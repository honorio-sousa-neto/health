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
 for(const role of (process.env.JOURNEY_FORMS_ONLY ? [] : Object.keys(fixture.users))){
  try{await login(role);for(const destination of destinosPesquisaveis(menuParaPapel(role))){context={role,page:destination.to.name};const startRuntime=runtime.length,startResponses=responses.length;await navigate(destination.to);const errors=runtime.slice(startRuntime),requests=responses.slice(startResponses);const failed=requests.filter(r=>r.status>=400);const text=await evaluate('document.body.innerText');const blank=!text.trim()||await evaluate(`document.querySelector('#q-app').innerHTML.trim()===''`);console.log(role,destination.to.name);report.pages.push({role,name:destination.to.name,title:destination.title,passed:!errors.length&&!failed.length&&!blank,errors,failedRequests:failed});}}
  catch(error){report.errors.push({role,message:error.message});}
 }
 await login('attendant');context={role:'attendant',page:'browser-admission'};
 const seed=await evaluate(`(async()=>{const api=${app}.config.globalProperties.$api;const customer=(await api.post('customers',{name:'TESTE Browser paciente',phone:'000000001',source:'Teste browser'})).data.data;const attendance=(await api.post('attendances',{customerId:customer.id,serviceId:${JSON.stringify(fixture.services.consultation.id)}})).data.data;return(await api.get('attendances/'+attendance.id)).data.data;})()`);
 await login('nurse');context={role:'nurse',page:'screening-form'};await navigate({name:'editar-triagem',params:{consultationId:seed.screening.id}});await wait(`!!document.querySelector('.field-group input')`);
 await evaluate(`(()=>{const fields=[...document.querySelectorAll('.field-group')];for(const [label,value] of [['Peso (kg)','70'],['Altura (cm)','170']]){const input=fields.find(f=>f.textContent.includes(label)).querySelector('input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));}document.querySelectorAll('.vc-options').forEach(group=>group.querySelector('button')?.click());[...document.querySelectorAll('button')].find(b=>b.innerText.includes('Concluir triagem')).click();})()`);
 await wait(`!document.body.innerText.includes('Concluir triagem')`);
 const screening=await evaluate(`(async()=>{const api=${app}.config.globalProperties.$api;return(await api.get('screenings/'+${JSON.stringify(seed.screening.id)})).data.data;})()`);assert.equal(screening.status,'FINISHED');assert.equal(screening.weight,'70');report.forms.push({role:'nurse',name:'screening',passed:true});
 await login('doctor');context={role:'doctor',page:'consultation-form'};
 const queue=await evaluate(`(async()=>{return(await ${app}.config.globalProperties.$api.get('consultations',{params:{perPage:100}})).data.data;})()`);const consultation=queue.find(c=>c.screeningId===seed.screening.id);assert.ok(consultation,'Screened patient in doctor queue');
 await navigate({name:'medico-atendimento',params:{consultationId:consultation.id}});await wait(`document.body.innerText.includes('Terminar consulta')`);
 await evaluate(`(()=>{const fields=[...document.querySelectorAll('textarea')];const input=fields.at(-1);Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(input,'Diagnóstico sintético browser');input.dispatchEvent(new Event('input',{bubbles:true}));})()`);await sleep(1800);
 await evaluate(`[...document.querySelectorAll('button')].find(b=>b.innerText.includes('Terminar consulta')).click()`);await wait(`document.body.innerText.includes('Consulta terminada')`);report.forms.push({role:'doctor',name:'consultation',passed:true});
 const unsafe=responses.filter(r=>!r.url.startsWith(fixture.api+'/')&&r.url!==fixture.api);assert.equal(unsafe.length,0,'All browser API requests target the isolated API');
}catch(error){report.errors.push({...context,message:error.message,html:await evaluate('document.querySelector("#q-app").innerHTML').catch(()=> '')});}
finally{
 report.runtime=runtime;report.requestCount=responses.length;await writeFile('/tmp/health-journey-browser-results.json',JSON.stringify(report,null,2));ws?.close();chrome?.kill('SIGTERM');await sleep(300);server.closeAllConnections();await new Promise(r=>server.close(r));await rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:500});
}
const failures=report.pages.filter(p=>!p.passed);console.log(JSON.stringify({logins:report.logins.length,pages:report.pages.length,forms:report.forms,failedPages:failures.map(p=>({role:p.role,page:p.name,errors:p.errors,requests:p.failedRequests})),errors:report.errors},null,2));
if(failures.length||report.errors.length)process.exitCode=1;
