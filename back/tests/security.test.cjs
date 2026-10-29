const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test-only-secret-with-more-than-thirty-two-bytes';
const { prisma } = require('../src/database/prisma');
const { signSession, authenticate, jwtSecret } = require('../src/security/auth');
const { canAccess } = require('../src/security/authorization');
const { publicPayload, safeResponses } = require('../src/security/response');
const { fileType } = require('../src/config/multer');
const { issueInvoiceInput } = require('../src/validator/issue-invoice');
const { calculateAmountItems } = require('../src/controllers/invoice/utils');
const { UserController } = require('../src/controllers/user');
const { stockExit, stockTransfer } = require('../src/services/stock/stock-service');
const { issueInvoice } = require('../src/services/invoice/issue');
const id = '11111111-1111-4111-a111-111111111111', serviceId = '22222222-2222-4222-a222-222222222222', customerId = '33333333-3333-4333-a333-333333333333';
const identity = { id, email: null, role: 'financial' };
const realFindUser = prisma.user.findUnique, realTransaction = prisma.$transaction;
let account = identity, server, origin;
before(async () => {
  prisma.user.findUnique = async ({ where }) => where.id === id ? account : null;
  const app = express(); app.use(express.json()); app.use(safeResponses);
  app.use('/api', require('../src/routers').default);
  app.use((err, req, res, next) => res.status(err.name === 'ZodError' || err.name === 'MulterError' ? 400 : 500).json({ message: 'Invalid request' }));
  server = http.createServer(app); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { prisma.user.findUnique = realFindUser; prisma.$transaction = realTransaction; server?.closeAllConnections(); if(server)await new Promise(resolve => server.close(resolve)); await prisma.$disconnect(); });
test('session requires rotated key, stable subject and active account', async () => {
  const token = signSession(identity); assert.equal(jwt.decode(token).sub,id); assert.equal((await authenticate(token)).id,id);
  await assert.rejects(authenticate(jwt.sign({email:'invented@example.invalid'},'alfavida_app_management_clinic')));
  await assert.rejects(authenticate(jwt.sign({email:'invented@example.invalid'},process.env.JWT_SECRET)));
  account={...identity,deletedAt:new Date()}; await assert.rejects(authenticate(token)); account=null; await assert.rejects(authenticate(token)); account=identity;
  const secret=process.env.JWT_SECRET; process.env.JWT_SECRET='alfavida_app_management_clinic'; assert.throws(jwtSecret); process.env.JWT_SECRET=secret;
});
test('anonymous reports, balances, uploads and users are rejected',async()=>{
  for(const path of ['balances','reports/any-id','uploads/files/test.pdf','users']) assert.equal((await fetch(`${origin}/api/${path}`)).status,401,path);
});
test('roles cannot promote users or write to other departments',async()=>{
  for(const role of ['doctor','attendant','inventory','financial','nurse','analyst']){assert.equal(canAccess(role,'POST','users'),false);assert.equal(canAccess(role,'PATCH','users'),false);assert.equal(canAccess(role,'GET','unknown'),false);}
  assert.equal(canAccess('attendant','POST','consultations'),false);assert.equal(canAccess('inventory','GET','customers'),false);assert.equal(canAccess('doctor','POST','invoices'),false);
  assert.equal(canAccess('doctor','POST','consultations'),true);assert.equal(canAccess('nurse','POST','screenings'),true);assert.equal(canAccess('inventory','POST','stock'),true);
  account={...identity,role:'attendant'};const res=await fetch(`${origin}/api/users/${id}`,{method:'PATCH',headers:{Authorization:`Bearer ${signSession(account)}`,'Content-Type':'application/json'},body:JSON.stringify({role:'admin'})});assert.equal(res.status,403);account=identity;
});
test('password hashes disappear from directory and nested relations',async()=>{
  const user={...identity,password:'sensitive-hash'};const controller=new UserController({index:async()=>[user],count:async()=>1,show:async()=>user,update:async()=>user});
  for(const response of [await controller.index({page:'1',perPage:'10',search:''}),await controller.show(id),await controller.update(id,{name:'Updated'})])assert.equal(JSON.stringify(response).includes('sensitive-hash'),false);
  assert.deepEqual(publicPayload({data:[{doctor:user}]}),{data:[{doctor:identity}]});
});
test('upload rejects forged content before writing',async()=>{
  assert.equal(fileType(Buffer.from('<script>alert(1)</script>')),null);assert.equal(fileType(Buffer.from('GIF89a')),null);
  account={...identity,role:'inventory'};const form=new FormData();form.append('file',new Blob(['<script>bad</script>'],{type:'application/pdf'}),'fake.pdf');
  const res=await fetch(`${origin}/api/uploads/invoice/${id}`,{method:'POST',headers:{Authorization:`Bearer ${signSession(account)}`},body:form});assert.equal(res.status,415);
  const oversized=new FormData();oversized.append('file',new Blob([new Uint8Array(11*1024*1024)]),'large.pdf');
  const rejected=await fetch(`${origin}/api/uploads/invoice/${id}`,{method:'POST',headers:{Authorization:`Bearer ${signSession(account)}`},body:oversized});assert.equal(rejected.status,400);account=identity;
});
const input={type:'FR',customerId,paymentId:id,amount_received:200,invoiceItems:[{serviceId,quantity:2,price:100,discount:0}]};
test('invoice rejects negative and fractional quantities, infinity and excessive discounts',()=>{
  for(const item of [{quantity:-2},{quantity:0},{quantity:1.5},{price:Infinity},{discount:101}])assert.equal(issueInvoiceInput.safeParse({...input,invoiceItems:[{...input.invoiceItems[0],...item}]}).success,false);
  assert.throws(()=>calculateAmountItems([{price:100,discount:0,quantity:-2}]));assert.equal(calculateAmountItems([{price:0.1,discount:0,quantity:3}]),0.3);
});
function stockTx({balance=5,expired=false,change=1}={}){
  const calls=[];return{calls,$queryRaw:async()=>{calls.push('lock');return[]},movimentationStock:{aggregate:async q=>({_sum:{quantity:q.where.toLocationId?balance:0}}),create:async({data})=>{calls.push(data);return data}},service:{findUnique:async()=>({name:'Drug'})},batchProduct:{findMany:async()=>[{id:serviceId,quantity:balance,expiration:expired?new Date('2000-01-01'):null,batch:'B'}],updateMany:async()=>({count:change}),findUnique:async()=>({id:serviceId,quantity:balance}),upsert:async()=>({id:serviceId})}};
}
test('stock prevents overselling, expired dispensing and stale decrements',async()=>{
  const args={productId:serviceId,locationId:id,quantity:6,reason:'sale'};
  await assert.rejects(stockExit(stockTx(),args),/insuficiente/);await assert.rejects(stockExit(stockTx({expired:true}),{...args,quantity:1}),/expirados/);await assert.rejects(stockExit(stockTx({change:0}),{...args,quantity:1}),/alterado/);
  const tx=stockTx();await stockExit(tx,{...args,quantity:2});assert.equal(tx.calls[0],'lock');assert.equal(tx.calls[1].quantity,2);
  await assert.rejects(stockExit(stockTx(),{...args,quantity:Infinity}),/inválida/);await assert.rejects(stockTransfer(stockTx(),{productId:serviceId,fromLocationId:id,toLocationId:customerId,quantity:6}),/insuficiente/);
});
test('explicit disposal can remove expired stock',async()=>{const tx=stockTx({expired:true});await stockExit(tx,{productId:serviceId,locationId:id,quantity:1,reason:'expiry'});assert.equal(tx.calls[1].quantity,1);});
test('invoice, cash and stock roll back together and retries are idempotent',async()=>{
  let state={invoices:[],cash:[]},fail=false;
  prisma.$transaction=async fn=>{const draft=structuredClone(state);const tx={
    $queryRaw:async()=>[],customer:{findUnique:async()=>({id:customerId,deletedAt:null})},
    service:{findMany:async()=>[{id:serviceId,unit_price:100,discount:0}],findUnique:async()=>({name:'Internamento'})},
    invoice:{findUnique:async({where})=>draft.invoices.find(i=>i.id===where.id)||null,findFirst:async()=>null,count:async()=>draft.invoices.length,create:async({data})=>{draft.invoices.push(data);return data}},
    flow:{create:async({data})=>{draft.cash.push(data);if(fail)throw new Error('injected failure');return data}},movimentationStock:{groupBy:async()=>[]}};
    const result=await fn(tx);state=draft;return result;};
  fail=true;await assert.rejects(issueInvoice(input,identity,'request-key-failure-123'),/injected/);assert.equal(state.invoices.length,0);assert.equal(state.cash.length,0);
  fail=false;const first=await issueInvoice({...input,userId:serviceId,total:1},identity,'request-key-success-123');const second=await issueInvoice(input,identity,'request-key-success-123');
  assert.equal(first.id,second.id);assert.equal(first.userId,id);assert.equal(first.total,200);assert.equal(state.invoices.length,1);assert.equal(state.cash.length,1);
  await assert.rejects(issueInvoice({...input,amount_received:300},identity,'request-key-success-123'),/outros dados/);
  await assert.rejects(issueInvoice({...input,invoiceItems:[{...input.invoiceItems[0],price:1}]},{...identity,role:'attendant'},'request-price-denied-123'),/preçário/);
  prisma.$transaction=realTransaction;
});
test('Socket.IO refuses anonymous clients and ignores client-selected roles',{timeout:15000},async()=>{
  const { Server }=require('socket.io');
  const { secureSockets }=require('../src/security/socket');
  const socketServer=http.createServer();await new Promise(resolve=>socketServer.listen(0,'127.0.0.1',resolve));
  const endpoint=`ws://127.0.0.1:${socketServer.address().port}/socket.io/?EIO=4&transport=websocket`;
  const io=new Server(socketServer,{transports:['websocket']});secureSockets(io);
  const message=ws=>new Promise((resolve,reject)=>{ws.addEventListener('message',e=>resolve(String(e.data)),{once:true});ws.addEventListener('error',reject,{once:true});});
  const anonymous=new WebSocket(endpoint);
  assert.ok((await message(anonymous)).startsWith('0'));
  let received=message(anonymous);anonymous.send('40{}');assert.ok((await received).startsWith('44'));anonymous.close();
  account={...identity,role:'nurse'};
  const client=new WebSocket(endpoint);
  try{
    assert.ok((await message(client)).startsWith('0'));
    received=message(client);client.send('40'+JSON.stringify({token:signSession(account)}));
    const connected=await received;assert.ok(connected.startsWith('40'));
    const peer=io.sockets.sockets.get(JSON.parse(connected.slice(2)).sid);
    assert.equal(peer.rooms.has('enfermaria'),true);assert.equal(peer.rooms.has('consultorio'),false);
    client.send('42'+JSON.stringify(['join:role','admin']));
    received=message(client);io.to('role:doctor').emit('scoped-test','doctor');io.to('role:nurse').emit('scoped-test','nurse');
    assert.deepEqual(JSON.parse((await received).slice(2)),['scoped-test','nurse']);assert.equal(peer.rooms.has('consultorio'),false);
  }finally{client.close();account=identity;await new Promise(resolve=>io.close(resolve));}
});
test('login limiting is bounded and administrative validation reaches the error handler',async()=>{
  const { loginLimit }=require('../src/security/rate-limit');let allowed=0,status;
  const req={ip:'test-rate-limit',socket:{}};const res={once(){},setHeader(){},status(code){status=code;return this},json(){}};
  for(let i=0;i<21;i++)loginLimit(req,res,()=>allowed++);assert.equal(allowed,20);assert.equal(status,429);
  account={...identity,role:'admin'};
  const invalid=await fetch(`${origin}/api/users`,{method:'POST',headers:{Authorization:`Bearer ${signSession(account)}`,'Content-Type':'application/json'},body:JSON.stringify({name:'Invalid',phone:'test',role:'admin',password:'short'})});
  assert.equal(invalid.status,400); account=identity;
});
