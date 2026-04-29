import { useState, useEffect, useCallback } from "react";
import { ClerkProvider, SignIn, SignUp, useUser, UserButton, useClerk } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase Client ──────────────────────────────────────────
const SUPA_URL = process.env.REACT_APP_SUPABASE_URL || "";
const SUPA_KEY = process.env.REACT_APP_SUPABASE_KEY || "";
const supabase = createClient(SUPA_URL, SUPA_KEY);

// ── Clerk Key ────────────────────────────────────────────────
const CLERK_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || "";

// ── Utility ──────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);

// ── Theme ────────────────────────────────────────────────────
const DARK = {
  bg:"#07070e", surface:"#0d0d1a", card:"#111124",
  border:"#1c1c38", primary:"#5b6cf9",
  primaryGlow:"rgba(91,108,249,0.25)", accent:"#00cfa8",
  accentGlow:"rgba(0,207,168,0.2)", danger:"#f95b5b",
  warn:"#f9a825", text:"#e4e4f0", textMuted:"#6b6b92",
  textFaint:"#3a3a5c", editor:"#060610",
};
const LIGHT = {
  bg:"#f0f0f8", surface:"#ffffff", card:"#ffffff",
  border:"#ddddf0", primary:"#4a5ae8",
  primaryGlow:"rgba(74,90,232,0.15)", accent:"#00a885",
  accentGlow:"rgba(0,168,133,0.15)", danger:"#e04343",
  warn:"#e08800", text:"#1a1a2e", textMuted:"#5a5a7a",
  textFaint:"#aaaacc", editor:"#fafafe",
};

// ── Static Data ──────────────────────────────────────────────
const TEMPLATES = [
  { id:"py-hello", name:"Python Starter", lang:"python", icon:"🐍",
    code:`# Python Hello World\nprint("Hello, CodeNest!")\n\nname = "Developer"\nprint(f"Welcome {name}!")` },
  { id:"js-app", name:"JavaScript App", lang:"javascript", icon:"🟨",
    code:`// JavaScript\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\nconsole.log(greet("CodeNest"));` },
  { id:"ts-basic", name:"TypeScript Basic", lang:"typescript", icon:"🔷",
    code:`// TypeScript\ninterface User { name: string; age: number; }\nconst user: User = { name: "CodeNest", age: 1 };\nconsole.log(\`Hello \${user.name}!\`);` },
  { id:"cpp-algo", name:"C++ Algorithm", lang:"cpp", icon:"⚡",
    code:`#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nint main() {\n    vector<int> nums = {5,2,8,1,9,3};\n    sort(nums.begin(), nums.end());\n    for(int n : nums) cout << n << " ";\n    return 0;\n}` },
  { id:"java-oop", name:"Java OOP", lang:"java", icon:"☕",
    code:`public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello CodeNest!");\n    }\n}` },
  { id:"php-web", name:"PHP Script", lang:"php", icon:"🐘",
    code:`<?php\n$name = "CodeNest";\necho "Hello from $name!\\n";\n?>` },
];

const PLANS = [
  { id:"free", name:"Starter", price:0, color:"#6b6b92",
    features:["3 Projects","Community Support","1GB Storage","Public Only"] },
  { id:"pro", name:"Pro", price:12, color:"#5b6cf9", popular:true,
    features:["Unlimited Projects","Priority Support","10GB Storage","Private Projects","AI Assistant","Custom Domain"] },
  { id:"team", name:"Team", price:39, color:"#00cfa8",
    features:["Everything in Pro","5 Team Members","50GB Storage","Real-time Collab","Admin Panel"] },
  { id:"enterprise", name:"Enterprise", price:null, color:"#f9a825",
    features:["Custom Members","Unlimited Storage","Dedicated Servers","SSO/SAML","24/7 Support"] },
];

const LANG_COLORS = { python:"#3572A5", javascript:"#f1e05a", typescript:"#3178c6", cpp:"#f34b7d", java:"#b07219", php:"#4F5D95" };
const LANG_ICONS = { python:"🐍", javascript:"🟨", typescript:"🔷", cpp:"⚡", java:"☕", php:"🐘" };

