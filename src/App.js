import { useState, useEffect, useRef, useCallback } from "react";

// ── Utility helpers ──────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toLocaleString();

// ── Theme tokens ─────────────────────────────────────────────
const DARK = {
  bg:"#07070e", surface:"#0d0d1a", card:"#111124", cardHover:"#161630",
  border:"#1c1c38", borderLight:"#252548", primary:"#5b6cf9", primaryHover:"#4a5ae8",
  primaryGlow:"rgba(91,108,249,0.25)", accent:"#00cfa8", accentGlow:"rgba(0,207,168,0.2)",
  danger:"#f95b5b", warn:"#f9a825", success:"#00cfa8", text:"#e4e4f0",
  textMuted:"#6b6b92", textFaint:"#3a3a5c", editor:"#060610",
};
const LIGHT = {
  bg:"#f0f0f8", surface:"#ffffff", card:"#ffffff", cardHover:"#f7f7ff",
  border:"#ddddf0", borderLight:"#eeeef8", primary:"#4a5ae8", primaryHover:"#3a4ad8",
  primaryGlow:"rgba(74,90,232,0.15)", accent:"#00a885", accentGlow:"rgba(0,168,133,0.15)",
  danger:"#e04343", warn:"#e08800", success:"#00a885", text:"#1a1a2e",
  textMuted:"#5a5a7a", textFaint:"#aaaacc", editor:"#fafafe",
};

// ── Seed data ─────────────────────────────────────────────────
const TEMPLATES = [
  { id:"py-hello", name:"Python Starter", lang:"python", icon:"🐍",
    code:`# Python Hello World\nprint("Hello, CodeNest!")\n\nname = "Developer"\nprint(f"Welcome {name}!")` },
  { id:"js-app", name:"JavaScript App", lang:"javascript", icon:"🟨",
    code:`// JavaScript Hello World\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet("CodeNest"));\nconsole.log("Running on CodeNest!");` },
  { id:"ts-basic", name:"TypeScript Basic", lang:"typescript", icon:"🔷",
    code:`// TypeScript Example\ninterface User {\n  name: string;\n  age: number;\n}\n\nconst user: User = {\n  name: "CodeNest",\n  age: 1\n};\n\nconsole.log(\`Hello \${user.name}!\`);` },
  { id:"cpp-algo", name:"C++ Algorithm", lang:"cpp", icon:"⚡",
    code:`#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {5,2,8,1,9,3};\n    sort(nums.begin(), nums.end());\n    for(int n : nums) cout << n << " ";\n    cout << endl;\n    return 0;\n}` },
  { id:"java-oop", name:"Java OOP", lang:"java", icon:"☕",
    code:`public class Main {\n    static class Animal {\n        String name;\n        Animal(String n) { this.name = n; }\n        void speak() { System.out.println(name + " speaks!"); }\n    }\n    public static void main(String[] args) {\n        Animal a = new Animal("Dog");\n        a.speak();\n    }\n}` },
  { id:"php-web", name:"PHP Script", lang:"php", icon:"🐘",
    code:`<?php\n$name = "CodeNest";\necho "Hello from $name!\\n";\n\n$fruits = ["Apple","Banana","Cherry"];\nforeach($fruits as $f) echo "- $f\\n";\n?>` },
];

const PLANS = [
  { id:"free", name:"Starter", price:0, color:"#6b6b92",
    features:["3 Projects","Community Support","1GB Storage","Shared CPU","Public Only"] },
  { id:"pro", name:"Pro", price:12, color:"#5b6cf9", popular:true,
    features:["Unlimited Projects","Priority Support","10GB Storage","Dedicated CPU","Private Projects","AI Assistant 100/mo","Custom Domain"] },
  { id:"team", name:"Team", price:39, color:"#00cfa8",
    features:["Everything in Pro","5 Team Members","50GB Storage","Real-time Collab","AI 500/mo","Admin Panel","SLA Guarantee"] },
  { id:"enterprise", name:"Enterprise", price:null, color:"#f9a825",
    features:["Custom Members","Unlimited Storage","Dedicated Servers","AI Unlimited","On-premise Deploy","SSO/SAML","24/7 Support"] },
];

