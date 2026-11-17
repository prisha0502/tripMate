const BASE='/api';
export async function api(path,{token,...options}={}){const res=await fetch(`${BASE}${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`} :{}),...options?.headers}});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||'Request failed. Please try again.');return data}
