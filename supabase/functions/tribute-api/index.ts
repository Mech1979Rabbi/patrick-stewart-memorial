// Supabase Edge Function: tribute-api
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TURNSTILE_SECRET, ALLOWED_ORIGIN
import { createClient } from "npm:@supabase/supabase-js@2";
const cors=(origin:string)=>({"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"content-type","Vary":"Origin"});
const locations:Record<string,[number,number]>={DE:[51,10],GB:[54,-2],US:[39,-98],ES:[40,-4],FR:[46,2],CA:[56,-106],MX:[23,-102],BR:[-10,-52],IN:[21,78],JP:[36,138],AU:[-25,134],IT:[42,12],NL:[52,5],PL:[52,19],AR:[-34,-64],ZA:[-29,24],ID:[-2,118],PH:[13,122],NZ:[-41,174]};
export async function handler(req: Request){
 try {
 const allowed=Deno.env.get("ALLOWED_ORIGIN")||"";
 const origin=req.headers.get("origin")||"";
 const headers={...cors(allowed),"Content-Type":"application/json"};
 if(!allowed||origin!==allowed)return new Response(JSON.stringify({error:"Origin not allowed"}),{status:403,headers});
 if(req.method==="OPTIONS")return new Response(null,{headers});
 if(!["GET","POST"].includes(req.method))return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers});
 const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!key)return new Response(JSON.stringify({error:"Not configured"}),{status:503,headers});
 const db=createClient(url,key,{auth:{persistSession:false}});
 if(req.method==="GET"){
  const {data,error}=await db.from("tributes").select("display_name,country_code,message,created_at").eq("status","approved").order("created_at",{ascending:false}).limit(500);
  if(error)return new Response(JSON.stringify({error:"Unable to load tributes"}),{status:500,headers});
  return new Response(JSON.stringify({tributes:(data||[]).map(x=>({name:x.display_name,message:x.message,country:x.country_code,lat:locations[x.country_code]?.[0]??0,lng:locations[x.country_code]?.[1]??0,date:x.created_at}))}),{headers});
 }
 if(Number(req.headers.get("content-length"))>16384)return new Response(JSON.stringify({error:"Payload too large"}),{status:413,headers});
 let body:any;try{const raw=await req.text();if(new TextEncoder().encode(raw).length>16384)return new Response(JSON.stringify({error:"Payload too large"}),{status:413,headers});body=JSON.parse(raw)}catch{return new Response(JSON.stringify({error:"Invalid JSON"}),{status:400,headers})}
 if(!body||typeof body!=="object"||Array.isArray(body)||!["name","message","country","token"].every(k=>typeof body[k]==="string"))return new Response(JSON.stringify({error:"Invalid submission"}),{status:400,headers});
 const name=String(body.name||"").trim(),message=String(body.message||"").trim(),country=String(body.country||"").toUpperCase(),token=String(body.token||"");
 if(name.length<1||name.length>70||message.length<5||message.length>1200||!Object.hasOwn(locations,country)||token.length<5||token.length>2048)return new Response(JSON.stringify({error:"Invalid submission"}),{status:400,headers});
 const secret=Deno.env.get("TURNSTILE_SECRET");
 if(!secret)return new Response(JSON.stringify({error:"Captcha not configured"}),{status:503,headers});

 const check=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({secret,response:token}),signal:AbortSignal.timeout(10000)});
 const verification=await check.json();
 if(!check.ok||verification.success!==true||verification.hostname!==new URL(allowed).hostname)return new Response(JSON.stringify({error:"Captcha failed"}),{status:403,headers});
 const {error}=await db.from("tributes").insert({display_name:name,country_code:country,message,status:"pending"});
 if(error)return new Response(JSON.stringify({error:"Submission failed"}),{status:500,headers});
 return new Response(JSON.stringify({ok:true,status:"pending"}),{status:202,headers});
 } catch {
 return new Response(JSON.stringify({error:"Service temporarily unavailable"}),{status:503,headers:{...cors(Deno.env.get("ALLOWED_ORIGIN")||""),"Content-Type":"application/json"}});
 }
}
Deno.serve(handler);
