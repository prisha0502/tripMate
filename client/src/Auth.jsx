import {createContext,useContext,useEffect,useState} from 'react';
import {api} from './api';
const C=createContext(null);
export function AuthProvider({children}){const [session,setSession]=useState(()=>{try{return JSON.parse(localStorage.getItem('tripmate-session'))}catch{return null}});useEffect(()=>{if(session)localStorage.setItem('tripmate-session',JSON.stringify(session));else localStorage.removeItem('tripmate-session')},[session]);const login=async(email,password)=>{const s=await api('/login',{method:'POST',body:JSON.stringify({email,password})});setSession(s);return s.user};const register=async(name,email,password)=>{const s=await api('/register',{method:'POST',body:JSON.stringify({name,email,password})});setSession(s);return s.user};return <C.Provider value={{session,user:session?.user,token:session?.token,login,register,logout:()=>setSession(null)}}>{children}</C.Provider>}
export const useAuth=()=>useContext(C);
