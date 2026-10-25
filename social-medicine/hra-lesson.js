(function(root){
  'use strict';
  const calc=typeof module!=='undefined'&&module.exports?require('./calc.js'):root.SocialMed;
  const course=typeof module!=='undefined'&&module.exports?require('./course-data.js'):root.CourseData;
  const source='课堂补充表12-1（第150—151页）、表12-2（第153页）、表12-3（第154页）；课程课件第163—174页。';
  const choose=(id,label,options,hint='')=>({id,label,options,hint});
  const num=(id,label,min,max,unit,hint='')=>({id,label,min,max,unit,hint});
  const fields=[
    num('sbp','收缩压',0,400,'按所选单位','高压、低压都可记录，计算时只使用上方选中的一项。'),
    num('dbp','舒张压',0,250,'按上方血压单位'),
    num('cholesterol','胆固醇',0,1000,'mg/dl','请先确认检验单单位；这里使用mg/dl。'),
    choose('diabetes','糖尿病史',[['none','无'],['controlled','有，已控制'],['yes','有'],['other','其他或待核对']]),
    choose('activity','体力活动',[['sedentary','坐着工作和娱乐'],['some','有些活动的工作'],['moderate','中度锻炼'],['vigorous','较强度锻炼'],['regular','坐着工作，有定期锻炼'],['otherRegular','其他工作，有定期锻炼'],['other','其他或待核对']]),
    choose('chdFamily','冠心病家族史',[['none','无（表12-1给定0.9）'],['old','父母健在，均已满60岁'],['young','父母健在，未满60岁'],['one','父母之一60岁以前死于冠心病'],['both','父母二人60岁以前死于冠心病'],['other','其他或待核对']]),
    choose('smoke','吸烟',[['never','不吸烟'],['heavy','每天不少于10支'],['light','每天少于10支'],['pipe','雪茄或烟斗'],['recentQuit','戒烟不足10年'],['longQuit','戒烟10年以上'],['other','其他或待核对']]),
    choose('weightBasis','体重状况',[['percent','填写超重百分比'],['le10','超重10%以下（表12-2分类）'],['average','降到平均体重（原题条件）'],['other','其他或待核对']],'按教材中的超重百分比填写，和BMI不是同一个指标。'),
    num('excess','超重百分比',0,300,'%','只在体重状况选择“填写超重百分比”时使用。例如超重30%填30。'),
    choose('alcohol','饮酒',[['none','不饮酒'],['other','其他情况，需相应死因的分数']]),
    num('mileage','每年驾车里程',0,1000000,'km/年','例题中25000 km/年对应2.5；其他里程需要补充转换依据。'),
    num('seatbelt','安全带使用比例',0,100,'%','表12-1的90%与改善后的100%均给定0.8，工具按原表保留。'),
    choose('depression','抑郁状况（原题分类）',[['frequent','经常（原题给定2.5）'],['treated','治疗抑郁（原题给定1.5）'],['other','其他情况，需补充分数']],'这是课堂变量，不是抑郁症筛查量表。'),
    choose('suicideFamily','自杀相关家族史',[['none','无'],['other','其他或待核对']]),
    choose('murmur','心脏杂音',[['none','无'],['other','其他或待核对']]),
    choose('rheumatic','风湿热',[['none','无'],['other','其他或待核对']]),
    choose('symptoms','风湿性心脏病相关症状体征',[['none','无'],['other','其他或待核对']]),
    choose('emphysema','肺气肿',[['none','无'],['other','其他或待核对']]),
    choose('polyps','肠息肉',[['none','无'],['other','其他或待核对']]),
    choose('bleeding','肛门出血',[['none','无'],['other','其他或待核对']]),
    choose('colitis','肠炎',[['none','无'],['other','其他或待核对']]),
    choose('proctoscopy','直肠镜检查（原题条件）',[['none','无'],['annual','每年检查一次（原题给定0.3）'],['other','其他或待核对']],'仅复现课堂历史题设，不作为现实筛查建议。'),
    choose('xray','结核相关X线检查',[['negative','阴性'],['other','其他或待核对']]),
    choose('tb','结核活动',[['none','无'],['other','其他或待核对']]),
    choose('social','经济和社会地位',[['middle','中等（原题条件）'],['other','其他或待核对']])
  ];
  const byId=Object.fromEntries(fields.map(f=>[f.id,f]));
  const groups=[['血压、血脂与糖尿病史',['sbp','dbp','cholesterol','diabetes']],['活动、家族史与体重',['activity','chdFamily','smoke','weightBasis','excess']],['出行、饮酒与抑郁状况',['alcohol','mileage','seatbelt','depression','suicideFamily']],['其他疾病相关因素',['murmur','rheumatic','symptoms','emphysema','polyps','bleeding','colitis','proctoscopy','xray','tb','social']]];
  const bindings=[
    ['sbp','cholesterol','diabetes','activity','chdFamily','smoke','weightBasis'],
    ['alcohol','mileage','seatbelt'],['depression','suicideFamily'],['alcohol'],
    ['sbp','cholesterol','diabetes','smoke'],['smoke'],['murmur','rheumatic','symptoms'],
    ['alcohol','emphysema','smoke'],['polyps','bleeding','colitis','proctoscopy'],['sbp','weightBasis'],['xray','tb'],['social']
  ];
  const clean=()=>Object.fromEntries(fields.map(f=>[f.id,'']));
  function blank(){return{kind:'social-medicine-classroom-hra',version:1,age:'41',sex:'male',bpUnit:'mmHg',bpIndicator:'sbp',policy:'table',roundFirst:true,mode:'自行填写的课堂练习',before:clean(),after:clean(),overrides:{}}}
  function example(){const s=blank();s.policy='given';s.mode='课堂表12-1算例';Object.assign(s.before,{sbp:'120',dbp:'70',cholesterol:'192',diabetes:'none',activity:'sedentary',chdFamily:'none',smoke:'never',weightBasis:'percent',excess:'30',alcohol:'none',mileage:'25000',seatbelt:'90',depression:'frequent',suicideFamily:'none',murmur:'none',rheumatic:'none',symptoms:'none',emphysema:'none',polyps:'none',bleeding:'none',colitis:'none',proctoscopy:'none',xray:'negative',tb:'none',social:'middle'});Object.assign(s.after,{activity:'regular',weightBasis:'average',depression:'treated',proctoscopy:'annual',seatbelt:'100'});return s}
  const has=v=>v!==''&&v!==null&&v!==undefined;
  const fmt=(v,p=2)=>Number(v).toLocaleString('zh-CN',{maximumFractionDigits:p,useGrouping:false});
  function validate(raw){
    if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.kind!=='social-medicine-classroom-hra'||raw.version!==1)throw Error('请选择从课堂计算器保存的资料JSON。旧版生活方式记录不是表12-1资料。');
    const s=blank(),keys=new Set(Object.keys(s));for(const key of Object.keys(raw))if(!keys.has(key))throw Error('不认识的资料项目：'+key);
    for(const [key,allowed]of [['sex',['male','female']],['bpUnit',['mmHg','kPa']],['bpIndicator',['sbp','dbp']],['policy',['given','table']]]){if(!allowed.includes(raw[key]))throw Error('请核对'+key+'选项');s[key]=raw[key]}
    if(typeof raw.roundFirst!=='boolean')throw Error('组合分数保留位数选项不正确');s.roundFirst=raw.roundFirst;
    if(typeof raw.mode!=='string'||raw.mode.length>100)throw Error('资料标记不正确');s.mode=raw.mode;
    if(has(raw.age)){if(!/^\d+$/.test(String(raw.age))||Number(raw.age)>120)throw Error('实际年龄请填写0—120的整数');s.age=String(raw.age)}else s.age='';
    for(const phase of ['before','after']){
      const values=raw[phase];if(!values||typeof values!=='object'||Array.isArray(values))throw Error('变量资料格式不正确');
      for(const id of Object.keys(values))if(!byId[id])throw Error('不认识的变量：'+id);
      for(const f of fields){const x=values[f.id];if(!has(x))continue;if(!['string','number'].includes(typeof x))throw Error(f.label+'格式不正确');const v=String(x).trim();if(!v)continue;
        if(f.options){if(!f.options.some(o=>o[0]===v))throw Error(f.label+'的选项不正确')}
        else if(!Number.isFinite(Number(v))||Number(v)<f.min||Number(v)>f.max)throw Error(f.label+'请填'+f.min+'—'+f.max+'之间的数值');s[phase][f.id]=v;
      }
    }
    for(const v of [s.before,effective(s,'after')])if(has(v.sbp)&&has(v.dbp)&&Number(v.dbp)>=Number(v.sbp))throw Error('舒张压应小于收缩压，请核对高压、低压是否填反。');
    if(!raw.overrides||typeof raw.overrides!=='object'||Array.isArray(raw.overrides))throw Error('补充分数格式不正确');
    for(const [key,value]of Object.entries(raw.overrides)){
      const match=key.match(/^(\d+)-(\d+)$/);if(!match||!bindings[+match[1]]?.[+match[2]])throw Error('不认识的死因或因素：'+key);
      if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['before','after','source'].includes(k)))throw Error('补充分数格式不正确');
      const entry={before:'',after:'',source:''};for(const phase of ['before','after'])if(has(value[phase])){if(!['string','number'].includes(typeof value[phase])||!Number.isFinite(Number(value[phase]))||Number(value[phase])<0||Number(value[phase])>1000000)throw Error('危险分数须为0—1000000的有效数值');entry[phase]=String(value[phase])}
      if(has(value.source)&&(typeof value.source!=='string'||value.source.length>500))throw Error('补充分数来源请控制在500字以内');entry.source=value.source||'';s.overrides[key]=entry;
    }
    return s;
  }
  const effective=(s,phase)=>phase==='before'?s.before:Object.fromEntries(fields.map(f=>[f.id,has(s.after[f.id])?s.after[f.id]:s.before[f.id]]));
  const textValue=(f,value)=>!has(value)?'未填':f.options?f.options.find(o=>o[0]===value)?.[1]||value:String(value)+(f.unit?' '+f.unit:'');
  function observed(s,v,id){
    if(id==='sbp')return (v.sbp||'—')+'/'+(v.dbp||'—')+' '+s.bpUnit+'；用'+(s.bpIndicator==='sbp'?'收缩压':'舒张压')+'换算';
    if(id==='weightBasis')return v.weightBasis==='percent'?(has(v.excess)?'超重'+v.excess+'%':'超重百分比未填'):textValue(byId.weightBasis,v.weightBasis);
    return textValue(byId[id],v[id]);
  }
  function lookup(points,x){
    if(!has(x))return{score:null,note:'测量值未填'};
    const value=Number(x);if(value<points[0][0]||value>points.at(-1)[0])return{score:null,note:'超出表12-2的'+points[0][0]+'—'+points.at(-1)[0]+'区段，需补充系数，不外推'};
    const upper=points.findIndex(p=>p[0]>=value);if(points[upper][0]===value)return{score:points[upper][1],note:'表12-2参照点：'+value+' → '+points[upper][1]};
    const low=points[upper-1],high=points[upper],score=calc.interpolate(value,...low,...high);
    return{score,note:'表12-2内插：'+low[1]+'＋('+value+'−'+low[0]+')÷('+high[0]+'−'+low[0]+')×('+high[1]+'−'+low[1]+')＝'+fmt(score,6)};
  }
  function automatic(s,v,cause,index){
    const id=bindings[cause][index],known=score=>({score,note:'表12-1给定：'+observed(s,v,id)+' → '+score});
    const missing={score:null,note:'原始变量未填'},unknown={score:null,note:'三张表未给出此情况的该死因系数；请补充分数及来源'};
    if(id==='sbp'){
      const chosen=s.bpIndicator;if(!has(v[chosen]))return missing;
      if(cause!==0)return chosen==='sbp'&&Number(v.sbp)===(s.bpUnit==='mmHg'?120:16)?known(.4):unknown;
      const points=chosen==='sbp'?(s.bpUnit==='mmHg'?[[120,.4],[140,.8],[160,1.4],[180,2.2],[200,3.2]]:[[16,.4],[18.6,.8],[21.3,1.4],[23.9,2.2],[26.6,3.2]]):(s.bpUnit==='mmHg'?[[82,.4],[88,.8],[94,1.3],[100,2],[106,3.7]]:[[10.9,.4],[11.7,.8],[12.5,1.3],[13.3,2],[14.1,3.7]]);
      return lookup(points,v[chosen]);
    }
    if(id==='weightBasis'){
      if(!v.weightBasis)return missing;if(v.weightBasis==='average')return known(1);
      if(cause!==0)return v.weightBasis==='percent'&&has(v.excess)&&Number(v.excess)===30?known(1.3):unknown;
      if(v.weightBasis==='le10')return{score:.8,note:'表12-2分类：超重10%以下 → 0.8'};
      if(v.weightBasis!=='percent')return unknown;
      if(s.policy==='given'&&has(v.excess)&&Number(v.excess)===30)return known(1.3);
      return lookup([[15,1],[50,1.5],[75,2.5]],v.excess);
    }
    if(!has(v[id]))return missing;
    if(cause===0){
      if(id==='cholesterol'){if(s.policy==='given'&&Number(v[id])===192)return known(.6);return lookup([[180,.5],[220,1],[280,1.5]],v[id])}
      const map={diabetes:{none:1,controlled:2.5,yes:3},activity:{sedentary:2.5,some:1,moderate:.6,vigorous:.5,regular:1,otherRegular:.5},chdFamily:{none:.9,old:.9,young:1,one:1.2,both:1.4},smoke:{never:.5,heavy:1.5,light:1.1,pipe:1,recentQuit:.7,longQuit:.5}};
      if(Object.hasOwn(map[id]||{},v[id]))return{score:map[id][v[id]],note:(id==='chdFamily'&&v[id]==='none'?'表12-1给定':'表12-2分类')+'：'+observed(s,v,id)+' → '+map[id][v[id]]};return unknown;
    }
    const maps=[null,[{none:.5},{25000:2.5},{90:.8,100:.8}],[{frequent:2.5,treated:1.5},{none:1}],[{none:.1}],null,[{never:.2}],[{none:1},{none:1},{none:.1}],[{none:1},{none:1},{never:1}],[{none:1},{none:1},{none:1},{none:1,annual:.3}],null,[{negative:.2},{none:1}],[{middle:1}]];
    if(cause===4){if(id==='cholesterol')return Number(v[id])===192?known(.6):unknown;if(id==='diabetes')return v[id]==='none'?known(1):unknown;if(id==='smoke')return v[id]==='never'?known(.8):unknown}
    const map=maps[cause]?.[index];return map&&Object.hasOwn(map,v[id])?known(map[v[id]]):unknown;
  }
  const deps=(s,id)=>id==='sbp'?[s.bpIndicator]:id==='weightBasis'?['weightBasis','excess']:[id];
  // The increasing adult segment of table 12-3; lower-age rows repeat or decrease and are not inverted.
  const ageRows=[[1600,24],[1620,25],[1660,26],[1730,27],[1830,28],[1960,29],[2120,30],[2310,31],[2520,32],[2760,33],[3030,34],[3330,35],[3670,36],[4060,37],[4510,38],[5010,39],[5560,40],[6160,41],[6830,42],[7570,43],[8380,44],[9260,45],[10190,46],[11160,47],[12170,48],[13230,49],[14340,50],[15530,51],[16830,52],[18260,53],[19820,54],[21490,55],[23260,56],[25140,57],[27120,58],[29210,59],[31420,60],[33760,61],[36220,62],[38810,63],[41540,64],[44410,65],[47440,66],[50650,67],[54070,68],[57720,69],[61640,70]];
  function ageLookup(value,actualAge){return calc.tableAge(value,ageRows.map(([risk,age])=>[risk,age+Number(actualAge)%5]))}
  function riskChange(before,after){
    if(!Number.isFinite(before)||!Number.isFinite(after)||before<0||after<0)return null;
    const delta=before-after;
    if(Math.abs(delta)<=Math.max(1,before,after)*1e-12)return{direction:'flat',percent:0,arrow:'→',label:'无变化',description:'与当前值相同'};
    const direction=delta>0?'down':'up',arrow=delta>0?'↓':'↑';
    if(before===0)return{direction,percent:null,arrow,label:'由0增加',description:'当前值为0，无法计算变化百分比'};
    const percent=Math.abs(delta)/before*100,label=percent<.1?'<0.1%':fmt(percent,1)+'%';
    return{direction,percent,arrow,label,description:'比当前'+(direction==='down'?'下降':'上升')+label};
  }
  function analyse(raw){
    const s=validate(raw),before=effective(s,'before'),after=effective(s,'after'),applicable=s.sex==='male'&&has(s.age)&&+s.age>=40&&+s.age<=44;
    const pending=[],rows=course.hraCase.map((c,ci)=>{
      const factors=c.factors.map((f,fi)=>{
        const id=bindings[ci][fi],key=ci+'-'+fi,override=s.overrides[key]||{},read=(phase,v)=>{
          const own=override[phase];if(has(own))return override.source.trim()?{score:Number(own),note:'手工补充：'+override.source,manual:true}:{score:null,note:'补充分数尚未注明来源'};
          if(phase==='after'&&deps(s,id).every(k=>v[k]===before[k]))return{...read('before',before),inherited:true};
          return automatic(s,v,ci,fi);
        };
        const b=read('before',before),a=read('after',after),variableChanged=deps(s,id).some(k=>before[k]!==after[k]),coefficientChanged=b.score!==null&&a.score!==null&&b.score!==a.score,changed=variableChanged||coefficientChanged;
        if(b.score===null)pending.push({cause:ci,factor:fi,phase:'before',label:c.name+' / '+f.name,note:b.note});
        if(a.score===null)pending.push({cause:ci,factor:fi,phase:'after',label:c.name+' / '+f.name,note:a.note});
        return{...f,id,key,before:b.score,after:a.score,beforeValue:observed(s,before,id),afterValue:observed(s,after,id),afterChange:variableChanged?observed(s,after,id):coefficientChanged?'变量不变；手工调整系数':'保持当前',beforeNote:b.note,afterNote:a.inherited?'沿用当前分数；'+a.note:a.note,changed,variableChanged,coefficientChanged};
      });
      const b=applicable&&factors.every(f=>f.before!==null)?calc.risk(factors.map(f=>f.before),c.baseline,s.roundFirst):null,a=applicable&&factors.every(f=>f.after!==null)?calc.risk(factors.map(f=>f.after),c.baseline,s.roundFirst):null;
      return{...c,factors,before:b,after:a,delta:b&&a?b.d-a.d:null};
    });
    const complete=applicable&&rows.every(r=>r.before&&r.after),b=complete?rows.reduce((sum,r)=>sum+r.before.d,0):null,a=complete?rows.reduce((sum,r)=>sum+r.after.d,0):null;
    rows.forEach(r=>r.contribution=complete&&b>0&&r.delta!==null?r.delta/b*100:null);
    const beforeAge=complete?ageLookup(b,s.age):null,afterAge=complete?ageLookup(a,s.age):null;
    return{state:s,rows,pending,applicable,complete,before:b,after:a,delta:complete?b-a:null,percent:complete&&b>0?(b-a)/b*100:null,beforeAge,afterAge,finished:rows.filter(r=>r.before&&r.after).length};
  }
  function csv(raw){
    const r=analyse(raw);if(!r.complete)throw Error('请补齐变量和必要系数，并核对男性40—44岁参数适用条件。');
    const quote=v=>{let text=typeof v==='number'?String(Number(v.toPrecision(14))):String(v??'');if(typeof v==='string'&&/^[=+\-@\t\r]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"'};
    const data=[['(1)死亡原因','(2)死亡概率/10万','(3)疾病诱发因素','(4)指标值','(5)危险分数','(6)组合危险分数','(7)存在死亡危险/10万','(8)改变危险因素','(9)新危险分数','(10)新组合危险分数','(11)新存在死亡危险/10万','(12)降低量/10万','(13)占原总危险百分比','当前分数来源','改善后分数来源','计算口径','资料标记']];
    for(const row of r.rows)row.factors.forEach((f,i)=>data.push([i===0?row.name:'',i===0?row.baseline:'',f.name,f.beforeValue,f.before,i===0?row.before.applied:'',i===0?row.before.d:'',f.afterChange,f.after,i===0?row.after.applied:'',i===0?row.after.d:'',i===0?row.delta:'',i===0?row.contribution:'',f.beforeNote,f.afterNote,r.state.policy==='given'?'优先采用表12-1给定值':'冠心病按表12-2内插',r.state.mode]));
    data.push(['合计',5560,'','','','',r.before,'','','',r.after,r.delta,r.percent,'','',r.state.policy,r.state.mode]);
    data.push(['实际年龄',r.state.age,'评价年龄',r.beforeAge?.age??'超出参照范围','增长年龄',r.afterAge?.age??'超出参照范围','年龄列',Number(r.state.age)%5,'来源',source]);
    return data.map(row=>[...row,...Array(Math.max(0,data[0].length-row.length)).fill('')].map(quote).join(',')).join('\r\n');
  }
  function report(raw){
    const r=analyse(raw);if(!r.complete)throw Error('表12-1尚未全部算完，请核对待补项目。');
    const lines=['健康危险因素评价 · 课堂表12-1至12-3','资料标记：'+r.state.mode,'参数组：男性40—44岁；实际年龄：'+r.state.age,'计算口径：'+(r.state.policy==='given'?'优先采用表12-1给定值':'冠心病按表12-2内插')+'；'+(r.state.roundFirst?'R先保留2位':'R使用完整精度'),''];
    r.rows.forEach(row=>{lines.push(row.name+'（基准率'+row.baseline+'/10万）');row.factors.forEach(f=>lines.push(f.name+'：'+f.beforeValue+' → r='+f.before+'；改善后'+f.afterValue+' → r='+f.after+'\n依据：'+f.beforeNote+'；'+f.afterNote));
      for(const [title,value]of [['当前',row.before],['改善后',row.after]])lines.push(title+'：X='+fmt(value.x,6)+'；Y='+fmt(value.y,6)+'；R='+fmt(value.r,6)+'；采用R='+fmt(value.applied,6)+'；D='+value.m+'×'+fmt(value.applied,6)+'='+fmt(value.d,6)+' /10万');lines.push('降低量：'+fmt(row.delta,6)+'；占原总危险：'+fmt(row.contribution,6)+'%','');
    });
    lines.push('总危险：'+fmt(r.before,6)+' → '+fmt(r.after,6)+' /10万','降低量：'+fmt(r.delta,6)+'；总危险下降：'+(r.percent===null?'未定义（原总危险为0）':fmt(r.percent,6)+'%'),'实际年龄：'+r.state.age+'；评价年龄：'+(r.beforeAge?fmt(r.beforeAge.age,6):'超出表内区段')+'；增长年龄：'+(r.afterAge?fmt(r.afterAge.age,6):'超出表内区段'),'评价年龄与增长年龄是风险对应年龄，不是预计寿命或延寿年数。','来源：'+source,'课堂历史参数演算，不作为现实诊断、死亡概率预测或筛查安排。');return lines.join('\n');
  }
  let state=blank(),result=null,document,notify=()=>{},save;
  const $=id=>document.getElementById(id),el=(tag,text='',cls='')=>{const node=document.createElement(tag);node.textContent=text;if(cls)node.className=cls;return node};
  const policyLabel=s=>s.policy==='given'?'沿用表12-1给定分数':'冠心病按表12-2内插';
  function changeBadge(change){const badge=el('span','','lesson-change '+change.direction);badge.setAttribute('aria-label',change.description);badge.title=change.description;const arrow=el('span',change.arrow,'lesson-change-arrow');arrow.setAttribute('aria-hidden','true');badge.append(arrow,el('span',change.label));return badge}
  function changed(){if(state.mode==='课堂表12-1算例')state.mode='修改后的课堂算例';$('lesson-status').textContent='已修改，离开前记得保存。'}
  function clearAffected(id){for(let ci=0;ci<bindings.length;ci++)for(let fi=0;fi<bindings[ci].length;fi++)if(deps(state,bindings[ci][fi]).includes(id))delete state.overrides[ci+'-'+fi]}
  function inputField(f,phase){
    const input=el(f.options?'select':'input');input.id='lesson-'+phase+'-'+f.id;input.setAttribute('aria-label',(phase==='before'?'当前 ':'改善后 ')+f.label);
    if(f.options){const empty=el('option',phase==='after'?'保持当前':'请选择 / 暂不填');empty.value='';input.append(empty);f.options.forEach(([value,label])=>{const option=el('option',label);option.value=value;input.append(option)})}
    else{input.type='number';input.min=f.min;input.max=f.max;input.step='any';input.inputMode='decimal';if(phase==='after')input.placeholder='留空＝保持当前'}
    input.value=state[phase][f.id];input.addEventListener('input',()=>{state[phase][f.id]=input.value;clearAffected(f.id);changed();render()});return input;
  }
  function renderFields(){
    $('lesson-fields').replaceChildren();groups.forEach(([name,ids],i)=>{
      const group=el('fieldset','','lesson-group');group.append(el('legend',name));
      const header=el('div','','lesson-field-head');['变量','当前填写','改善后设定'].forEach(t=>header.append(el('span',t)));group.append(header);
      for(const id of ids){const f=byId[id],row=el('div','','lesson-field-row'),label=el('label',f.label+(f.unit?'（'+f.unit+'）':''));label.htmlFor='lesson-before-'+id;if(f.hint)label.append(el('small',f.hint));row.append(label);for(const phase of ['before','after']){const cell=el('label','','lesson-value');cell.append(el('span',phase==='before'?'当前填写':'改善后设定','lesson-mobile-label'),inputField(f,phase));row.append(cell)}group.append(row)}$('lesson-fields').append(group);
    });
    for(const id of ['age','sex','bpUnit','bpIndicator','policy'])$('lesson-'+id).value=state[id];$('lesson-round').checked=state.roundFirst;
  }
  function numberCell(value){return value===null||value===undefined?'—':fmt(value,6)}
  function render(){
    result=null;for(const id of ['lesson-metrics','lesson-summary-rows','lesson-full-rows','lesson-ages','lesson-pending','lesson-risk-chart'])$(id).replaceChildren();$('lesson-error').textContent='';
    try{result=analyse(state)}catch(e){$('lesson-error').textContent=e.message}
    const r=result,complete=!!r?.complete;$('lesson-csv').disabled=!complete;$('lesson-print').disabled=!complete;$('lesson-save').disabled=!r;
    const modeName={'课堂表12-1算例':'课堂例题','修改后的课堂算例':'已修改的课堂例题','自行填写的课堂练习':'自行填写'}[state.mode]||state.mode;
    $('lesson-mode').textContent=r?modeName+'；'+policyLabel(state)+'，'+(state.roundFirst?'组合分数保留2位小数。':'组合分数不提前取整。'):'';
    if(!r){$('lesson-progress').textContent='输入有误，旧结果已清除。';$('lesson-age-note').textContent='';$('lesson-factor-details').replaceChildren();for(const row of $('lesson-age-rows').children)row.classList.remove('current','after');notify();return}
    $('lesson-progress').textContent='已完成 '+r.finished+' / 12 项计算。'+(complete?'完整表格和年龄结果见下方。':'资料齐全后显示合计。');
    if(!r.applicable)$('lesson-pending').append(el('p','这组参数适用于男性40—44岁。其他人群需要对应的基准率和转换表。','lesson-waiting'));
    if(r.pending.length){const unique=[...new Set(r.pending.map(p=>p.label))];$('lesson-pending').append(el('p',unique.length<=4?'待补：'+unique.join('、')+'。':'还有'+unique.length+'项资料或系数未齐。','help'));const jump=el('button','查看需要补充的项目');jump.type='button';jump.onclick=()=>{$('lesson-conversion').open=true;$('lesson-conversion').scrollIntoView({block:'start'})};$('lesson-pending').append(jump)}
    if(complete){for(const [label,value]of [['当前总危险',r.before],['改善后总危险',r.after],['减少量',r.delta]]){const card=el('div','','metric');card.append(el('span',label),el('strong',fmt(value,2)),el('small','/10万'));$('lesson-metrics').append(card)}const card=el('div','','metric lesson-total-change'),change=riskChange(r.before,r.after);card.append(el('span','总危险变化'),changeBadge(change),el('small',change.percent===null?change.description:'与当前总危险相比'));$('lesson-metrics').append(card)}
    r.rows.forEach((row,ci)=>{
      const tr=el('tr');tr.dataset.cause=String(ci);const name=el('th',row.name);name.scope='row';tr.append(name);
      for(const value of [row.baseline,row.before?.applied,row.after?.applied,row.before?.d,row.after?.d,row.delta,row.contribution])tr.append(el('td',value===null||value===undefined?'—':fmt(value,2)));$('lesson-summary-rows').append(tr);
      row.factors.forEach((f,fi)=>{
        const line=el('tr');line.dataset.factor=f.key;
        if(fi===0){for(const value of [row.name,row.baseline]){const cell=el('td',String(value));cell.rowSpan=row.factors.length;line.append(cell)}}
        for(const value of [f.name,f.beforeValue,numberCell(f.before)])line.append(el('td',value));
        if(fi===0){for(const value of [row.before?.applied,row.before?.d]){const cell=el('td',numberCell(value));cell.rowSpan=row.factors.length;line.append(cell)}}
        line.append(el('td',f.afterChange),el('td',numberCell(f.after)));
        if(fi===0){for(const value of [row.after?.applied,row.after?.d,row.delta,row.contribution]){const cell=el('td',numberCell(value));cell.rowSpan=row.factors.length;line.append(cell)}}$('lesson-full-rows').append(line);
      });
    });
    if(complete){const max=Math.max(1,...r.rows.flatMap(row=>[row.before.d,row.after.d]));r.rows.forEach(row=>{const line=el('div','','lesson-bar-row');line.append(el('span',row.name,'lesson-bar-label'));for(const [phase,label]of [['before','当前'],['after','改善后']]){const track=el('div','','lesson-bar-track '+phase),bar=el('span','','lesson-bar-fill');bar.style.width=row[phase].d/max*100+'%';track.append(bar);track.setAttribute('aria-label',row.name+' '+label+' '+fmt(row[phase].d,2)+' /10万');line.append(track)}const stats=el('div','','lesson-bar-stats');stats.append(changeBadge(riskChange(row.before.d,row.after.d)),el('small',fmt(row.before.d,2)+' → '+fmt(row.after.d,2)));line.append(stats);$('lesson-risk-chart').append(line)});$('lesson-risk-chart').append(el('p','横轴单位：/10万；各项使用相同刻度。','help'))}else $('lesson-risk-chart').append(el('p','填完资料后，这里会显示各项改善前后的变化。','help'));
    if(complete){
      for(const [label,value]of [['实际年龄',+state.age],['评价年龄',r.beforeAge?.age],['增长年龄',r.afterAge?.age]]){const row=el('div','','age-row');row.append(el('span',label),el('strong',value===undefined?'超出表内区段':fmt(value,2)+' 岁'));$('lesson-ages').append(row)}
      const explain=(name,value,a)=>!a?name+'：超出已录入的1600—61640参照区段，不外推。':name+'：'+fmt(value,2)+'位于'+a.low[0]+'（'+a.low[1]+'岁）与'+a.high[0]+'（'+a.high[1]+'岁）之间，内插得'+fmt(a.age,6)+'岁。';
      $('lesson-age-note').textContent='实际年龄末位'+(+state.age%10)+'，使用表12-3的'+(+state.age%5)+' / '+(+state.age%5+5)+'列。\n'+explain('评价年龄',r.before,r.beforeAge)+'\n'+explain('增长年龄',r.after,r.afterAge);
    }else $('lesson-age-note').textContent='12项死因全部完成并符合参数组后，才用合计危险查表12-3。';
    for(const row of $('lesson-age-rows').children){row.classList.remove('current','after');const risk=Number(row.dataset.risk);if(r.beforeAge&&(risk===r.beforeAge.low[0]||risk===r.beforeAge.high[0]))row.classList.add('current');if(r.afterAge&&(risk===r.afterAge.low[0]||risk===r.afterAge.high[0]))row.classList.add('after');row.children[1].textContent=String(Number(row.dataset.base)+(+state.age%5||0))}
    renderConversions();notify();
  }
  function renderConversions(){
    const host=$('lesson-factor-details'),open=new Set([...host.children].filter(n=>n.open).map(n=>n.dataset.cause)),manualOpen=new Set([...host.querySelectorAll('.lesson-manual[open]')].map(n=>n.dataset.factor));host.replaceChildren();if(!result)return;
    result.rows.forEach((row,ci)=>{const details=el('details','','lesson-cause');details.dataset.cause=String(ci);details.open=open.has(String(ci));details.append(el('summary',row.name+' · '+row.factors.filter(f=>f.before!==null&&f.after!==null).length+'/'+row.factors.length+'项分数已确定'));
      row.factors.forEach(f=>{
        const box=el('div','','lesson-factor');box.append(el('h4',f.name));
        for(const [title,value,score,note]of [['当前',f.beforeValue,f.before,f.beforeNote],['改善后',f.afterValue,f.after,f.afterNote]])box.append(el('p',title+'：'+value+' → r＝'+numberCell(score)),el('p',note,'help'));
        const manual=el('details','','lesson-manual');manual.dataset.factor=f.key;manual.open=manualOpen.has(f.key);manual.append(el('summary','补充或更正这项危险分数'),el('p','填写后点“应用这项系数”，再查看结果。留空可恢复自动转换。','help'));const grid=el('div','','lesson-manual-grid'),inputs={};
        for(const phase of ['before','after']){const label=el('label',phase==='before'?'补充当前r':'补充改善后r'),input=el('input');input.type='number';input.min=0;input.max=1000000;input.step='any';input.value=state.overrides[f.key]?.[phase]||'';input.setAttribute('aria-label',row.name+' '+f.name+' '+(phase==='before'?'补充当前分数':'补充改善后分数'));input.placeholder='留空使用自动转换';label.append(input);inputs[phase]=input;grid.append(label)}
        const label=el('label','补充分数的来源'),input=el('input');input.type='text';input.maxLength=500;input.value=state.overrides[f.key]?.source||'';input.setAttribute('aria-label',row.name+' '+f.name+' 补充分数来源');input.placeholder='填写表号、页码或原网址';label.append(input);grid.append(label);const apply=el('button','应用这项系数');apply.type='button';apply.setAttribute('aria-label',row.name+' '+f.name+' 应用这项系数');const manualError=el('p','','error');manualError.setAttribute('role','status');apply.onclick=()=>{const next={...state,overrides:{...state.overrides,[f.key]:{before:inputs.before.value,after:inputs.after.value,source:input.value}}};try{validate(next)}catch(e){manualError.textContent=e.message;return}state=next;changed();render()};manual.append(grid,apply,manualError);box.append(manual);details.append(box);
      });
      if(row.before&&row.after){const steps=el('div','','steps');steps.textContent=[['当前',row.before],['改善后',row.after]].map(([name,v])=>name+'：X＝'+(v.high.length?v.high.map(n=>'('+n+'−1)').join('＋'):'0')+'＝'+fmt(v.x,6)+'\nY＝'+(v.low.length?v.low.join('×'):'1')+'＝'+fmt(v.y,6)+'\nR＝X＋Y＝'+fmt(v.r,6)+'；采用R＝'+fmt(v.applied,6)+'\nD＝'+v.m+'×'+fmt(v.applied,6)+'＝'+fmt(v.d,6)+' /10万').join('\n\n');details.append(steps)}host.append(details);
    });
  }
  function hasWork(){return Object.values(state.before).some(has)||Object.values(state.after).some(has)||Object.keys(state.overrides).length>0}
  function replaceAllowed(){return !hasWork()||root.confirm('当前课堂资料将被替换。需要保留的话请先保存，继续吗？')}
  function init(options={}){
    document=root.document;notify=options.onChange||(()=>{});save=options.download||((text,name,type='text/plain')=>{const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:type+';charset=utf-8'})),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)});
    ageRows.forEach(([risk,base])=>{const row=el('tr');row.dataset.risk=String(risk);row.dataset.base=String(base);row.append(el('td',String(risk)),el('td',String(base+1)));$('lesson-age-rows').append(row)});
    for(const id of ['age','sex','bpUnit','bpIndicator','policy'])$('lesson-'+id).addEventListener('input',()=>{state[id]=$('lesson-'+id).value;changed();render();if(['bpUnit','bpIndicator','policy'].includes(id)&&Object.keys(state.overrides).length)$('lesson-status').textContent='选项已更新。手工系数及来源已保留；请核对它们是否仍适用于当前设定。'});
    $('lesson-round').onchange=()=>{state.roundFirst=$('lesson-round').checked;changed();render()};
    $('lesson-form').onsubmit=e=>e.preventDefault();
    $('lesson-demo').onclick=()=>{if(!replaceAllowed())return;state=example();renderFields();render();$('lesson-status').textContent='已载入课堂例题。可以试着改几项数值，看看结果怎样变化。'};
    $('lesson-clear').onclick=()=>{if(!replaceAllowed())return;state=blank();renderFields();render();$('lesson-status').textContent='已清空变量。当前值未知就留空，改善后留空表示保持当前。'};
    $('lesson-unchanged').onclick=()=>{state.after=clean();Object.values(state.overrides).forEach(o=>o.after='');changed();renderFields();render();$('lesson-status').textContent='已将改善后设为保持当前，当前填写的资料没有改动。'};
    $('lesson-four').onclick=()=>{Object.assign(state.after,{activity:'regular',weightBasis:'average',depression:'treated',proctoscopy:'annual'});for(const id of ['activity','weightBasis','depression','proctoscopy'])clearAffected(id);changed();renderFields();render();$('lesson-status').textContent='已填入课件第174页的4项改变，结果已更新。'};
    $('lesson-save').onclick=()=>{const s=validate(state);save(JSON.stringify(s,null,2),'健康危险因素评价_课堂资料.json','application/json');$('lesson-status').textContent='填写内容已保存，下次可以导入接着填。'};
    $('lesson-import').onchange=async()=>{const input=$('lesson-import'),file=input.files?.[0];if(!file)return;try{if(file.size>150000)throw Error('请选择小于150KB的单份课堂资料');const next=validate(JSON.parse((await file.text()).replace(/^\uFEFF/,'')));if(!replaceAllowed())return;state=next;renderFields();render();$('lesson-status').textContent='已恢复课堂资料。'}catch(e){$('lesson-status').textContent='没有导入，原资料保留。'+(e instanceof SyntaxError?'文件不是有效JSON。':e.message)}finally{input.value=''}};
    $('lesson-csv').onclick=()=>{try{save(csv(state),'健康危险因素评价_表12-1完整结果.csv','text/csv');$('lesson-status').textContent='已导出表12-1的13列、分数依据、合计及查表年龄。'}catch(e){$('lesson-status').textContent=e.message}};
    $('lesson-print').onclick=()=>{document.body.classList.add('printing-lesson');root.print()};root.addEventListener('afterprint',()=>document.body.classList.remove('printing-lesson'));
    $('lesson-view').onclick=()=>{$('lesson-results-title').focus();$('lesson-results-title').scrollIntoView({block:'start'})};
    renderFields();render();
  }
  const api={fields,groups,bindings,source,ageRows,blank,example,validate,analyse,ageLookup,riskChange,csv,report,init,get ready(){return !!result?.complete},get result(){return result},get state(){return state}};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HraLesson=api;
})(typeof window!=='undefined'?window:globalThis);
