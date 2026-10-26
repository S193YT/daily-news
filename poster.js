/* 昶勝日報・自選頭條海報（純前端 canvas 產生 1080x1350 PNG） */
(function(){
const D=window.POSTER_DATA;if(!D||!D.items.length)return;
const $=s=>document.querySelector(s),KEY="cs-poster-v1",MAX=5;
const DEF={title:"昶勝日報",sign:"",font:"Noto Serif TC",color:"#ffd36b",bg:"auto",sel:[]};
const FONTS=[["Noto Serif TC","思源宋體"],["Noto Sans TC","思源黑體"],["LXGW WenKai TC","霞鶩文楷"],["Chiron Hei HK","昭源黑體"],["Chiron Sung HK","昭源宋體"]];
const BGS={auto:"自動（依類別）",dark:"深藍棚版",green:"藍綠漸層",red:"喜氣紅",paper:"米白報紙",health:"健康綠"};
const CATBG={"財經":"dark","保險理財":"green","健康醫療":"health"};
let S;try{S=Object.assign({},DEF,JSON.parse(localStorage.getItem(KEY)||"{}"));}catch(e){S=Object.assign({},DEF);}
S.sel=(S.date===D.date?S.sel:[]).filter(i=>i<D.items.length);S.date=D.date;
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
const root=$("#poster");
root.innerHTML=`<h2>自選頭條海報 <small>勾選最多 5 則，▲▼ 排順序</small></h2>
<div class="pf"><label>海報標題<input id="p-title" maxlength="12"></label>
<label>署名／標語（選填）<input id="p-sign" maxlength="30" placeholder="例：您的名字／公司／聯絡方式"></label>
<label>標題字體<select id="p-font">${FONTS.map(f=>`<option value="${f[0]}">${f[1]}</option>`).join("")}</select></label>
<label>標題顏色<input id="p-color" type="color"></label>
<label>背景<select id="p-bg">${Object.entries(BGS).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select></label></div>
<div class="pchosen"><b>已選 <span id="p-n">0</span>/5</b><ol id="p-order"></ol></div>
<ul id="p-list" class="plist"></ul>
<div class="pbtns"><button id="p-gen" class="btn">產生海報</button><button id="p-reset" class="btn ghost">還原</button></div>
<div id="p-out" hidden><img id="p-img" alt="自選頭條海報預覽"><div class="pbtns"><a id="p-dl" class="btn" download>下載圖片</a><button id="p-share" class="btn" hidden>分享到 LINE…</button></div></div>`;
const T=$("#p-title"),SG=$("#p-sign"),F=$("#p-font"),C=$("#p-color"),B=$("#p-bg");
function syncForm(){T.value=S.title;SG.value=S.sign;F.value=S.font;C.value=S.color;B.value=S.bg;}
[T,SG,F,C,B].forEach(el=>el.oninput=()=>{S.title=T.value;S.sign=SG.value;S.font=F.value;S.color=C.value;S.bg=B.value;save();});
function renderList(){
 $("#p-list").innerHTML=D.items.map((it,i)=>`<li><label><input type="checkbox" data-i="${i}" ${S.sel.includes(i)?"checked":""}><span class="pcat">${esc(it.cat)}</span><span>${esc(it.title)}<small>${esc(it.source)} ${esc(it.time||"")}</small></span></label></li>`).join("");
 $("#p-list").querySelectorAll("input").forEach(cb=>cb.onchange=()=>{const i=+cb.dataset.i;
  if(cb.checked){if(S.sel.length>=MAX){cb.checked=false;alert("最多選 5 則");return;}S.sel.push(i);}else S.sel=S.sel.filter(x=>x!==i);save();renderOrder();});
 renderOrder();}
function renderOrder(){$("#p-n").textContent=S.sel.length;
 $("#p-order").innerHTML=S.sel.map((i,k)=>`<li><span>${esc(D.items[i].title)}</span><button data-k="${k}" data-d="-1" aria-label="上移">▲</button><button data-k="${k}" data-d="1" aria-label="下移">▼</button></li>`).join("")||"<li class=empty>尚未勾選新聞</li>";
 $("#p-order").querySelectorAll("button").forEach(b=>b.onclick=()=>{const k=+b.dataset.k,j=k+ +b.dataset.d;if(j<0||j>=S.sel.length)return;[S.sel[k],S.sel[j]]=[S.sel[j],S.sel[k]];save();renderOrder();});}
$("#p-reset").onclick=()=>{S=Object.assign({},DEF,{sel:[],date:D.date});save();syncForm();renderList();$("#p-out").hidden=true;};
const THEMES={
 dark:{g:["#0b1d3a","#13305e"],fg:"#ffffff",sub:"#c9d6ee",card:"rgba(255,255,255,.08)",num:"#ffd36b",numfg:"#0b1d3a"},
 green:{g:["#0e5e6f","#1aa38a"],fg:"#ffffff",sub:"#e0f4ef",card:"rgba(255,255,255,.13)",num:"#ffffff",numfg:"#0e5e6f"},
 red:{g:["#8f1d1d","#c0392b"],fg:"#fff8ec",sub:"#ffe2c7",card:"rgba(255,255,255,.1)",num:"#ffd36b",numfg:"#8f1d1d"},
 paper:{g:["#f7f1e3","#efe6d0"],fg:"#2b2620",sub:"#6b5f4d",card:"rgba(0,0,0,.05)",num:"#8f1d1d",numfg:"#fff"},
 health:{g:["#1f6f43","#5fb878"],fg:"#ffffff",sub:"#e6f6ea",card:"rgba(255,255,255,.13)",num:"#ffffff",numfg:"#1f6f43"}};
function pickBg(items){if(S.bg!=="auto")return S.bg;const n={};items.forEach(it=>n[it.cat]=(n[it.cat]||0)+1);
 const top=Object.keys(n).sort((a,b)=>n[b]-n[a])[0];return CATBG[top]||"dark";}
function wrap(ctx,text,maxW,maxLines){const out=[];let line="";
 for(const ch of text){if(ctx.measureText(line+ch).width>maxW){out.push(line);line=ch;if(out.length===maxLines){break;}}else line+=ch;}
 if(out.length<maxLines&&line)out.push(line);else if(out.length===maxLines&&line){let l=out[maxLines-1];while(ctx.measureText(l+"…").width>maxW)l=l.slice(0,-1);out[maxLines-1]=l+"…";}
 return out;}
async function loadFonts(title,body){const fams=[`900 120px "${S.font}"`,`700 44px "Noto Sans TC"`,`400 30px "Noto Sans TC"`];
 try{await Promise.all([document.fonts.load(fams[0],title),document.fonts.load(fams[1],body),document.fonts.load(fams[2],body)]);await document.fonts.ready;}catch(e){}}
async function draw(){const items=S.sel.map(i=>D.items[i]);if(!items.length){alert("請先勾選至少 1 則新聞");return null;}
 const W=1080,H=1350,cv=document.createElement("canvas");cv.width=W;cv.height=H;const x=cv.getContext("2d");
 const th=THEMES[pickBg(items)],title=(S.title||"昶勝日報").trim(),allTxt=items.map(i=>i.title+i.source).join("")+(S.sign||"")+"內容僅供參考，不構成投資建議資料來源今日頭條年月日0123456789";
 await loadFonts(title,allTxt);
 const SANS=`"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif`,TF=`"${S.font}",${SANS}`;
 const g=x.createLinearGradient(0,0,W*.4,H);g.addColorStop(0,th.g[0]);g.addColorStop(1,th.g[1]);x.fillStyle=g;x.fillRect(0,0,W,H);
 x.globalAlpha=.08;x.fillStyle=th.fg;x.beginPath();x.arc(W-60,140,260,0,7);x.fill();x.beginPath();x.arc(80,H-90,180,0,7);x.fill();x.globalAlpha=1;
 const [y,m,dd]=D.date.split("-"),wk="日一二三四五六"[new Date(+y,m-1,+dd).getDay()];
 x.textBaseline="alphabetic";x.fillStyle=th.sub;x.font=`500 34px ${SANS}`;x.fillText(`${y}.${m}.${dd}（${wk}）・今日頭條`,72,110);
 let ts=130;x.font=`900 ${ts}px ${TF}`;while(x.measureText(title).width>W-144&&ts>60){ts-=6;x.font=`900 ${ts}px ${TF}`;}
 x.fillStyle=S.color;x.fillText(title,72,110+ts+10);
 let top=110+ts+50;x.fillStyle=S.color;x.fillRect(72,top,140,8);top+=44;
 const foot=S.sign?150:110,avail=H-top-foot,gap=22,bh=Math.min(200,(avail-gap*(items.length-1))/items.length);
 items.forEach((it,k)=>{const by=top+k*(bh+gap);x.fillStyle=th.card;rr(x,72,by,W-144,bh,24);x.fill();
  x.fillStyle=th.num;x.beginPath();x.arc(132,by+bh/2,36,0,7);x.fill();x.fillStyle=th.numfg;x.font=`900 40px ${SANS}`;x.textAlign="center";x.fillText(k+1,132,by+bh/2+14);x.textAlign="left";
  const fs=bh>=170?44:38;x.font=`700 ${fs}px ${SANS}`;const ls=wrap(x,it.title,W-144-150,2),lh=fs*1.3;
  const blockH=ls.length*lh+40;let ty=by+(bh-blockH)/2+fs;x.fillStyle=th.fg;ls.forEach(l=>{x.fillText(l,196,ty);ty+=lh;});
  x.fillStyle=th.sub;x.font=`400 26px ${SANS}`;x.fillText(`${it.cat}｜${it.source}`,196,ty-4);});
 x.fillStyle=th.sub;x.font=`400 26px ${SANS}`;x.fillText("內容僅供參考，不構成投資建議｜資料來源："+[...new Set(items.map(i=>i.source))].join("、"),72,H-50);
 if(S.sign){x.fillStyle=th.fg;x.font=`700 38px ${SANS}`;let s=S.sign;while(x.measureText(s).width>W-144)s=s.slice(0,-1);x.fillText(s,72,H-100);}
 return cv;}
function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath();}
let blob=null;
$("#p-gen").onclick=async()=>{const b=$("#p-gen");b.disabled=true;b.textContent="產生中…";
 try{const cv=await draw();if(!cv)return;blob=await new Promise(r=>cv.toBlob(r,"image/png"));const url=URL.createObjectURL(blob);
  $("#p-img").src=url;const dl=$("#p-dl");dl.href=url;dl.download=`昶勝日報-自選-${D.date}.png`;$("#p-out").hidden=false;
  const f=new File([blob],dl.download,{type:"image/png"});$("#p-share").hidden=!(navigator.canShare&&navigator.canShare({files:[f]}));
  $("#p-out").scrollIntoView({behavior:"smooth"});}finally{b.disabled=false;b.textContent="產生海報";}};
$("#p-share").onclick=async()=>{if(!blob)return;const f=new File([blob],$("#p-dl").download,{type:"image/png"});try{await navigator.share({files:[f],title:S.title});}catch(e){}};
syncForm();renderList();window.__posterDraw=draw;
})();
