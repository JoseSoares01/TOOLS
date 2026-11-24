/* SAP Ajustador - motor de cálculo em cêntimos, sem dependências externas. */
(function(root){
'use strict';
const UNITS=1000000; // 100,0000% em unidades de 0,0001 ponto percentual
const money=n=>(n/100).toLocaleString('pt-PT',{minimumFractionDigits:2,maximumFractionDigits:2});
function gross(net,rate){const r=Math.round(Number(rate)*100);return Math.floor((net*(10000+r)+5000)/10000)}
function fromPct(total,u){return Math.floor((total*u+500000)/1000000)}
function bounds(total,amount){
 if(total<=0)return null;
 let low=0,high=1000000;
 while(low<high){const m=Math.floor((low+high)/2);if(fromPct(total,m)>=amount)high=m;else low=m+1}
 const first=low;
 low=0;high=1000001;
 while(low<high){const m=Math.floor((low+high)/2);if(fromPct(total,m)>amount)high=m;else low=m+1}
 const last=low-1;
 return first<=last&&first<=1000000&&last>=0?[first,last]:null;
}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function assignPct(rows,amounts,targetNet,changedIndices){
 const changed=new Set(changedIndices);
 let fixed=0;const entries=[];
 for(let i=0;i<rows.length;i++){
  const old=rows[i].units;
  if(!changed.has(i)){
   if(fromPct(targetNet,old)!==amounts[i])return null;
   fixed+=old;
  }else{
   const range=bounds(targetNet,amounts[i]);if(!range)return null;
   entries.push({i,old,lo:range[0],hi:range[1],u:clamp(old,...range)});
  }
 }
 const target=UNITS-fixed;
 if(entries.reduce((s,e)=>s+e.lo,0)>target || entries.reduce((s,e)=>s+e.hi,0)<target)return null;
 let diff=target-entries.reduce((s,e)=>s+e.u,0);
 // Atribuição de unidades, preferindo manter cada percentagem próxima da original.
 let loops=0;
 while(diff!==0 && loops++<entries.length+2){
  const candidates=entries.filter(e=>diff>0?e.u<e.hi:e.u>e.lo);
  if(!candidates.length)return null;
  candidates.sort((a,b)=>{
   const ga=diff>0? a.old-a.u : a.u-a.old;
   const gb=diff>0? b.old-b.u : b.u-b.old;
   return gb-ga || a.i-b.i;
  });
  const e=candidates[0],max=diff>0?e.hi-e.u:e.u-e.lo;
  const amount=Math.min(Math.abs(diff),max);
  e.u+=Math.sign(diff)*amount;diff-=Math.sign(diff)*amount;
 }
 if(diff!==0)return null;
 const units=rows.map(r=>r.units);
 for(const e of entries)units[e.i]=e.u;
 if(units.reduce((a,b)=>a+b,0)!==UNITS)return null;
 if(units.some((u,i)=>fromPct(targetNet,u)!==amounts[i]))return null;
 return units;
}
function solve(input){
 const {rows,targetNet,targetGross,groupTargets=null,lockGroups=true,maxStep=35}=input;
 if(!rows.length)return {error:'Importa ou introduz primeiro as linhas da fatura.'};
 if(rows.some(r=>!Number.isInteger(r.net)||r.net<0||!Number.isInteger(r.units)||r.units<0||r.units>UNITS||!Number.isFinite(r.rate)))return {error:'Existem valores ou percentagens inválidos na tabela.'};
 if(!Number.isInteger(targetNet)||targetNet<=0||!Number.isInteger(targetGross))return {error:'Indica os totais pretendidos em euros.'};
 const n=rows.length,amounts=rows.map(r=>r.net),currentNet=amounts.reduce((a,b)=>a+b,0),currentGross=rows.reduce((s,r)=>s+gross(r.net,r.rate),0);
 const keys=rows.map(r=>r.rate.toFixed(2));const groups=[...new Set(keys)];
 const existing={};for(let i=0;i<n;i++)existing[keys[i]]=(existing[keys[i]]||0)+amounts[i];
 const targets={};for(const k of groups)targets[k]=lockGroups? (groupTargets&&groupTargets[k]!==undefined?groupTargets[k]:existing[k]) : null;
 if(lockGroups && groups.reduce((s,k)=>s+targets[k],0)!==targetNet)return {error:'A soma dos subtotais pretendidos por taxa de IVA não corresponde ao total sem IVA.'};
 if(targetGross<targetNet)return {error:'O total com IVA não pode ser inferior ao sem IVA.'};
 const requiredNet=targetNet-currentNet,requiredGross=targetGross-currentGross;
 const groupDelta={};for(const k of groups)groupDelta[k]=lockGroups?targets[k]-existing[k]:null;
 const allSourceValid=rows.every((r,i)=>fromPct(targetNet,r.units)===amounts[i]);
 let best=null;
 function consider(changes){
   const ids=Object.keys(changes).map(Number).filter(i=>changes[i]!==0);
   const result=amounts.slice();for(const i of ids){result[i]+=changes[i];if(result[i]<0)return}
   if(result.reduce((a,b)=>a+b,0)!==targetNet)return;
   if(lockGroups){const subt={};for(let i=0;i<n;i++)subt[keys[i]]=(subt[keys[i]]||0)+result[i];for(const k of groups)if(subt[k]!==targets[k])return}
   let sumGross=0;for(let i=0;i<n;i++)sumGross+=gross(result[i],rows[i].rate);
   if(sumGross!==targetGross)return;
   // Inclui uma linha de percentagem sem alteração monetária apenas se necessário.
   const trySets=[ids];if(!ids.length)for(let i=0;i<n;i++)trySets.push([i]);
   let unitResult=null;
   for(const set of trySets){unitResult=assignPct(rows,result,targetNet,set);if(unitResult)break}
   if(!unitResult)return;
   const changesMade=unitResult.reduce((s,u,i)=>s+(u!==rows[i].units?1:0),0);
   const magnitude=result.reduce((s,v,i)=>s+Math.abs(v-amounts[i]),0);
   const changePct=unitResult.reduce((s,u,i)=>s+Math.abs(u-rows[i].units),0);
   const score=[changesMade,magnitude,changePct];
   if(!best||score.some((v,j)=> v<best.score[j]&&score.slice(0,j).every((w,k)=>w===best.score[k]))){best={amounts:result,units:unitResult,score}}
 }
 consider({});
 if(best&&best.score[0]===0)return output();
 // Primeiro, um único campo alterado.
 for(let i=0;i<n;i++){
  if(lockGroups && groups.some(k=>groupDelta[k]!==0 && keys[i]!==k))continue;
  if(requiredNet!==0)consider({[i]:requiredNet});
  // Percentagens podem precisar somar 100% sem alterar montantes.
  if(requiredNet===0&&requiredGross===0) {
   const pct=assignPct(rows,amounts,targetNet,[i]);
   if(pct){const c=pct.reduce((s,u,j)=>s+(u!==rows[j].units?1:0),0);if(c<=1)best={amounts:amounts.slice(),units:pct,score:[c,0,pct.reduce((s,u,j)=>s+Math.abs(u-rows[j].units),0)]}}
  }
 }
 if(best&&best.score[0]<=1)return output();
 const limit=Math.max(3,Math.min(200,Math.round(maxStep)));
 const deltaPool=[];for(let d=-limit;d<=limit;d++)deltaPool.push(d);
 // Permite transferências maiores se os subtotais por taxa as exigirem.
 const special=[requiredNet,...(lockGroups?Object.values(groupDelta):[])];
 for(const d of special)if(!deltaPool.includes(d))deltaPool.push(d);
 deltaPool.sort((a,b)=>Math.abs(a)-Math.abs(b));
 // Duas linhas: é o caso mais frequente (e ideal).
 for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
  let dis=[];
  if(lockGroups && keys[i]!==keys[j]){
    if(groups.some(k=>groupDelta[k]!==0 && k!==keys[i]&&k!==keys[j]))continue;
    dis=[groupDelta[keys[i]]];
  }else dis=deltaPool;
  for(const di of dis){const dj=requiredNet-di;
    if(di===0&&dj===0)continue;
    if(lockGroups&&keys[i]===keys[j] && groups.some(k=>groupDelta[k]!==0 && k!==keys[i]))continue;
    if(lockGroups&&keys[i]!==keys[j] && dj!==groupDelta[keys[j]])continue;
    if(amounts[i]+di<0||amounts[j]+dj<0)continue;
    const diff=gross(amounts[i]+di,rows[i].rate)-gross(amounts[i],rows[i].rate)+gross(amounts[j]+dj,rows[j].rate)-gross(amounts[j],rows[j].rate);
    if(diff===requiredGross)consider({[i]:di,[j]:dj});
  }
 }
 if(best&&best.score[0]<=2)return output();
 // Três linhas, com pesquisa progressiva e limitada para manter a interface ágil.
 if(n<=60){
   const tripleLimit=Math.min(limit,n>30?8:22);
   const triplePool=[];for(let v=-tripleLimit;v<=tripleLimit;v++)triplePool.push(v);
   const rare=Object.values(groupDelta).filter(v=>Math.abs(v)>tripleLimit);
   for(const v of [...rare,requiredNet])if(!triplePool.includes(v))triplePool.push(v);
   let iterations=0,stop=false;
   for(let i=0;i<n&&!stop;i++)for(let j=i+1;j<n&&!stop;j++)for(let k=j+1;k<n&&!stop;k++){
    for(const di of triplePool){for(const dj of triplePool){
     if(++iterations>2500000){stop=true;break}
     const dk=requiredNet-di-dj;
     if(Math.abs(dk)>limit&&!special.includes(dk))continue;
     if(!di||!dj||!dk)continue;
     if(amounts[i]+di<0||amounts[j]+dj<0||amounts[k]+dk<0)continue;
     if(lockGroups){const ds={};ds[keys[i]]=(ds[keys[i]]||0)+di;ds[keys[j]]=(ds[keys[j]]||0)+dj;ds[keys[k]]=(ds[keys[k]]||0)+dk;if(groups.some(g=>(ds[g]||0)!==groupDelta[g]))continue}
     const delta=gross(amounts[i]+di,rows[i].rate)-gross(amounts[i],rows[i].rate)+gross(amounts[j]+dj,rows[j].rate)-gross(amounts[j],rows[j].rate)+gross(amounts[k]+dk,rows[k].rate)-gross(amounts[k],rows[k].rate);
     if(delta===requiredGross)consider({[i]:di,[j]:dj,[k]:dk});
    }if(stop)break}
   }
 }
 if(best&&best.score[0]<=3)return output();
 // Quatro linhas como duas transferências independentes; útil para arredondamento por linha.
 if(requiredNet===0&&(!lockGroups||groups.every(g=>groupDelta[g]===0))&&n<=70&&Math.abs(requiredGross)<=8){
   const options=[];const m=Math.min(limit,60);
   for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
    if(lockGroups&&keys[i]!==keys[j])continue;
    for(let d=-m;d<=m;d++){
     if(!d||amounts[i]+d<0||amounts[j]-d<0)continue;
     const delta=gross(amounts[i]+d,rows[i].rate)-gross(amounts[i],rows[i].rate)+gross(amounts[j]-d,rows[j].rate)-gross(amounts[j],rows[j].rate);
     if(delta===0||Math.abs(delta)>Math.abs(requiredGross)+2)continue;
     options.push({i,j,d,delta,magnitude:2*Math.abs(d)});
    }
   }
   options.sort((a,b)=>a.magnitude-b.magnitude);
   const first=options.slice(0,7000);
   const byDelta={};for(const p of first)(byDelta[p.delta]??=[]).push(p);
   for(const p of first){const matching=byDelta[requiredGross-p.delta]||[];for(const q of matching){if(p.i===q.i||p.i===q.j||p.j===q.i||p.j===q.j)continue;consider({[p.i]:p.d,[p.j]:-p.d,[q.i]:q.d,[q.j]:-q.d});break}}
 }
 if(!best)return {error:'Não encontrei uma combinação exata com até 4 linhas e o limite de variação definido. Aumenta a pesquisa em cêntimos, revê os subtotais por IVA ou confirma que o SAP arredonda por linha.',currentNet,currentGross,percentTotal:rows.reduce((s,r)=>s+r.units,0)};
 return output();
 function output(){
   const updated=rows.map((r,i)=>({...r,newNet:best.amounts[i],newUnits:best.units[i],oldGross:gross(r.net,r.rate),newGross:gross(best.amounts[i],r.rate)}));
   const sourcePct=rows.reduce((s,r)=>s+r.units,0);
   return {rows:updated,changes:updated.filter(r=>r.newUnits!==r.units||r.newNet!==r.net),targetNet,targetGross,currentNet,currentGross,percentTotal:sourcePct,newPercentTotal:updated.reduce((s,r)=>s+r.newUnits,0),sourceMatchesBase:allSourceValid,totalChanges:best.score[0],amountMoved:best.score[1],groups:groups.map(k=>({rate:Number(k),current:existing[k],target:lockGroups?targets[k]:updated.filter(r=>r.rate.toFixed(2)===k).reduce((s,r)=>s+r.newNet,0)}))};
 }
}
root.SapSolver={solve,gross,fromPct,bounds,money};
})(typeof window!=='undefined'?window:globalThis);
