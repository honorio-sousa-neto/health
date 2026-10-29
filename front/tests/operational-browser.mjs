import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { menuParaPapel, destinosPesquisaveis } from '../src/config/menu.js';
const fixture=JSON.parse(await readFile('/tmp/health-journey-fixture.json','utf8'));
assert.equal(fixture.api,'http://127.0.0.1:18020/api');
const root=path.resolve(process.env.JOURNEY_SPA_DIR||'dist/spa');
const profile=await mkdtemp(path.join(tmpdir(),'health-journey-browser-'));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png'};
const server=http.createServer(async(req,res)=>{try{const file=path.resolve(root,'.'+(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404).end();}});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let chrome,ws,seq=0,context={role:null,page:null},runtime=[],responses=[],pending=new Map();
const report={logins:[],pages:[],forms:[],errors:[]};
function send(method,params={}){const id=++seq;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending.delete(id);reject(new Error('CDP timeout: '+method))},20000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result?.value;}
async function wait(expression,ms=12000){const start=Date.now();while(Date.now()-start<ms){try{if(await evaluate(expression))return;}catch{}await sleep(100);}throw new Error('Wait failed: '+expression);}
const app=`document.querySelector('#q-app').__vue_app__`;
const router=`${app}.config.globalProperties.$router`;
async function navigate(to){await evaluate(`void ${router}.push(${JSON.stringify(to)})`);await sleep(450);}
async function login(role){context={role,page:'login'};await evaluate('sessionStorage.clear();localStorage.clear()');await send('Page.navigate',{url:base+'/#/login'});await wait(`!!document.querySelector('input[type="password"]')`);const user=fixture.users[role];await evaluate(`(()=>{const inputs=[...document.querySelectorAll('input')];for(const [el,value] of [[inputs.find(x=>x.type!=='password'),${JSON.stringify(user.username)}],[inputs.find(x=>x.type==='password'),${JSON.stringify(user.password)}]]){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}document.querySelector('form').requestSubmit();})()`);await wait(`location.hash.includes('bem-vindo')`);assert.ok(await evaluate(`document.body.innerText.includes(${JSON.stringify('TESTE '+role)})`),'User identity visible: '+role);report.logins.push({role,passed:true});}
let base;
try{
 await new Promise(resolve=>server.listen(19008,'127.0.0.1',resolve));base='http://127.0.0.1:19008';
 chrome=spawn('google-chrome',['--headless=new','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--no-first-run','--no-default-browser-check','--window-size=1440,1000','--remote-debugging-port=0','--remote-debugging-address=127.0.0.1',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
 let port;for(let i=0;i<100;i++){try{port=(await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break;}catch{await sleep(100)}}assert.ok(port,'Chrome remote debugging started');
 const tabs=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});
 ws.addEventListener('message',event=>{const packet=JSON.parse(event.data);if(packet.id){const entry=pending.get(packet.id);if(entry){clearTimeout(entry.timer);pending.delete(packet.id);packet.error?entry.reject(new Error(packet.error.message)):entry.resolve(packet.result)}return;}if(packet.method==='Runtime.exceptionThrown')runtime.push({...context,message:packet.params.exceptionDetails.exception?.description||packet.params.exceptionDetails.text});if(packet.method==='Network.responseReceived'&&packet.params.response.url.includes('/api/')){const r=packet.params.response;responses.push({...context,url:r.url,status:r.status});}});
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Page.navigate',{url:base+'/#/login'});await wait(`!!document.querySelector('input[type="password"]')`);
 const scenarios=[{key:'normal',label:'Não urgente',color:'GREEN',pulse:'75',pressure:'110/70'},{key:'grave',label:'Urgência',color:'ORANGE',pulse:'110',pressure:'125/80'},{key:'muitoGrave',label:'Emergência',color:'RED',pulse:'140',pressure:'150/100'}];
 const patients=[];const marker=String(Date.now());
 for(const scenario of scenarios){
  await login('attendant');
  const seed=await evaluate(`(async()=>{const api=${app}.config.globalProperties.$api;const customer=(await api.post('customers',{name:${JSON.stringify('TESTE Browser '+marker+' '+scenario.key)},phone:'000000003',source:'Teste operacional browser'})).data.data;const a=(await api.post('attendances',{customerId:customer.id,serviceId:${JSON.stringify(fixture.services.consultation.id)}})).data.data;return(await api.get('attendances/'+a.id)).data.data;})()`);
  await login('nurse');context={role:'nurse',page:scenario.key+'-screening'};await navigate({name:'editar-triagem',params:{consultationId:seed.screening.id}});await wait(`!!document.querySelector('.field-group input') && document.querySelector('.status-badge')?.textContent.trim()==='Em triagem'`);
  await evaluate(`(()=>{const fill=(el,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));};const fields=[...document.querySelectorAll('.field-group')];fill(fields.find(f=>f.textContent.includes('Peso (kg)')).querySelector('input'),'70');fill(fields.find(f=>f.textContent.includes('Altura (cm)')).querySelector('input'),'170');document.querySelectorAll('input[type=radio][value=${scenario.color}]').forEach(r=>r.click());fill(document.querySelector('input[placeholder="ex: 80"]'),${JSON.stringify(scenario.pulse)});fill(document.querySelector('input[placeholder="ex: 120/80"]'),${JSON.stringify(scenario.pressure)});})()`);
  await wait(`document.querySelector('.sev-label')?.textContent.trim()===${JSON.stringify(scenario.label)} && ![...document.querySelectorAll('button')].find(b=>b.textContent.includes('Concluir triagem')).disabled`);
  await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Concluir triagem')).click()`);await wait(`!document.querySelector('.field-group input')`);
  const screening=await evaluate(`(async()=>{return(await ${app}.config.globalProperties.$api.get('screenings/'+${JSON.stringify(seed.screening.id)})).data.data})()`);assert.equal(screening.status,'FINISHED');assert.equal(screening.oxygen,scenario.color);report.forms.push({role:'nurse',name:scenario.key+'-screening',passed:true});patients.push({...scenario,seed});
 }
 await login('doctor');context={role:'doctor',page:'priority-queue'};await navigate({name:'medico-lista-atendimento'});
 await wait(`!!document.querySelector('input[placeholder="Pesquisar…"]')`);
 await evaluate(`(()=>{const input=document.querySelector('input[placeholder="Pesquisar…"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(marker)});input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
 await wait(`document.querySelectorAll('.fl-nome').length===3`);
 const order=await evaluate(`[...document.querySelectorAll('.fl-nome')].map(el=>el.textContent.trim())`);assert.deepEqual(order.map(name=>name.split(' ').at(-1)),['muitoGrave','grave','normal']);report.pages.push({role:'doctor',name:'severity-priority',passed:true,errors:[],failedRequests:[]});

 // A pending autosave must stay attached to its original patient.
 const queueForSwitch=await evaluate(`(async()=>{return(await ${app}.config.globalProperties.$api.get('consultations')).data.data})()`);
 const first=queueForSwitch.find(c=>c.screeningId===patients[0].seed.screening.id),second=queueForSwitch.find(c=>c.screeningId===patients[1].seed.screening.id);
 await navigate({name:'medico-atendimento',params:{consultationId:first.id}});await wait(`!!document.querySelector('.cf-wrap textarea')`);
 await evaluate(`(()=>{const input=[...document.querySelectorAll('.cf-wrap textarea')].at(-1);Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,'AUTOSAVE PACIENTE ORIGINAL');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
 await navigate({name:'medico-atendimento',params:{consultationId:second.id}});await wait(`document.querySelector('.vh-name')?.textContent.includes(${JSON.stringify('grave')})`);await wait(`(async()=>{return(await ${app}.config.globalProperties.$api.get('consultations/'+${JSON.stringify(first.id)})).data.data.diagnosis==='AUTOSAVE PACIENTE ORIGINAL'})()`);
 const switched=await evaluate(`(async()=>{const api=${app}.config.globalProperties.$api;return[(await api.get('consultations/'+${JSON.stringify(first.id)})).data.data,(await api.get('consultations/'+${JSON.stringify(second.id)})).data.data]})()`);
 assert.equal(switched[0].diagnosis,'AUTOSAVE PACIENTE ORIGINAL');assert.notEqual(switched[1].diagnosis,'AUTOSAVE PACIENTE ORIGINAL');report.pages.push({role:'doctor',name:'autosave-patient-isolation',passed:true,errors:[],failedRequests:[]});
 for(const scenario of patients){
  context={role:'doctor',page:scenario.key+'-consultation'};
  const queue=await evaluate(`(async()=>{return(await ${app}.config.globalProperties.$api.get('consultations')).data.data})()`);const c=queue.find(c=>c.screeningId===scenario.seed.screening.id);assert.ok(c);
  await navigate({name:'medico-atendimento',params:{consultationId:c.id}});await wait(`!![...document.querySelectorAll('button')].find(b=>b.textContent.includes('Terminar consulta'))`);
  const disabled=await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Terminar consulta')).disabled`);assert.equal(disabled,scenario.key!=='normal','Referral required for '+scenario.key);
  if(scenario.key!=='normal'){
   const prefix=scenario.key==='grave'?'os':'is';await wait(`!!document.querySelector('.${prefix}-option')`);await evaluate(`document.querySelector('.${prefix}-option').click()`);
   const label=scenario.key==='grave'?'Solicitar observação':'Solicitar observação de emergência';await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes(${JSON.stringify(label)})).click()`);
   await wait(`![...document.querySelectorAll('button')].find(b=>b.textContent.includes('Terminar consulta')).disabled`);
   // Reopening must preserve the referral and keep completion available.
   await navigate({name:'welcome'});await navigate({name:'medico-atendimento',params:{consultationId:c.id}});await wait(`!![...document.querySelectorAll('button')].find(b=>b.textContent.includes('Terminar consulta'))`);assert.equal(await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Terminar consulta')).disabled`),false);
  }
  await evaluate(`(()=>{const input=[...document.querySelectorAll('textarea')].at(-1);Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,'Diagnóstico sintético operacional');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);await sleep(1500);
  await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Terminar consulta')).click()`);await wait(`!!document.querySelector('.done-chip')`);
  const saved=await evaluate(`(async()=>{return(await ${app}.config.globalProperties.$api.get('consultations/'+${JSON.stringify(c.id)})).data.data})()`);assert.equal(saved.status,'done');report.forms.push({role:'doctor',name:scenario.key+'-consultation',passed:true});
 }
 const unsafe=responses.filter(r=>!r.url.startsWith(fixture.api+'/')&&r.url!==fixture.api);assert.equal(unsafe.length,0,'All browser API requests target the isolated API');
}catch(error){report.errors.push({...context,message:error.message,html:await evaluate('document.querySelector("#q-app").innerHTML').catch(()=> '')});}
finally{
 report.runtime=runtime;report.requestCount=responses.length;await writeFile('/tmp/health-operational-browser-results.json',JSON.stringify(report,null,2));ws?.close();chrome?.kill('SIGTERM');await sleep(300);server.closeAllConnections();await new Promise(r=>server.close(r));await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:500});
}
const failures=report.pages.filter(p=>!p.passed);console.log(JSON.stringify({logins:report.logins.length,pages:report.pages.length,forms:report.forms,failedPages:failures.map(p=>({role:p.role,page:p.name,errors:p.errors,requests:p.failedRequests})),errors:report.errors},null,2));
if(failures.length||report.errors.length)process.exitCode=1;
