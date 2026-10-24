(function(root){
  'use strict';
  const sources={
    activity:{name:'WHO：身体活动指南（2020）',url:'https://www.who.int/publications/i/item/9789240015128'},
    diet:{name:'WHO：健康饮食',url:'https://www.who.int/en/news-room/fact-sheets/detail/healthy-diet'},
    sleep:{name:'中华医学会：健康睡眠四要素（2024）',url:'https://www.cma.org.cn/art/2024/5/13/art_4584_56543.html'},
    tobacco:{name:'WHO：烟草与尼古丁',url:'https://www.who.int/news-room/fact-sheets/detail/tobacco'},
    alcohol:{name:'WHO：酒精',url:'https://www.who.int/news-room/fact-sheets/detail/alcohol'},
    weight:{name:'国家卫生健康委：成人体重与腰围判定说明（2025）',url:'https://www.nhc.gov.cn/xcs/c100122/202503/27b26d397f4941ff8ff3846ef40026ee.shtml'},
    bp:{name:'国家卫生健康委：诊室、家庭血压的不同参照',url:'https://www.nhc.gov.cn/jkj/c100063/202009/b6a4c154c6574ed6814c15010c8b4b94.shtml'}
  };
  const number=(id,label,min,max,unit='',hint='',integer=false)=>({id,label,type:'number',min,max,unit,hint,integer});
  const select=(id,label,options,hint='')=>({id,label,type:'select',options,hint});
  const groups=[
    {name:'基本情况',hint:'请先填年龄和适用情况，其他资料知道多少填多少。',fields:[
      {id:'recordDate',label:'本次记录日期',type:'date',hint:'复评时记录新的日期，便于分清两次资料。'},
      number('age','年龄',0,120,'岁','本页统一的生活习惯参照用于18—64岁一般成年人。',true),
      select('scope','目前属于哪种情况？',[['general','一般成年人'],['pregnancy','孕期或产后'],['individual','医生要求限制活动或采用个别方案']]),
      number('height','身高',50,250,'cm'),number('weight','体重',15,400,'kg'),
      select('sex','体重判定所用性别',[['male','男'],['female','女']],'只用于腰围参照；可以不填。'),
      number('waist','腰围（可选）',30,220,'cm','自然站立，肋弓下缘和髂嵴之间的中点水平测量。')
    ]},
    {name:'运动与休息',hint:'填写最近一周的合计量。同一段活动只计算一次。',fields:[
      number('moderate','中等强度活动',0,10080,'分钟/周','例如快走、让呼吸加快但仍能交谈的骑车。没有就填0。'),
      number('vigorous','较大强度活动',0,10080,'分钟/周','例如跑步、明显气喘而难以连续交谈的运动。没有就填0。'),
      number('strength','力量训练',0,7,'天/周','例如涉及主要肌群的抗阻或自重训练。',true),
      number('sleep','通常每晚实际睡眠',0,24,'小时','不把在床上刷手机的时间算进去。'),
      number('sitting','每天坐着或躺着清醒的时间（可选）',0,24,'小时','包括上课、学习和娱乐；只作记录，不自行设置危险界值。')
    ]},
    {name:'饮食',hint:'按通常一天估计。不了解食堂用盐量时，留空比猜一个数更合适。',fields:[
      number('fruitveg','蔬菜和水果合计',0,4000,'克/天','不含土豆等淀粉类薯根，不用果汁替代。'),
      number('salt','全天食盐量',0,100,'克/天','包括酱油、加工食品等隐含盐。包装标钠时：盐（g）≈钠（mg）×2.5÷1000。'),
      number('alcohol','最近一周有几天饮酒？',0,7,'天','不饮酒填0；仅凭天数不能判断饮酒量或酒精依赖。',true)
    ]},
    {name:'烟草与生活环境',hint:'有些因素需要同伴、学校或家庭一起改善。它们也值得记录。',fields:[
      select('smoke','目前吸烟或使用电子烟吗？',[['never','从未使用'],['former','以前使用，现在已停止'],['current','现在吸烟或使用其他烟草'],['vape','现在使用电子烟']]),
      number('secondhand','最近一周接触二手烟的天数',0,7,'天','宿舍、家里或其他室内场所的烟草烟雾均计入。',true),
      select('family','父母或兄弟姐妹有心血管疾病、糖尿病史吗？',[['yes','有'],['no','据我了解没有']],'不清楚可以留空；家族史不计入习惯项数。'),
      select('stress','最近的压力是否影响学习、工作或休息？',[['no','没有明显影响'],['some','有一点影响'],['impact','已影响日常生活']],'用于了解生活背景，不作为心理量表计分。'),
      select('support','想改善习惯时，身边有人能提供支持吗？',[['yes','有人可以一起做或帮忙'],['some','有一些支持，但不太稳定'],['no','暂时缺少支持']])
    ]},
    {name:'体检记录（可选）',hint:'照最近一次报告填写，不需要为完成页面专门做检查。已有诊断或正在用药时，以医生的个别目标为准。',fields:[
      select('bpContext','血压测量方式',[['clinic','诊室测量'],['home','家里偶尔测量一次'],['homeAverage','家里连续5—7天规范测量的平均值']]),
      number('sbp','收缩压（高压）',50,300,'mmHg'),number('dbp','舒张压（低压）',20,200,'mmHg'),
      number('glucose','空腹血糖',1,40,'mmol/L','记录报告值；本页不根据一次检测诊断糖尿病。'),
      number('cholesterol','总胆固醇',1,30,'mmol/L','核对单位。血脂应结合LDL-C、其他危险因素及报告解释，不据总胆固醇一项判定健康。')
    ]},
    {name:'这次先做一件事',hint:'给自己留一个做得到的目标，之后再来看看。',fields:[
      {id:'plan',label:'准备怎样调整？',type:'text',hint:'例如：周一、三、五晚饭后和室友快走20分钟。',maxLength:500},
      {id:'reviewDate',label:'打算哪天再记录？',type:'date',hint:'这里记录日期，不会自动发提醒。'}
    ]}
  ];
  const fields=groups.flatMap(g=>g.fields),byId=Object.fromEntries(fields.map(f=>[f.id,f]));
  const blank=()=>Object.fromEntries(fields.map(f=>[f.id,'']));
  const has=v=>v!==''&&v!==undefined&&v!==null;
  const fmt=(v,p=2)=>Number(v).toLocaleString('zh-CN',{maximumFractionDigits:p,useGrouping:false});
  function validate(input){
    if(!input||typeof input!=='object'||Array.isArray(input))throw Error('资料格式不正确');
    for(const key of Object.keys(input))if(!Object.hasOwn(byId,key))throw Error('不认识的资料项目：'+key);
    const values=blank();
    fields.forEach(f=>{
      const raw=input[f.id];if(raw===undefined||raw===null||raw==='')return;
      if(typeof raw!=='string'&&typeof raw!=='number')throw Error(f.label+'的格式不正确');
      const v=String(raw).trim();if(!v)return;
      if(f.type==='number'){
        const n=Number(v);
        if(!Number.isFinite(n)||n<f.min||n>f.max||(f.integer&&!Number.isInteger(n)))throw Error(f.label+'请填'+f.min+'—'+f.max+'之间的'+(f.integer?'整数':'数值')+'（'+f.unit+'）');
      }else if(f.type==='select'){
        if(!f.options.some(o=>o[0]===v))throw Error(f.label+'的选项不正确');
      }else if(f.type==='date'){
        if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error(f.label+'格式不正确');
      }else if(v.length>f.maxLength)throw Error(f.label+'请控制在'+f.maxLength+'字以内');
      values[f.id]=v;
    });
    if(has(values.moderate)&&has(values.vigorous)&&Number(values.moderate)+Number(values.vigorous)>10080)throw Error('两种活动的合计不能超过一周的总分钟数，请检查是否重复计算');
    if(has(values.sbp)&&has(values.dbp)&&Number(values.dbp)>=Number(values.sbp))throw Error('舒张压应小于收缩压，请检查高压、低压是否填反');
    return values;
  }
  function analyse(input){
    const values=validate(input),age=has(values.age)?Number(values.age):null;
    const applicable=age!==null&&age>=18&&age<=64&&values.scope==='general';
    let scopeMessage='先填年龄，并选择适用情况，再显示生活习惯的参照结果。';
    if(age!==null&&(age<18||age>64))scopeMessage='当前年龄不在18—64岁参照范围内。保留填写的资料，不给出统一的习惯项数；请按相应年龄的指南评价。';
    else if(values.scope&&values.scope!=='general')scopeMessage='当前情况需要个别目标。本页保留资料，不把一般成年人的运动、饮食和BMI参照套进来。';
    const activity=has(values.moderate)&&has(values.vigorous)?Number(values.moderate)+2*Number(values.vigorous):null;
    const bmi=has(values.height)&&has(values.weight)?Number(values.weight)/(Number(values.height)/100)**2:null;
    const habits=[];
    const row=(id,label,known,met,value,criterion,source,action)=>habits.push({id,label,status:!applicable||!known?'unknown':met?'met':'review',value,criterion,source,action});
    row('activity','有氧活动',activity!==null,activity>=150,activity===null?'需填写两种强度的分钟数':fmt(activity)+'分钟/周（中等强度等效）','每周至少150分钟中等强度，或75分钟较大强度，或等效组合。','activity','从现有活动量开始，找几个固定的时段动起来，再逐步接近每周150分钟中等强度等效量。');
    row('strength','力量训练',has(values.strength),Number(values.strength)>=2,has(values.strength)?values.strength+'天/周':'未填','每周至少2天，涉及主要肌群。','activity','找两天安排适合自己的抗阻或自重训练；不熟悉动作时请体育老师指导。');
    row('sleep','睡眠时长',has(values.sleep),Number(values.sleep)>=7&&Number(values.sleep)<=9,has(values.sleep)?values.sleep+'小时/晚':'未填','18—64岁通常每晚7—9小时；还要看白天精力和睡眠质量。','sleep','先记录一周入睡、起床和白天精力，给睡眠留出合适的时间；持续影响日常生活时再寻求帮助。');
    row('fruitveg','蔬菜和水果',has(values.fruitveg),Number(values.fruitveg)>=400,has(values.fruitveg)?values.fruitveg+'克/天':'未填','每天合计至少400克；不含淀粉类薯根。','diet','在日常几餐里增加蔬菜，方便时带一份水果；先了解自己通常吃了多少。');
    row('salt','食盐',has(values.salt),Number(values.salt)<5,has(values.salt)?values.salt+'克/天':'未填','成人全天少于5克，包括加工食品和调味料中的盐。','diet','先核对常吃食品的钠含量，少加酱汁；食堂用盐不清楚时，可先记录饮食，不必猜数。');
    row('smoke','吸烟与电子烟',has(values.smoke),['never','former'].includes(values.smoke),display('smoke',values.smoke),'不使用烟草或电子烟。戒烟后的风险变化还与既往暴露有关。','tobacco','若正在吸烟或使用电子烟，可以先找校医院或戒烟门诊讨论一个可行的停止方案。');
    row('secondhand','二手烟',has(values.secondhand),Number(values.secondhand)===0,has(values.secondhand)?values.secondhand+'天/周':'未填','避免二手烟暴露；0天只是最近一周的记录。','tobacco','和室友或家人商量室内不吸烟，必要时请宿舍管理或学校协助。');
    row('alcohol','饮酒',has(values.alcohol),Number(values.alcohol)===0,has(values.alcohol)?values.alcohol+'天/周':'未填','以不饮酒作为避免酒精暴露的参照，不鼓励为健康开始饮酒。','alcohol','把饮酒场合和大致饮酒量记下来；若想减少，可以先选择不含酒精的替代饮品。');
    const met=habits.filter(h=>h.status==='met').length,review=habits.filter(h=>h.status==='review').length;
    const measurements=[];
    if(bmi!==null){
      const category=bmi<18.5?'体重过低':bmi<24?'正常体重范围':bmi<28?'超重范围':'肥胖范围';
      measurements.push({title:'体重指数 BMI',value:fmt(bmi),text:applicable?category+'（中国成人参照：18.5≤BMI<24）。BMI不能单独反映肌肉量或体脂分布。':'当前适用条件未确认，仅显示算式结果，不作体重分类。',steps:values.weight+'÷('+values.height+'÷100)²＝'+fmt(bmi,4),source:'weight'});
    }
    if(has(values.waist)&&values.sex){
      const cutoff=values.sex==='male'?90:85,pre=values.sex==='male'?85:80,w=Number(values.waist);
      measurements.push({title:'腰围',value:values.waist+' cm',text:applicable?(w>=cutoff?'达到中心型肥胖的腰围参照':w>=pre?'处于中心型肥胖前期的腰围范围':'低于中心型肥胖前期的腰围参照')+'；男性85/90 cm、女性80/85 cm为相应界点。':'按当前填写保留记录，不分类。',source:'weight'});
    }
    if(has(values.sbp)||has(values.dbp)){
      let text='补齐高压、低压与测量方式后，才对照相应参照。';
      if(!applicable)text='仅保留本次读数，尚未确认或不适用本页的一般成人参照；请结合原报告和个别建议解释。';
      else if(has(values.sbp)&&has(values.dbp)&&values.bpContext){
        const s=Number(values.sbp),d=Number(values.dbp);
        if(s>=180||d>=110)text='读数明显升高，先安静休息并复测；仍高时及时就医。伴胸痛、呼吸困难等症状时应立即就医。';
        else if(values.bpContext==='home')text='这是单次家庭读数，不据此判断是否患高血压。可按规范连续记录，再与医生讨论。';
        else{
          const sc=values.bpContext==='homeAverage'?135:140,dc=values.bpContext==='homeAverage'?85:90;
          text=(s>=sc||d>=dc?'达到血压升高的就诊参照，建议进一步核对。':'本次未达到上述血压升高参照；不代表所有风险都正常。')+'当前参照为'+(values.bpContext==='homeAverage'?'连续5—7天家庭平均':'诊室')+'血压'+sc+'/'+dc+' mmHg。不能根据本页一次记录诊断或调整药物。';
        }
      }
      measurements.push({title:'血压记录',value:(values.sbp||'—')+'/'+(values.dbp||'—')+' mmHg',text,source:'bp'});
    }
    if(has(values.glucose))measurements.push({title:'空腹血糖记录',value:values.glucose+' mmol/L',text:'结合原报告、是否确诊及用药情况解释。这里不把单次血糖换成健康分，也不替代复核。'});
    if(has(values.cholesterol))measurements.push({title:'总胆固醇记录',value:values.cholesterol+' mmol/L',text:'还需结合LDL-C、其他危险因素及医生设定的目标；这里不使用课堂中年男性的mg/dl危险系数。'});
    return {values,applicable,scopeMessage,habits,met,review,unknown:8-met-review,activity,bmi,measurements};
  }
  function display(id,value){const f=byId[id];return !has(value)?'未填':f.type==='select'?f.options.find(o=>o[0]===value)[1]:value+(f.unit?' '+f.unit:'')}
  function validateSnapshot(data){
    if(!data||data.kind!=='social-medicine-personal-hra'||data.version!==1)throw Error('请导入从本页保存的个人资料JSON文件');
    const values=validate(data.values),reference=data.reference===null||data.reference===undefined?null:validate(data.reference);
    const modes=['自行填写','模拟资料','修改后的模拟资料'];
    if(!modes.includes(data.mode)||reference&&!modes.includes(data.referenceMode))throw Error('资料来源标记不正确');
    return {values,reference,mode:data.mode,referenceMode:reference?data.referenceMode:null};
  }
  const state={values:blank(),reference:null,mode:'自行填写',referenceMode:null,result:null,view:'personal'};
  let document,changed=()=>{};
  const $=id=>document.getElementById(id);
  const el=(tag,text='',cls='')=>{const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n};
  function link(key){const a=el('a',sources[key].name);a.href=sources[key].url;a.target='_blank';a.rel='noopener';return a}
  function filled(){return Object.values(state.values).some(has)}
  function read(){return Object.fromEntries(fields.map(f=>[f.id,$('personal-'+f.id).value]))}
  function apply(values){fields.forEach(f=>{$('personal-'+f.id).value=values[f.id]||''});state.values={...values};render()}
  function confirmReplace(){return !(filled()||state.reference)||root.confirm('当前资料和对照会被替换。需要保留的话，请先保存。继续吗？')}
  function render(){
    const out=$('personal-summary');out.replaceChildren();$('personal-habits').replaceChildren();$('personal-measures').replaceChildren();$('personal-next').replaceChildren();$('personal-comparison').replaceChildren();$('personal-print-data').replaceChildren();$('personal-error').textContent='';state.result=null;
    try{
      state.result=analyse(state.values);const r=state.result;
      $('personal-result-title').textContent=filled()?'这次记录的情况':'填写后在这里看结果';
      if(r.applicable){
        const band=el('div','','personal-count');band.append(el('strong',r.met+' / 8'),el('span','项习惯达到所列参照'));out.append(band);
        out.append(el('p','已评价'+(8-r.unknown)+'项 · 可再了解或调整'+r.review+'项 · 待补资料'+r.unknown+'项','help'));
        const track=el('div','','habit-track');r.habits.forEach(h=>{const part=el('span','','habit-segment '+h.status);part.title=h.label+'：'+({met:'达到参照',review:'可再调整',unknown:'待补资料'})[h.status];track.append(part)});track.setAttribute('aria-label',r.met+'项达到参照，'+r.review+'项可再调整，'+r.unknown+'项待补资料');out.append(track);
      }else out.append(el('p',r.scopeMessage,'help'));
      out.append(el('p','资料来源：'+state.mode,'help'));
      if(state.mode.includes('模拟'))out.append(el('p','当前是模拟资料，不能写成自己的调查结果。','personal-example-note'));
      r.habits.forEach(h=>{
        const row=el('div','','habit-row '+h.status),head=el('div','','habit-row-heading');
        head.append(el('b',h.label),el('span',r.applicable?({met:'达到参照',review:'可再调整',unknown:'待补资料'})[h.status]:'只作记录','habit-status'));row.append(head,el('p',h.value));
        const detail=el('details'),summary=el('summary','参照与依据');detail.append(summary,el('p',h.criterion,'help'),link(h.source));row.append(detail);$('personal-habits').append(row);
      });
      r.measurements.forEach(m=>{const box=el('div','','personal-measure');box.append(el('span',m.title,'help'),el('strong',m.value),el('p',m.text,'help'));if(m.steps)box.append(el('p',m.steps,'steps'));if(m.source)box.append(link(m.source));$('personal-measures').append(box)});
      if(state.reference){
        const previous=analyse(state.reference);$('personal-comparison').append(el('h4','与保留的那次记录比较'));
        if(state.mode.includes('模拟')!==state.referenceMode.includes('模拟'))$('personal-comparison').append(el('p','两次资料的来源不同（'+state.referenceMode+' / '+state.mode+'）。不计算前后改善，请用同一人的记录作对照。'));
        else if(!r.applicable||!previous.applicable)$('personal-comparison').append(el('p','两次都符合18—64岁一般成年人参照条件时，才比较习惯变化。'));
        else{
          const comparable=r.habits.filter((h,i)=>h.status!=='unknown'&&previous.habits[i].status!=='unknown');
          const improved=comparable.filter(h=>h.status==='met'&&previous.habits.find(p=>p.id===h.id).status==='review');
          const declined=comparable.filter(h=>h.status==='review'&&previous.habits.find(p=>p.id===h.id).status==='met');
          $('personal-comparison').append(el('p','两次都有资料的'+comparable.length+'项中，'+improved.length+'项由可调整变为达到参照，'+declined.length+'项由达到参照变为可调整。缺项不算改善。'));
          if(improved.length)$('personal-comparison').append(el('p','达到参照的变化：'+improved.map(h=>h.label).join('、')));
          if(r.activity!==null&&previous.activity!==null)$('personal-comparison').append(el('p','等效活动量：'+fmt(previous.activity)+' → '+fmt(r.activity)+'分钟/周。'));
          if(r.bmi!==null&&previous.bmi!==null)$('personal-comparison').append(el('p','BMI：'+fmt(previous.bmi)+' → '+fmt(r.bmi)+'；数值下降不一定表示改善，要结合原有体重状况。'));
          $('personal-comparison').append(el('p','这是前后记录的变化，不能据此断言患病风险降低了多少。'));
        }
      }
      const todo=r.habits.filter(h=>h.status==='review');
      if(r.applicable&&todo.length){$('personal-next').append(el('h4','可以从哪件事开始？'));todo.slice(0,3).forEach(h=>$('personal-next').append(el('p',h.label+'：'+h.action,'help')))}
      if(state.values.stress==='impact')$('personal-next').append(el('p','压力已影响日常生活，可以和信任的人、辅导员或校内咨询人员谈谈，了解有哪些支持。','help'));
      if(state.values.support==='no')$('personal-next').append(el('p','如果一个人不容易坚持，可以请同伴一起，或了解校内运动场地、食堂选择与健康咨询服务。','help'));
      if(state.values.family==='yes')$('personal-next').append(el('p','有家族史值得在健康咨询时说明，但不能仅凭“有/无”估算遗传风险，也不把它当作做得好或不好的一项。','help'));
      if(filled()){$('personal-print-data').append(el('h4','本次填写的资料'));fields.filter(f=>has(state.values[f.id])).forEach(f=>$('personal-print-data').append(el('p',f.label+'：'+display(f.id,state.values[f.id]),'help')))}
    }catch(e){$('personal-error').textContent=e.message;out.append(el('p','先核对输入，结果暂不显示，避免保留上一份数值。','help'))}
    $('personal-save').disabled=!filled()||!state.result;$('personal-reference').disabled=!filled()||!state.result;
    $('personal-unreference').hidden=!state.reference;changed();
  }
  function setView(view){
    state.view=view==='classroom'?'classroom':'personal';
    $('hra-personal').hidden=state.view!=='personal';$('hra-classroom').hidden=state.view!=='classroom';
    for(const [id,v] of [['hra-personal-tab','personal'],['hra-example-tab','classroom']]){$(id).setAttribute('aria-pressed',String(state.view===v));$(id).classList.toggle('active',state.view===v)}
    changed();
  }
  function report(){
    if(!state.result||!filled())throw Error('先填写有效的个人资料');
    const r=state.result,lines=['个人健康危险因素记录','资料来源：'+state.mode,'适用参照：18—64岁一般成年人',''];
    groups.forEach(g=>{lines.push(g.name);g.fields.forEach(f=>lines.push(f.label+'：'+display(f.id,state.values[f.id])));lines.push('')});
    lines.push('生活习惯对照（8项）',r.applicable?'达到参照'+r.met+'项；可再了解或调整'+r.review+'项；待补资料'+r.unknown+'项。':r.scopeMessage,'项数是参照完成记录，不是经验证的量表总分，不代表患病概率。');
    r.habits.forEach(h=>lines.push(h.label+'：'+h.value+'；'+(r.applicable?({met:'达到参照',review:'可再调整',unknown:'待补资料'})[h.status]:'只作记录')+'\n参照：'+h.criterion+'\n'+sources[h.source].url));
    lines.push('','体格与体检');r.measurements.forEach(m=>lines.push(m.title+'：'+m.value+'\n'+(m.steps?m.steps+'\n':'')+m.text));
    if(r.activity!==null)lines.push('活动量计算：'+r.values.moderate+'＋2×'+r.values.vigorous+'＝'+fmt(r.activity)+'分钟/周（中等强度等效）。');
    if(state.reference){lines.push('','前后对照',$('personal-comparison').textContent,'','保留的那次原始资料（'+state.referenceMode+'）');fields.forEach(f=>lines.push(f.label+'：'+display(f.id,state.reference[f.id])))}
    lines.push('','依据与原网址',...Object.values(sources).map(s=>s.name+'\n'+s.url),'','课堂联系：收集危险因素，逐项评价，选定可改变的目标，按同一规则复评。没有把41岁男性例题的危险系数、死亡率或评价年龄套入本记录。');
    return lines.join('\n');
  }
  function init({onChange,download}){
    document=root.document;changed=onChange;
    groups.forEach((g,i)=>{
      const fieldset=el('fieldset','','personal-group');fieldset.append(el('legend',String(i+1).padStart(2,'0')+'  '+g.name),el('p',g.hint,'help'));
      const grid=el('div','','personal-fields');g.fields.forEach(f=>{
        const label=el('label'),input=el(f.type==='select'?'select':'input');input.id='personal-'+f.id;input.name=f.id;
        label.append(el('span',f.label+(f.unit?'（'+f.unit+'）':'')));
        if(f.type==='select'){const empty=el('option','不清楚 / 暂不填');empty.value='';input.append(empty);f.options.forEach(([v,t])=>{const o=el('option',t);o.value=v;input.append(o)})}
        else{input.type=f.type;if(f.type==='number'){input.min=f.min;input.max=f.max;input.step=f.integer?'1':'any';input.inputMode='decimal'}if(f.maxLength)input.maxLength=f.maxLength}
        if(f.hint){const hint=el('small',f.hint);hint.id=input.id+'-hint';input.setAttribute('aria-describedby',hint.id);label.append(input,hint)}else label.append(input);
        input.addEventListener('input',()=>{state.values=read();if(state.mode.includes('模拟'))state.mode='修改后的模拟资料';$('personal-status').textContent='资料有改动，离开前请保存。';render()});grid.append(label);
      });fieldset.append(grid);$('personal-form').append(fieldset);
    });
    $('personal-form').addEventListener('submit',e=>e.preventDefault());
    const jump=()=>{$('personal-result-title').focus();$('personal-result-title').scrollIntoView({block:'start'})};
    $('personal-jump').onclick=jump;const review=el('button','查看本次评价','primary');review.type='button';review.onclick=jump;$('personal-form').append(review);
    Object.keys(sources).forEach(k=>{const li=el('li');li.append(link(k));$('personal-sources').append(li)});
    $('hra-personal-tab').onclick=()=>setView('personal');$('hra-example-tab').onclick=()=>setView('classroom');
    $('personal-save').onclick=()=>{if(!state.result)return;download(JSON.stringify({kind:'social-medicine-personal-hra',version:1,values:state.values,reference:state.reference,mode:state.mode,referenceMode:state.referenceMode},null,2),'个人健康资料.json','application/json');$('personal-status').textContent='已保存为资料文件。下次导入可继续填写，对照记录也一并保留。'};
    $('personal-import').onchange=async()=>{
      const input=$('personal-import'),file=input.files?.[0];if(!file)return;
      try{if(file.size>100000)throw Error('文件过大，请选择从本页保存的个人资料文件');const data=validateSnapshot(JSON.parse((await file.text()).replace(/^\uFEFF/,'')));if(!confirmReplace())return;state.mode=data.mode;state.reference=data.reference;state.referenceMode=data.referenceMode;apply(data.values);$('personal-status').textContent='已恢复保存的资料，可接着填写。'}catch(e){$('personal-status').textContent='没有导入，当前资料保留。'+(e instanceof SyntaxError?'文件不是有效的JSON。':e.message)}finally{input.value=''}
    };
    $('personal-clear').onclick=()=>{if((filled()||state.reference)&&!root.confirm('清空当前资料和临时对照？需要保留的话，请先保存。'))return;state.reference=null;state.referenceMode=null;state.mode='自行填写';apply(blank());$('personal-status').textContent='已清空，可以重新填写。'};
    $('personal-demo').onclick=()=>{if(!confirmReplace())return;state.mode='模拟资料';state.reference=null;state.referenceMode=null;apply({...blank(),age:'21',scope:'general',sex:'male',height:'172',weight:'68',moderate:'60',vigorous:'0',strength:'1',sleep:'6',sitting:'9',fruitveg:'250',alcohol:'0',smoke:'never',secondhand:'2',family:'no',stress:'some',support:'yes'});$('personal-status').textContent='已载入虚构的模拟资料，食盐和体检值仍留空；请不要当作本人的结果。'};
    $('personal-reference').onclick=()=>{if(!state.result)return;if(state.reference&&!root.confirm('替换之前保留的对照记录吗？'))return;state.reference={...state.values};state.referenceMode=state.mode;render();$('personal-status').textContent='已保留本次资料。修改当前填写后，可以比较两次都有资料的项目；保存文件会同时保存这次对照。'};
    $('personal-unreference').onclick=()=>{state.reference=null;state.referenceMode=null;render()};
    render();setView('personal');
  }
  const api={sources,groups,fields,blank,validate,analyse,validateSnapshot,init,report,get view(){return state.view},get ready(){return !!state.result&&filled()}};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PersonalHra=api;
})(typeof window!=='undefined'?window:globalThis);
