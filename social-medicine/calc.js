(function(root){
 'use strict';
 const number=(v,label)=>{if(v===null||v===undefined||String(v).trim()===''||!Number.isFinite(Number(v)))throw Error(label+'请填写有效数字');return Number(v)};
 const finite=v=>{if(!Number.isFinite(v))throw Error('数值过大，请核对单位与输入');return v};
 function qaly(rows){
  if(!rows.length)throw Error('至少保留一个健康状态');
  const parts=rows.map((r,i)=>{let years=number(r.years,'第'+(i+1)+'行年数：'),weight=number(r.weight,'第'+(i+1)+'行权重：');if(years<0)throw Error('年数不能为负数');if(weight>1)throw Error('本工具的健康效用权重不能大于1');return {...r,years,weight,weighted:years*weight}});
  return {parts,years:finite(parts.reduce((s,r)=>s+r.years,0)),qaly:finite(parts.reduce((s,r)=>s+r.weighted,0))};
 }
 function composite(values){
  if(!values.length)throw Error('至少填写一个危险分数');
  const factors=values.map(v=>number(v,'危险分数：'));
  if(factors.some(v=>v<0))throw Error('危险分数不能为负数');
  const high=factors.filter(v=>v>1),low=factors.filter(v=>v<=1);
  const x=high.reduce((s,v)=>s+v-1,0),y=low.reduce((s,v)=>s*v,1);
  return {factors,high,low,x,y,r:finite(x+y)};
 }
 function risk(values,baseline,roundFirst=true){
  const c=composite(values),m=number(baseline,'基准死亡率：');if(m<0)throw Error('基准死亡率不能为负数');
  const applied=roundFirst?Math.round((c.r+Number.EPSILON)*100)/100:c.r;
  return {...c,m,applied,d:finite(m*applied)};
 }
 function interpolate(x,x1,r1,x2,r2){
  [x,x1,r1,x2,r2]=[x,x1,r1,x2,r2].map(v=>number(v,'内插数据：'));
  if(x2<=x1)throw Error('上限x₂必须大于下限x₁');
  if(x<x1||x>x2)throw Error('x须位于两个已知值之间；本工具不外推');
  return r1+(x-x1)/(x2-x1)*(r2-r1);
 }
 function reduction(before,after,originalTotal){
  [before,after,originalTotal]=[before,after,originalTotal].map(v=>number(v,'比较数据：'));
  if(before<=0||after<0||originalTotal<=0)throw Error('原风险与原总风险应大于0，改善后风险不能为负');
  if(originalTotal<before)throw Error('原总风险不能小于所选死因的原风险');
  const delta=before-after;return{delta,within:delta/before*100,contribution:delta/originalTotal*100};
 }
 function eqState(values,vas){
  if(values.length!==5||values.some(v=>!['1','2','3'].includes(String(v))))throw Error('五个维度都须选择1、2或3');
  const v=number(vas,'VAS：');if(v<0||v>100)throw Error('VAS应在0—100之间');
  return{code:values.join(''),vas:v};
 }
 function answerValue(value){
  const s=String(value??'').trim().toUpperCase();
  return /^[A-E]$/.test(s)?s.charCodeAt(0)-64:Number(s);
 }
 function whoqol100(raw,meta){
  const missing=[],invalid=[];
  for(const id of meta.itemIds){
   const v=raw[id];
   if(v===undefined||v===null||String(v).trim()==='')missing.push(id);
   else if(!Number.isInteger(answerValue(v))||answerValue(v)<1||answerValue(v)>5)invalid.push(id);
  }
  if(invalid.length)throw Error('这些条目须选择A—E，或填写未转向的1—5：'+invalid.join('、'));
  if(missing.length)throw Error('尚缺'+missing.length+'题：'+missing.slice(0,8).join('、')+(missing.length>8?'等':''));
  const facets=meta.facets.map(f=>{
   const items=[1,2,3,4].map(i=>{const id=meta.itemId(f.id,i),original=answerValue(raw[id]),reversed=f.reverse.includes(i),classReversed=f.negative||reversed;return{id,original,reversed,classReversed,classScored:classReversed?6-original:original,scored:reversed?6-original:original}});
   const native=items.reduce((s,i)=>s+i.scored,0),positive=f.negative?24-native:native;
   return{...f,items,native,positive,score100:(positive-4)/16*100};
  });
  const byId=Object.fromEntries(facets.map(f=>[f.id,f]));
  const domains=meta.domains.map(d=>{const score=d.facets.reduce((s,id)=>s+byId[id].positive,0)/d.facets.length;return{...d,score,score100:(score-4)/16*100}});
  const classSummary=domains.slice(0,5).reduce((s,d)=>s+d.score100,0)/5;
  return{facets,domains,general:byId.G,answered:100,classSummary};
 }
 function parseWhoCsv(text,meta){
  if(typeof text!=='string'||text.length>100000)throw Error('CSV内容过大或格式不正确');
  const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(s=>s.trim()),values={},known=new Set(meta.itemIds);
  if(!lines.length)throw Error('CSV为空');
  for(let i=0;i<lines.length;i++){
   const m=lines[i].trim().match(/^"?([^",]+)"?\s*,\s*"?([^",]*)"?$/);
   if(!m)throw Error('CSV第'+(i+1)+'行应为条目代码,分数');
   const id=m[1].trim().toUpperCase(),val=m[2].trim();
   if(i===0&&id==='ITEM'&&val.toLowerCase()==='score')continue;
   if(!known.has(id))throw Error('未知条目代码：'+id+'；请使用F1.1—F24.4及G1—G4');
   if(Object.hasOwn(values,id))throw Error('条目重复：'+id);
   if(val!==''&&!/^[A-E1-5]$/i.test(val))throw Error(id+'须为A—E或未转向的1—5，缺失可留空');
   values[id]=val===''?'':answerValue(val);
  }
  if(Object.keys(values).length!==100)throw Error('CSV应包含100个不同条目，目前为'+Object.keys(values).length+'个');
  return values;
 }
 function assessment(causes,roundFirst=true){
  if(!Array.isArray(causes)||!causes.length)throw Error('至少保留一个死因');
  const rows=causes.map(c=>{
   const before=risk(c.factors.map(f=>f.before),c.baseline,roundFirst),after=risk(c.factors.map(f=>f.after),c.baseline,roundFirst);
   return {...c,before,after,delta:before.d-after.d};
  });
  const before=finite(rows.reduce((s,c)=>s+c.before.d,0)),after=finite(rows.reduce((s,c)=>s+c.after.d,0)),delta=before-after;
  if(before<=0)throw Error('总危险为0，不能计算下降比例');
  return {rows:rows.map(r=>({...r,contribution:r.delta/before*100})),before,after,delta,percent:delta/before*100};
 }
 function tableAge(value,points){
  value=number(value,'死亡危险值：');
  if(!Array.isArray(points)||points.length<2)throw Error('至少需要两个年龄参照点');
  for(let i=1;i<points.length;i++)if(points[i][0]<=points[i-1][0]||points[i][1]<=points[i-1][1])throw Error('年龄参照点须严格递增');
  if(value<points[0][0]||value>points.at(-1)[0])return null;
  const i=points.findIndex(p=>p[0]>=value);
  if(i===0)return{age:points[0][1],low:points[0],high:points[0]};
  const [x1,y1]=points[i-1],[x2,y2]=points[i];
  return{age:interpolate(value,x1,y1,x2,y2),low:points[i-1],high:points[i]};
 }
 function convertRisk(indicator,value){
  const v=number(value,'测量值或选项：');
  if(indicator.options){
   if(!Number.isInteger(v)||!indicator.options[v])throw Error('请选择表内分类');
   return {score:indicator.options[v][1],label:indicator.options[v][0]};
  }
  const points=indicator.points;
  if(v<points[0][0]||v>points.at(-1)[0])throw Error('测量值须在'+points[0][0]+'—'+points.at(-1)[0]+' '+indicator.unit+'之间，不外推');
  const i=points.findIndex(p=>p[0]>=v);
  if(i===0||v===points[i][0])return{score:points[i][1],low:points[i],high:points[i]};
  return {score:interpolate(v,points[i-1][0],points[i-1][1],points[i][0],points[i][1]),low:points[i-1],high:points[i]};
 }
 const api={qaly,composite,risk,interpolate,reduction,eqState,answerValue,whoqol100,parseWhoCsv,assessment,tableAge,convertRisk};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SocialMed=api;
})(typeof window!=='undefined'?window:globalThis);
