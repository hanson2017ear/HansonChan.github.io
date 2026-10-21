(function(root){
 'use strict';
 const number=(v,label)=>{if(v===null||v===undefined||String(v).trim()===''||!Number.isFinite(Number(v)))throw Error(label+'请填写有效数字');return Number(v)};
 function qaly(rows){
  if(!rows.length)throw Error('至少保留一个健康状态');
  const parts=rows.map((r,i)=>{let years=number(r.years,'第'+(i+1)+'行年数：'),weight=number(r.weight,'第'+(i+1)+'行权重：');if(years<0)throw Error('年数不能为负数');if(weight>1)throw Error('本工具的健康效用权重不能大于1');return {...r,years,weight,weighted:years*weight}});
  return {parts,years:parts.reduce((s,r)=>s+r.years,0),qaly:parts.reduce((s,r)=>s+r.weighted,0)};
 }
 function composite(values){
  if(!values.length)throw Error('至少填写一个危险分数');
  const factors=values.map(v=>number(v,'危险分数：'));
  if(factors.some(v=>v<0))throw Error('危险分数不能为负数');
  const high=factors.filter(v=>v>1),low=factors.filter(v=>v<=1);
  const x=high.reduce((s,v)=>s+v-1,0),y=low.reduce((s,v)=>s*v,1);
  return {factors,high,low,x,y,r:x+y};
 }
 function risk(values,baseline,roundFirst=true){
  const c=composite(values),m=number(baseline,'基准死亡率：');if(m<0)throw Error('基准死亡率不能为负数');
  const applied=roundFirst?Math.round((c.r+Number.EPSILON)*100)/100:c.r;
  return {...c,m,applied,d:m*applied};
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
 const api={qaly,composite,risk,interpolate,reduction,eqState};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SocialMed=api;
})(typeof window!=='undefined'?window:globalThis);
