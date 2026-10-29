const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const fixture = JSON.parse(fs.readFileSync('/tmp/health-journey-fixture.json'));
if (fixture.api !== 'http://127.0.0.1:18020/api') throw new Error('Isolated journey API required');
const url = process.env.JOURNEY_DATABASE_URL;
if (!url || new URL(url).port !== '55482' || !new URL(url).pathname.startsWith('/health_journey_')) throw new Error('Isolated journey database required');
process.env.DATABASE_URL = url;
const { prisma } = require('../src/database/prisma');
const sessions = {}, trace = [];
async function request(role, method, path, body, expected) {
  const response = await fetch(fixture.api + path, { method, headers: { ...(sessions[role] ? {Authorization:`Bearer ${sessions[role].token}`} : {}), ...(body !== undefined ? {'Content-Type':'application/json'} : {}), ...(method === 'POST' && path === '/invoices' ? {'Idempotency-Key':randomUUID()} : {}) }, ...(body !== undefined ? {body:JSON.stringify(body)} : {}), signal:AbortSignal.timeout(15000) });
  const data = await response.json();
  trace.push({role,method,path,status:response.status,success:data.success,message:data.message});
  if (expected) assert.equal(response.status,expected,`${role} ${method} ${path}: ${JSON.stringify(data)}`);
  else assert.ok(response.ok && data.success !== false,`${role} ${method} ${path}: ${response.status} ${JSON.stringify(data)}`);
  return data;
}
before(async()=>{
  for(const [role,user] of Object.entries(fixture.users)) {
    const result=await request(role,'POST','/auth/login',{username:user.username,password:user.password},200);
    assert.equal(result.data.id,user.id);assert.equal(result.data.role,role);assert.equal('password' in result.data,false);
    sessions[role]=result.data;
  }
});
after(async()=>{ fs.writeFileSync('/tmp/health-journey-api-results.json',JSON.stringify(trace,null,2));await prisma.$disconnect(); });
const pages={admin:['/users','/companies'],attendant:['/customers','/attendances','/request-exams/external'],nurse:['/screenings','/prescriptions','/administrations'],techNursian:['/screenings','/prescriptions','/administrations'],doctor:['/consultations','/customers','/request-exams/view-results'],analyst:['/request-exams','/exams/index'],techLab:['/request-exams','/exams/index'],chiefLab:['/request-exams','/exams/index'],financial:['/invoices','/customers','/payments'],inventory:['/stock/balance','/products','/materials','/purchases','/suppliers']};
for(const [role,paths] of Object.entries(pages)) test(`login and working lists: ${role}`,async()=>{for(const path of paths)await request(role,'GET',path);});
async function patient(){return(await request('attendant','POST','/customers',{name:`TESTE Percurso ${randomUUID().slice(0,8)}`,phone:'000000000',source:'Teste isolado',gender:'MALE',birthday:'1990-01-01'})).data;}
async function admit(){const customer=await patient();const attendance=(await request('attendant','POST','/attendances',{customerId:customer.id,serviceId:fixture.services.consultation.id})).data;const full=(await request('attendant','GET',`/attendances/${attendance.id}`)).data;return{customer,attendance,screening:full.screening};}
async function bill(customer,items,extra={}){return(await request('attendant','POST','/invoices',{type:'FR',asNormal:true,customerId:customer.id,paymentId:fixture.payment.id,amount_received:items.reduce((sum,i)=>sum+i.price*i.quantity,0),invoiceItems:items,...extra})).data;}
const item=(service,quantity=1)=>({serviceId:service.id,quantity,price:service.unit_price,discount:0});
test('attendance authorship belongs to the logged-in receptionist',async()=>{const x=await admit();assert.equal(x.attendance.receptionistId,fixture.users.attendant.id);});
test('nursing technicians can complete screening with optional vital signs omitted',async()=>{
 const x=await admit();await request('techNursian','PATCH',`/screenings/${x.screening.id}`,{nurseId:fixture.users.techNursian.id,status:'FINISHED',weight:'70',height:'170',oxygen:'GREEN',fever:'GREEN',bloodPressure:'120/80',heartbeatRate:'75'});
 const consultation=await prisma.consultation.findUnique({where:{screeningId:x.screening.id}});assert.ok(consultation);
});
test('complete journey: reception, billing, screening, doctor, laboratory, prescription and completion',async()=>{
 const x=await admit();assert.ok(x.screening,'Consultation admission creates a screening');
 await bill(x.customer,[item(fixture.services.consultation)],{attendanceId:x.attendance.id});
 const nursing=(await request('nurse','GET',`/screenings?queue=true&search=${encodeURIComponent(x.customer.name)}&perPage=100&page=1`)).data;assert.ok(nursing.some(s=>s.id===x.screening.id));
 await request('nurse','PATCH',`/screenings/${x.screening.id}`,{status:'RUNNING',nurseId:fixture.users.nurse.id,weight:'70',height:'170'});
 await request('nurse','PATCH',`/screenings/${x.screening.id}`,{status:'FINISHED',nurseId:fixture.users.nurse.id,weight:'70',height:'170',oxygen:'GREEN',fever:'GREEN',bloodPressure:'110/70',heartbeatRate:'75',breathingRate:'GREEN'});
 const consultation=await prisma.consultation.findUnique({where:{screeningId:x.screening.id}});assert.ok(consultation);
 await request('doctor','PATCH',`/consultations/${consultation.id}`,{doctorId:fixture.users.doctor.id,status:'running',description:'Avaliação sintética'});
 const detail=(await request('attendant','GET',`/attendances/${x.attendance.id}`)).data;
 assert.equal(detail.status,'IN_CONSULTATION','Attendance follows the medical consultation');assert.ok(detail.consultation,'Reception can follow the linked consultation');
 const examRequests=(await request('doctor','POST',`/request-exams/${consultation.id}`,{exams:[fixture.services.exam.id]})).data;
 await bill(x.customer,[item(fixture.services.exam)],{attendanceId:x.attendance.id});
 await request('attendant','PATCH',`/request-exams/${consultation.id}`,{exams:[fixture.services.exam.id]});
 await request('analyst','PATCH',`/request-exams/claim/${consultation.id}`,{analystId:fixture.users.analyst.id});
 await request('analyst','POST','/request-exams',[{id:examRequests[0].id,consultationId:consultation.id,result:{hemoglobina:'14'},resultText:'Resultado sintético normal',resultColor:'GREEN',materials:[{productId:fixture.services.material.id,quantity:1}]}]);
 const results=(await request('doctor','GET',`/consultations/${consultation.id}`)).data;assert.equal(results.exams[0].resultText,'Resultado sintético normal');
 const prescription=(await request('doctor','POST','/prescriptions',{type:'PHARMACY',userId:fixture.users.doctor.id,consultationId:consultation.id,items:[{serviceId:fixture.services.drug.id,dose:'1 unidade',frequency:'diária',canal:'oral',duration:3,quantity:'3'}]})).data;
 await request('nurse','POST',`/prescriptions/${prescription.id}/dispense`,{});
 await request('nurse','POST',`/prescriptions/${prescription.id}/dispense`,{},400);
 await request('doctor','PATCH',`/consultations/${consultation.id}`,{doctorId:fixture.users.doctor.id,status:'done',diagnosis:'Diagnóstico sintético de teste'});
 const final=(await request('attendant','GET',`/attendances/${x.attendance.id}`)).data;assert.equal(final.status,'COMPLETED');
 const updated=JSON.parse(fs.readFileSync('/tmp/health-journey-fixture.json'));updated.journey={customerId:x.customer.id,attendanceId:x.attendance.id,screeningId:x.screening.id,consultationId:consultation.id,prescriptionId:prescription.id};fs.writeFileSync('/tmp/health-journey-fixture.json',JSON.stringify(updated),{mode:0o600});
});
test('reception can register external exams after billing',async()=>{const customer=await patient();await bill(customer,[item(fixture.services.exam)]);await request('attendant','POST','/request-exams/external',{customerId:customer.id,exams:[fixture.services.exam.id],paid:true});});
test('finance can settle a prescription without clinical write permission',async()=>{
 const x=await admit();await request('nurse','PATCH',`/screenings/${x.screening.id}`,{status:'FINISHED',nurseId:fixture.users.nurse.id,weight:'70',height:'170'});
 const c=await prisma.consultation.findUnique({where:{screeningId:x.screening.id}});
 const p=(await request('doctor','POST','/prescriptions',{type:'PHARMACY',userId:fixture.users.doctor.id,consultationId:c.id,items:[{serviceId:fixture.services.drug.id,dose:'1',frequency:'diária',canal:'oral',duration:1,quantity:'1'}]})).data;
 await request('financial','PATCH',`/prescriptions/${p.id}`,{paid:true});
 await request('financial','PATCH',`/consultations/${c.id}`,{diagnosis:'Forbidden'},403);
});
test('all non-admin roles are barred from changing user roles',async()=>{for(const role of Object.keys(fixture.users).filter(r=>r!=='admin'))await request(role,'PATCH',`/users/${fixture.users[role].id}`,{role:'admin'},403);});
test('finished screening cannot be reopened or overwritten',async()=>{
 const x=await admit();await request('nurse','PATCH',`/screenings/${x.screening.id}`,{nurseId:fixture.users.nurse.id,status:'FINISHED',weight:'70',height:'170',breathingRate:'ORANGE'});
 await request('nurse','PATCH',`/screenings/${x.screening.id}`,{nurseId:fixture.users.nurse.id,status:'PENDING',weight:'1'},409);
 const saved=(await request('nurse','GET',`/screenings/${x.screening.id}`)).data;assert.equal(saved.breathingRate,'ORANGE');assert.equal(saved.weight,'70');
});
test('canceled attendance cannot proceed to medical consultation',async()=>{
 const x=await admit();await request('attendant','PATCH',`/attendances/${x.attendance.id}`,{status:'CANCELED'});
 await request('nurse','PATCH',`/screenings/${x.screening.id}`,{nurseId:fixture.users.nurse.id,status:'FINISHED',weight:'70'},409);
 assert.equal(await prisma.consultation.count({where:{screeningId:x.screening.id}}),0);
});
async function consult(){const x=await admit();await request('nurse','PATCH',`/screenings/${x.screening.id}`,{nurseId:fixture.users.nurse.id,status:'FINISHED',weight:'70'});return{...x,consultation:await prisma.consultation.findUnique({where:{screeningId:x.screening.id}})};}
test('billing an exam changes only that consultation, not other patients',async()=>{
 const a=await consult(),b=await consult();for(const x of [a,b])await request('doctor','POST',`/request-exams/${x.consultation.id}`,{exams:[fixture.services.exam.id]});
 await bill(a.customer,[item(fixture.services.exam)]);await request('attendant','PATCH',`/request-exams/${a.consultation.id}`,{exams:[fixture.services.exam.id]});
 const requests=await prisma.requestExams.findMany({where:{consultationId:{in:[a.consultation.id,b.consultation.id]}}});assert.equal(requests.find(r=>r.consultationId===a.consultation.id).paid,true);assert.equal(requests.find(r=>r.consultationId===b.consultation.id).paid,false);
});
test('laboratory cannot record results for an unpaid examination',async()=>{
 const x=await consult();const exams=(await request('doctor','POST',`/request-exams/${x.consultation.id}`,{exams:[fixture.services.exam.id]})).data;
 await request('techLab','POST','/request-exams',[{id:exams[0].id,consultationId:x.consultation.id,resultText:'Unpaid',result:{},resultColor:'GREEN'}],409);
});
test('pharmacy shortage rolls back every item and leaves prescription pending',async()=>{
 const x=await consult();const p=(await request('doctor','POST','/prescriptions',{type:'PHARMACY',userId:fixture.users.doctor.id,consultationId:x.consultation.id,items:[{serviceId:fixture.services.drug.id,dose:'1',frequency:'diária',canal:'oral',duration:1,quantity:'1'},{serviceId:fixture.services.material.id,dose:'1',frequency:'diária',canal:'oral',duration:1,quantity:'99999'}]})).data;
 const before=await prisma.movimentationStock.count({where:{reason:'pharmacy_dispensing'}});
 await request('techNursian','POST',`/prescriptions/${p.id}/dispense`,{},400);
 assert.equal(await prisma.movimentationStock.count({where:{reason:'pharmacy_dispensing'}}),before);assert.equal((await prisma.prescription.findUnique({where:{id:p.id}})).paid,false);
});
test('clinical and billing operations remain separated after permission fixes',async()=>{
 await request('attendant','POST','/request-exams',[],403);
 await request('doctor','POST','/request-exams',[],403);
 await request('financial','PATCH',`/prescriptions/${randomUUID()}`,{paid:true,items:[]},403);
 await request('techLab','PATCH',`/consultations/${randomUUID()}`,{diagnosis:'Forbidden'},403);
});
for (const role of ['techLab','chiefLab']) test(`${role} can claim and save a paid examination`,async()=>{
 const x=await admit();await request('nurse','PATCH',`/screenings/${x.screening.id}`,{status:'FINISHED',weight:'70',height:'170'});
 const c=await prisma.consultation.findUnique({where:{screeningId:x.screening.id}});
 const exams=(await request('doctor','POST',`/request-exams/${c.id}`,{exams:[fixture.services.exam.id]})).data;
 await bill(x.customer,[item(fixture.services.exam)]);
 await request('financial','PATCH',`/request-exams/${c.id}`,{exams:[fixture.services.exam.id]});
 await request(role,'PATCH',`/request-exams/claim/${c.id}`,{analystId:fixture.users.admin.id});
 await request(role,'POST','/request-exams',[{id:exams[0].id,consultationId:c.id,result:{value:'14'},resultText:`Resultado ${role}`,resultColor:'GREEN',materials:[]}]);
 const saved=await prisma.requestExams.findUnique({where:{id:exams[0].id}});assert.equal(saved.resultText,`Resultado ${role}`);
});
test('medical queues accept a page size without a page number',async()=>{
 await request('doctor','GET','/consultations?perPage=100');
});
test('laboratory shortage rolls back results and consumables together',async()=>{
 const x=await admit();await request('nurse','PATCH',`/screenings/${x.screening.id}`,{status:'FINISHED',weight:'70',height:'170'});
 const c=await prisma.consultation.findUnique({where:{screeningId:x.screening.id}});
 const exams=(await request('doctor','POST',`/request-exams/${c.id}`,{exams:[fixture.services.exam.id]})).data;
 await bill(x.customer,[item(fixture.services.exam)]);await request('attendant','PATCH',`/request-exams/${c.id}`,{exams:[fixture.services.exam.id]});
 const before=await prisma.batchProduct.findMany({where:{productId:fixture.services.material.id},orderBy:{id:'asc'}});
 await request('analyst','POST','/request-exams',[{id:exams[0].id,consultationId:c.id,result:{value:'99'},resultText:'Não deve gravar',resultColor:'GREEN',materials:[{productId:fixture.services.material.id,quantity:100000}]}],400);
 const saved=await prisma.requestExams.findUnique({where:{id:exams[0].id}});assert.notEqual(saved.resultText,'Não deve gravar');
 assert.deepEqual(await prisma.batchProduct.findMany({where:{productId:fixture.services.material.id},orderBy:{id:'asc'}}),before);
});
