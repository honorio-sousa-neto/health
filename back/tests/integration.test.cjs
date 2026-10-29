const { test, before, after }=require('node:test');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const url=process.env.INTEGRATION_DATABASE_URL;
if(!url || new URL(url).hostname !== '127.0.0.1' || new URL(url).port !== '55482')throw new Error('Use only the disposable PostgreSQL test server on port 55482');
process.env.DATABASE_URL=url;
const {prisma}=require('../src/database/prisma');
const {stockEntry,stockExit,stockTransfer,balanceAtLocation}=require('../src/services/stock/stock-service');
const {issueInvoice}=require('../src/services/invoice/issue');
let user,customer,payment,location,category;
before(async()=>{
 const key=randomUUID();
 user=await prisma.user.create({data:{name:'Security test',username:key,phone:key,password:'not-a-real-password',role:'financial'}});
 customer=await prisma.customer.create({data:{name:'Synthetic security test'}});
 payment=await prisma.payment.create({data:{name:'Test',code:key}});
 category=await prisma.category.create({data:{name:'Security test'}});
 await prisma.stockLocation.updateMany({data:{isDefault:false}});
 location=await prisma.stockLocation.create({data:{name:'Security test',isDefault:true}});
});
after(()=>prisma.$disconnect());
async function product(quantity=0,batch=false){
 const p=await prisma.service.create({data:{name:'Synthetic drug',unit_price:100,categoryId:category.id,type:'PRODUCT'}});
 if(quantity)await prisma.$transaction(tx=>stockEntry(tx,{productId:p.id,locationId:location.id,quantity,...(batch?{batch:'LOT'}:{})}));
 return p;
}
function payload(p,quantity=1){return{type:'FR',customerId:customer.id,paymentId:payment.id,amount_received:100*quantity,invoiceItems:[{serviceId:p.id,quantity,price:100,discount:0}]};}
test('real PostgreSQL serializes concurrent exits from the same lot',async()=>{
 const p=await product(5,true),args={productId:p.id,locationId:location.id,quantity:4,reason:'sale'};
 const results=await Promise.allSettled([prisma.$transaction(tx=>stockExit(tx,args)),prisma.$transaction(tx=>stockExit(tx,args))]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 assert.equal(await balanceAtLocation(prisma,p.id,location.id),1);
 assert.equal((await prisma.batchProduct.findFirst({where:{productId:p.id}})).quantity,1);
});
test('concurrent idempotent invoice requests commit exactly one invoice, cash entry and stock exit',async()=>{
 const p=await product(1,true),key=randomUUID(),before=await prisma.flow.count();
 const invoices=await Promise.all(Array.from({length:5},()=>issueInvoice(payload(p),user,key)));
 assert.equal(new Set(invoices.map(i=>i.id)).size,1);
 assert.equal(await prisma.flow.count(),before+1);
 assert.equal(await prisma.movimentationStock.count({where:{productId:p.id,type:'EXIT'}}),1);
 assert.equal(await balanceAtLocation(prisma,p.id,location.id),0);
});
test('insufficient stock rolls back the already-created invoice and cash entry',async()=>{
 const p=await product(1),invoices=await prisma.invoice.count(),cash=await prisma.flow.count();
 await assert.rejects(issueInvoice(payload(p,2),user,randomUUID()),/insuficiente/);
 assert.equal(await prisma.invoice.count(),invoices);assert.equal(await prisma.flow.count(),cash);
 assert.equal(await balanceAtLocation(prisma,p.id,location.id),1);
});
test('different concurrent invoices have distinct references',async()=>{
 const p=await product(2);
 const invoices=await Promise.all([issueInvoice(payload(p),user,randomUUID()),issueInvoice(payload(p),user,randomUUID())]);
 assert.notEqual(invoices[0].reference,invoices[1].reference);
});
test('expired batches cannot be consumed through unbatched remainder',async()=>{
 const p=await product(1);
 await prisma.$transaction(tx=>stockEntry(tx,{productId:p.id,locationId:location.id,quantity:1,batch:'EXPIRED',expiration:new Date('2000-01-01')}));
 await assert.rejects(prisma.$transaction(tx=>stockExit(tx,{productId:p.id,locationId:location.id,quantity:2,reason:'sale'})),/expirados/);
 assert.equal(await balanceAtLocation(prisma,p.id,location.id),2);
 await prisma.$transaction(tx=>stockExit(tx,{productId:p.id,locationId:location.id,quantity:1,reason:'expiry'}));
 assert.equal(await balanceAtLocation(prisma,p.id,location.id),1);
});
test('receipt inherits original coverage and cannot bypass collection using a forged internId',async()=>{
 const p=await product(1);
 const invoice=await issueInvoice({...payload(p),type:'FT',paymentId:undefined},user,randomUUID());
 const cash=await prisma.flow.count();
 const receipt=await issueInvoice({type:'RC',invoiceId:invoice.id,paymentId:payment.id,amount_received:100,internId:randomUUID()},user,randomUUID());
 assert.equal(receipt.internId,null);assert.equal(receipt.customerId,customer.id);assert.equal(await prisma.flow.count(),cash+1);
 await assert.rejects(issueInvoice({type:'RC',invoiceId:invoice.id,paymentId:payment.id,amount_received:100},user,randomUUID()),/finalizado/);
});
