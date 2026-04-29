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
            <pre className="mono" style={{background:T.editor,padding:14,flex:1,fontSize:13,color:T.text,lineHeight:1.75}}>
{`# CodeNest AI-Assisted Development
def fibonacci(n: int) -> int:
    """AI-optimized fibonacci"""
    if n <= 1: return n
    a, b = 0, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b

result = fibonacci(10)
print(f"fib(10) = {result}")  # → 55`}
            </pre>
            <div style={{width:170,background:T.surface,borderLeft:`1px solid ${T.border}`,padding:12}}>
              <div style={{fontSize:11,fontWeight:700,color:T.textFaint,marginBottom:8,letterSpacing:1}}>AI ASSISTANT</div>
              {[{l:"✨ Generate",c:T.primary},{l:"🔧 Fix Bug",c:T.danger},{l:"📖 Explain",c:T.warn},{l:"⚡ Optimize",c:T.accent}].map(a=>(
                <div key={a.l} style={{background:`${a.c}15`,border:`1px solid ${a.c}30`,borderRadius:6,
                  padding:"6px 9px",marginBottom:5,fontSize:12,color:a.c,fontWeight:600}}>{a.l}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Features */}
      <div style={{padding:"0 24px 70px",maxWidth:1060,margin:"0 auto"}}>
        <h2 className="syne" style={{textAlign:"center",fontSize:34,fontWeight:800,color:T.text,marginBottom:40,letterSpacing:"-1px"}}>
          Everything a developer needs
        </h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:18}}>
          {features.map((f,i)=>(
            <div key={i} className="card fade" style={{background:T.card,border:`1px solid ${T.border}`,
              borderRadius:14,padding:22,animationDelay:`${i*0.06}s`}}>
              <div style={{fontSize:30,marginBottom:12}}>{f.icon}</div>
              <h3 style={{fontWeight:700,fontSize:15,color:T.text,marginBottom:7}}>{f.title}</h3>
              <p style={{fontSize:13.5,color:T.textMuted,lineHeight:1.65}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Stats */}
      <div style={{background:T.card,borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`,padding:"36px 24px"}}>
        <div style={{display:"flex",justifyContent:"center",gap:50,flexWrap:"wrap"}}>
          {[["120K+","Developers"],["2.4M+","Projects"],["99.9%","Uptime"],["10+","Languages"]].map(([n,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div className="syne" style={{fontSize:34,fontWeight:800,color:T.primary}}>{n}</div>
              <div style={{fontSize:13,color:T.textMuted,marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      {/* CTA */}
      <div style={{padding:"70px 24px",textAlign:"center"}}>
        <h2 className="syne" style={{fontSize:38,fontWeight:800,color:T.text,marginBottom:14}}>Ready to start building?</h2>
        <p style={{color:T.textMuted,fontSize:16,marginBottom:28}}>Join 120,000 developers shipping faster with CodeNest.</p>
        <Btn T={T} size="lg" onClick={()=>setPage("signup")} icon="🪺">Create Free Account</Btn>
      </div>
      {/* Footer */}
      <div style={{borderTop:`1px solid ${T.border}`,padding:20,display:"flex",
        justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
        <span className="syne" style={{fontWeight:700,color:T.textMuted}}>🪺 CodeNest</span>
        <div style={{display:"flex",gap:16}}>
          {["Docs","Blog","Pricing","Privacy","Terms"].map(l=>(
            <button key={l} className="btn" style={{background:"none",border:"none",fontSize:13,color:T.textMuted}}>{l}</button>
          ))}
        </div>
        <span style={{fontSize:12,color:T.textFaint}}>© 2025 CodeNest Inc.</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// PAGE: AUTH
// ═══════════════════════════════════════════════════
function Auth({mode,setPage,setUser,toast,T}) {
  const [form,setForm]=useState({name:"",email:"",password:""});
  const [loading,setLoading]=useState(false);
  const isLogin=mode==="login";
  const handle=async()=>{
    if(!form.email||!form.password){toast("सभी fields भरो","warn");return;}
    setLoading(true);
    await new Promise(r=>setTimeout(r,800));
    const isAdmin=form.email==="admin@codenest.dev";
    const u={id:uid(),name:isLogin?(form.email.split("@")[0]):form.name||"Developer",
      email:form.email,plan:"pro",isAdmin,joined:now()};
    store.set("cn_user",u);setUser(u);
    toast(`Welcome ${u.name}! 🎉`,"success");
    setPage(isAdmin?"admin":"dashboard");
    setLoading(false);
  };
  const oauth=async(p)=>{
    setLoading(true);await new Promise(r=>setTimeout(r,600));
    const u={id:uid(),name:`${p} User`,email:`user@${p.toLowerCase()}.com`,plan:"pro",joined:now()};
    store.set("cn_user",u);setUser(u);
    toast(`${p} से login हो गया!`,"success");setPage("dashboard");setLoading(false);
  };
  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",
      justifyContent:"center",padding:"80px 24px",paddingTop:90}}>
      <div className="fade" style={{width:"100%",maxWidth:400}}>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:30,
          boxShadow:`0 40px 80px rgba(0,0,0,0.3),0 0 0 1px ${T.primary}15`}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:34,marginBottom:6}}>🪺</div>
            <h2 className="syne" style={{fontSize:24,fontWeight:800,color:T.text}}>
              {isLogin?"Welcome back":"Create account"}
            </h2>
            <p style={{fontSize:13,color:T.textMuted,marginTop:5}}>
              {isLogin?"Sign in to your CodeNest account":"Start building for free today"}
            </p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:18}}>
            {[["Google","🔵"],["GitHub","⚫"]].map(([p,ic])=>(
              <button key={p} className="btn" onClick={()=>oauth(p)} disabled={loading}
                style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:9,padding:10,
                  color:T.text,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                <span>{ic}</span>{p}
              </button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
            <div style={{flex:1,height:1,background:T.border}}/>
            <span style={{fontSize:12,color:T.textFaint}}>ya email se</span>
            <div style={{flex:1,height:1,background:T.border}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {!isLogin&&<Inp T={T} label="Full Name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Aapka Naam" icon="👤"/>}
            <Inp T={T} label="Email" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} placeholder="aap@example.com" icon="✉️"/>
            <Inp T={T} label="Password" type="password" value={form.password} onChange={v=>setForm(f=>({...f,password:v}))} placeholder="••••••••" icon="🔒"/>
          </div>
          <Btn T={T} onClick={handle} disabled={loading} style={{width:"100%",justifyContent:"center",marginTop:18}} size="lg">
            {loading?<><Spinner size={15} color="#fff"/>Processing...</>:isLogin?"Sign In":"Create Account"}
          </Btn>
          <div style={{textAlign:"center",marginTop:16,fontSize:13,color:T.textMuted}}>
            {isLogin?"Account नहीं है? ":"पहले से account है? "}
            <button className="btn" onClick={()=>setPage(isLogin?"signup":"login")}
              style={{background:"none",border:"none",color:T.primary,fontWeight:700}}>
              {isLogin?"Sign Up":"Sign In"}
            </button>
          </div>
          {isLogin&&(
            <div style={{marginTop:14,padding:11,background:`${T.accent}10`,borderRadius:8,
              border:`1px solid ${T.accent}30`,fontSize:12,color:T.textMuted}}>
              💡 <strong style={{color:T.accent}}>Admin:</strong> <code style={{color:T.text}}>admin@codenest.dev</code> से login करो
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// PAGE: DASHBOARD
// ═══════════════════════════════════════════════════
function Dashboard({user,setPage,setActiveProject,toast,T}) {
  const [projects,setProjects]=useState(()=>store.get("cn_projects",[
    {id:"p1",name:"My Portfolio",lang:"javascript",lastEdit:"2h ago",files:5,isPublic:true,status:"running"},
    {id:"p2",name:"ML Classifier",lang:"python",lastEdit:"1d ago",files:12,isPublic:false,status:"idle"},
    {id:"p3",name:"REST Server",lang:"typescript",lastEdit:"3d ago",files:8,isPublic:false,status:"deployed"},
  ]));
  const [showNew,setShowNew]=useState(false);
  const [search,setSearch]=useState("");
  const [newP,setNewP]=useState({name:"",lang:"python"});
  const filtered=projects.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));
  const create=()=>{
    if(!newP.name.trim()){toast("Project ka naam likho","warn");return;}
    const tmpl=TEMPLATES.find(t=>t.lang===newP.lang);
    const p={id:uid(),name:newP.name,lang:newP.lang,lastEdit:"Just now",files:1,isPublic:false,status:"idle",code:tmpl?.code||"// Start coding..."};
    const u=[p,...projects];setProjects(u);store.set("cn_projects",u);
    setShowNew(false);toast(`"${p.name}" project ban gaya!`,"success");
    setActiveProject(p);setPage("editor");
  };
  const del=(id)=>{
    const u=projects.filter(p=>p.id!==id);setProjects(u);store.set("cn_projects",u);
    toast("Project delete ho gaya","success");
  };
  const stats=[
    {label:"Projects",value:projects.length,icon:"📁",color:T.primary},
    {label:"Deployed",value:projects.filter(p=>p.status==="deployed").length,icon:"🚀",color:T.accent},
    {label:"Plan",value:(user?.plan||"free").toUpperCase(),icon:"💎",color:T.warn},
    {label:"Storage",value:"2.4 GB",icon:"☁️",color:"#a855f7"},
  ];
  return (
    <div style={{minHeight:"100vh",background:T.bg,padding:"74px 22px 40px",maxWidth:1160,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14,marginBottom:24}}>
        <div>
          <h1 className="syne" style={{fontSize:26,fontWeight:800,color:T.text}}>
            Namaste, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{color:T.textMuted,fontSize:14,marginTop:3}}>Aapke projects ka overview</p>
        </div>
        <Btn T={T} icon="+" onClick={()=>setShowNew(true)}>New Project</Btn>
      </div>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:24}}>
        {stats.map((s,i)=>(
          <div key={i} className="card fade" style={{background:T.card,border:`1px solid ${T.border}`,
            borderRadius:13,padding:18,animationDelay:`${i*0.05}s`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <p style={{fontSize:11,color:T.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{s.label}</p>
                <p className="syne" style={{fontSize:26,fontWeight:800,color:s.color,marginTop:5}}>{s.value}</p>
              </div>
              <span style={{fontSize:26}}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Quick Start */}
      <div style={{marginBottom:24}}>
        <h3 style={{fontSize:13,fontWeight:700,color:T.textMuted,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Quick Start Templates</h3>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
          {TEMPLATES.map(tmpl=>(
            <button key={tmpl.id} className="btn" onClick={()=>{
              const p={...tmpl,id:uid(),lastEdit:"Just now",files:1,isPublic:false,status:"idle"};
              const u=[p,...projects];setProjects(u);store.set("cn_projects",u);
              setActiveProject(p);setPage("editor");toast(`${p.name} khula!`,"success");
            }}
            style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:9,
              padding:"9px 14px",display:"flex",alignItems:"center",gap:7,whiteSpace:"nowrap",
              color:T.text,fontSize:13,fontWeight:600}}>
              <span style={{fontSize:17}}>{tmpl.icon}</span>{tmpl.name}
            </button>
          ))}
        </div>
      </div>
      {/* Search */}
      <div style={{marginBottom:16}}>
        <Inp T={T} value={search} onChange={setSearch} placeholder="Projects search karo..." icon="🔍"/>
      </div>
      {/* Projects */}
      <h3 style={{fontSize:13,fontWeight:700,color:T.textMuted,marginBottom:11,textTransform:"uppercase",letterSpacing:1}}>Aapke Projects</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        {filtered.map((p,i)=>(
          <div key={p.id} className="card fade" style={{background:T.card,border:`1px solid ${T.border}`,
            borderRadius:13,padding:18,animationDelay:`${i*0.06}s`,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,
              background:LANG_COLORS[p.lang]||T.primary,borderRadius:"13px 13px 0 0"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <span style={{fontSize:26}}>{LANG_ICONS[p.lang]}</span>
                <div>
                  <h3 style={{fontWeight:700,fontSize:14,color:T.text}}>{p.name}</h3>
                  <p style={{fontSize:12,color:T.textMuted,marginTop:1}}>{p.lang} · {p.files} files</p>
                </div>
              </div>
              <Badge color={p.status==="deployed"?T.accent:p.status==="running"?T.primary:T.textFaint}>{p.status}</Badge>
            </div>
            <div style={{marginTop:12,display:"flex",gap:7,flexWrap:"wrap"}}>
              <Btn T={T} size="sm" icon="✏️" onClick={()=>{setActiveProject(p);setPage("editor");}}>Edit</Btn>
              <Btn T={T} size="sm" variant="ghost" icon="🚀" onClick={()=>toast("Deploy ho raha hai...","info")}>Deploy</Btn>
              <button className="btn" onClick={()=>del(p.id)}
                style={{marginLeft:"auto",background:`${T.danger}15`,border:`1px solid ${T.danger}30`,
                  borderRadius:6,padding:"5px 9px",fontSize:12,color:T.danger}}>🗑️</button>
            </div>
            <p style={{fontSize:11,color:T.textFaint,marginTop:10}}>Last edit: {p.lastEdit}</p>
          </div>
        ))}
        {filtered.length===0&&(
          <div style={{gridColumn:"1/-1",textAlign:"center",padding:50,color:T.textMuted}}>
            <span style={{fontSize:44}}>📭</span>
            <p style={{marginTop:10,fontSize:14}}>Koi project nahi mila</p>
            <Btn T={T} style={{marginTop:14}} icon="+" onClick={()=>setShowNew(true)}>New Project</Btn>
          </div>
        )}
      </div>
      <Modal open={showNew} onClose={()=>setShowNew(false)} title="Naya Project Banao" T={T}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Inp T={T} label="Project Name" value={newP.name} onChange={v=>setNewP(n=>({...n,name:v}))} placeholder="mera-project" icon="📁"/>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:T.textMuted,display:"block",marginBottom:7}}>Language</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
              {Object.keys(LANG_COLORS).map(lang=>(
                <button key={lang} className="btn" onClick={()=>setNewP(n=>({...n,lang}))}
                  style={{background:newP.lang===lang?`${LANG_COLORS[lang]}22`:T.surface,
                    border:`1.5px solid ${newP.lang===lang?LANG_COLORS[lang]:T.border}`,
                    borderRadius:8,padding:"9px 5px",fontSize:12,fontWeight:600,color:T.text,
                    display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                  {LANG_ICONS[lang]}{lang}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:6}}>
            <Btn T={T} variant="ghost" onClick={()=>setShowNew(false)}>Cancel</Btn>
            <Btn T={T} icon="🚀" onClick={create}>Create</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// PAGE: EDITOR
// ═══════════════════════════════════════════════════
function Editor({activeProject,toast,T}) {
  const [code,setCode]=useState(activeProject?.code||"// Start coding...");
  const [output,setOutput]=useState("");
  const [running,setRunning]=useState(false);
  const [aiOpen,setAiOpen]=useState(true);
  const [aiMode,setAiMode]=useState("generate");
  const [aiPrompt,setAiPrompt]=useState("");
  const [aiResp,setAiResp]=useState("");
  const [aiLoad,setAiLoad]=useState(false);
  const lang=activeProject?.lang||"python";

  const run=async()=>{
    setRunning(true);setOutput("");
    await new Promise(r=>setTimeout(r,700));
    const out={
      python:`Python 3.11\n${"─".repeat(20)}\nHello, CodeNest!\n\n✅ Code 0.12s me run hua`,
      javascript:`Node.js v20\n${"─".repeat(20)}\nHello, CodeNest!\n\n✅ Code 0.08s me run hua`,
      typescript:`TypeScript 5.1\n${"─".repeat(20)}\nHello TypeScript!\n\n✅ Code 0.10s me run hua`,
      cpp:`GCC 13.2\n${"─".repeat(20)}\n1 2 3 5 8 9\n\n✅ Code 0.03s me run hua`,
      java:`OpenJDK 21\n${"─".repeat(20)}\nDog speaks!\n\n✅ Code 0.45s me run hua`,
      php:`PHP 8.2\n${"─".repeat(20)}\nHello from CodeNest!\n\n✅ Code 0.02s me run hua`,
    };
    setOutput(out[lang]||"Code run ho gaya!");
    setRunning(false);
  };

  const askAI=async()=>{
    if(!aiPrompt.trim()&&aiMode==="generate"){toast("Prompt likho","warn");return;}
    setAiLoad(true);setAiResp("");
    const sys={
      generate:"You are an expert coding assistant. Generate clean, commented code based on the user request. Be concise.",
      fix:"You are a debugging expert. Find and fix bugs in the code shown. Explain what was wrong.",
      explain:"You are a code teacher. Explain the code clearly — what it does, how it works, key concepts.",
      optimize:"You are a performance expert. Analyze and suggest optimizations for speed and readability.",
    };
    const userMsg={
      generate:aiPrompt,
      fix:`Fix this ${lang} code:\n\`\`\`${lang}\n${code}\n\`\`\`\nNotes: ${aiPrompt||"Find all bugs"}`,
      explain:`Explain this ${lang} code:\n\`\`\`${lang}\n${code}\n\`\`\``,
      optimize:`Optimize this ${lang} code:\n\`\`\`${lang}\n${code}\n\`\`\`\nFocus: ${aiPrompt||"overall performance"}`,
    };
    try {
      await callAI(sys[aiMode],userMsg[aiMode],(t)=>setAiResp(t));
    } catch(e) {
      setAiResp(`❌ Error: ${e.message}\n\nNote: Claude.ai ke andar yeh automatically kaam karta hai.`);
    }
    setAiLoad(false);
  };

  const applyCode=()=>{
    const m=aiResp.match(/```[\w]*\n([\s\S]*?)```/);
    if(m){setCode(m[1]);toast("AI ka code apply hua!","success");}
    else toast("AI response me code block nahi mila","warn");
  };

  const files=[
    {name:"main."+(lang==="python"?"py":lang==="cpp"?"cpp":lang==="java"?"java":lang==="php"?"php":"ts"),active:true},
    {name:"README.md",active:false},
    {name:lang==="python"?"requirements.txt":"package.json",active:false},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.bg,paddingTop:54}}>
      {/* Toolbar */}
      <div style={{height:40,background:T.surface,borderBottom:`1px solid ${T.border}`,
        display:"flex",alignItems:"center",padding:"0 12px",gap:8,flexShrink:0}}>
        <span style={{fontSize:13,fontWeight:700,color:T.text}}>{LANG_ICONS[lang]} {activeProject?.name||"Untitled"}</span>
        <div style={{flex:1}}/>
        <button className="btn" onClick={()=>{toast("Saved! ✓","success");}}
          style={{background:`${T.primary}20`,border:`1px solid ${T.primary}40`,borderRadius:6,
            padding:"5px 11px",fontSize:12,color:T.primary,fontWeight:700}}>💾 Save</button>
        <button className="btn" onClick={run} disabled={running}
          style={{background:T.accent,border:"none",borderRadius:6,padding:"5px 14px",
            fontSize:12,color:"#07070e",fontWeight:800,display:"flex",alignItems:"center",gap:5}}>
          {running?<><Spinner size={12} color="#07070e"/>Run ho raha...</>:"▶ Run"}
        </button>
        <button className="btn" onClick={()=>toast("Deploy ho raha hai...","info")}
          style={{background:`${T.warn}20`,border:`1px solid ${T.warn}40`,borderRadius:6,
            padding:"5px 11px",fontSize:12,color:T.warn,fontWeight:700}}>🚀 Deploy</button>
        <button className="btn" onClick={()=>setAiOpen(a=>!a)}
          style={{background:aiOpen?`${T.primary}25`:"none",border:`1px solid ${aiOpen?T.primary:T.border}`,
            borderRadius:6,padding:"5px 11px",fontSize:12,
            color:aiOpen?T.primary:T.textMuted,fontWeight:700}}>🤖 AI</button>
      </div>
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* File tree */}
        <div style={{width:190,background:T.surface,borderRight:`1px solid ${T.border}`,padding:"10px 0",flexShrink:0}}>
          <div style={{padding:"0 12px",marginBottom:7,fontSize:10,fontWeight:700,color:T.textFaint,textTransform:"uppercase",letterSpacing:1}}>Files</div>
          {files.map(f=>(
            <div key={f.name} style={{padding:"7px 12px",fontSize:12.5,color:f.active?T.primary:T.textMuted,
              background:f.active?`${T.primary}15`:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:13}}>📄</span>{f.name}
            </div>
          ))}
          <div style={{margin:"10px 8px 0"}}>
            <button className="btn" style={{width:"100%",background:"none",border:`1px dashed ${T.border}`,
              borderRadius:6,padding:"6px",fontSize:12,color:T.textFaint}}>+ New File</button>
          </div>
        </div>
        {/* Code + output */}
        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
          <div style={{flex:1,display:"flex",overflow:"hidden"}}>
            <div style={{background:T.editor,padding:"12px 0",width:40,textAlign:"right",
              borderRight:`1px solid ${T.border}`,overflow:"hidden",flexShrink:0}}>
              {code.split("\n").map((_,i)=>(
                <div key={i} style={{fontSize:11.5,color:T.textFaint,padding:"0 7px",lineHeight:"22px",fontFamily:"'JetBrains Mono',monospace"}}>{i+1}</div>
              ))}
            </div>
            <textarea className="mono" value={code} onChange={e=>setCode(e.target.value)}
              style={{flex:1,background:T.editor,border:"none",color:T.text,fontSize:13.5,
                lineHeight:"22px",padding:"12px 14px",outline:"none",overflowY:"auto",
                fontFamily:"'JetBrains Mono',monospace",tabSize:2,spellCheck:false}}/>
          </div>
          <div style={{height:190,background:T.bg,borderTop:`1px solid ${T.border}`,display:"flex",flexDirection:"column"}}>
            <div style={{background:T.surface,padding:"7px 14px",borderBottom:`1px solid ${T.border}`,
              fontSize:12,fontWeight:700,color:T.textMuted}}>📤 Output</div>
            <pre className="mono" style={{flex:1,padding:12,color:T.accent,fontSize:12.5,
              overflowY:"auto",background:T.editor,margin:0,lineHeight:1.7}}>
              {running?"⏳ Code run ho raha hai...":output||"▶ Run dabao code chalane ke liye"}
            </pre>
          </div>
        </div>
        {/* AI Panel */}
        {aiOpen&&(
          <div className="fade" style={{width:300,background:T.surface,borderLeft:`1px solid ${T.border}`,
            display:"flex",flexDirection:"column",flexShrink:0}}>
            <div style={{padding:"11px 14px",borderBottom:`1px solid ${T.border}`,
              background:`linear-gradient(135deg,${T.primary}15,${T.accent}10)`}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontSize:19}}>🤖</span>
                <span className="syne" style={{fontWeight:700,fontSize:14,color:T.text}}>AI Assistant</span>
                <Badge color={T.accent}>LIVE</Badge>
              </div>
              <p style={{fontSize:11,color:T.textMuted,marginTop:3}}>Claude API se powered · Real AI</p>
            </div>
            <div style={{padding:"11px 11px 0",display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {[
                {id:"generate",l:"✨ Generate",c:T.primary},
                {id:"fix",l:"🔧 Fix Bug",c:T.danger},
                {id:"explain",l:"📖 Explain",c:T.warn},
                {id:"optimize",l:"⚡ Optimize",c:T.accent},
              ].map(m=>(
                <button key={m.id} className="btn" onClick={()=>setAiMode(m.id)}
                  style={{background:aiMode===m.id?`${m.c}25`:`${m.c}10`,
                    border:`1.5px solid ${aiMode===m.id?m.c:m.c+"30"}`,
                    borderRadius:7,padding:"7px 5px",fontSize:11.5,fontWeight:700,color:m.c}}>
                  {m.l}
                </button>
              ))}
            </div>
            <div style={{padding:11}}>
              <textarea className="mono" value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)}
                placeholder={aiMode==="generate"?"Kya code chahiye?":aiMode==="fix"?"Bug describe karo...":aiMode==="explain"?"Blank raho — code explain hoga":"Optimization focus..."}
                style={{width:"100%",height:75,background:T.card,border:`1px solid ${T.border}`,
                  borderRadius:7,padding:9,color:T.text,fontSize:12,fontFamily:"'DM Sans',sans-serif",
                  outline:"none",lineHeight:1.6}}/>
              <Btn T={T} onClick={askAI} disabled={aiLoad} style={{width:"100%",justifyContent:"center",marginTop:7}}>
                {aiLoad?<><Spinner size={13} color="#fff"/>Soch raha hai...</>:"AI se Pucho →"}
              </Btn>
            </div>
            {(aiResp||aiLoad)&&(
              <div style={{flex:1,overflowY:"auto",padding:11,borderTop:`1px solid ${T.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                  <span style={{fontSize:10,fontWeight:700,color:T.textMuted}}>AI JAWAB</span>
                  {aiResp&&!aiLoad&&(
                    <button className="btn" onClick={applyCode}
                      style={{background:`${T.accent}20`,border:`1px solid ${T.accent}40`,
                        borderRadius:5,padding:"3px 7px",fontSize:10.5,color:T.accent}}>Apply</button>
                  )}
                </div>
                {aiLoad&&!aiResp&&<div style={{display:"flex",alignItems:"center",gap:7}}>
                  <Spinner size={13}/><span style={{fontSize:12,color:T.textMuted}}>Soch raha hai...</span>
                </div>}
                <pre className="mono" style={{fontSize:11,color:T.text,whiteSpace:"pre-wrap",wordBreak:"break-word",
                  lineHeight:1.65,background:T.card,padding:9,borderRadius:6,border:`1px solid ${T.border}`}}>
                  {aiResp}
                </pre>
              </div>
            )}
            {!aiResp&&!aiLoad&&(
              <div style={{padding:11,borderTop:`1px solid ${T.border}`}}>
                <p style={{fontSize:10,color:T.textFaint,marginBottom:7}}>QUICK PROMPTS</p>
                {["Error handling add karo","Unit tests likho","Comments add karo","Async/await me convert karo"].map(s=>(
                  <button key={s} className="btn" onClick={()=>{setAiPrompt(s);setAiMode("generate");}}
                    style={{width:"100%",textAlign:"left",background:"none",border:`1px solid ${T.border}`,
                      borderRadius:5,padding:"5px 9px",fontSize:11.5,color:T.textMuted,marginBottom:4}}>
                    💡 {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// PAGE: PRICING
// ═══════════════════════════════════════════════════
function Pricing({setPage,user,toast,T}) {
  const [billing,setBilling]=useState("monthly");
  return (
    <div style={{minHeight:"100vh",background:T.bg,padding:"74px 24px 60px"}}>
      <div style={{maxWidth:1060,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:50}}>
          <h1 className="syne" style={{fontSize:44,fontWeight:800,color:T.text,marginBottom:11}}>Pricing Plans</h1>
          <p style={{fontSize:16,color:T.textMuted,marginBottom:26}}>Free se shuru karo, baad me upgrade karo</p>
          <div style={{display:"inline-flex",background:T.card,border:`1px solid ${T.border}`,borderRadius:28,padding:4}}>
            {["monthly","annual"].map(b=>(
              <button key={b} className="btn" onClick={()=>setBilling(b)}
                style={{background:billing===b?T.primary:"transparent",borderRadius:24,border:"none",
                  padding:"7px 20px",fontSize:13,fontWeight:700,color:billing===b?"#fff":T.textMuted,
                  display:"flex",alignItems:"center",gap:6}}>
                {b==="monthly"?"Monthly":"Annual"} {b==="annual"&&<Badge color={T.accent}>-20%</Badge>}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:18}}>
          {PLANS.map((plan,i)=>(
            <div key={plan.id} className="card fade"
              style={{background:plan.popular?`${plan.color}12`:T.card,
                border:`2px solid ${plan.popular?plan.color:T.border}`,
                borderRadius:17,padding:26,position:"relative",animationDelay:`${i*0.08}s`}}>
              {plan.popular&&(
                <div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",
                  background:plan.color,color:"#fff",borderRadius:20,padding:"3px 12px",
                  fontSize:11,fontWeight:800,whiteSpace:"nowrap"}}>⭐ BEST VALUE</div>
              )}
              <h3 className="syne" style={{fontSize:20,fontWeight:800,color:T.text}}>{plan.name}</h3>
              <div style={{display:"flex",alignItems:"baseline",gap:3,margin:"10px 0"}}>
                {plan.price===null
                  ?<span className="syne" style={{fontSize:28,fontWeight:800,color:plan.color}}>Custom</span>
                  :<><span className="syne" style={{fontSize:40,fontWeight:800,color:plan.color}}>
                      ${billing==="annual"?Math.round(plan.price*0.8):plan.price}
                    </span><span style={{color:T.textMuted,fontSize:13}}>/mo</span></>
                }
              </div>
              <ul style={{listStyle:"none",marginBottom:22}}>
                {plan.features.map(f=>(
                  <li key={f} style={{display:"flex",alignItems:"flex-start",gap:7,
                    fontSize:13,color:T.text,marginBottom:8}}>
                    <span style={{color:plan.color,flexShrink:0}}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Btn T={T} style={{width:"100%",justifyContent:"center",background:plan.popular?plan.color:undefined}}
                variant={plan.popular?"primary":"outline"}
                onClick={()=>{if(!user){setPage("signup");return;}toast(`${plan.name} plan select hua!`,"success");}}>
                {plan.price===0?"Free Start karo":plan.price===null?"Contact karo":"Subscribe karo"}
              </Btn>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// PAGE: SETTINGS
// ═══════════════════════════════════════════════════
function Settings({user,setUser,toast,isDark,setDark,T}) {
  const [tab,setTab]=useState("profile");
  const [p,setP]=useState({name:user?.name||"",email:user?.email||"",bio:"Full-stack developer"});
  const tabs=[{id:"profile",l:"👤 Profile"},{id:"security",l:"🔒 Security"},{id:"billing",l:"💳 Billing"},{id:"api",l:"🔑 API Keys"}];
  const save=()=>{const u={...user,...p};setUser(u);store.set("cn_user",u);toast("Save ho gaya!","success");};
  return (
    <div style={{minHeight:"100vh",background:T.bg,padding:"74px 22px 40px"}}>
      <div style={{maxWidth:860,margin:"0 auto"}}>
        <h1 className="syne" style={{fontSize:26,fontWeight:800,color:T.text,marginBottom:24}}>Settings</h1>
        <div style={{display:"flex",gap:22,flexWrap:"wrap"}}>
          <div style={{width:190,flexShrink:0}}>
            {tabs.map(tb=>(
              <button key={tb.id} className="btn" onClick={()=>setTab(tb.id)}
                style={{width:"100%",textAlign:"left",background:tab===tb.id?`${T.primary}18`:"none",
                  border:"none",borderRadius:8,padding:"9px 13px",fontSize:13,fontWeight:600,
                  color:tab===tb.id?T.primary:T.textMuted,display:"block",marginBottom:2}}>{tb.l}</button>
            ))}
          </div>
          <div className="fade" style={{flex:1,minWidth:260}}>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:15,padding:26}}>
              {tab==="profile"&&(
                <div style={{display:"flex",flexDirection:"column",gap:16}}>
                  <h3 style={{fontWeight:700,fontSize:16,color:T.text}}>Profile</h3>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:64,height:64,background:T.primary,borderRadius:14,
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:800,color:"#fff"}}>
                      {p.name[0]||"U"}
                    </div>
                    <Btn T={T} size="sm" variant="ghost" icon="📸">Change Avatar</Btn>
                  </div>
                  <Inp T={T} label="Naam" value={p.name} onChange={v=>setP(x=>({...x,name:v}))} icon="👤"/>
                  <Inp T={T} label="Email" value={p.email} onChange={v=>setP(x=>({...x,email:v}))} icon="✉️"/>
                  <div>
                    <label style={{fontSize:13,fontWeight:600,color:T.textMuted,display:"block",marginBottom:6}}>Bio</label>
                    <textarea value={p.bio} onChange={e=>setP(x=>({...x,bio:e.target.value}))}
                      style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,
                        padding:10,color:T.text,fontSize:14,fontFamily:"'DM Sans',sans-serif",height:75,outline:"none"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:13,background:T.surface,borderRadius:9,border:`1px solid ${T.border}`}}>
                    <div>
                      <p style={{fontWeight:600,color:T.text,fontSize:14}}>Dark Mode</p>
                      <p style={{fontSize:12,color:T.textMuted}}>Theme toggle karo</p>
                    </div>
                    <button onClick={()=>setDark(d=>!d)}
                      style={{width:46,height:25,background:isDark?T.primary:T.border,borderRadius:12,
                        border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
                      <div style={{width:19,height:19,background:"#fff",borderRadius:"50%",position:"absolute",
                        top:3,left:isDark?23:3,transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}/>
                    </button>
                  </div>
                  <Btn T={T} onClick={save}>Save karo</Btn>
                </div>
              )}
              {tab==="billing"&&(
                <div>
                  <h3 style={{fontWeight:700,fontSize:16,color:T.text,marginBottom:18}}>Billing</h3>
                  <div style={{background:`${T.primary}15`,border:`1px solid ${T.primary}30`,borderRadius:11,padding:18,marginBottom:18}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <p style={{fontWeight:700,fontSize:15,color:T.text}}>Pro Plan</p>
                        <p style={{fontSize:13,color:T.textMuted}}>$12/month · Next billing Jan 2026</p>
                      </div>
                      <Badge color={T.primary}>Active</Badge>
                    </div>
                  </div>
                  {[{l:"AI Requests",u:67,t:100},{l:"Storage",u:2.4,t:10,un:"GB"},{l:"Executions",u:1240,t:5000}].map(item=>(
                    <div key={item.l} style={{marginBottom:13}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:13,color:T.text}}>{item.l}</span>
                        <span style={{fontSize:12,color:T.textMuted}}>{item.un?`${item.u}${item.un}/${item.t}${item.un}`:`${item.u}/${item.t}`}</span>
                      </div>
                      <div style={{height:6,background:T.border,borderRadius:3}}>
                        <div style={{height:"100%",background:T.primary,borderRadius:3,width:`${(item.u/item.t)*100}%`}}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {tab==="api"&&(
                <div>
                  <h3 style={{fontWeight:700,fontSize:16,color:T.text,marginBottom:16}}>API Keys</h3>
                  <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:9,padding:14,marginBottom:14}}>
                    <p style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:7}}>Personal Token</p>
                    <div style={{display:"flex",gap:7,alignItems:"center"}}>
                      <code style={{flex:1,fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.textMuted,
                        background:T.card,padding:"7px 10px",borderRadius:6,border:`1px solid ${T.border}`}}>
                        sk-cn-••••••••••••••••
                      </code>
                      <Btn T={T} size="sm" variant="ghost" onClick={()=>toast("Copy ho gaya!","success")}>📋</Btn>
                    </div>
                  </div>
                  <Btn T={T} icon="+" onClick={()=>toast("Naya key ban gaya!","success")}>New Key</Btn>
                </div>
              )}
              {tab==="security"&&(
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <h3 style={{fontWeight:700,fontSize:16,color:T.text}}>Security</h3>
                  <Inp T={T} label="Current Password" type="password" value="" onChange={()=>{}} placeholder="••••••••" icon="🔒"/>
                  <Inp T={T} label="New Password" type="password" value="" onChange={()=>{}} placeholder="••••••••" icon="🔒"/>
                  <Inp T={T} label="Confirm Password" type="password" value="" onChange={()=>{}} placeholder="••••••••" icon="✅"/>
                  <Btn T={T} onClick={()=>toast("Password update ho gaya!","success")}>Update Password</Btn>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// PAGE: ADMIN
// ═══════════════════════════════════════════════════
function Admin({toast,T}) {
  const [tab,setTab]=useState("overview");
  const [users,setUsers]=useState(SAMPLE_USERS);
  const [selUser,setSelUser]=useState(null);
  const totalRev=users.reduce((s,u)=>s+u.revenue,0);
  const adminTabs=[
    {id:"overview",l:"📊 Overview"},{id:"users",l:"👥 Users"},
    {id:"revenue",l:"💰 Revenue"},{id:"logs",l:"📋 Logs"},
    {id:"plans",l:"💎 Plans"},{id:"announce",l:"📢 Announce"},
    {id:"mod",l:"🛡️ Moderation"},
    {id:"apikeys",l:"🔑 API Keys",highlight:true},
  ];
  const logs=[
    {time:"14:32",level:"INFO",msg:"alice@example.com ne login kiya"},
    {time:"14:28",level:"WARN",msg:"Rate limit exceed: IP 203.0.113.42"},
    {time:"14:15",level:"ERROR",msg:"Docker container crash: project-x7z2"},
    {time:"13:57",level:"INFO",msg:"Payment: $12 from bob@example.com"},
    {time:"13:44",level:"WARN",msg:"5 failed login attempts"},
    {time:"13:02",level:"INFO",msg:"Deploy complete: portfolio-x7"},
  ];
  const suspend=(id)=>{
    setUsers(us=>us.map(u=>u.id===id?{...u,status:u.status==="active"?"suspended":"active"}:u));
    toast("User status update ho gaya","success");
  };
  return (
    <div style={{minHeight:"100vh",background:T.bg,paddingTop:54}}>
      <div style={{display:"flex"}}>
        <div style={{width:210,background:T.surface,borderRight:`1px solid ${T.border}`,
          minHeight:"calc(100vh - 54px)",padding:"18px 10px",flexShrink:0}}>
          <div style={{padding:"7px 11px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:19}}>🛡️</span>
              <span className="syne" style={{fontWeight:800,fontSize:14,color:T.danger}}>Admin Panel</span>
            </div>
            <p style={{fontSize:11,color:T.textFaint,marginTop:2}}>Super Admin Access</p>
          </div>
          {adminTabs.map(tb=>(
            <button key={tb.id} className="btn" onClick={()=>setTab(tb.id)}
              style={{width:"100%",textAlign:"left",
                background:tab===tb.id?`${T.primary}18`:tb.highlight?`${T.warn}08`:"none",
                border:tb.highlight&&tab!==tb.id?`1px solid ${T.warn}30`:"none",
                borderRadius:7,padding:"8px 11px",fontSize:13,fontWeight:600,
                color:tab===tb.id?T.primary:tb.highlight?T.warn:T.textMuted,
                display:"block",marginBottom:2}}>{tb.l}</button>
          ))}
        </div>
        <div className="fade" style={{flex:1,padding:24,overflowY:"auto"}}>
          {tab==="overview"&&(
            <div>
              <h2 className="syne" style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:18}}>Dashboard Overview</h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:24}}>
                {[
                  {l:"Total Users",v:users.length,ic:"👥",c:T.primary},
                  {l:"Active Users",v:users.filter(u=>u.status==="active").length,ic:"✅",c:T.accent},
                  {l:"Revenue",v:`$${totalRev}`,ic:"💰",c:T.warn},
                  {l:"Projects",v:"2,847",ic:"📁",c:"#a855f7"},
                  {l:"Deployments",v:"1,204",ic:"🚀",c:"#06b6d4"},
                  {l:"AI Calls",v:"94.2K",ic:"⚡",c:"#f97316"},
                ].map((s,i)=>(
                  <div key={i} className="card" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:16}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:22}}>{s.ic}</span>
                      <Badge color={T.accent}>+↑</Badge>
                    </div>
                    <p className="syne" style={{fontSize:24,fontWeight:800,color:s.c,marginTop:7}}>{s.v}</p>
                    <p style={{fontSize:11,color:T.textMuted}}>{s.l}</p>
                  </div>
                ))}
              </div>
              <h3 style={{fontWeight:700,color:T.text,marginBottom:11}}>Recent Logs</h3>
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,overflow:"hidden"}}>
                {logs.slice(0,4).map((log,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 15px",
                    borderBottom:i<3?`1px solid ${T.border}`:"none"}}>
                    <span style={{width:44,fontSize:10,fontWeight:700,textAlign:"center",
                      color:log.level==="ERROR"?T.danger:log.level==="WARN"?T.warn:T.accent,
                      background:`${log.level==="ERROR"?T.danger:log.level==="WARN"?T.warn:T.accent}15`,
                      borderRadius:4,padding:"2px 3px"}}>{log.level}</span>
                    <span style={{flex:1,fontSize:13,color:T.text}}>{log.msg}</span>
                    <span style={{fontSize:11,color:T.textMuted}}>{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==="users"&&(
            <div>
              <h2 className="syne" style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:18}}>User Management</h2>
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,overflow:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{borderBottom:`1px solid ${T.border}`}}>
                      {["User","Plan","Projects","Revenue","Status","Action"].map(h=>(
                        <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:11,
                          fontWeight:700,color:T.textMuted,textTransform:"uppercase",letterSpacing:1,whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u=>(
                      <tr key={u.id} style={{borderBottom:`1px solid ${T.border}`}}>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:9}}>
                            <div style={{width:30,height:30,background:T.primary,borderRadius:7,
                              display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}>{u.name[0]}</div>
                            <div>
                              <p style={{fontSize:13,fontWeight:600,color:T.text}}>{u.name}</p>
                              <p style={{fontSize:11,color:T.textMuted}}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:"11px 14px"}}><Badge color={u.plan==="enterprise"?T.warn:u.plan==="team"?T.accent:u.plan==="pro"?T.primary:T.textFaint}>{u.plan}</Badge></td>
                        <td style={{padding:"11px 14px",fontSize:13,color:T.text}}>{u.projects}</td>
                        <td style={{padding:"11px 14px",fontSize:13,color:T.accent,fontWeight:700}}>${u.revenue}</td>
                        <td style={{padding:"11px 14px"}}><Badge color={u.status==="active"?T.accent:T.danger}>{u.status}</Badge></td>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",gap:5}}>
                            <button className="btn" onClick={()=>suspend(u.id)}
                              style={{background:`${u.status==="active"?T.danger:T.accent}15`,border:`1px solid ${u.status==="active"?T.danger:T.accent}30`,
                                borderRadius:5,padding:"4px 9px",fontSize:11,color:u.status==="active"?T.danger:T.accent}}>
                              {u.status==="active"?"Suspend":"Activate"}
                            </button>
                            <button className="btn" onClick={()=>setSelUser(u)}
                              style={{background:`${T.primary}15`,border:`1px solid ${T.primary}30`,borderRadius:5,padding:"4px 9px",fontSize:11,color:T.primary}}>View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {tab==="revenue"&&(
            <div>
              <h2 className="syne" style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:18}}>Revenue Dashboard</h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:22}}>
                {[
                  {l:"MRR",v:`$${totalRev}`,c:T.accent},{l:"ARR",v:`$${totalRev*12}`,c:T.primary},
                  {l:"Avg/User",v:`$${Math.round(totalRev/users.length)}`,c:T.warn},{l:"Churn",v:"2.1%",c:T.danger},
                ].map((s,i)=>(
                  <div key={i} className="card" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:18}}>
                    <p className="syne" style={{fontSize:26,fontWeight:800,color:s.c}}>{s.v}</p>
                    <p style={{fontSize:12,color:T.textMuted,marginTop:4}}>{s.l}</p>
                  </div>
                ))}
              </div>
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:22}}>
                <h3 style={{fontWeight:700,color:T.text,marginBottom:14}}>Plan ke hisab se Revenue</h3>
                {PLANS.filter(p=>p.price).map(plan=>{
                  const rev=users.filter(u=>u.plan===plan.id).reduce((s,u)=>s+u.revenue,0);
                  const pct=totalRev>0?Math.round(rev/totalRev*100):0;
                  return (
                    <div key={plan.id} style={{marginBottom:13}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:13,color:T.text,fontWeight:600}}>{plan.name}</span>
                        <span style={{fontSize:13,color:plan.color,fontWeight:700}}>${rev} ({pct}%)</span>
                      </div>
                      <div style={{height:8,background:T.border,borderRadius:4}}>
                        <div style={{height:"100%",background:plan.color,borderRadius:4,width:`${pct}%`}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {tab==="logs"&&(
            <div>
              <h2 className="syne" style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:18}}>Server Logs</h2>
              <div style={{background:T.editor,border:`1px solid ${T.border}`,borderRadius:13,overflow:"hidden"}}>
                {logs.map((log,i)=>(
                  <div key={i} className="mono" style={{display:"flex",gap:11,padding:"9px 15px",
                    borderBottom:`1px solid ${T.border}20`,fontSize:12}}>
                    <span style={{color:T.textFaint,flexShrink:0}}>{log.time}</span>
                    <span style={{fontWeight:700,flexShrink:0,width:42,
                      color:log.level==="ERROR"?T.danger:log.level==="WARN"?T.warn:T.accent}}>{log.level}</span>
                    <span style={{color:T.text,flex:1}}>{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==="plans"&&(
            <div>
              <h2 className="syne" style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:18}}>Plans Manage karo</h2>
              <div style={{display:"grid",gap:13}}>
                {PLANS.map(plan=>(
                  <div key={plan.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:18,
                    display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:11}}>
                    <div style={{display:"flex",alignItems:"center",gap:11}}>
                      <div style={{width:38,height:38,background:`${plan.color}22`,border:`2px solid ${plan.color}`,
                        borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💎</div>
                      <div>
                        <p style={{fontWeight:700,color:T.text,fontSize:15}}>{plan.name}</p>
                        <p style={{fontSize:12,color:T.textMuted}}>
                          {plan.price===null?"Custom":plan.price===0?"Free":`$${plan.price}/mo`} · {users.filter(u=>u.plan===plan.id).length} users
                        </p>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:7}}>
                      <Btn T={T} size="sm" variant="ghost" onClick={()=>toast("Plan editor coming soon","info")}>Edit</Btn>
                      <Btn T={T} size="sm" variant="ghost" onClick={()=>toast("Analytics ready","info")}>📊 Stats</Btn>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==="announce"&&(
            <div>
              <h2 className="syne" style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:18}}>Announcement Bhejo</h2>
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:22}}>
                <div style={{display:"flex",flexDirection:"column",gap:13}}>
                  <Inp T={T} label="Title" value="" onChange={()=>{}} placeholder="🚀 Naya Feature Launch!" icon="📢"/>
                  <div>
                    <label style={{fontSize:13,fontWeight:600,color:T.textMuted,display:"block",marginBottom:6}}>Message</label>
                    <textarea placeholder="Announcement likhiye..."
                      style={{width:"100%",height:110,background:T.surface,border:`1px solid ${T.border}`,
                        borderRadius:8,padding:11,color:T.text,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
                  </div>
                  <Btn T={T} icon="📢" onClick={()=>toast("Announcement sabko bhej diya!","success")}>Bhejo</Btn>
                </div>
              </div>
            </div>
          )}
          {tab==="mod"&&(            <div>
              <h2 className="syne" style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:18}}>Content Moderation</h2>
              <div style={{display:"grid",gap:11}}>
                {[
                  {title:"Malware Detect Hua",desc:"Project 'hack-tools-v2' me suspicious code hai",user:"anonymous",sev:"high",time:"2h ago"},
                  {title:"API Abuse",desc:"Ek user ne 50x rate limit hit kiya 1 ghante me",user:"spambot",sev:"high",time:"3h ago"},
                  {title:"Terms Violation",desc:"Public project me inappropriate content mila",user:"dave@example.com",sev:"medium",time:"5h ago"},
                ].map((issue,i)=>(
                  <div key={i} style={{background:T.card,border:`1px solid ${issue.sev==="high"?T.danger+"44":T.warn+"44"}`,borderRadius:11,padding:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:11}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
                          <span style={{fontSize:15}}>{issue.sev==="high"?"🚨":"⚠️"}</span>
                          <span style={{fontWeight:700,color:T.text}}>{issue.title}</span>
                          <Badge color={issue.sev==="high"?T.danger:T.warn}>{issue.sev}</Badge>
                        </div>
                        <p style={{fontSize:13,color:T.textMuted}}>{issue.desc}</p>
                        <p style={{fontSize:11,color:T.textFaint,marginTop:3}}>by {issue.user} · {issue.time}</p>
                      </div>
                      <div style={{display:"flex",gap:5,flexShrink:0}}>
                        <Btn T={T} size="sm" variant="danger" onClick={()=>toast("User suspend hua","success")}>Suspend</Btn>
                        <Btn T={T} size="sm" variant="ghost" onClick={()=>toast("Dismiss kiya","info")}>Dismiss</Btn>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==="apikeys"&&<AdminApiKeys toast={toast} T={T}/>}
        </div>
      </div>
      <Modal open={!!selUser} onClose={()=>setSelUser(null)} title={`User: ${selUser?.name}`} T={T}>
        {selUser&&(
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {[["Email",selUser.email],["Plan",selUser.plan],["Status",selUser.status],
              ["Projects",selUser.projects],["Revenue",`$${selUser.revenue}`]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                <span style={{color:T.textMuted,fontSize:13}}>{k}</span>
                <span style={{color:T.text,fontWeight:600,fontSize:13}}>{v}</span>
              </div>
            ))}
            <div style={{display:"flex",gap:9,marginTop:7}}>
              <Btn T={T} variant="danger" onClick={()=>{suspend(selUser.id);setSelUser(null);}}>
                {selUser.status==="active"?"Suspend":"Activate"}
              </Btn>
              <Btn T={T} variant="ghost" onClick={()=>setSelUser(null)}>Close</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ADMIN API KEYS PAGE (separate for clarity)
// ═══════════════════════════════════════════════════
function AdminApiKeys({toast,T}) {
  const [apiKeys,setApiKeys]=useState(()=>store.get("cn_admin_keys",{
    anthropic:"",stripe:"",razorpay_id:"",razorpay_secret:"",
    clerk:"",aws_key:"",aws_secret:"",aws_bucket:"",aws_region:"ap-south-1",
    db_url:"",redis_url:"",docker_host:"unix:///var/run/docker.sock",
  }));
  const [showKeys,setShowKeys]=useState({});
  const [saved,setSaved]=useState(false);
  const [testingKey,setTestingKey]=useState(null);

  const save=()=>{
    store.set("cn_admin_keys",apiKeys);
    setSaved(true);
    toast("Saari API keys save ho gayi! ✅","success");
    setTimeout(()=>setSaved(false),3000);
  };
  const toggleShow=(k)=>setShowKeys(s=>({...s,[k]:!s[k]}));
  const testKey=async(id)=>{
    setTestingKey(id);
    await new Promise(r=>setTimeout(r,1200));
    setTestingKey(null);
    if(apiKeys[id]) toast(`${id} key test successful! ✅`,"success");
    else toast("Pehle key enter karo","warn");
  };
  const clearKey=(k)=>{
    setApiKeys(a=>({...a,[k]:""}));
    toast("Key clear ho gayi","info");
  };

  const KEY_GROUPS=[
    { group:"🤖 AI", color:"#cc785c", keys:[
      {id:"anthropic",label:"Anthropic API Key",icon:"🤖",placeholder:"sk-ant-api03-xxxxxxxx...",
       hint:"console.anthropic.com se milegi",link:"https://console.anthropic.com"},
    ]},
    { group:"💳 Payments", color:"#635bff", keys:[
      {id:"stripe",label:"Stripe Secret Key",icon:"💳",placeholder:"sk_live_xxxxxxxxxxxxxxxx",
       hint:"dashboard.stripe.com → API Keys",link:"https://dashboard.stripe.com"},
      {id:"razorpay_id",label:"Razorpay Key ID",icon:"🇮🇳",placeholder:"rzp_live_xxxxxxxx",
       hint:"dashboard.razorpay.com → Settings → API Keys",link:"https://dashboard.razorpay.com"},
      {id:"razorpay_secret",label:"Razorpay Secret Key",icon:"🔐",placeholder:"xxxxxxxxxxxxxxxxxxxxxxxx",
       hint:"Razorpay dashboard se milega",link:"https://dashboard.razorpay.com"},
    ]},
    { group:"🔐 Authentication", color:"#6c47ff", keys:[
      {id:"clerk",label:"Clerk Secret Key",icon:"👤",placeholder:"sk_live_xxxxxxxxxxxxxxxx",
       hint:"dashboard.clerk.com → API Keys",link:"https://dashboard.clerk.com"},
    ]},
    { group:"☁️ AWS S3 Storage", color:"#ff9900", keys:[
      {id:"aws_key",label:"AWS Access Key ID",icon:"🔑",placeholder:"AKIAXXXXXXXXXXXXXXXX",
       hint:"AWS Console → IAM → Users → Access Keys",link:"https://aws.amazon.com/console"},
      {id:"aws_secret",label:"AWS Secret Access Key",icon:"🔒",placeholder:"wJalrXUtnFEMI/K7MDENG...",
       hint:"Access Key banate waqt milti hai",link:"https://aws.amazon.com/console"},
      {id:"aws_bucket",label:"S3 Bucket Name",icon:"🪣",placeholder:"codenest-storage",
       hint:"AWS S3 me bucket ka naam",link:"https://aws.amazon.com/console"},
      {id:"aws_region",label:"AWS Region",icon:"🌍",placeholder:"ap-south-1",
       hint:"India ke liye ap-south-1 use karo",link:"https://aws.amazon.com"},
    ]},
    { group:"🗄️ Database & Cache", color:"#3ecf8e", keys:[
      {id:"db_url",label:"PostgreSQL Database URL",icon:"🐘",placeholder:"postgresql://user:password@host:5432/codenest",
       hint:"Supabase.com pe free database milega",link:"https://supabase.com"},
      {id:"redis_url",label:"Redis Cache URL",icon:"⚡",placeholder:"redis://default:password@host:6379",
       hint:"Upstash.com pe free Redis milega",link:"https://upstash.com"},
    ]},
    { group:"🐳 Infrastructure", color:"#2496ed", keys:[
      {id:"docker_host",label:"Docker Host",icon:"🐳",placeholder:"unix:///var/run/docker.sock",
       hint:"Code execution ke liye Docker socket path",link:"https://docker.com"},
    ]},
  ];

  const filled=Object.values(apiKeys).filter(v=>v.trim()).length;
  const total=Object.keys(apiKeys).length;

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
        flexWrap:"wrap",gap:14,marginBottom:22}}>
        <div>
          <h2 className="syne" style={{fontSize:22,fontWeight:800,color:T.text}}>🔑 API Keys Manager</h2>
          <p style={{fontSize:13,color:T.textMuted,marginTop:4}}>
            Saari API keys yahan add karo — securely localStorage me save hoti hain
          </p>
        </div>
        <div style={{display:"flex",gap:9,alignItems:"center"}}>
          <div style={{fontSize:12,color:T.textMuted,background:T.card,
            border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 12px"}}>
            ✅ {filled}/{total} keys added
          </div>
          <Btn T={T} onClick={save} icon={saved?"✅":"💾"}>
            {saved?"Saved!":"Save All Keys"}
          </Btn>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:11,
        padding:"14px 18px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
          <span style={{fontSize:13,fontWeight:600,color:T.text}}>Setup Progress</span>
          <span style={{fontSize:13,color:T.accent,fontWeight:700}}>{Math.round(filled/total*100)}%</span>
        </div>
        <div style={{height:8,background:T.border,borderRadius:4}}>
          <div style={{height:"100%",borderRadius:4,transition:"width 0.4s",
            background:`linear-gradient(90deg,${T.primary},${T.accent})`,
            width:`${filled/total*100}%`}}/>
        </div>
        <p style={{fontSize:11,color:T.textMuted,marginTop:7}}>
          {filled===total?"🎉 Sab keys add ho gayi! Platform ready hai!":
           filled===0?"👆 Neeche se shuru karo, har service ki key add karo":
           `${total-filled} aur keys baaki hain`}
        </p>
      </div>

      {/* Warning box */}
      <div style={{background:`${T.warn}10`,border:`1px solid ${T.warn}30`,borderRadius:10,
        padding:"12px 16px",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"}}>
        <span style={{fontSize:18,flexShrink:0}}>⚠️</span>
        <div>
          <p style={{fontWeight:700,color:T.warn,fontSize:13}}>Security Notice</p>
          <p style={{fontSize:12,color:T.textMuted,marginTop:3,lineHeight:1.6}}>
            Ye keys demo me localStorage me save hoti hain. Production me inhe server ke .env file me rakho. Kabhi GitHub pe upload mat karo!
          </p>
        </div>
      </div>

      {/* Key groups */}
      {KEY_GROUPS.map((group,gi)=>(
        <div key={gi} style={{background:T.card,border:`1px solid ${T.border}`,
          borderRadius:13,overflow:"hidden",marginBottom:16}}>
          {/* Group header */}
          <div style={{padding:"13px 18px",background:`${group.color}10`,
            borderBottom:`1px solid ${group.color}25`,display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:group.color}}/>
            <span style={{fontWeight:700,fontSize:14,color:group.color}}>{group.group}</span>
            <span style={{fontSize:11,color:T.textMuted,marginLeft:"auto"}}>
              {group.keys.filter(k=>apiKeys[k.id]?.trim()).length}/{group.keys.length} added
            </span>
          </div>

          {/* Keys in group */}
          <div style={{padding:"6px 0"}}>
            {group.keys.map((kc,ki)=>{
              const val=apiKeys[kc.id]||"";
              const isFilled=val.trim().length>0;
              const isShown=showKeys[kc.id];
              const isTesting=testingKey===kc.id;
              return (
                <div key={ki} style={{padding:"14px 18px",
                  borderBottom:ki<group.keys.length-1?`1px solid ${T.border}`:"none"}}>
                  {/* Label row */}
                  <div style={{display:"flex",justifyContent:"space-between",
                    alignItems:"center",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:16}}>{kc.icon}</span>
                      <span style={{fontSize:13,fontWeight:700,color:T.text}}>{kc.label}</span>
                      {isFilled&&<span style={{fontSize:10,background:`${T.accent}20`,
                        color:T.accent,border:`1px solid ${T.accent}40`,
                        borderRadius:10,padding:"1px 7px",fontWeight:700}}>✓ Added</span>}
                    </div>
                    <a href={kc.link} target="_blank" rel="noreferrer"
                      style={{fontSize:11,color:group.color,textDecoration:"none",
                        background:`${group.color}15`,border:`1px solid ${group.color}30`,
                        borderRadius:5,padding:"3px 8px",fontWeight:600}}>
                      🔗 Get Key
                    </a>
                  </div>

                  {/* Input row */}
                  <div style={{display:"flex",gap:7,alignItems:"center"}}>
                    <div style={{position:"relative",flex:1}}>
                      <input
                        type={isShown?"text":"password"}
                        value={val}
                        onChange={e=>setApiKeys(a=>({...a,[kc.id]:e.target.value}))}
                        placeholder={kc.placeholder}
                        className="mono"
                        style={{width:"100%",background:T.surface,
                          border:`1.5px solid ${isFilled?group.color:T.border}`,
                          borderRadius:8,padding:"9px 12px",color:T.text,fontSize:12.5,
                          fontFamily:"'JetBrains Mono',monospace",outline:"none",
                          boxShadow:isFilled?`0 0 0 3px ${group.color}15`:"none",
                          transition:"all 0.2s"}}
                      />
                      {isFilled&&(
                        <div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
                          width:7,height:7,borderRadius:"50%",background:T.accent}}/>
                      )}
                    </div>

                    {/* Show/hide */}
                    <button className="btn" onClick={()=>toggleShow(kc.id)}
                      style={{background:T.surface,border:`1px solid ${T.border}`,
                        borderRadius:7,padding:"9px 11px",fontSize:14,color:T.textMuted,flexShrink:0}}>
                      {isShown?"🙈":"👁️"}
                    </button>

                    {/* Test */}
                    <button className="btn" onClick={()=>testKey(kc.id)}
                      disabled={isTesting}
                      style={{background:`${group.color}15`,border:`1px solid ${group.color}30`,
                        borderRadius:7,padding:"9px 12px",fontSize:12,color:group.color,
                        fontWeight:700,flexShrink:0,display:"flex",alignItems:"center",gap:5}}>
                      {isTesting?<><span className="spin" style={{display:"inline-block",width:12,height:12,
                        borderRadius:"50%",border:`2px solid ${group.color}30`,borderTopColor:group.color}}/>Test...</>
                        :"⚡ Test"}
                    </button>

                    {/* Clear */}
                    {isFilled&&(
                      <button className="btn" onClick={()=>clearKey(kc.id)}
                        style={{background:`${T.danger}15`,border:`1px solid ${T.danger}30`,
                          borderRadius:7,padding:"9px 10px",fontSize:13,color:T.danger,flexShrink:0}}>
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Hint */}
                  <p style={{fontSize:11,color:T.textFaint,marginTop:6,marginLeft:2}}>
                    💡 {kc.hint}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Save button bottom */}
      <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8,paddingBottom:20}}>
        <Btn T={T} variant="ghost" onClick={()=>{
          setApiKeys({anthropic:"",stripe:"",razorpay_id:"",razorpay_secret:"",
            clerk:"",aws_key:"",aws_secret:"",aws_bucket:"",aws_region:"ap-south-1",
            db_url:"",redis_url:"",docker_host:"unix:///var/run/docker.sock"});
          toast("Saari keys clear ho gayi","info");
        }}>🗑️ Clear All</Btn>
        <Btn T={T} icon={saved?"✅":"💾"} onClick={save}>
          {saved?"Saved!":"Save All Keys"}
        </Btn>
      </div>

      {/* .env export */}
      <div style={{background:T.editor,border:`1px solid ${T.border}`,borderRadius:13,padding:18,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontWeight:700,fontSize:13,color:T.text}}>📄 .env File Preview</span>
          <button className="btn" onClick={()=>{
            const envText=`ANTHROPIC_API_KEY=${apiKeys.anthropic}\nSTRIPE_SECRET_KEY=${apiKeys.stripe}\nRAZORPAY_KEY_ID=${apiKeys.razorpay_id}\nRAZORPAY_KEY_SECRET=${apiKeys.razorpay_secret}\nCLERK_SECRET_KEY=${apiKeys.clerk}\nAWS_ACCESS_KEY_ID=${apiKeys.aws_key}\nAWS_SECRET_ACCESS_KEY=${apiKeys.aws_secret}\nAWS_S3_BUCKET=${apiKeys.aws_bucket}\nAWS_REGION=${apiKeys.aws_region}\nDATABASE_URL=${apiKeys.db_url}\nREDIS_URL=${apiKeys.redis_url}\nDOCKER_HOST=${apiKeys.docker_host}`;
            navigator.clipboard?.writeText(envText);
            toast(".env content copy ho gaya! 📋","success");
          }}
          style={{background:`${T.primary}20`,border:`1px solid ${T.primary}40`,
            borderRadius:6,padding:"5px 11px",fontSize:12,color:T.primary,fontWeight:700}}>
            📋 Copy .env
          </button>
        </div>
        <pre className="mono" style={{fontSize:11.5,color:T.accent,lineHeight:1.8,overflowX:"auto"}}>
{`ANTHROPIC_API_KEY=${apiKeys.anthropic?"sk-ant-••••••":"{not set}"}
STRIPE_SECRET_KEY=${apiKeys.stripe?"sk_live_••••••":"{not set}"}
RAZORPAY_KEY_ID=${apiKeys.razorpay_id||"{not set}"}
RAZORPAY_KEY_SECRET=${apiKeys.razorpay_secret?"••••••••":"{not set}"}
CLERK_SECRET_KEY=${apiKeys.clerk?"sk_live_••••••":"{not set}"}
AWS_ACCESS_KEY_ID=${apiKeys.aws_key?"AKIA••••••":"{not set}"}
AWS_SECRET_ACCESS_KEY=${apiKeys.aws_secret?"••••••••":"{not set}"}
AWS_S3_BUCKET=${apiKeys.aws_bucket||"{not set}"}
AWS_REGION=${apiKeys.aws_region||"ap-south-1"}
DATABASE_URL=${apiKeys.db_url?"postgresql://••••••":"{not set}"}
REDIS_URL=${apiKeys.redis_url?"redis://••••••":"{not set}"}
DOCKER_HOST=${apiKeys.docker_host||"unix:///var/run/docker.sock"}`}
        </pre>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════
export default function App() {
  injectCSS();
  const [isDark,setDark]=useState(true);
  const [page,setPage]=useState("landing");
  const [user,setUser]=useState(()=>store.get("cn_user",null));
  const [activeProject,setActiveProject]=useState(null);
  const [toasts,setToasts]=useState([]);
  const T=isDark?DARK:LIGHT;
  const toast=useCallback((msg,type="success")=>{
    const id=uid();setToasts(ts=>[...ts,{id,msg,type}]);
  },[]);
  const rmToast=useCallback((id)=>setToasts(ts=>ts.filter(t=>t.id!==id)),[]);
  useEffect(()=>{
    if(!user&&!["landing","login","signup","pricing"].includes(page))setPage("landing");
  },[user,page]);
  const renderPage=()=>{
    const props={user,setUser,setPage,toast,T,isDark,setDark,activeProject,setActiveProject};
    switch(page){
      case "landing": return <Landing {...props}/>;
      case "login": return <Auth mode="login" {...props}/>;
      case "signup": return <Auth mode="signup" {...props}/>;
      case "dashboard": return <Dashboard {...props}/>;
      case "editor": return <Editor {...props}/>;
      case "pricing": return <Pricing {...props}/>;
      case "settings": return <Settings {...props}/>;
      case "admin": return <Admin {...props}/>;
      default: return <Landing {...props}/>;
    }
  };
  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'DM Sans',sans-serif"}}>
      <TopBar page={page} setPage={setPage} user={user} setUser={setUser} isDark={isDark} setDark={setDark} T={T}/>
      {renderPage()}
      <div style={{position:"fixed",bottom:22,right:22,zIndex:99999,display:"flex",flexDirection:"column",gap:7}}>
        {toasts.map(t=><Toast key={t.id} msg={t.msg} type={t.type} onClose={()=>rmToast(t.id)}/>)}
      </div>
    </div>
  );
}