const SAMPLE_USERS = [
  { id:"u1", name:"Alice Chen", email:"alice@example.com", plan:"pro", status:"active", projects:12, revenue:144 },
  { id:"u2", name:"Bob Kumar", email:"bob@example.com", plan:"team", status:"active", projects:34, revenue:468 },
  { id:"u3", name:"Carol Smith", email:"carol@example.com", plan:"free", status:"active", projects:3, revenue:0 },
  { id:"u4", name:"Dave Lee", email:"dave@example.com", plan:"pro", status:"suspended", projects:8, revenue:72 },
  { id:"u5", name:"Eve Wilson", email:"eve@example.com", plan:"enterprise", status:"active", projects:67, revenue:1200 },
];

const LANG_COLORS = { python:"#3572A5", javascript:"#f1e05a", typescript:"#3178c6", cpp:"#f34b7d", java:"#b07219", php:"#4F5D95" };
const LANG_ICONS = { python:"🐍", javascript:"🟨", typescript:"🔷", cpp:"⚡", java:"☕", php:"🐘" };

// ── Global CSS ──────────────────────────────────────────────
const injectCSS = () => {
  if (document.getElementById("cn-css")) return;
  const s = document.createElement("style");
  s.id = "cn-css";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',sans-serif}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-thumb{background:#2a2a50;border-radius:3px}
    .syne{font-family:'Syne',sans-serif}
    .mono{font-family:'JetBrains Mono',monospace}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    @keyframes glow{0%,100%{box-shadow:0 0 10px rgba(91,108,249,0.3)}50%{box-shadow:0 0 28px rgba(91,108,249,0.7)}}
    .fade{animation:fadeUp 0.35s ease both}
    .spin{animation:spin 1s linear infinite}
    .pulse{animation:pulse 2s ease infinite}
    .btn{transition:all 0.15s ease;cursor:pointer;border:none;outline:none}
    .btn:hover{filter:brightness(1.12)}
    .btn:active{transform:scale(0.96)}
    .card{transition:transform 0.2s,box-shadow 0.2s}
    .card:hover{transform:translateY(-2px)}
    .inp{transition:border-color 0.2s,box-shadow 0.2s;outline:none}
    textarea{resize:none}
    .dotbg{background-image:radial-gradient(rgba(91,108,249,0.12) 1px,transparent 1px);background-size:28px 28px}
  `;
  document.head.appendChild(s);
};

// ── Storage ──────────────────────────────────────────────────
const store = {
  get:(k,d)=>{ try{return JSON.parse(localStorage.getItem(k))??d}catch{return d} },
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)),
};

// ── AI Call ──────────────────────────────────────────────────
async function callAI(system, msg, onChunk) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:1000, stream:true,
      system, messages:[{role:"user",content:msg}],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let full = "";
  while(true) {
    const {done,value} = await reader.read();
    if(done) break;
    for(const line of dec.decode(value).split("\n")) {
      if(!line.startsWith("data: ")) continue;
      const d = line.slice(6).trim();
      if(d==="[DONE]") break;
      try{ const t=JSON.parse(d).delta?.text||""; if(t){full+=t;onChunk(full);} }catch{}
    }
  }
  return full;
}

// ═══════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════

function Spinner({size=18,color="#5b6cf9"}) {
  return <div className="spin" style={{width:size,height:size,borderRadius:"50%",
    border:`2px solid ${color}30`,borderTopColor:color,flexShrink:0}}/>;
}

function Badge({children,color="#5b6cf9"}) {
  return <span style={{background:`${color}22`,color,border:`1px solid ${color}44`,
    borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{children}</span>;
}

function Btn({children,onClick,variant="primary",size="md",disabled,icon,style:sx,T}) {
  const T2=T||DARK;
  const base={display:"flex",alignItems:"center",gap:6,borderRadius:8,fontWeight:600,
    fontFamily:"'DM Sans',sans-serif",cursor:disabled?"not-allowed":"pointer",border:"none",
    transition:"all 0.15s",opacity:disabled?0.5:1,whiteSpace:"nowrap"};
  const sz={sm:{padding:"6px 12px",fontSize:12},md:{padding:"9px 18px",fontSize:14},lg:{padding:"12px 26px",fontSize:15}};
  const vars={
    primary:{background:T2.primary,color:"#fff",boxShadow:`0 0 18px ${T2.primaryGlow}`},
    ghost:{background:"transparent",color:T2.textMuted,border:`1px solid ${T2.border}`},
    danger:{background:`${T2.danger}20`,color:T2.danger,border:`1px solid ${T2.danger}44`},
    accent:{background:T2.accent,color:"#07070e"},
    outline:{background:"transparent",color:T2.primary,border:`1px solid ${T2.primary}`},
  };
  return (
    <button className="btn" style={{...base,...sz[size],...vars[variant],...sx}}
      onClick={!disabled?onClick:undefined} disabled={disabled}>
      {icon&&<span style={{fontSize:15}}>{icon}</span>}{children}
    </button>
  );
}

function Inp({label,value,onChange,type="text",placeholder,T,icon,style:sx}) {
  const T2=T||DARK;
  const [f,setF]=useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {label&&<label style={{fontSize:13,fontWeight:600,color:T2.textMuted}}>{label}</label>}
      <div style={{position:"relative",display:"flex",alignItems:"center"}}>
        {icon&&<span style={{position:"absolute",left:11,fontSize:15,color:T2.textFaint}}>{icon}</span>}
        <input className="inp" type={type} value={value} onChange={e=>onChange(e.target.value)}
          placeholder={placeholder} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
          style={{width:"100%",background:T2.surface,border:`1.5px solid ${f?T2.primary:T2.border}`,
            borderRadius:8,padding:icon?"10px 12px 10px 36px":"10px 12px",color:T2.text,fontSize:14,
            fontFamily:"'DM Sans',sans-serif",boxShadow:f?`0 0 0 3px ${T2.primaryGlow}`:"none",
            outline:"none",...sx}}/>
      </div>
    </div>
  );
}

function Modal({open,onClose,title,children,T,width=500}) {
  const T2=T||DARK;
  if(!open) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",
      zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
      onClick={onClose}>
      <div className="fade" style={{background:T2.card,border:`1px solid ${T2.border}`,borderRadius:16,
        width:"100%",maxWidth:width,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 40px 80px rgba(0,0,0,0.5)"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{padding:"18px 22px",borderBottom:`1px solid ${T2.border}`,display:"flex",
          justifyContent:"space-between",alignItems:"center"}}>
          <span className="syne" style={{fontWeight:700,fontSize:16,color:T2.text}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:T2.textMuted,fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:22}}>{children}</div>
      </div>
    </div>
  );
}

function Toast({msg,type="success",onClose}) {
  const c={success:"#00cfa8",error:"#f95b5b",info:"#5b6cf9",warn:"#f9a825"}[type];
  useEffect(()=>{const t=setTimeout(onClose,3500);return()=>clearTimeout(t)},[]);
  return (
    <div className="fade" style={{background:"#111124",border:`1px solid ${c}44`,borderRadius:10,
      padding:"12px 16px",display:"flex",gap:10,alignItems:"center",
      boxShadow:`0 8px 32px rgba(0,0,0,0.4)`,minWidth:230,maxWidth:340}}>
      <span style={{fontSize:17}}>{type==="success"?"✅":type==="error"?"❌":type==="warn"?"⚠️":"ℹ️"}</span>
      <span style={{color:"#e4e4f0",fontSize:13,flex:1}}>{msg}</span>
      <button onClick={onClose} style={{background:"none",border:"none",color:"#6b6b92",cursor:"pointer"}}>✕</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// TOPBAR
// ═══════════════════════════════════════════════════
function TopBar({page,setPage,user,setUser,isDark,setDark,T}) {
  const [menu,setMenu]=useState(false);
  const nav=user?.isAdmin
    ?[{id:"admin",label:"Admin",icon:"🛡️"}]
    :[{id:"dashboard",label:"Dashboard",icon:"⊞"},{id:"editor",label:"Editor",icon:"✏️"},{id:"pricing",label:"Pricing",icon:"💎"}];
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,height:54,background:`${T.surface}ee`,
      backdropFilter:"blur(12px)",borderBottom:`1px solid ${T.border}`,zIndex:1000,
      display:"flex",alignItems:"center",padding:"0 18px",gap:16}}>
      <button className="btn" onClick={()=>setPage(user?"dashboard":"landing")}
        style={{background:"none",border:"none",display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:30,height:30,background:T.primary,borderRadius:8,display:"flex",
          alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:`0 0 14px ${T.primaryGlow}`}}>🪺</div>
        <span className="syne" style={{fontWeight:800,fontSize:17,color:T.text,letterSpacing:"-0.5px"}}>
          Code<span style={{color:T.primary}}>Nest</span>
        </span>
      </button>
      {user&&<nav style={{display:"flex",gap:4,flex:1}}>
        {nav.map(n=>(
          <button key={n.id} className="btn" onClick={()=>setPage(n.id)}
            style={{background:page===n.id?`${T.primary}18`:"none",border:"none",
              color:page===n.id?T.primary:T.textMuted,padding:"6px 13px",borderRadius:8,
              fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:13}}>{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>}
      {!user&&<div style={{flex:1}}/>}
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <button className="btn" onClick={()=>setDark(d=>!d)}
          style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,
            padding:"6px 9px",fontSize:15,color:T.textMuted}}>{isDark?"☀️":"🌙"}</button>
        {user?(
          <div style={{position:"relative"}}>
            <button className="btn" onClick={()=>setMenu(m=>!m)}
              style={{display:"flex",alignItems:"center",gap:7,background:T.card,
                border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 9px 5px 5px"}}>
              <div style={{width:27,height:27,background:T.primary,borderRadius:6,display:"flex",
                alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff"}}>
                {user.name[0]}
              </div>
              <span style={{fontSize:13,fontWeight:600,color:T.text}}>{user.name}</span>
              <span style={{fontSize:9,color:T.textMuted}}>▼</span>
            </button>
            {menu&&(
              <div className="fade" style={{position:"absolute",right:0,top:"calc(100%+5px)",
                background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:8,
                minWidth:170,zIndex:9999,boxShadow:"0 20px 40px rgba(0,0,0,0.3)"}}>
                {[
                  {l:"⚙️ Settings",a:()=>{setPage("settings");setMenu(false)}},
                  {l:"📊 Dashboard",a:()=>{setPage("dashboard");setMenu(false)}},
                  {l:"💎 Upgrade",a:()=>{setPage("pricing");setMenu(false)}},
                  {l:"🚪 Logout",a:()=>{setUser(null);setPage("landing");setMenu(false)}},
                ].map(item=>(
                  <button key={item.l} className="btn" onClick={item.a}
                    style={{width:"100%",textAlign:"left",background:"none",border:"none",
                      color:item.l.includes("Logout")?T.danger:T.text,padding:"8px 11px",
                      borderRadius:6,fontSize:13,fontWeight:500}}>{item.l}</button>
                ))}
              </div>
            )}
          </div>
        ):(
          <div style={{display:"flex",gap:7}}>
            <Btn T={T} variant="ghost" size="sm" onClick={()=>setPage("login")}>Login</Btn>
            <Btn T={T} size="sm" onClick={()=>setPage("signup")}>Get Started</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// PAGE: LANDING
// ═══════════════════════════════════════════════════
function Landing({setPage,T}) {
  const features=[
    {icon:"📝",title:"Smart Code Editor",desc:"Monaco-powered with IntelliSense, syntax highlighting for 10+ languages."},
    {icon:"🤖",title:"AI Coding Assistant",desc:"Generate, debug, explain and optimize code with Claude AI inside your project."},
    {icon:"🚀",title:"One-Click Deploy",desc:"Deploy static sites, Node apps, Python services with zero configuration."},
    {icon:"👥",title:"Real-Time Collab",desc:"Code together live. Share projects, comment, and build as a team."},
    {icon:"🔒",title:"Secure Sandbox",desc:"Every run is in an isolated Docker container with CPU/RAM limits."},
    {icon:"📦",title:"50+ Templates",desc:"Bootstrap projects instantly from battle-tested templates."},
  ];
  return (
    <div style={{minHeight:"100vh",background:T.bg,paddingTop:54}}>
      {/* Hero */}
      <div className="dotbg" style={{position:"relative",padding:"90px 24px 70px",textAlign:"center",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"20%",left:"5%",width:400,height:400,
          background:T.primaryGlow,borderRadius:"50%",filter:"blur(80px)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"40%",right:"5%",width:280,height:280,
          background:T.accentGlow,borderRadius:"50%",filter:"blur(60px)",pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <Badge color={T.accent}>🚀 AI-Powered Cloud IDE</Badge>
          <h1 className="syne fade" style={{fontSize:"clamp(34px,6vw,68px)",fontWeight:800,
            color:T.text,lineHeight:1.1,marginTop:18,marginBottom:18,letterSpacing:"-2px"}}>
            Build. Deploy. Collaborate.<br/>
            <span style={{background:`linear-gradient(135deg,${T.primary},${T.accent})`,
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              All in One Place.
            </span>
          </h1>
          <p style={{fontSize:17,color:T.textMuted,maxWidth:560,margin:"0 auto 32px",lineHeight:1.7}}>
            CodeNest is the cloud IDE for modern developers. Write, run, and ship code from your browser — no setup needed.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <Btn T={T} size="lg" onClick={()=>setPage("signup")} icon="🪺">Start Building Free</Btn>
            <Btn T={T} size="lg" variant="ghost" onClick={()=>setPage("pricing")} icon="💎">View Pricing</Btn>
          </div>
          <p style={{fontSize:12,color:T.textFaint,marginTop:14}}>No credit card · Free forever plan</p>
        </div>
      </div>
      {/* Editor mockup */}
      <div style={{padding:"0 24px 70px",maxWidth:860,margin:"0 auto"}}>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden",
          boxShadow:`0 40px 80px rgba(0,0,0,0.35),0 0 0 1px ${T.primary}20`}}>
          <div style={{background:T.surface,padding:"10px 14px",display:"flex",alignItems:"center",
            gap:7,borderBottom:`1px solid ${T.border}`}}>
            {["#f95b5b","#f9a825","#00cfa8"].map(c=><div key={c} style={{width:11,height:11,borderRadius:"50%",background:c}}/>)}
            <span style={{fontSize:12,color:T.textMuted,marginLeft:6,fontFamily:"'JetBrains Mono',monospace"}}>main.py — CodeNest</span>
          </div>
          <div style={{display:"flex",minHeight:240}}>
            <div style={{background:T.editor,padding:"14px 0",width:38,textAlign:"right",borderRight:`1px solid ${T.border}`}}>
              {Array.from({length:10},(_,i)=>(
                <div key={i} style={{fontSize:11,color:T.textFaint,padding:"0 8px",lineHeight:"22px",fontFamily:"'JetBrains Mono',monospace"}}>{i+1}</div>
              ))}
            </div>
            <pre c
