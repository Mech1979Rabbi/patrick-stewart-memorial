import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
const source=stripTypeScriptTypes(readFileSync('supabase/functions/tribute-api/index.ts','utf8').replace(/^import .*;$/m,'').replace('export async function','async function'));
function setup({captcha=true,hostname='example.org',dbError=false}={}) {
 let inserted,filter;
 const query={select(){return this},eq(k,v){filter=[k,v];return this},order(){return this},async limit(){return {data:[],error:dbError}},async insert(row){inserted=row;return {error:dbError}}};
 const context=vm.createContext({Request,Response,TextEncoder,URL,AbortSignal,createClient:()=>({from:()=>query}),fetch:async()=>({ok:true,json:async()=>({success:captcha,hostname})}),Deno:{env:{get:k=>({ALLOWED_ORIGIN:'https://example.org',SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-only',TURNSTILE_SECRET:'test-only'})[k]},serve(){}}});
 vm.runInContext(source,context);
 return {send:(body,method='POST',origin='https://example.org')=>context.handler(new Request('https://example.org/api',{method,headers:{origin,'content-type':'application/json'},...(method==='POST'?{body:JSON.stringify(body)}:{})})),inserted:()=>inserted,filter:()=>filter};
}
const valid={name:'Visitor',message:'Thank you for your work',country:'DE',token:'test-token'};
test('submissions publish directly regardless of supplied status',async()=>{const api=setup();assert.equal((await api.send({...valid,status:'pending'})).status,201);assert.equal(api.inserted().status,'approved')});
test('only approved rows are queried',async()=>{const api=setup();assert.equal((await api.send(null,'GET')).status,200);assert.equal(api.filter().join(','),'status,approved')});
test('malformed payloads never insert',async()=>{for(const body of [null,[],{}, {...valid,name:{}},{...valid,country:'OTHER'},{...valid,country:'constructor'},{...valid,token:'x'.repeat(2049)}]){const api=setup();assert.equal((await api.send(body)).status,400);assert.equal(api.inserted(),undefined)}});
test('wrong origin is denied',async()=>assert.equal((await setup().send(valid,'POST','https://attacker.example')).status,403));
test('captcha failure and hostname mismatch deny insert',async()=>{for(const options of [{captcha:false},{hostname:'attacker.example'}]){const api=setup(options);assert.equal((await api.send(valid)).status,403);assert.equal(api.inserted(),undefined)}});
test('database errors are reported',async()=>assert.equal((await setup({dbError:true}).send(valid)).status,500));
test('oversized payload rejected',async()=>assert.equal((await setup().send({...valid,message:'x'.repeat(17000)})).status,413));
test('city point is rounded and published',async()=>{const api=setup();assert.equal((await api.send({...valid,city:'Berlin',latitude:52.52123,longitude:13.40123,status:'approved'})).status,201);assert.equal(api.inserted().latitude,52.52);assert.equal(api.inserted().status,'approved')});
test('invalid and partial points never insert',async()=>{for(const point of [{latitude:91,longitude:0},{latitude:0,longitude:181},{latitude:52},{latitude:'52',longitude:13},{latitude:null,longitude:null},{city:'Berlin'},{latitude:0,longitude:0,city:'x'.repeat(101)}]){const api=setup();assert.equal((await api.send({...valid,...point})).status,400);assert.equal(api.inserted(),undefined)}});