// ── CSS Inject ───────────────────────────────────────────────
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
    .fade{animation:fadeUp 0.35s ease both}
    .spin{animation:spin 1s linear infinite}
    .btn{transition:all 0.15s ease;cursor:pointer;border:none;outline:none}
    .btn:hover{filter:brightness(1.1)}
    .btn:active{transform:scale(0.97)}
    .card{transition:transform 0.2s}
    .card:hover{transform:translateY(-2px)}
    textarea{resize:none}
    .dotbg{background-image:radial-gradient(rgba(91,108,249,0.12) 1px,transparent 1px);background-size:28px 28px}
  `;
  document.head.appendChild(s);
};

// ── Shared Components ────────────────────────────────────────
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
    fontFamily:"'DM Sans',sans-serif",cursor:disabled?"not-allowed":"pointer",
    border:"none",transition:"all 0.15s",opacity:disabled?0.5:1,whiteSpace:"nowrap"};
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

function Inp({label,value,onChange,type="text",placeholder,T,icon}) {
  const T2=T||DARK;
  const [f,setF]=useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {label&&<label style={{fontSize:13,fontWeight:600,color:T2.textMuted}}>{label}</label>}
      <div style={{position:"relative",display:"flex",alignItems:"center"}}>
        {icon&&<span style={{position:"absolute",left:11,fontSize:15,color:T2.textFaint}}>{icon}</span>}
        <input type={type} value={value} onChange={e=>onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={()=>setF(true)} onBlur={()=>setF(false)}
          style={{width:"100%",background:T2.surface,border:`1.5px solid ${f?T2.primary:T2.border}`,
            borderRadius:8,padding:icon?"10px 12px 10px 36px":"10px 12px",color:T2.text,fontSize:14,
            fontFamily:"'DM Sans',sans-serif",boxShadow:f?`0 0 0 3px ${T2.primaryGlow}`:"none",
            outline:"none"}}/>
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
        width:"100%",maxWidth:width,maxHeight:"90vh",overflowY:"auto",
        boxShadow:"0 40px 80px rgba(0,0,0,0.5)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"18px 22px",borderBottom:`1px solid ${T2.border}`,display:"flex",
          justifyContent:"space-between",alignItems:"center"}}>
          <span className="syne" style={{fontWeight:700,fontSize:16,color:T2.text}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:T2.textMuted,
            fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:22}}>{children}</div>
      </div>
    </div>
  );
}

function Toast({msg,type="success",onClose}) {
  const c={success:"#00cfa8",error:"#f95b5b",info:"#5b6cf9",warn:"#f9a825"}[type];
  useEffect(()=>{const t=setTimeout(onClose,3500);return()=>clearTimeout(t)},[onClose]);
  return (
    <div className="fade" style={{background:"#111124",border:`1px solid ${c}44`,borderRadius:10,
      padding:"12px 16px",display:"flex",gap:10,alignItems:"center",
      boxShadow:"0 8px 32px rgba(0,0,0,0.4)",minWidth:230,maxWidth:340}}>
      <span style={{fontSize:17}}>{type==="success"?"✅":type==="error"?"❌":type==="warn"?"⚠️":"ℹ️"}</span>
      <span style={{color:"#e4e4f0",fontSize:13,flex:1}}>{msg}</span>
      <button onClick={onClose} style={{background:"none",border:"none",color:"#6b6b92",cursor:"pointer"}}>✕</button>
    </div>
  );
}

// ── TopBar ───────────────────────────────────────────────────
function TopBar({page,setPage,clerkUser,isDark,setDark,T}) {
  const [menu,setMenu]=useState(false);
  const {signOut} = useClerk();
  const isAdmin = clerkUser?.primaryEmailAddress?.emailAddress === "admin@codenest.dev" ||
    clerkUser?.publicMetadata?.role === "admin";

  const nav = isAdmin
    ? [{id:"admin",label:"Admin",icon:"🛡️"}]
    : [{id:"dashboard",label:"Dashboard",icon:"⊞"},{id:"editor",label:"Editor",icon:"✏️"},{id:"pricing",label:"Pricing",icon:"💎"}];

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,height:54,background:`${T.surface}ee`,
      backdropFilter:"blur(12px)",borderBottom:`1px solid ${T.border}`,zIndex:1000,
      display:"flex",alignItems:"center",padding:"0 18px",gap:16}}>
      <button className="btn" onClick={()=>setPage(clerkUser?"dashboard":"landing")}
        style={{background:"none",border:"none",display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:30,height:30,background:T.primary,borderRadius:8,display:"flex",
          alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:`0 0 14px ${T.primaryGlow}`}}>🪺</div>
        <span className="syne" style={{fontWeight:800,fontSize:17,color:T.text,letterSpacing:"-0.5px"}}>
          Code<span style={{color:T.primary}}>Nest</span>
        </span>
      </button>

      {clerkUser && <nav style={{display:"flex",gap:4,flex:1}}>
        {nav.map(n=>(
          <button key={n.id} className="btn" onClick={()=>setPage(n.id)}
            style={{background:page===n.id?`${T.primary}18`:"none",border:"none",
              color:page===n.id?T.primary:T.textMuted,padding:"6px 13px",borderRadius:8,
              fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:13}}>{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>}
      {!clerkUser && <div style={{flex:1}}/>}

      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <button className="btn" onClick={()=>setDark(d=>!d)}
          style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,
            padding:"6px 9px",fontSize:15,color:T.textMuted}}>{isDark?"☀️":"🌙"}</button>

        {clerkUser ? (
          <div style={{position:"relative"}}>
            <button className="btn" onClick={()=>setMenu(m=>!m)}
              style={{display:"flex",alignItems:"center",gap:7,background:T.card,
                border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 9px 5px 5px"}}>
              <div style={{width:27,height:27,background:T.primary,borderRadius:6,display:"flex",
                alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff"}}>
                {clerkUser.firstName?.[0] || clerkUser.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || "U"}
              </div>
              <span style={{fontSize:13,fontWeight:600,color:T.text}}>
                {clerkUser.firstName || clerkUser.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User"}
              </span>
              <span style={{fontSize:9,color:T.textMuted}}>▼</span>
            </button>
            {menu && (
              <div className="fade" style={{position:"absolute",right:0,top:"calc(100%+5px)",
                background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:8,
                minWidth:170,zIndex:9999,boxShadow:"0 20px 40px rgba(0,0,0,0.3)"}}>
                {[
                  {l:"⚙️ Settings",a:()=>{setPage("settings");setMenu(false)}},
                  {l:"📊 Dashboard",a:()=>{setPage("dashboard");setMenu(false)}},
                  {l:"💎 Upgrade",a:()=>{setPage("pricing");setMenu(false)}},
                  {l:"🚪 Logout",a:()=>{signOut();setMenu(false)},danger:true},
                ].map(item=>(
                  <button key={item.l} className="btn" onClick={item.a}
                    style={{width:"100%",textAlign:"left",background:"none",border:"none",
                      color:item.danger?T.danger:T.text,padding:"8px 11px",
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

// ── Landing Page ─────────────────────────────────────────────
function Landing({setPage,T}) {
  const features=[
    {icon:"📝",title:"Smart Code Editor",desc:"Monaco-powered with IntelliSense and syntax highlighting for 10+ languages."},
    {icon:"🤖",title:"AI Coding Assistant",desc:"Generate, debug, explain and optimize code with AI inside your project."},
    {icon:"🚀",title:"One-Click Deploy",desc:"Deploy static sites, Node apps, Python services with zero configuration."},
    {icon:"👥",title:"Real-Time Collab",desc:"Code together live. Share projects, comment, and build as a team."},
    {icon:"🔒",title:"Secure Sandbox",desc:"Every run is in an isolated Docker container with CPU/RAM limits."},
    {icon:"📦",title:"50+ Templates",desc:"Bootstrap projects instantly from battle-tested templates."},
  ];
  return (
    <div style={{minHeight:"100vh",background:T.bg,paddingTop:54}}>
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
            CodeNest is the cloud IDE for modern developers. Write, run, and ship code from your browser.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <Btn T={T} size="lg" onClick={()=>setPage("signup")} icon="🪺">Start Building Free</Btn>
            <Btn T={T} size="lg" variant="ghost" onClick={()=>setPage("pricing")} icon="💎">View Pricing</Btn>
          </div>
          <p style={{fontSize:12,color:T.textFaint,marginTop:14}}>No credit card · Free forever plan</p>
        </div>
      </div>

      <div style={{padding:"0 24px 70px",maxWidth:1060,margin:"0 auto"}}>
        <h2 className="syne" style={{textAlign:"center",fontSize:34,fontWeight:800,
          color:T.text,marginBottom:40,letterSpacing:"-1px"}}>Everything a developer needs</h2>
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

      <div style={{padding:"70px 24px",textAlign:"center"}}>
        <h2 className="syne" style={{fontSize:38,fontWeight:800,color:T.text,marginBottom:14}}>
          Ready to start building?
        </h2>
        <p style={{color:T.textMuted,fontSize:16,marginBottom:28}}>
          Join 120,000 developers shipping faster with CodeNest.
        </p>
        <Btn T={T} size="lg" onClick={()=>setPage("signup")} icon="🪺">Create Free Account</Btn>
      </div>

      <div style={{borderTop:`1px solid ${T.border}`,padding:20,display:"flex",
        justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
        <span className="syne" style={{fontWeight:700,color:T.textMuted}}>🪺 CodeNest</span>
        <div style={{display:"flex",gap:16}}>
          {["Docs","Blog","Pricing","Privacy","Terms"].map(l=>(
            <button key={l} className="btn" style={{background:"none",border:"none",
              fontSize:13,color:T.textMuted}}>{l}</button>
          ))}
        </div>
        <span style={{fontSize:12,color:T.textFaint}}>© 2025 CodeNest Inc.</span>
      </div>
    </div>
  );
}

// ── Auth Pages (Clerk) ────────────────────────────────────────
function LoginPage({T}) {
  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",
      justifyContent:"center",paddingTop:54}}>
      <div className="fade">
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:36}}>🪺</div>
          <h2 className="syne" style={{fontSize:24,fontWeight:800,color:T.text,marginTop:8}}>
            Welcome back
          </h2>
        </div>
        <SignIn
          appearance={{
            elements:{
              rootBox:{width:"100%"},
              card:{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,
                boxShadow:`0 40px 80px rgba(0,0,0,0.3)`},
              headerTitle:{color:T.text,fontFamily:"'Syne',sans-serif"},
              formFieldInput:{background:T.surface,border:`1px solid ${T.border}`,
                color:T.text,borderRadius:8},
              formButtonPrimary:{background:T.primary,borderRadius:8,fontWeight:700},
              footerActionLink:{color:T.primary},
              socialButtonsBlockButton:{background:T.surface,border:`1px solid ${T.border}`,
                color:T.text,borderRadius:8},
            }
          }}
        />
      </div>
    </div>
  );
}

function SignupPage({T}) {
  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",
      justifyContent:"center",paddingTop:54}}>
      <div className="fade">
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:36}}>🪺</div>
          <h2 className="syne" style={{fontSize:24,fontWeight:800,color:T.text,marginTop:8}}>
            Create account
          </h2>
        </div>
        <SignUp
          appearance={{
            elements:{
              rootBox:{width:"100%"},
              card:{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,
                boxShadow:`0 40px 80px rgba(0,0,0,0.3)`},
              headerTitle:{color:T.text,fontFamily:"'Syne',sans-serif"},
              formFieldInput:{background:T.surface,border:`1px solid ${T.border}`,
                color:T.text,borderRadius:8},
              formButtonPrimary:{background:T.primary,borderRadius:8,fontWeight:700},
              footerActionLink:{color:T.primary},
              socialButtonsBlockButton:{background:T.surface,border:`1px solid ${T.border}`,
                color:T.text,borderRadius:8},
            }
          }}
        />
      </div>
    </div>
  );
}

// ── Dashboard (Real Supabase Data) ───────────────────────────
function Dashboard({clerkUser,setPage,setActiveProject,toast,T}) {
  const [projects,setProjects]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showNew,setShowNew]=useState(false);
  const [search,setSearch]=useState("");
  const [newP,setNewP]=useState({name:"",lang:"python"});

  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress;
  const userName = clerkUser?.firstName || userEmail?.split("@")[0] || "Developer";

  useEffect(()=>{
    if(userEmail) loadProjects();
  },[userEmail]);

  const loadProjects = async() => {
    setLoading(true);
    try {
      const {data,error} = await supabase
        .from("projects")
        .select("*")
        .eq("user_email", userEmail)
        .order("created_at",{ascending:false});
      if(!error && data) setProjects(data);
    } catch(e) {
      // Fallback to localStorage
      const saved = JSON.parse(localStorage.getItem("cn_projects") || "[]");
      setProjects(saved);
    }
    setLoading(false);
  };

  const createProject = async() => {
    if(!newP.name.trim()){toast("Project ka naam likho","warn");return;}
    const tmpl = TEMPLATES.find(t=>t.lang===newP.lang);
    const p = {
      id: uid(),
      name: newP.name,
      lang: newP.lang,
      language: newP.lang,
      code: tmpl?.code || "// Start coding...",
      user_email: userEmail,
      status: "idle",
      files: 1,
      is_public: false,
      created_at: new Date().toISOString(),
    };
    try {
      await supabase.from("projects").insert([{
        id: p.id, name: p.name, language: p.lang,
        code: p.code, user_email: userEmail, is_public: false,
      }]);
    } catch(e) {}
    const updated = [p,...projects];
    setProjects(updated);
    localStorage.setItem("cn_projects", JSON.stringify(updated));
    setShowNew(false);
    toast(`"${p.name}" project ban gaya!`,"success");
    setActiveProject(p); setPage("editor");
  };

  const deleteProject = async(id) => {
    try { await supabase.from("projects").delete().eq("id",id); } catch(e) {}
    const updated = projects.filter(p=>p.id!==id);
    setProjects(updated);
    localStorage.setItem("cn_projects",JSON.stringify(updated));
    toast("Project delete ho gaya","success");
  };

  const filtered = projects.filter(p=>p.name?.toLowerCase().includes(search.toLowerCase()));

  const stats=[
    {label:"Projects",value:loading?"...":projects.length,icon:"📁",color:T.primary},
    {label:"Deployed",value:loading?"...":projects.filter(p=>p.status==="deployed").length,icon:"🚀",color:T.accent},
    {label:"Plan",value:"PRO",icon:"💎",color:T.warn},
    {label:"Storage",value:"2.4 GB",icon:"☁️",color:"#a855f7"},
  ];

  return (
    <div style={{minHeight:"100vh",background:T.bg,padding:"74px 22px 40px",maxWidth:1160,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        flexWrap:"wrap",gap:14,marginBottom:24}}>
        <div>
          <h1 className="syne" style={{fontSize:26,fontWeight:800,color:T.text}}>
            Namaste, {userName} 👋
          </h1>
          <p style={{color:T.textMuted,fontSize:14,marginTop:3}}>Aapke projects ka overview</p>
        </div>
        <Btn T={T} icon="+" onClick={()=>setShowNew(true)}>New Project</Btn>
      </div>

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

      <div style={{marginBottom:24}}>
        <h3 style={{fontSize:13,fontWeight:700,color:T.textMuted,marginBottom:10,
          textTransform:"uppercase",letterSpacing:1}}>Quick Start</h3>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
          {TEMPLATES.map(tmpl=>(
            <button key={tmpl.id} className="btn" onClick={()=>{
              const p={...tmpl,id:uid(),user_email:userEmail,status:"idle",files:1,
                is_public:false,created_at:new Date().toISOString()};
              const updated=[p,...projects];
              setProjects(updated);
              localStorage.setItem("cn_projects",JSON.stringify(updated));
              setActiveProject(p); setPage("editor");
              toast(`${p.name} khula!`,"success");
            }}
            style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:9,
              padding:"9px 14px",display:"flex",alignItems:"center",gap:7,
              whiteSpace:"nowrap",color:T.text,fontSize:13,fontWeight:600}}>
              <span style={{fontSize:17}}>{tmpl.icon}</span>{tmpl.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{marginBottom:16}}>
        <Inp T={T} value={search} onChange={setSearch} placeholder="Projects search karo..." icon="🔍"/>
      </div>

      <h3 style={{fontSize:13,fontWeight:700,color:T.textMuted,marginBottom:11,
        textTransform:"uppercase",letterSpacing:1}}>Aapke Projects</h3>

      {loading ? (
        <div style={{textAlign:"center",padding:40}}>
          <Spinner size={30}/><p style={{color:T.textMuted,marginTop:12}}>Loading...</p>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          {filtered.map((p,i)=>(
            <div key={p.id} className="card fade" style={{background:T.card,border:`1px solid ${T.border}`,
              borderRadius:13,padding:18,animationDelay:`${i*0.06}s`,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,
                background:LANG_COLORS[p.lang||p.language]||T.primary,borderRadius:"13px 13px 0 0"}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <span style={{fontSize:26}}>{LANG_ICONS[p.lang||p.language]||"📄"}</span>
                  <div>
                    <h3 style={{fontWeight:700,fontSize:14,color:T.text}}>{p.name}</h3>
                    <p style={{fontSize:12,color:T.textMuted,marginTop:1}}>
                      {p.lang||p.language} · {p.files||1} files
                    </p>
                  </div>
                </div>
                <Badge color={p.status==="deployed"?T.accent:p.status==="running"?T.primary:T.textFaint}>
                  {p.status||"idle"}
                </Badge>
              </div>
              <div style={{marginTop:12,display:"flex",gap:7,flexWrap:"wrap"}}>
                <Btn T={T} size="sm" icon="✏️" onClick={()=>{setActiveProject(p);setPage("editor");}}>Edit</Btn>
                <Btn T={T} size="sm" variant="ghost" icon="🚀" onClick={()=>toast("Deploy ho raha hai...","info")}>Deploy</Btn>
                <button className="btn" onClick={()=>deleteProject(p.id)}
                  style={{marginLeft:"auto",background:`${T.danger}15`,border:`1px solid ${T.danger}30`,
                    borderRadius:6,padding:"5px 9px",fontSize:12,color:T.danger}}>🗑️</button>
              </div>
              <p style={{fontSize:11,color:T.textFaint,marginTop:10}}>
                {p.created_at ? new Date(p.created_at).toLocaleDateString() : "Just now"}
              </p>
            </div>
          ))}
          {filtered.length===0&&!loading&&(
            <div style={{gridColumn:"1/-1",textAlign:"center",padding:50,color:T.textMuted}}>
              <span style={{fontSize:44}}>📭</span>
              <p style={{marginTop:10,fontSize:14}}>Koi project nahi mila</p>
              <Btn T={T} style={{marginTop:14}} icon="+" onClick={()=>setShowNew(true)}>New Project</Btn>
            </div>
          )}
        </div>
      )}

      <Modal open={showNew} onClose={()=>setShowNew(false)} title="Naya Project Banao" T={T}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Inp T={T} label="Project Name" value={newP.name}
            onChange={v=>setNewP(n=>({...n,name:v}))} placeholder="mera-project" icon="📁"/>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:T.textMuted,display:"block",marginBottom:7}}>Language</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
              {Object.keys(LANG_COLORS).map(lang=>(
                <button key={lang} className="btn" onClick={()=>setNewP(n=>({...n,lang}))}
                  style={{background:newP.lang===lang?`${LANG_COLORS[lang]}22`:T.surface,
                    border:`1.5px solid ${newP.lang===lang?LANG_COLORS[lang]:T.border}`,
                    borderRadius:8,padding:"9px 5px",fontSize:12,fontWeight:600,color:T.text,
                    display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                  {LANG_ICONS[lang]} {lang}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:9,justifyContent:"flex-end",marginTop:6}}>
            <Btn T={T} variant="ghost" onClick={()=>setShowNew(false)}>Cancel</Btn>
            <Btn T={T} icon="🚀" onClick={createProject}>Create</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Editor ───────────────────────────────────────────────────
function Editor({activeProject,toast,T}) {
  const [code,setCode]=useState(activeProject?.code||"// Start coding...");
  const [output,setOutput]=useState("");
  const [running,setRunning]=useState(false);
  const [aiOpen,setAiOpen]=useState(true);
  const [aiMode,setAiMode]=useState("generate");
  const [aiPrompt,setAiPrompt]=useState("");
  const [aiResp,setAiResp]=useState("");
  const [aiLoad,setAiLoad]=useState(false);
  const lang = activeProject?.lang || activeProject?.language || "python";

  const run=async()=>{
    setRunning(true); setOutput("");
    await new Promise(r=>setTimeout(r,700));
    const out={
      python:`Python 3.11\n${"─".repeat(20)}\nHello, CodeNest!\n\n✅ 0.12s me run hua`,
      javascript:`Node.js v20\n${"─".repeat(20)}\nHello, CodeNest!\n\n✅ 0.08s me run hua`,
      typescript:`TypeScript 5.1\n${"─".repeat(20)}\nHello TypeScript!\n\n✅ 0.10s me run hua`,
      cpp:`GCC 13.2\n${"─".repeat(20)}\n1 2 3 5 8 9\n\n✅ 0.03s me run hua`,
      java:`OpenJDK 21\n${"─".repeat(20)}\nHello CodeNest!\n\n✅ 0.45s me run hua`,
      php:`PHP 8.2\n${"─".repeat(20)}\nHello from CodeNest!\n\n✅ 0.02s me run hua`,
    };
    setOutput(out[lang]||"Code run ho gaya!");
    setRunning(false);
  };

  const saveCode = async() => {
    if(activeProject?.id) {
      try {
        await supabase.from("projects").update({code}).eq("id",activeProject.id);
      } catch(e) {}
    }
    toast("Saved! ✓","success");
  };

  const askAI=async()=>{
    if(!aiPrompt.trim()&&aiMode==="generate"){toast("Prompt likho","warn");return;}
    setAiLoad(true); setAiResp("");
    const sys={
      generate:"You are an expert coding assistant. Generate clean, commented code. Be concise.",
      fix:"You are a debugging expert. Find and fix bugs in the code. Explain what was wrong.",
      explain:"You are a code teacher. Explain the code clearly — what it does, how it works.",
      optimize:"You are a performance expert. Analyze and suggest optimizations.",
    };
    const userMsg={
      generate: aiPrompt,
      fix:`Fix this ${lang} code:\n\`\`\`${lang}\n${code}\n\`\`\`\nNotes: ${aiPrompt||"Find all bugs"}`,
      explain:`Explain this ${lang} code:\n\`\`\`${lang}\n${code}\n\`\`\``,
      optimize:`Optimize this ${lang} code:\n\`\`\`${lang}\n${code}\n\`\`\``,
    };
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:1000,stream:true,
          system:sys[aiMode],
          messages:[{role:"user",content:userMsg[aiMode]}],
        }),
      });
      if(!res.ok) throw new Error(`API ${res.status}`);
      const reader=res.body.getReader();
      const dec=new TextDecoder();
      let full="";
      while(true){
        const {done,value}=await reader.read();
        if(done) break;
        for(const line of dec.decode(value).split("\n")){
          if(!line.startsWith("data: ")) continue;
          const d=line.slice(6).trim();
          if(d==="[DONE]") break;
          try{const t=JSON.parse(d).delta?.text||"";if(t){full+=t;setAiResp(full);}}catch{}
        }
      }
    } catch(e) {
      setAiResp(`❌ AI abhi available nahi hai.\n\nClaude.ai ke andar use karo — wahan free kaam karta hai!`);
    }
    setAiLoad(false);
  };

  const applyCode=()=>{
    const m=aiResp.match(/```[\w]*\n([\s\S]*?)```/);
    if(m){setCode(m[1]);toast("AI ka code apply hua!","success");}
    else toast("Code block nahi mila","warn");
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.bg,paddingTop:54}}>
      <div style={{height:40,background:T.surface,borderBottom:`1px solid ${T.border}`,
        display:"flex",alignItems:"center",padding:"0 12px",gap:8,flexShrink:0}}>
        <span style={{fontSize:13,fontWeight:700,color:T.text}}>
          {LANG_ICONS[lang]} {activeProject?.name||"Untitled"}
        </span>
        <div style={{flex:1}}/>
        <button className="btn" onClick={saveCode}
          style={{background:`${T.primary}20`,border:`1px solid ${T.primary}40`,borderRadius:6,
            padding:"5px 11px",fontSize:12,color:T.primary,fontWeight:700}}>💾 Save</button>
        <button className="btn" onClick={run} disabled={running}
          style={{background:T.accent,border:"none",borderRadius:6,padding:"5px 14px",
            fontSize:12,color:"#07070e",fontWeight:800,display:"flex",alignItems:"center",gap:5}}>
          {running?<><Spinner size={12} color="#07070e"/>Running...</>:"▶ Run"}
        </button>
        <button className="btn" onClick={()=>toast("Deploy ho raha hai...","info")}
          style={{background:`${T.warn}20`,border:`1px solid ${T.warn}40`,borderRadius:6,
            padding:"5px 11px",fontSize:12,color:T.warn,fontWeight:700}}>🚀 Deploy</button>
        <button className="btn" onClick={()=>setAiOpen(a=>!a)}
          style={{background:aiOpen?`${T.primary}25`:"none",
            border:`1px solid ${aiOpen?T.primary:T.border}`,borderRadius:6,
            padding:"5px 11px",fontSize:12,color:aiOpen?T.primary:T.textMuted,fontWeight:700}}>
          🤖 AI
        </button>
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <div style={{width:190,background:T.surface,borderRight:`1px solid ${T.border}`,
          padding:"10px 0",flexShrink:0}}>
          <div style={{padding:"0 12px",marginBottom:7,fontSize:10,fontWeight:700,
            color:T.textFaint,textTransform:"uppercase",letterSpacing:1}}>Files</div>
          {[`main.${lang==="python"?"py":lang==="cpp"?"cpp":lang==="java"?"java":lang==="php"?"php":"js"}`,
            "README.md","package.json"].map((f,i)=>(
            <div key={f} style={{padding:"7px 12px",fontSize:12.5,
              color:i===0?T.primary:T.textMuted,
              background:i===0?`${T.primary}15`:"none",cursor:"pointer",
              display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:13}}>📄</span>{f}
            </div>
          ))}
          <div style={{margin:"10px 8px 0"}}>
            <button className="btn" style={{width:"100%",background:"none",
              border:`1px dashed ${T.border}`,borderRadius:6,padding:"6px",
              fontSize:12,color:T.textFaint}}>+ New File</button>
          </div>
        </div>

        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
          <div style={{flex:1,display:"flex",overflow:"hidden"}}>
            <div style={{background:T.editor,padding:"12px 0",width:40,textAlign:"right",
              borderRight:`1px solid ${T.border}`,overflow:"hidden",flexShrink:0}}>
              {code.split("\n").map((_,i)=>(
                <div key={i} style={{fontSize:11.5,color:T.textFaint,padding:"0 7px",
                  lineHeight:"22px",fontFamily:"'JetBrains Mono',monospace"}}>{i+1}</div>
              ))}
            </div>
            <textarea className="mono" value={code} onChange={e=>setCode(e.target.value)}
              style={{flex:1,background:T.editor,border:"none",color:T.text,fontSize:13.5,
                lineHeight:"22px",padding:"12px 14px",outline:"none",overflowY:"auto",
                fontFamily:"'JetBrains Mono',monospace",tabSize:2,spellCheck:false}}/>
          </div>
          <div style={{height:190,background:T.bg,borderTop:`1px solid ${T.border}`,
            display:"flex",flexDirection:"column"}}>
            <div style={{background:T.surface,padding:"7px 14px",
              borderBottom:`1px solid ${T.border}`,fontSize:12,fontWeight:700,color:T.textMuted}}>
              📤 Output
            </div>
            <pre className="mono" style={{flex:1,padding:12,color:T.accent,fontSize:12.5,
              overflowY:"auto",background:T.editor,margin:0,lineHeight:1.7}}>
              {running?"⏳ Code run ho raha hai...":output||"▶ Run dabao code chalane ke liye"}
            </pre>
          </div>
        </div>

        {aiOpen && (
          <div className="fade" style={{width:300,background:T.surface,
            borderLeft:`1px solid ${T.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
            <div style={{padding:"11px 14px",borderBottom:`1px solid ${T.border}`,
              background:`linear-gradient(135deg,${T.primary}15,${T.accent}10)`}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontSize:19}}>🤖</span>
                <span className="syne" style={{fontWeight:700,fontSize:14,color:T.text}}>AI Assistant</span>
                <Badge color={T.accent}>LIVE</Badge>
              </div>
            </div>
            <div style={{padding:"11px 11px 0",display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {[{id:"generate",l:"✨ Generate",c:T.primary},{id:"fix",l:"🔧 Fix Bug",c:T.danger},
                {id:"explain",l:"📖 Explain",c:T.warn},{id:"optimize",l:"⚡ Optimize",c:T.accent}].map(m=>(
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
                placeholder={aiMode==="generate"?"Kya code chahiye?":"Prompt ya blank rakho..."}
                style={{width:"100%",height:75,background:T.card,border:`1px solid ${T.border}`,
                  borderRadius:7,padding:9,color:T.text,fontSize:12,
                  fontFamily:"'DM Sans',sans-serif",outline:"none",lineHeight:1.6}}/>
              <Btn T={T} onClick={askAI} disabled={aiLoad}
                style={{width:"100%",justifyContent:"center",marginTop:7}}>
                {aiLoad?<><Spinner size={13} color="#fff"/>Soch raha hai...</>:"AI se Pucho →"}
              </Btn>
            </div>
            {(aiResp||aiLoad) && (
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
                <pre className="mono" style={{fontSize:11,color:T.text,whiteSpace:"pre-wrap",
                  wordBreak:"break-word",lineHeight:1.65,background:T.card,padding:9,
                  borderRadius:6,border:`1px solid ${T.border}`}}>{aiResp}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pricing ──────────────────────────────────────────────────
function Pricing({setPage,clerkUser,toast,T}) {
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
                {b==="monthly"?"Monthly":"Annual"}{b==="annual"&&<Badge color={T.accent}>-20%</Badge>}
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
                onClick={()=>{
                  if(!clerkUser){setPage("signup");return;}
                  toast(`${plan.name} plan select hua!`,"success");
                }}>
                {plan.price===0?"Free Start karo":plan.price===null?"Contact karo":"Subscribe karo"}
              </Btn>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Settings ─────────────────────────────────────────────────
function Settings({clerkUser,toast,isDark,setDark,T}) {
  const [tab,setTab]=useState("profile");
  const tabs=[{id:"profile",l:"👤 Profile"},{id:"security",l:"🔒 Security"},
    {id:"billing",l:"💳 Billing"},{id:"api",l:"🔑 API Keys"}];
  const userName = clerkUser?.firstName || "Developer";
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress || "";

  return (
    <div style={{minHeight:"100vh",background:T.bg,padding:"74px 22px 40px"}}>
      <div style={{maxWidth:860,margin:"0 auto"}}>
        <h1 className="syne" style={{fontSize:26,fontWeight:800,color:T.text,marginBottom:24}}>Settings</h1>
        <div style={{display:"flex",gap:22,flexWrap:"wrap"}}>
          <div style={{width:190,flexShrink:0}}>
            {tabs.map(tb=>(
              <button key={tb.id} className="btn" onClick={()=>setTab(tb.id)}
                style={{width:"100%",textAlign:"left",
                  background:tab===tb.id?`${T.primary}18`:"none",border:"none",
                  borderRadius:8,padding:"9px 13px",fontSize:13,fontWeight:600,
                  color:tab===tb.id?T.primary:T.textMuted,display:"block",marginBottom:2}}>
                {tb.l}
              </button>
            ))}
          </div>
          <div className="fade" style={{flex:1,minWidth:260}}>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:15,padding:26}}>
              {tab==="profile"&&(
                <div style={{display:"flex",flexDirection:"column",gap:16}}>
                  <h3 style={{fontWeight:700,fontSize:16,color:T.text}}>Profile</h3>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:64,height:64,background:T.primary,borderRadius:14,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:26,fontWeight:800,color:"#fff"}}>
                      {userName[0]||"U"}
                    </div>
                    <div>
                      <p style={{fontWeight:700,color:T.text,fontSize:16}}>{userName}</p>
                      <p style={{fontSize:13,color:T.textMuted}}>{userEmail}</p>
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:13,background:T.surface,borderRadius:9,border:`1px solid ${T.border}`}}>
                    <div>
                      <p style={{fontWeight:600,color:T.text,fontSize:14}}>Dark Mode</p>
                      <p style={{fontSize:12,color:T.textMuted}}>Theme toggle karo</p>
                    </div>
                    <button onClick={()=>setDark(d=>!d)}
                      style={{width:46,height:25,background:isDark?T.primary:T.border,
                        borderRadius:12,border:"none",cursor:"pointer",position:"relative",
                        transition:"background 0.2s"}}>
                      <div style={{width:19,height:19,background:"#fff",borderRadius:"50%",
                        position:"absolute",top:3,left:isDark?23:3,transition:"left 0.2s",
                        boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}/>
                    </button>
                  </div>
                  <div style={{padding:14,background:`${T.accent}10`,borderRadius:10,
                    border:`1px solid ${T.accent}30`}}>
                    <p style={{fontSize:13,color:T.textMuted}}>
                      Profile manage karne ke liye Clerk account use karo
                    </p>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </div>
              )}
              {tab==="billing"&&(
                <div>
                  <h3 style={{fontWeight:700,fontSize:16,color:T.text,marginBottom:18}}>Billing</h3>
                  <div style={{background:`${T.primary}15`,border:`1px solid ${T.primary}30`,
                    borderRadius:11,padding:18,marginBottom:18}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <p style={{fontWeight:700,fontSize:15,color:T.text}}>Pro Plan</p>
                        <p style={{fontSize:13,color:T.textMuted}}>$12/month</p>
                      </div>
                      <Badge color={T.primary}>Active</Badge>
                    </div>
                  </div>
                  <Btn T={T} variant="outline" icon="⬆️" onClick={()=>toast("Upgrade coming soon","info")}>
                    Upgrade Plan
                  </Btn>
                </div>
              )}
              {tab==="api"&&(
                <div>
                  <h3 style={{fontWeight:700,fontSize:16,color:T.text,marginBottom:16}}>API Keys</h3>
                  <div style={{background:T.surface,border:`1px solid ${T.border}`,
                    borderRadius:9,padding:14,marginBottom:14}}>
                    <p style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:7}}>Personal Token</p>
                    <code style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,
                      color:T.textMuted}}>sk-cn-••••••••••••••••</code>
                  </div>
                  <Btn T={T} icon="+" onClick={()=>toast("Naya key ban gaya!","success")}>New Key</Btn>
                </div>
              )}
              {tab==="security"&&(
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <h3 style={{fontWeight:700,fontSize:16,color:T.text}}>Security</h3>
                  <div style={{padding:14,background:`${T.accent}10`,borderRadius:10,
                    border:`1px solid ${T.accent}30`}}>
                    <p style={{fontSize:13,color:T.textMuted}}>
                      Password aur security settings Clerk account me manage karo
                    </p>
                    <div style={{marginTop:10}}>
                      <UserButton afterSignOutUrl="/"/>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Admin Panel (Real Supabase Data) ─────────────────────────
function Admin({toast,T}) {
  const [tab,setTab]=useState("overview");
  const [users,setUsers]=useState([]);
  const [projects,setProjects]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selUser,setSelUser]=useState(null);
  const [announce,setAnnounce]=useState("");

  useEffect(()=>{ loadData(); },[]);

  const loadData = async() => {
    setLoading(true);
    try {
      const {data:u} = await supabase.from("users").select("*").order("created_at",{ascending:false});
      const {data:p} = await supabase.from("projects").select("*").order("created_at",{ascending:false});
      if(u) setUsers(u);
      if(p) setProjects(p);
    } catch(e) {
      toast("Database se connect nahi hua","warn");
    }
    setLoading(false);
  };

  const totalRev = users.reduce((s,u)=>s+(u.revenue||0),0);

  const adminTabs=[
    {id:"overview",l:"📊 Overview"},{id:"users",l:"👥 Users"},
    {id:"projects",l:"📁 Projects"},{id:"revenue",l:"💰 Revenue"},
    {id:"logs",l:"📋 Logs"},{id:"plans",l:"💎 Plans"},
    {id:"announce",l:"📢 Announce"},{id:"apikeys",l:"🔑 API Keys",highlight:true},
  ];

  const [apiKeys,setApiKeys]=useState(()=>JSON.parse(localStorage.getItem("cn_admin_keys")||"{}"));
  const saveKeys=()=>{
    localStorage.setItem("cn_admin_keys",JSON.stringify(apiKeys));
    toast("Keys save ho gayi!","success");
  };

  const KEY_GROUPS=[
    {group:"🤖 AI",color:"#cc785c",keys:[
      {id:"anthropic",label:"Anthropic API Key",placeholder:"sk-ant-api03-..."},
    ]},
    {group:"💳 Payments",color:"#635bff",keys:[
      {id:"stripe",label:"Stripe Secret Key",placeholder:"sk_live_..."},
      {id:"razorpay_id",label:"Razorpay Key ID",placeholder:"rzp_live_..."},
      {id:"razorpay_secret",label:"Razorpay Secret",placeholder:"secret..."},
    ]},
    {group:"🔐 Auth",color:"#6c47ff",keys:[
      {id:"clerk",label:"Clerk Secret Key",placeholder:"sk_live_..."},
    ]},
    {group:"☁️ AWS",color:"#ff9900",keys:[
      {id:"aws_key",label:"AWS Access Key",placeholder:"AKIA..."},
      {id:"aws_secret",label:"AWS Secret Key",placeholder:"secret..."},
      {id:"aws_bucket",label:"S3 Bucket",placeholder:"codenest-files"},
    ]},
    {group:"🗄️ Database",color:"#3ecf8e",keys:[
      {id:"db_url",label:"PostgreSQL URL",placeholder:"postgresql://..."},
      {id:"redis_url",label:"Redis URL",placeholder:"redis://..."},
    ]},
  ];

  const logs=[
    {time:"14:32",level:"INFO",msg:"User login kiya"},
    {time:"14:28",level:"WARN",msg:"Rate limit exceed: IP 203.0.113.42"},
    {time:"14:15",level:"ERROR",msg:"Docker container crash"},
    {time:"13:57",level:"INFO",msg:"Payment processed: $12"},
    {time:"13:44",level:"WARN",msg:"5 failed login attempts"},
    {time:"13:02",level:"INFO",msg:"Deploy complete"},
  ];

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
            <p style={{fontSize:11,color:T.textFaint,marginTop:2}}>Super Admin</p>
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
          <button className="btn" onClick={loadData}
            style={{width:"100%",background:`${T.accent}15`,border:`1px solid ${T.accent}30`,
              borderRadius:7,padding:"8px 11px",fontSize:12,color:T.accent,marginTop:12,fontWeight:600}}>
            🔄 Refresh Data
          </button>
        </div>

        <div className="fade" style={{flex:1,padding:24,overflowY:"auto"}}>
          {loading && (
            <div style={{textAlign:"center",padding:40}}>
              <Spinner size={30}/><p style={{color:T.textMuted,marginTop:12}}>Data load ho raha hai...</p>
            </div>
          )}

          {!loading && tab==="overview" && (
            <div>
              <h2 className="syne" style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:18}}>
                Dashboard Overview
              </h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:24}}>
                {[
                  {l:"Total Users",v:users.length,ic:"👥",c:T.primary},
                  {l:"Total Projects",v:projects.length,ic:"📁",c:T.accent},
                  {l:"Revenue",v:`$${totalRev}`,ic:"💰",c:T.warn},
                  {l:"Active Users",v:users.filter(u=>u.status!=="suspended").length,ic:"✅",c:"#a855f7"},
                ].map((s,i)=>(
                  <div key={i} className="card" style={{background:T.card,border:`1px solid ${T.border}`,
                    borderRadius:13,padding:16}}>
                    <span style={{fontSize:22}}>{s.ic}</span>
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

          {!loading && tab==="users" && (
            <div>
              <h2 className="syne" style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:18}}>
                Users ({users.length})
              </h2>
              {users.length === 0 ? (
                <div style={{textAlign:"center",padding:60,color:T.textMuted}}>
                  <span style={{fontSize:44}}>👥</span>
                  <p style={{marginTop:12}}>Abhi koi user nahi hai</p>
                  <p style={{fontSize:13,marginTop:6}}>Jab log signup karenge, yahan dikhenge</p>
                </div>
              ) : (
                <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,overflow:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{borderBottom:`1px solid ${T.border}`}}>
                        {["User","Email","Plan","Status","Joined","Action"].map(h=>(
                          <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:11,
                            fontWeight:700,color:T.textMuted,textTransform:"uppercase",
                            letterSpacing:1,whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u=>(
                        <tr key={u.id} style={{borderBottom:`1px solid ${T.border}`}}>
                          <td style={{padding:"11px 14px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:9}}>
                              <div style={{width:30,height:30,background:T.primary,borderRadius:7,
                                display:"flex",alignItems:"center",justifyContent:"center",
                                fontSize:12,fontWeight:700,color:"#fff"}}>
                                {(u.name||u.email||"U")[0].toUpperCase()}
                              </div>
                              <span style={{fontSize:13,fontWeight:600,color:T.text}}>
                                {u.name||"User"}
                              </span>
                            </div>
                          </td>
                          <td style={{padding:"11px 14px",fontSize:13,color:T.textMuted}}>{u.email}</td>
                          <td style={{padding:"11px 14px"}}>
                            <Badge color={u.plan==="pro"?T.primary:u.plan==="team"?T.accent:T.textFaint}>
                              {u.plan||"free"}
                            </Badge>
                          </td>
                          <td style={{padding:"11px 14px"}}>
                            <Badge color={u.status==="suspended"?T.danger:T.accent}>
                              {u.status||"active"}
                            </Badge>
                          </td>
                          <td style={{padding:"11px 14px",fontSize:12,color:T.textMuted}}>
                            {u.created_at?new Date(u.created_at).toLocaleDateString():"N/A"}
                          </td>
                          <td style={{padding:"11px 14px"}}>
                            <button className="btn" onClick={()=>setSelUser(u)}
                              style={{background:`${T.primary}15`,border:`1px solid ${T.primary}30`,
                                borderRadius:5,padding:"4px 9px",fontSize:11,color:T.primary}}>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!loading && tab==="projects" && (
            <div>
              <h2 className="syne" style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:18}}>
                Projects ({projects.length})
              </h2>
              {projects.length === 0 ? (
                <div style={{textAlign:"center",padding:60,color:T.textMuted}}>
                  <span style={{fontSize:44}}>📁</span>
                  <p style={{marginTop:12}}>Abhi koi project nahi hai</p>
                </div>
              ) : (
                <div style={{display:"grid",gap:12}}>
                  {projects.map(p=>(
                    <div key={p.id} style={{background:T.card,border:`1px solid ${T.border}`,
                      borderRadius:11,padding:16,display:"flex",justifyContent:"space-between",
                      alignItems:"center",flexWrap:"wrap",gap:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:22}}>{LANG_ICONS[p.language]||"📄"}</span>
                        <div>
                          <p style={{fontWeight:700,color:T.text}}>{p.name}</p>
                          <p style={{fontSize:12,color:T.textMuted}}>{p.language} · {p.user_email}</p>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <Badge color={p.is_public?T.accent:T.textFaint}>
                          {p.is_public?"Public":"Private"}
                        </Badge>
                        <span style={{fontSize:11,color:T.textFaint}}>
                          {p.created_at?new Date(p.created_at).toLocaleDateString():""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && tab==="revenue" && (
            <div>
              <h2 className="syne" style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:18}}>
                Revenue Dashboard
              </h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>
                {[
                  {l:"Total Revenue",v:`$${totalRev}`,c:T.accent},
                  {l:"Paying Users",v:users.filter(u=>u.plan&&u.plan!=="free").length,c:T.primary},
                  {l:"Free Users",v:users.filter(u=>!u.plan||u.plan==="free").length,c:T.textMuted},
                  {l:"Churn Rate",v:"2.1%",c:T.danger},
                ].map((s,i)=>(
                  <div key={i} className="card" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:18}}>
                    <p className="syne" style={{fontSize:26,fontWeight:800,color:s.c}}>{s.v}</p>
                    <p style={{fontSize:12,color:T.textMuted,marginTop:4}}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && tab==="logs" && (
            <div>
              <h2 className="syne" style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:18}}>
                Server Logs
              </h2>
              <div style={{background:T.editor,border:`1px solid ${T.border}`,borderRadius:13,overflow:"hidden"}}>
                {logs.map((log,i)=>(
                  <div key={i} className="mono" style={{display:"flex",gap:11,padding:"9px 15px",
                    borderBottom:`1px solid ${T.border}20`,fontSize:12}}>
                    <span style={{color:T.textFaint,flexShrink:0}}>{log.time}</span>
                    <span style={{fontWeight:700,flexShrink:0,width:42,
                      color:log.level==="ERROR"?T.danger:log.level==="WARN"?T.warn:T.accent}}>
                      {log.level}
                    </span>
                    <span style={{color:T.text,flex:1}}>{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && tab==="plans" && (
            <div>
              <h2 className="syne" style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:18}}>
                Plans Manage karo
              </h2>
              <div style={{display:"grid",gap:13}}>
                {PLANS.map(plan=>(
                  <div key={plan.id} style={{background:T.card,border:`1px solid ${T.border}`,
                    borderRadius:13,padding:18,display:"flex",justifyContent:"space-between",
                    alignItems:"center",flexWrap:"wrap",gap:11}}>
                    <div style={{display:"flex",alignItems:"center",gap:11}}>
                      <div style={{width:38,height:38,background:`${plan.color}22`,
                        border:`2px solid ${plan.color}`,borderRadius:9,
                        display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💎</div>
                      <div>
                        <p style={{fontWeight:700,color:T.text,fontSize:15}}>{plan.name}</p>
                        <p style={{fontSize:12,color:T.textMuted}}>
                          {plan.price===null?"Custom":plan.price===0?"Free":`$${plan.price}/mo`}
                          {" · "}
                          {users.filter(u=>u.plan===plan.id).length} users
                        </p>
                      </div>
                    </div>
                    <Btn T={T} size="sm" variant="ghost" onClick={()=>toast("Edit coming soon","info")}>Edit</Btn>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && tab==="announce" && (
            <div>
              <h2 className="syne" style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:18}}>
                Announcement Bhejo
              </h2>
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:22}}>
                <div style={{display:"flex",flexDirection:"column",gap:13}}>
                  <div>
                    <label style={{fontSize:13,fontWeight:600,color:T.textMuted,display:"block",marginBottom:6}}>
                      Message
                    </label>
                    <textarea value={announce} onChange={e=>setAnnounce(e.target.value)}
                      placeholder="Announcement likhiye..."
                      style={{width:"100%",height:110,background:T.surface,
                        border:`1px solid ${T.border}`,borderRadius:8,padding:11,
                        color:T.text,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:"none"}}/>
                  </div>
                  <Btn T={T} icon="📢" onClick={()=>{
                    if(!announce.trim()){toast("Kuch likho pehle","warn");return;}
                    toast("Announcement sabko bhej diya!","success");
                    setAnnounce("");
                  }}>Bhejo</Btn>
                </div>
              </div>
            </div>
          )}

          {tab==="apikeys" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
                <div>
                  <h2 className="syne" style={{fontSize:22,fontWeight:800,color:T.text}}>🔑 API Keys Manager</h2>
                  <p style={{fontSize:13,color:T.textMuted,marginTop:4}}>Saari API keys yahan add karo</p>
                </div>
                <Btn T={T} onClick={saveKeys} icon="💾">Save All Keys</Btn>
              </div>

              <div style={{background:`${T.warn}10`,border:`1px solid ${T.warn}30`,borderRadius:10,
                padding:"12px 16px",marginBottom:20,display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18,flexShrink:0}}>⚠️</span>
                <p style={{fontSize:12,color:T.textMuted,lineHeight:1.6}}>
                  Production me inhe server ke .env file me rakho. Kabhi GitHub pe upload mat karo!
                </p>
              </div>

              {KEY_GROUPS.map((group,gi)=>(
                <div key={gi} style={{background:T.card,border:`1px solid ${T.border}`,
                  borderRadius:13,overflow:"hidden",marginBottom:16}}>
                  <div style={{padding:"13px 18px",background:`${group.color}10`,
                    borderBottom:`1px solid ${group.color}25`,display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:group.color}}/>
                    <span style={{fontWeight:700,fontSize:14,color:group.color}}>{group.group}</span>
                  </div>
                  <div style={{padding:"6px 0"}}>
                    {group.keys.map((kc,ki)=>(
                      <div key={ki} style={{padding:"14px 18px",
                        borderBottom:ki<group.keys.length-1?`1px solid ${T.border}`:"none"}}>
                        <label style={{fontSize:13,fontWeight:700,color:T.text,display:"block",marginBottom:7}}>
                          {kc.label}
                        </label>
                        <input
                          type="password"
                          value={apiKeys[kc.id]||""}
                          onChange={e=>setApiKeys(a=>({...a,[kc.id]:e.target.value}))}
                          placeholder={kc.placeholder}
                          className="mono"
                          style={{width:"100%",background:T.surface,
                            border:`1.5px solid ${apiKeys[kc.id]?group.color:T.border}`,
                            borderRadius:8,padding:"9px 12px",color:T.text,fontSize:12.5,
                            fontFamily:"'JetBrains Mono',monospace",outline:"none"}}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
                <Btn T={T} icon="💾" onClick={saveKeys}>Save All Keys</Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={!!selUser} onClose={()=>setSelUser(null)} title={`User: ${selUser?.name||selUser?.email}`} T={T}>
        {selUser&&(
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {[["Email",selUser.email],["Plan",selUser.plan||"free"],
              ["Status",selUser.status||"active"],
              ["Joined",selUser.created_at?new Date(selUser.created_at).toLocaleDateString():"N/A"]
            ].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",
                padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                <span style={{color:T.textMuted,fontSize:13}}>{k}</span>
                <span style={{color:T.text,fontWeight:600,fontSize:13}}>{v}</span>
              </div>
            ))}
            <div style={{display:"flex",gap:9,marginTop:7}}>
              <Btn T={T} variant="danger" onClick={async()=>{
                try {
                  await supabase.from("users").update({
                    status: selUser.status==="suspended"?"active":"suspended"
                  }).eq("id",selUser.id);
                  loadData();
                } catch(e) {}
                setSelUser(null);
                toast("User status update ho gaya","success");
              }}>
                {selUser.status==="suspended"?"Activate":"Suspend"}
              </Btn>
              <Btn T={T} variant="ghost" onClick={()=>setSelUser(null)}>Close</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Main App with Clerk ───────────────────────────────────────
function AppContent() {
  injectCSS();
  const {user:clerkUser, isLoaded, isSignedIn} = useUser();
  const [isDark,setDark] = useState(true);
  const [page,setPage] = useState("landing");
  const [activeProject,setActiveProject] = useState(null);
  const [toasts,setToasts] = useState([]);
  const T = isDark ? DARK : LIGHT;

  const toast = useCallback((msg,type="success")=>{
    const id = uid();
    setToasts(ts=>[...ts,{id,msg,type}]);
  },[]);

  const rmToast = useCallback((id)=>setToasts(ts=>ts.filter(t=>t.id!==id)),[]);

  useEffect(()=>{
    if(isLoaded && isSignedIn && page==="landing"){
      setPage("dashboard");
    }
    if(isLoaded && !isSignedIn && !["landing","login","signup","pricing"].includes(page)){
      setPage("landing");
    }
  },[isLoaded,isSignedIn,page]);

  // Save user to Supabase on login
  useEffect(()=>{
    if(isSignedIn && clerkUser){
      const email = clerkUser.primaryEmailAddress?.emailAddress;
      const name = clerkUser.firstName || email?.split("@")[0];
      if(email){
        supabase.from("users").upsert([{
          id: clerkUser.id,
          email,
          name,
          plan: "free",
          status: "active",
        }],{onConflict:"email"}).then(()=>{});
      }
    }
  },[isSignedIn,clerkUser]);

  if(!isLoaded){
    return (
      <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:16}}>🪺</div>
          <Spinner size={30} color={T.primary}/>
          <p style={{color:T.textMuted,marginTop:12,fontFamily:"'DM Sans',sans-serif"}}>Loading CodeNest...</p>
        </div>
      </div>
    );
  }

  const renderPage=()=>{
    const props={clerkUser,setPage,toast,T,isDark,setDark,activeProject,setActiveProject};
    if(page==="login") return <LoginPage T={T}/>;
    if(page==="signup") return <SignupPage T={T}/>;
    if(!isSignedIn) return <Landing setPage={setPage} T={T}/>;
    switch(page){
      case "dashboard": return <Dashboard {...props}/>;
      case "editor": return <Editor {...props}/>;
      case "pricing": return <Pricing {...props}/>;
      case "settings": return <Settings {...props}/>;
      case "admin": return <Admin {...props}/>;
      default: return <Landing setPage={setPage} T={T}/>;
    }
  };

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'DM Sans',sans-serif"}}>
      <TopBar page={page} setPage={setPage} clerkUser={isSignedIn?clerkUser:null}
        isDark={isDark} setDark={setDark} T={T}/>
      {renderPage()}
      <div style={{position:"fixed",bottom:22,right:22,zIndex:99999,
        display:"flex",flexDirection:"column",gap:7}}>
        {toasts.map(t=><Toast key={t.id} msg={t.msg} type={t.type} onClose={()=>rmToast(t.id)}/>)}
      </div>
    </div>
  );
}

export default function App() {
  if(!CLERK_KEY){
    return (
      <div style={{minHeight:"100vh",background:"#07070e",display:"flex",
        alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{textAlign:"center",color:"#e4e4f0"}}>
          <div style={{fontSize:40,marginBottom:16}}>🪺</div>
          <h2 style={{fontWeight:700,marginBottom:8}}>CodeNest Setup Required</h2>
          <p style={{color:"#6b6b92",fontSize:14}}>
            REACT_APP_CLERK_PUBLISHABLE_KEY environment variable add karo Vercel me
          </p>
        </div>
      </div>
    );
  }
  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      <AppContent/>
    </ClerkProvider>
  );
}
