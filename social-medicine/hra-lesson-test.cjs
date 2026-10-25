const assert=require('node:assert/strict'),h=require('./hra-lesson.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const copy=x=>JSON.parse(JSON.stringify(x));
const ex=h.example(),r=h.analyse(ex);
assert.equal(r.complete,true);assert.equal(r.rows.length,12);assert.equal(r.rows.reduce((n,x)=>n+x.factors.length,0),33);assert.equal(r.pending.length,0);
near(r.before,7167.45);near(r.after,3430.35);near(r.delta,3737.10);near(r.percent,52.13988238494861);near(r.beforeAge.age,43.45601351351351);near(r.afterAge.age,36.29514705882353);
const expectedBefore=[3585.07,541.5,660,22.2,42.18,40.4,16.7,111,111,39.2,11.2,1987];
const expectedAfter=[206.47,541.5,396,22.2,42.18,40.4,16.7,111,33.3,22.4,11.2,1987];
r.rows.forEach((row,i)=>{near(row.before.d,expectedBefore[i]);near(row.after.d,expectedAfter[i]);near(row.contribution,(expectedBefore[i]-expectedAfter[i])/7167.45*100)});
assert.deepEqual(r.rows[0].factors.map(f=>f.before),[.4,.6,1,2.5,.9,.5,1.3]);assert.deepEqual(r.rows[0].factors.map(f=>f.after),[.4,.6,1,1,.9,.5,1]);
const interpolation=copy(ex);interpolation.policy='table';const ri=h.analyse(interpolation);
near(ri.rows[0].factors[1].before,.65);near(ri.rows[0].factors[6].before,1+15/35*.5);near(ri.rows[0].before.applied,1.83);near(ri.rows[0].after.applied,.12);near(ri.before,7017.29);near(ri.after,3449.12);
near(ri.rows[4].factors[1].before,.6);near(ri.rows[9].factors[1].before,1.3); // disease-specific coefficients are not copied from CHD.
const unchanged=copy(ex);unchanged.after=h.blank().after;const ru=h.analyse(unchanged);near(ru.before,7167.45);near(ru.after,7167.45);near(ru.percent,0);near(ru.afterAge.age,ru.beforeAge.age);
const activity=copy(unchanged);activity.after.activity='regular';const ra=h.analyse(activity);near(ra.delta,2815.5);ra.rows.slice(1).forEach(row=>near(row.delta,0));
const empty=h.analyse(h.blank());assert.equal(empty.complete,false);assert.equal(empty.before,null);assert.equal(empty.beforeAge,null);assert.equal(empty.finished,0);
for(const [id,value,affected]of [['sbp','140',[0,4,9]],['cholesterol','220',[0,4]],['smoke','heavy',[0,4,5,7]],['alcohol','other',[1,3,7]],['mileage','25001',[1]],['seatbelt','91',[1]]]){
  const s=copy(ex);s.before[id]=value;const result=h.analyse(s);assert.equal(result.complete,false);assert.equal(result.before,null);for(const row of result.rows)if(!affected.includes(result.rows.indexOf(row)))assert.ok(row.before);
}
const bp=copy(ex);bp.before.sbp='140';const rb=h.analyse(bp);near(rb.rows[0].factors[0].before,.8);assert.equal(rb.rows[4].factors[0].before,null);assert.equal(rb.rows[9].factors[0].before,null);
bp.overrides={'4-0':{before:'.7',after:'',source:'课堂补充练习所给脑血管病系数'},'9-0':{before:'.9',after:'',source:'课堂补充练习所给高血压心脏病系数'}};
assert.equal(h.analyse(bp).complete,true);near(h.analyse(bp).rows[4].factors[0].after,.7);
bp.overrides['4-0'].source='';assert.equal(h.analyse(bp).complete,false);assert.match(h.analyse(bp).pending[0].note,/来源/);
const missing=copy(ex);missing.before.cholesterol='';assert.equal(h.analyse(missing).complete,false);assert.equal(h.analyse(missing).rows[0].before,null);assert.ok(h.analyse(missing).rows[1].before);
for(const age of [40,41,42,43,44]){const result=h.analyse({...copy(ex),age:String(age)});assert.equal(result.complete,true);near(result.beforeAge.age,43.45601351351351+age-41);near(result.afterAge.age,36.29514705882353+age-41)}
for(const patch of [{age:'21'},{age:'45'},{age:''},{sex:'female'}]){const result=h.analyse({...copy(ex),...patch});assert.equal(result.applicable,false);assert.equal(result.complete,false);assert.equal(result.before,null);assert.ok(result.rows.every(row=>row.before===null))}
near(h.ageLookup(5560,41).age,41);near(h.ageLookup(61640,44).age,74);assert.equal(h.ageLookup(1599,41),null);assert.equal(h.ageLookup(61641,41),null);
const kpa=copy(ex);kpa.bpUnit='kPa';kpa.before.sbp='16.0';kpa.before.dbp='9.3';near(h.analyse(kpa).before,7167.45);near(h.analyse(kpa).after,3430.35);
const dbp=copy(ex);dbp.bpIndicator='dbp';dbp.before.dbp='88';const rd=h.analyse(dbp);near(rd.rows[0].factors[0].before,.8);assert.equal(rd.rows[4].factors[0].before,null);
for(const patch of [{age:'-1'},{roundFirst:'yes'},{policy:'fake'},{before:{...ex.before,sbp:'NaN'}},{before:{...ex.before,unknown:1}},{before:{...ex.before,dbp:'200'}},{overrides:{'99-1':{before:1,source:'x'}}},{overrides:{'0-0':{before:-1,source:'x'}}}])assert.throws(()=>h.analyse({...copy(ex),...patch}));
assert.throws(()=>h.validate({kind:'social-medicine-personal-hra',version:1,values:{age:'41'}}),/不是表12-1/);
const large=copy(ex);large.overrides['0-0']={before:'1000',after:'',source:'模拟边界检查'};assert.equal(h.analyse(large).beforeAge,null);
const zero=copy(ex);zero.after=h.blank().after;h.bindings.forEach((factors,i)=>factors.forEach((_,j)=>zero.overrides[i+'-'+j]={before:'0',after:'',source:'模拟零值边界'}));const rz=h.analyse(zero);assert.equal(rz.complete,true);near(rz.before,0);assert.equal(rz.percent,null);assert.equal(rz.beforeAge,null);
const saved=JSON.stringify(ex);h.analyse(ex);assert.equal(JSON.stringify(ex),saved);assert.deepEqual(h.validate(JSON.parse(saved)),ex);
const csv=h.csv(ex),lines=csv.split('\r\n');assert.equal(lines.length,36);assert.match(lines[0],/\(13\)占原总危险百分比/);assert.match(csv,/"自杀","264"/);assert.match(csv,/"合计","5560"/);assert.match(csv,/表12-2|表12-1/);assert.ok(!csv.includes('undefined'));assert.throws(()=>h.csv(h.blank()));
const mode=copy(ex);mode.mode='=1+1';assert.match(h.csv(mode),/"'=1\+1"/);
const manualChange=copy(ex);manualChange.overrides['5-0']={before:'.2',after:'.4',source:'模拟手工系数检查'};const rm=h.analyse(manualChange);assert.equal(rm.rows[5].factors[0].changed,true);assert.equal(rm.rows[5].factors[0].variableChanged,false);assert.equal(rm.rows[5].factors[0].coefficientChanged,true);assert.equal(rm.rows[5].factors[0].afterChange,'变量不变；手工调整系数');near(rm.rows[5].after.d,80.8);assert.match(h.csv(manualChange),/变量不变；手工调整系数/);assert.match(h.csv(manualChange),/"-40.4"/);
const columns=lines.map(line=>line.match(/"(?:[^"]|"")*"/g).length);assert.ok(columns.every(n=>n===17));
const text=h.report(ex);assert.match(text,/7167.45 → 3430.35/);assert.match(text,/评价年龄：43.456014/);assert.match(text,/3737.1/);assert.match(text,/风险对应年龄/);
console.log('Passed: classroom table 12-1 all 12 causes and 33 factors; table 12-2 interpolation and given-value policies; table 12-3 age columns; partial/missing coefficients, units, manual provenance, snapshots and 13-column CSV.');
