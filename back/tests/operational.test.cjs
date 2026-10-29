const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {randomUUID}=require('node:crypto');
const fixture=JSON.parse(fs.readFileSync('/tmp/health-journey-fixture.json'));
const url=process.env.JOURNEY_DATABASE_URL;
if(!url||new URL(url).hostname!=='127.0.0.1'||new URL(url).port!=='55482'||!new URL(url).pathname.startsWith('/health_journey_')||fixture.api!=='http://127.0.0.1:18020/api')throw Error('Only isolated journey environment permitted');
process.env.DATABASE_URL=url;
const {prisma}=require('../src/database/prisma');
const sessions={},services={},trace=[],cases=[];
const vitals={normal:{oxygen:'GREEN',fever:'GREEN',breathingRate:'GREEN',heartbeatRate:'75',bloodPressure:'110/70'},grave:{oxygen:'ORANGE',fever:'ORANGE',breathingRate:'ORANGE',heartbeatRate:'110',bloodPressure:'125/80'},muitoGrave:{oxygen:'RED',fever:'RED',breathingRate:'RED',heartbeatRate:'140',bloodPressure:'150/100'}};
async function request(role,method,path,body,expected){const response=await fetch(fixture.api+path,{method,headers:{Authorization:`Bearer ${sessions[role]?.token||''}`,'Content-Type':'application/json',...(path==='/invoices'?{'Idempotency-Key':randomUUID()}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(15000)});const data=await response.json();trace.push({role,method,path,status:response.status,message:data.message});if(expected)assert.equal(response.status,expected,JSON.stringify(data));else assert.ok(response.ok&&data.success!==false,`${role} ${path}: ${response.status} ${JSON.stringify(data)}`);return data.data;}
before(async()=>{
 for(const [role,user]of Object.entries(fixture.users))sessions[role]=await request(role,'POST','/auth/login',{username:user.username,password:user.password});
 const category=await prisma.category.create({data:{name:'Percursos operacionais'}});
 for(const [key,name]of Object.entries({observation:'Observação 4h',internment:'Internamento de teste',surgery:'Cirurgia de teste',administration:'Administração IV',vaccine:'Vacinação de teste'}))services[key]=await prisma.service.create({data:{name,unit_price:100,type:'SERVICE',categoryId:category.id}});
});
after(async()=>{fs.writeFileSync('/tmp/health-operational-results.json',JSON.stringify({trace,cases},null,2));await prisma.$disconnect();});
async function consultation(severity){
 const customer=await request('attendant','POST','/customers',{name:`TESTE ${severity} ${randomUUID().slice(0,8)}`,phone:'000000002',source:'Teste operacional'});
 const attendance=await request('attendant','POST','/attendances',{customerId:customer.id,serviceId:fixture.services.consultation.id});
 const detail=await request('attendant','GET',`/attendances/${attendance.id}`);
 await request('nurse','PATCH',`/screenings/${detail.screening.id}`,{status:'FINISHED',weight:'70',height:'170',...vitals[severity]});
 const c=await prisma.consultation.findUnique({where:{screeningId:detail.screening.id}});
 await request('doctor','PATCH',`/consultations/${c.id}`,{status:'running',description:`Caso sintético ${severity}`});
 const x={customer,attendance,screening:detail.screening,consultation:c};cases.push({severity,customerId:customer.id,attendanceId:attendance.id,screeningId:detail.screening.id,consultationId:c.id});return x;
}
async function bill(customer,items){return request('attendant','POST','/invoices',{type:'FR',asNormal:true,customerId:customer.id,paymentId:fixture.payment.id,amount_received:items.reduce((s,p)=>s+Number(p.unit_price),0),invoiceItems:items.map(p=>({serviceId:p.id,quantity:1,price:Number(p.unit_price),discount:0}))});}
async function finish(x){await request('doctor','PATCH',`/consultations/${x.consultation.id}`,{status:'done',diagnosis:'Conclusão sintética'});const a=await request('attendant','GET',`/attendances/${x.attendance.id}`);assert.equal(a.status,'COMPLETED');}
async function observe(x,service=services.observation,exams=[]){return request('doctor','POST','/observations',{consultationId:x.consultation.id,serviceId:service.id,exams,serum:[{productId:fixture.services.drug.id,nome:'Medicação sintética',dose:'1 unidade',via:'EV'}]});}
test('normal: consultation, prescription and completed attendance',async()=>{const x=await consultation('normal');await bill(x.customer,[fixture.services.consultation]);const p=await request('doctor','POST','/prescriptions',{type:'PHARMACY',userId:fixture.users.doctor.id,consultationId:x.consultation.id,items:[{serviceId:fixture.services.drug.id,quantity:'1',dose:'1',frequency:'diária',canal:'oral',duration:1}]});await request('nurse','POST',`/prescriptions/${p.id}/dispense`,{});await finish(x);});
for(const severity of ['grave','muitoGrave'])test(`${severity}: observation, billing, laboratory, nursing and conclusion`,async()=>{
 const x=await consultation(severity);const obs=await observe(x,services.observation,[fixture.services.exam.id]);
 await bill(x.customer,[services.observation,fixture.services.exam]);await request('attendant','PATCH',`/observations/${obs.id}`,{paid:true});
 await request('nurse','PATCH',`/observations/${obs.id}`,{status:'running'});
 const running=await request('nurse','GET',`/observations/${obs.id}`);assert.ok(running.endTime);assert.equal(running.serum[0].productId,fixture.services.drug.id);
 const labQueue=await request('analyst','GET','/request-exams');assert.ok(labQueue.some(c=>c.id===x.consultation.id),'Observation exam reaches laboratory');
 const exam=await prisma.requestExams.findFirst({where:{observationId:obs.id}});assert.equal(exam.paid,true);
 await request('analyst','POST','/request-exams',[{id:exam.id,consultationId:x.consultation.id,result:{value:'14'},resultText:'Resultado em observação',resultColor:'GREEN',materials:[{productId:fixture.services.material.id,quantity:1}]}]);
 const doctor=await request('doctor','GET',`/consultations/${x.consultation.id}`);assert.equal(doctor.observation[0].exams[0].resultText,'Resultado em observação');
 await request('techNursian','PATCH',`/observations/${obs.id}`,{status:'done',description:'Observação terminada'});await finish(x);
});
test('very serious: hospitalization option retains patient and appears to nursing',async()=>{const x=await consultation('muitoGrave');const record=await observe(x,services.internment);await bill(x.customer,[services.internment]);await request('attendant','PATCH',`/observations/${record.id}`,{paid:true});const queue=await request('nurse','GET','/observations');assert.ok(queue.some(o=>o.id===record.id&&o.consultation.screening.customer.id===x.customer.id));await request('nurse','PATCH',`/observations/${record.id}`,{status:'running'});await request('nurse','PATCH',`/observations/${record.id}`,{status:'done'});await finish(x);});
for(const severity of ['grave','muitoGrave'])test(`${severity}: API refuses conclusion without required referral`,async()=>{const x=await consultation(severity);await request('doctor','PATCH',`/consultations/${x.consultation.id}`,{status:'done',diagnosis:'Tentativa sem encaminhamento'},409);});
test('observation cannot resume after conclusion',async()=>{const x=await consultation('grave');const o=await observe(x);await request('attendant','PATCH',`/observations/${o.id}`,{paid:true});await request('nurse','PATCH',`/observations/${o.id}`,{status:'running'});await request('nurse','PATCH',`/observations/${o.id}`,{status:'done'});await request('nurse','PATCH',`/observations/${o.id}`,{status:'running'},409);});
test('ambulatory plan belongs to patient, concludes attendance and records nursing identity',async()=>{
 const x=await consultation('normal');const p=await request('doctor','POST','/prescriptions',{type:'AMBULATORY',userId:fixture.users.doctor.id,consultationId:x.consultation.id,items:[{serviceId:fixture.services.drug.id,quantity:'4',dose:'1',frequency:'2x/dia',canal:'oral',duration:2}]});
 const plan=await request('doctor','POST','/ambulatory-plans',{prescriptionId:p.id,customerId:x.customer.id});const full=await request('nurse','GET',`/ambulatory-plans/${plan.id}`);assert.equal(full.sessions.length,4);assert.deepEqual(full.sessions.map(s=>s.day),[1,1,2,2]);
 for(const session of full.sessions)await request('techNursian','PATCH',`/ambulatory-plans/${session.id}/done`,{doneById:fixture.users.admin.id});
 const done=await request('nurse','GET',`/ambulatory-plans/${plan.id}`);assert.ok(done.sessions.every(s=>s.doneAt&&s.doneById===fixture.users.techNursian.id),'Session authorship comes from authenticated nurse');
 const a=await request('attendant','GET',`/attendances/${x.attendance.id}`);assert.equal(a.status,'COMPLETED');
});
test('ambulatory rejects linking prescription to another patient',async()=>{const x=await consultation('normal'),other=await consultation('normal');const p=await request('doctor','POST','/prescriptions',{type:'AMBULATORY',userId:fixture.users.doctor.id,consultationId:x.consultation.id,items:[{serviceId:fixture.services.drug.id,quantity:'1',dose:'1',frequency:'diária',canal:'oral',duration:1}]});await request('doctor','POST','/ambulatory-plans',{prescriptionId:p.id,customerId:other.customer.id},400);});
for(const severity of ['normal','grave','muitoGrave'])test(`${severity}: surgery, billing, conclusion and history`,async()=>{const x=await consultation(severity);if(severity!=='normal')await observe(x);const s=await request('doctor','POST','/surgeries',{serviceId:services.surgery.id,customerId:x.customer.id,observation:'Indicação sintética'});await bill(x.customer,[services.surgery]);await request('attendant','PATCH',`/surgeries/${s.id}`,{paid:true});await request('nurse','PATCH',`/surgeries/${s.id}`,{status:'running'});await request('doctor','PATCH',`/surgeries/${s.id}`,{status:'done'});const history=await request('doctor','GET',`/surgeries/${s.id}`);assert.equal(history.status,'done');assert.equal(history.customer.id,x.customer.id);await finish(x);});
for(const severity of ['normal','grave','muitoGrave'])for(const kind of ['administration','vaccine'])test(`${severity} ${kind}: order, billing, execution and patient history`,async()=>{const x=await consultation(severity);if(severity!=='normal')await observe(x);const a=await request('nurse','POST','/administrations',{serviceId:services[kind].id,customerId:x.customer.id,userId:fixture.users.nurse.id,quantity:'1',type:'IV',drugs:[{id:fixture.services.drug.id,name:'Medicamento sintético',amount:100,quantity:1}]});await bill(x.customer,[services[kind]]);await request('attendant','PATCH',`/administrations/${a.id}`,{paid:true});await request('techNursian','PATCH',`/administrations/${a.id}`,{status:'running'});await request('techNursian','PATCH',`/administrations/${a.id}`,{status:'done'});const result=await request('nurse','GET',`/administrations/${a.id}`);assert.equal(result.status,'done');assert.equal(result.customer.id,x.customer.id);await finish(x);});
test('partial laboratory results keep outstanding exams in the laboratory queue',async()=>{
 const x=await consultation('normal');const second=await prisma.service.create({data:{name:'Segundo exame sintético',unit_price:100,type:'SERVICE',categoryId:fixture.services.exam.categoryId}});
 const exams=await request('doctor','POST',`/request-exams/${x.consultation.id}`,{exams:[fixture.services.exam.id,second.id]});
 await bill(x.customer,[fixture.services.exam,second]);await request('attendant','PATCH',`/request-exams/${x.consultation.id}`,{exams:[fixture.services.exam.id,second.id]});
 await request('analyst','POST','/request-exams',[{id:exams[0].id,consultationId:x.consultation.id,result:{value:'14'},resultText:'Primeiro resultado',resultColor:'GREEN'}]);
 const queue=await request('analyst','GET','/request-exams');assert.ok(queue.some(c=>c.id===x.consultation.id),'Unfinished exam must remain visible');await request('techLab','PATCH',`/consultations/${x.consultation.id}`,{stage:'EXAM_RESULT'},409);
 await request('analyst','POST','/request-exams',[{id:exams[1].id,consultationId:x.consultation.id,result:{value:'15'},resultText:'Segundo resultado',resultColor:'GREEN'}]);
 assert.equal((await request('doctor','GET',`/consultations/${x.consultation.id}`)).stage,'EXAM_RESULT');await finish(x);
});
for(const severity of ['normal','grave','muitoGrave'])test(`${severity}: declared treatment consumption reaches the patient's attendance`,async()=>{
 const x=await consultation(severity);const before=await prisma.batchProduct.aggregate({where:{productId:fixture.services.material.id},_sum:{quantity:true}});
 const movements=await request('nurse','POST','/stock/consumptions/declare',{attendanceId:x.attendance.id,serviceId:services.observation.id,reference:'Consumo de teste operacional',items:[{productId:fixture.services.material.id,quantity:1}]});
 assert.ok(movements.every(m=>m.attendanceId===x.attendance.id&&m.userId===fixture.users.nurse.id));const after=await prisma.batchProduct.aggregate({where:{productId:fixture.services.material.id},_sum:{quantity:true}});assert.equal(Number(before._sum.quantity)-Number(after._sum.quantity),1);
});
test('ambulatory cannot bypass the referral required for a serious case',async()=>{const x=await consultation('grave');const p=await request('doctor','POST','/prescriptions',{type:'AMBULATORY',userId:fixture.users.doctor.id,consultationId:x.consultation.id,items:[{serviceId:fixture.services.drug.id,quantity:'1',dose:'1',frequency:'diária',canal:'oral',duration:1}]});await request('doctor','POST','/ambulatory-plans',{prescriptionId:p.id,customerId:x.customer.id},400);assert.equal(await prisma.ambulatoryPlan.count({where:{prescriptionId:p.id}}),0);});
test('simultaneous admissions get unique references and exactly one screening each',async()=>{
 const customer=await request('attendant','POST','/customers',{name:'TESTE Admissões concorrentes',phone:'000000004',source:'Teste operacional'});
 const admitted=await Promise.all(Array.from({length:4},()=>request('attendant','POST','/attendances',{customerId:customer.id,serviceId:fixture.services.consultation.id})));
 assert.equal(new Set(admitted.map(a=>a.reference)).size,4);for(const a of admitted)assert.equal(await prisma.screening.count({where:{attendanceId:a.id}}),1);
});
test('observation may repeat a consultation exam without duplicate display or identity errors',async()=>{
 const x=await consultation('grave');await request('doctor','POST',`/request-exams/${x.consultation.id}`,{exams:[fixture.services.exam.id]});
 const o=await observe(x,services.observation,[fixture.services.exam.id]);await request('attendant','PATCH',`/observations/${o.id}`,{paid:true});
 const queue=await request('analyst','GET','/request-exams');const c=queue.find(c=>c.id===x.consultation.id);assert.equal(c.exams.length,1);assert.equal(c.observation[0].exams.length,1);
 const child=c.observation[0].exams[0];await request('analyst','POST','/request-exams',[{id:child.id,consultationId:x.consultation.id,result:{value:'15'},resultText:'Repetição na observação',resultColor:'GREEN'}]);
 const detail=await request('doctor','GET',`/consultations/${x.consultation.id}`);assert.equal(detail.exams.length,1);assert.equal(detail.observation[0].exams[0].resultText,'Repetição na observação');
});
test('recording diagnosis does not remove a running patient from the medical queue',async()=>{const x=await consultation('normal');await request('doctor','PATCH',`/consultations/${x.consultation.id}`,{diagnosis:'Diagnóstico provisório'});assert.ok((await request('doctor','GET','/consultations')).some(c=>c.id===x.consultation.id));await finish(x);assert.ok(!(await request('doctor','GET','/consultations')).some(c=>c.id===x.consultation.id));});
test('screening queue searches active patients and retains waits exceeding 24 hours',async()=>{const customer=await request('attendant','POST','/customers',{name:`TESTE Fila ${randomUUID()}`,phone:'000000005',source:'Teste operacional'});const a=await request('attendant','POST','/attendances',{customerId:customer.id,serviceId:fixture.services.consultation.id});const detail=await request('attendant','GET',`/attendances/${a.id}`);await prisma.screening.update({where:{id:detail.screening.id},data:{updatedAt:new Date(Date.now()-48*3600000)}});const queue=await request('nurse','GET',`/screenings?queue=true&search=${encodeURIComponent(customer.name)}`);assert.equal(queue.length,1);assert.equal(queue[0].id,detail.screening.id);assert.ok(['PENDING','RUNNING'].includes(queue[0].status));});
