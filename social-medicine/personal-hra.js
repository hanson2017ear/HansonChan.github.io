(function(root){
  'use strict';
  const sources={
    activity:{name:'WHO：身体活动指南（2020）',url:'https://www.who.int/publications/i/item/9789240015128'},
    diet:{name:'WHO：健康饮食',url:'https://www.who.int/en/news-room/fact-sheets/detail/healthy-diet'},
    sleep:{name:'中华医学会：健康睡眠四要素（2024）',url:'https://www.cma.org.cn/art/2024/5/13/art_4584_56543.html'},
    tobacco:{name:'WHO：烟草与尼古丁',url:'https://www.who.int/news-room/fact-sheets/detail/tobacco'},
    alcohol:{name:'WHO：酒精',url:'https://www.who.int/news-room/fact-sheets/detail/alcohol'},
    weight:{name:'国家卫生健康委：成人体重与腰围判定说明（2025）',url:'https://www.nhc.gov.cn/xcs/c100122/202503/27b26d397f4941ff8ff3846ef40026ee.shtml'},
    bp:{name:'国家卫生健康委：诊室、家庭血压的不同参照',url:'https://www.nhc.gov.cn/jkj/c100063/202009/b6a4c154c6574ed6814c15010c8b4b94.shtml'},
    diabetes:{name:'Zhou等：中国糖尿病风险评分原研究（2013，表2）',url:'https://doi.org/10.2337/dc13-0593'},
    diabetesTable:{name:'原研究全文及评分表（CDC文献库）',url:'https://stacks.cdc.gov/view/cdc/28193/cdc_28193_DS1.pdf'},
    diabetesGuide:{name:'中华医学会：中国2型糖尿病防治指南（2020版，表5）',url:'https://gpedu.yiigle.com/uploads/guide_html/中国2型糖尿病防治指南（2020年版）%20-%20中华糖尿病杂志.html'}
  };
  const number=(id,label,min,max,unit='',hint='',integer=false)=>({id,label,type:'number',min,max,unit,hint,integer});
  const select=(id,label,options,hint='')=>({id,label,type:'select',options,hint});
  const groups=[
    {name:'基本情况',hint:'风险评分需要年龄、性别、身高体重、腰围、收缩压和糖尿病家族史。先填已有资料，不清楚的项目留空。',fields:[
      {id:'recordDate',label:'本次记录日期',type:'date',hint:'复评时记录新的日期，便于分清两次资料。'},
      number('age','年龄',0,120,'岁','本页统一的生活习惯参照用于18—64岁一般成年人。',true),
      select('scope','目前属于哪种情况？',[['general','一般成年人'],['pregnancy','孕期或产后'],['individual','医生要求限制活动或采用个别方案']]),
      select('diabetesHistory','是否已经被医生诊断为糖尿病？',[['no','没有确诊糖尿病'],['yes','已经确诊糖尿病']],'本评分用于筛查尚未确诊的2型糖尿病；不能根据一次自测血糖自行选择“已确诊”。'),
      number('height','身高',50,250,'cm'),number('weight','体重',15,400,'kg'),
      select('sex','评分与腰围判定所用性别',[['male','男'],['female','女']],'按原评分表的男、女两组计分。留空时不计算总分。'),
      number('waist','腰围',30,220,'cm','自然站立，肋弓下缘和髂嵴之间的中点水平测量。风险评分需要这一项。'),
      select('diabetesFamily','父母、兄弟姐妹或子女有糖尿病吗？',[['no','据我了解没有'],['yes','有']],'这是评分所用的一级亲属糖尿病史。不能用笼统的“心血管病或糖尿病家族史”代替。')
    ]},
    {name:'评分所需的血压',hint:'先安静休息，按规范测量。请填写可靠的诊室记录或连续家庭测量均值，单次家庭读数先保留作记录。',fields:[
      select('bpContext','血压测量方式',[['clinic','诊室测量'],['home','家里偶尔测量一次'],['homeAverage','家里连续5—7天规范测量的平均值']]),
      number('sbp','收缩压（高压）',50,300,'mmHg'),number('dbp','舒张压（低压）',20,200,'mmHg','糖尿病风险评分只用收缩压；低压用于下面的血压记录。')
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
    {name:'其他体检记录（可选）',hint:'有现成报告再填写，不需要为完成页面专门检查。这两项不参与上面的糖尿病风险评分。',fields:[
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
  // Zhou et al., Diabetes Care 2013;36:3944–3952, Table 2. Points screen for undiagnosed diabetes, not a probability.
  const diabetesRules={
    age:[[25,0],[35,4],[40,8],[45,11],[50,12],[55,13],[60,15],[65,16],[75,18]],
    bmi:[[22,0],[24,1],[30,3],[Infinity,5]],
    waist:[[75,0],[80,3],[85,5],[90,7],[95,8],[Infinity,10]],
    sbp:[[110,0],[120,1],[130,3],[140,6],[150,7],[160,8],[Infinity,10]]
  };
  function diabetesRisk(input){
    const v=validate(input),age=has(v.age)?Number(v.age):null;
    const missing=[],need=(id,label)=>{if(!has(v[id]))missing.push({id,label})};
    for(const [id,label] of [['age','年龄'],['scope','适用情况'],['diabetesHistory','是否已确诊糖尿病'],['sex','性别'],['height','身高'],['weight','体重'],['waist','腰围'],['sbp','收缩压'],['bpContext','血压测量方式'],['diabetesFamily','一级亲属糖尿病史']])need(id,label);
    let reason='';
    if(age!==null&&(age<20||age>74))reason='这份评分的适用年龄为20—74岁。当前年龄不在范围内，不外推分数。';
    else if(v.diabetesHistory==='yes')reason='已经确诊糖尿病时，不用这份筛查评分判断是否患病。请按医生的方案管理和复查。';
    else if(v.scope&&v.scope!=='general')reason='孕产期或需要个别方案的情况，不在本页统一评分的应用范围内。';
    if(v.bpContext==='home')missing.push({id:'bpContext',label:'规范测量的血压记录（目前为单次家庭读数）'});
    const bmi=has(v.height)&&has(v.weight)?Number(v.weight)/(Number(v.height)/100)**2:null;
    const points=(name,value)=>diabetesRules[name].find(([upper])=>value<upper)[1];
    const waistBase=v.sex==='female'?70:75,w=Number(v.waist);
    const waistBand=!has(v.waist)||!v.sex?'需同时填写腰围和性别':(v.sex==='male'?'男':'女')+'：'+(w<waistBase?'<'+waistBase:w<waistBase+5?waistBase+'—<'+(waistBase+5):w<waistBase+10?(waistBase+5)+'—<'+(waistBase+10):w<waistBase+15?(waistBase+10)+'—<'+(waistBase+15):w<waistBase+20?(waistBase+15)+'—<'+(waistBase+20):'≥'+(waistBase+20))+' cm';
    const items=[
      {id:'age',label:'年龄',value:age===null?'未填':v.age+' 岁',band:age===null||age<20||age>74?'—':age<25?'20—24岁':age<35?'25—34岁':age<40?'35—39岁':age<45?'40—44岁':age<50?'45—49岁':age<55?'50—54岁':age<60?'55—59岁':age<65?'60—64岁':'65—74岁',points:age!==null&&age>=20&&age<=74?points('age',age):null,max:18},
      {id:'sex',label:'性别',value:display('sex',v.sex),band:v.sex?display('sex',v.sex):'—',points:v.sex?v.sex==='male'?2:0:null,max:2},
      {id:'bmi',label:'BMI',value:bmi===null?'需填身高、体重':fmt(bmi,4)+' kg/m²',band:bmi===null?'—':bmi<22?'<22':bmi<24?'22—<24':bmi<30?'24—<30':'≥30',points:bmi===null?null:points('bmi',bmi),max:5},
      {id:'waist',label:'腰围',value:display('waist',v.waist),band:waistBand,points:has(v.waist)&&v.sex?points('waist',Number(v.waist)+(v.sex==='female'?5:0)):null,max:10},
      {id:'sbp',label:'收缩压',value:display('sbp',v.sbp),band:!has(v.sbp)?'—':Number(v.sbp)<110?'<110 mmHg':Number(v.sbp)<120?'110—<120 mmHg':Number(v.sbp)<130?'120—<130 mmHg':Number(v.sbp)<140?'130—<140 mmHg':Number(v.sbp)<150?'140—<150 mmHg':Number(v.sbp)<160?'150—<160 mmHg':'≥160 mmHg',points:has(v.sbp)&&v.bpContext&&v.bpContext!=='home'?points('sbp',Number(v.sbp)):null,max:10},
      {id:'diabetesFamily',label:'一级亲属糖尿病史',value:display('diabetesFamily',v.diabetesFamily),band:'父母、兄弟姐妹或子女',points:v.diabetesFamily?v.diabetesFamily==='yes'?6:0:null,max:6}
    ];
    if(reason)items.forEach(item=>item.points=null);
    const status=reason?'outside':missing.length?'incomplete':'complete',score=status==='complete'?items.reduce((sum,item)=>sum+item.points,0):null;
    const interpretation=status!=='complete'?reason||'必要资料尚未完整，暂不计算总分。':score>=25?'达到25分筛查切点。可带上记录到校医院或其他医疗机构咨询，由专业人员安排血糖等进一步检查。':'未达到25分筛查切点，不能据此排除糖尿病。若已有血糖异常或不适，仍需进一步评估。';
    return {status,reason,missing,items,score,cutoff:25,max:51,high:score===null?null:score>=25,interpretation,bmi};
  }
  function diabetesCsv(input,mode='自行填写'){
    const v=validate(input),r=diabetesRisk(v);if(r.status!=='complete')throw Error('风险评分资料尚未完整或不适用，暂不导出总分');
    const cell=value=>{let s=String(value??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
    const rows=[['记录日期','资料标记','模型','项目','本次资料','对应分组','分数','解释','来源']];
    r.items.forEach(item=>rows.push([v.recordDate,mode,'中国糖尿病风险评分（NCDRS）',item.label,item.value,item.band,item.points,'分值，不是百分比',sources.diabetes.url]));
    rows.push([v.recordDate,mode,'中国糖尿病风险评分（NCDRS）','合计',r.score+' / 51','筛查切点≥25分',r.score,r.interpretation,sources.diabetes.url]);
    return rows.map(row=>row.map(cell).join(',')).join('\r\n');
  }
  function display(id,value){const f=byId[id];return !has(value)?'未填':f.type==='select'?f.options.find(o=>o[0]===value)[1]:value+(f.unit?' '+f.unit:'')}
  const statusLabels={met:'达到参照',review:'需要留意',unknown:'待补资料',record:'仅作记录',outside:'需个别评价'};
  function evaluationRows(input){
    const r=analyse(input),v=r.values,rows=[];
    const add=(group,id,label,value,criterion,status,assessment,action,source=null)=>rows.push({group,id,label,value,criterion,status,assessment,action,source});
    r.habits.forEach(h=>{
      const known=h.id==='activity'?r.activity!==null:has(v[h.id]);
      const status=!known?'unknown':!r.applicable?'outside':h.status;
      const value=h.id==='activity'&&known?fmt(r.activity)+'分钟/周（'+v.moderate+'＋2×'+v.vigorous+'）':h.value;
      add('生活方式',h.id,h.label,value,h.criterion,status,statusLabels[status],!known?'有可靠记录时再补充，不用猜数。':!r.applicable?r.scopeMessage:h.status==='met'?'继续保持，并结合实际感受和生活变化复看。':h.action,h.source);
    });
    add('生活方式','sitting','久坐时间',display('sitting',v.sitting),'建议减少久坐，以适当活动替代部分久坐时间。本工具不自设小时数界值。',has(v.sitting)?'record':'unknown',has(v.sitting)?'记录活动环境':'待补资料',has(v.sitting)?'留意哪些时段连续坐得较久，在合适的时候起身活动。':'了解通常一天的清醒久坐时间后再补。','activity');
    const body=(id,label,known,value,criterion,status,assessment,action,source)=>{
      const finalStatus=!known?'unknown':!r.applicable?'outside':status;
      add('体格与体检',id,label,value,criterion,finalStatus,!known?'待补资料':!r.applicable?'不套用统一成人参照':assessment,!known?'有现成资料时再补充，不需为完成本页专门检查。':!r.applicable?r.scopeMessage:action,source);
    };
    const bmiCategory=r.bmi===null?'':r.bmi<18.5?'体重过低':r.bmi<24?'正常体重范围':r.bmi<28?'超重范围':'肥胖范围';
    body('bmi','体重指数 BMI',r.bmi!==null,r.bmi===null?'身高：'+display('height',v.height)+'；体重：'+display('weight',v.weight):fmt(r.bmi)+' kg/m²；'+v.weight+' kg / '+v.height+' cm','中国成人：<18.5为体重过低；18.5—<24为正常范围；24—<28为超重；≥28为肥胖。',r.bmi>=18.5&&r.bmi<24?'met':'review',bmiCategory,r.bmi<18.5?'先了解饮食、近期体重变化及身体情况，不把降低体重作为目标。':r.bmi<24?'保持规律饮食和活动，结合腰围与体重变化复看。':'结合腰围、体脂和既往情况商量目标，逐步调整饮食与活动。','weight');
    const waistKnown=has(v.waist)&&has(v.sex),waistPre=v.sex==='male'?85:80,waistCutoff=v.sex==='male'?90:85;
    body('waist','腰围',waistKnown,has(v.waist)?v.waist+' cm'+(!v.sex?'（未选择判定所用性别）':''):'未填','男性85—<90 cm、女性80—<85 cm为中心型肥胖前期；男性≥90 cm、女性≥85 cm达到中心型肥胖参照。',Number(v.waist)>=waistPre?'review':'met',Number(v.waist)>=waistCutoff?'达到中心型肥胖腰围参照':Number(v.waist)>=waistPre?'处于前期腰围范围':'低于前期腰围参照','核对测量位置，并结合BMI和近期变化解释。','weight');
    const bpKnown=has(v.sbp)&&has(v.dbp)&&has(v.bpContext),high=Number(v.sbp)>=180||Number(v.dbp)>=110;
    const above=Number(v.sbp)>=(v.bpContext==='homeAverage'?135:140)||Number(v.dbp)>=(v.bpContext==='homeAverage'?85:90);
    const bpCriterion=v.bpContext==='homeAverage'?'连续5—7天规范家庭测量的平均值，以135/85 mmHg为升高就诊参照。':v.bpContext==='clinic'?'诊室以140/90 mmHg为升高就诊参照；不能凭本页一次记录确诊。':v.bpContext==='home'?'单次家庭读数不直接判定高血压；需要了解规范测量与多次记录。':'先区分诊室、单次家庭与连续家庭平均值，再采用对应参照。';
    body('bp','血压',bpKnown,(v.sbp||'—')+'/'+(v.dbp||'—')+' mmHg'+(v.bpContext?'；'+display('bpContext',v.bpContext):''),bpCriterion,high||v.bpContext!=='home'&&above?'review':'record',high?'读数明显升高':v.bpContext==='home'?'单次读数，仅作记录':above?'达到升高就诊参照':'未达升高就诊参照',high?'安静休息后复测，仍明显升高时及时就医；伴胸痛、呼吸困难等症状时立即就医。':above&&v.bpContext!=='home'?'按规范进一步复核，并结合既往情况和医生的个别目标判断，不自行调整药物。':'保留测量方式与日期，结合连续记录和个别情况复看。','bp');
    for(const [id,label,criterion] of [['glucose','空腹血糖','结合原报告、空腹条件、既往诊断及用药解释，不根据一次检测诊断糖尿病。'],['cholesterol','总胆固醇','需结合LDL-C、其他危险因素与个别目标，不用总胆固醇一项判断健康。']]){
      const known=has(v[id]);add('体格与体检',id,label,display(id,v[id]),criterion,known?'record':'unknown',known?'按原报告核对':'待补资料',known?'保留原报告与检测日期；有疑问时与专业人员核对。':'已有报告时再补充，注意mmol/L单位。');
    }
    add('家庭与社会环境','family','家族史',display('family',v.family),'记录父母或兄弟姐妹的心血管疾病、糖尿病史，不换算为自编遗传风险分。',has(v.family)?'record':'unknown',v.family==='yes'?'有家族史，供综合判断':v.family==='no'?'目前自述未发现':'待补资料',v.family==='yes'?'咨询时说明亲属患病种类与大致年龄；家族史不属于个人做得好或不好。':'不清楚可以留空，以可靠信息为准。');
    add('家庭与社会环境','stress','压力与日常生活',display('stress',v.stress),'根据本人描述了解影响程度，不作为心理量表或疾病诊断。',!v.stress?'unknown':v.stress==='impact'?'review':'record',!v.stress?'待补资料':v.stress==='impact'?'已影响日常生活':'保留本人的感受',v.stress==='impact'?'可以和信任的人、辅导员或校内咨询人员谈谈，了解可用支持。':'记录压力来源及其变化，必要时再作进一步了解。');
    add('家庭与社会环境','support','社会支持',display('support',v.support),'了解有没有可获得的同伴、家庭或学校支持，不把支持不足归结为个人意志。',!v.support?'unknown':v.support==='no'?'review':'record',!v.support?'待补资料':v.support==='no'?'支持暂时不足':'记录现有支持',v.support==='no'?'尝试邀请同伴一起行动，了解学校场地、食堂与健康咨询服务。':'把能提供具体帮助的人或服务写进自己的行动计划。');
    return rows;
  }
  function tableCsv(input,mode='自行填写'){
    const r=analyse(input),cell=value=>{let s=String(value??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
    const rows=[['记录日期','年龄','资料标记','判定所用性别','适用情况','分类','项目','本次资料','参照与依据','本次评价','可以怎样做','来源']];
    evaluationRows(r.values).forEach(x=>rows.push([r.values.recordDate,r.values.age,mode,display('sex',r.values.sex),display('scope',r.values.scope),x.group,x.label,x.value,x.criterion,x.assessment,x.action,x.source?sources[x.source].url:'本次自述或本人报告；不作独立量表计分']));
    return rows.map(row=>row.map(cell).join(',')).join('\r\n');
  }
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
  function renderDiabetes(){
    const r=diabetesRisk(state.values),preview=$('personal-score-preview'),out=$('personal-diabetes-result');
    preview.replaceChildren();out.replaceChildren();$('personal-diabetes-rows').replaceChildren();
    $('personal-diabetes-csv').disabled=r.status!=='complete';
    preview.append(el('h4','糖尿病风险评分'));
    if(r.status==='complete'){
      const score=el('div','','diabetes-total');score.append(el('strong',r.score),el('span','分 / 51'));
      preview.append(score,el('p',r.high?'达到25分筛查切点':'未达到25分筛查切点','diabetes-verdict '+(r.high?'screen':'below')));
      const result=el('div','','diabetes-result-heading'),value=el('div','','diabetes-total');value.append(el('strong',r.score),el('span','分 / 51'));
      const text=el('div');text.append(el('h4',r.high?'达到筛查切点':'未达到筛查切点'),el('p',r.interpretation));result.append(value,text);out.append(result);
      const chart=el('div','','diabetes-scale'),track=el('div','','diabetes-score-track');
      r.items.forEach(item=>{const part=el('span','','diabetes-part '+item.id);part.style.width=item.points/51*100+'%';part.title=item.label+'：'+item.points+'分';track.append(part)});
      const marker=el('span','','diabetes-cutoff');marker.style.left=25/51*100+'%';marker.setAttribute('aria-hidden','true');track.append(marker);
      chart.append(track);const axis=el('div','','diabetes-score-axis');axis.append(el('span','0'),el('span','25分 · 筛查切点','cutoff-label'),el('span','51'));chart.append(axis);chart.setAttribute('role','img');chart.setAttribute('aria-label','糖尿病风险评分'+r.score+'分，范围0至51分，筛查切点25分');out.append(chart);
      out.append(el('p',r.items.map(item=>item.label+' '+item.points).join(' ＋ ')+' ＝ '+r.score+' 分','diabetes-sum'));
      if(state.reference&&state.mode.includes('模拟')===state.referenceMode.includes('模拟')){
        const previous=diabetesRisk(state.reference);
        if(previous.status==='complete')out.append(el('p','保留的那次评分：'+previous.score+'分；本次：'+r.score+'分；变化：'+(r.score-previous.score>0?'+':'')+(r.score-previous.score)+'分。分数差不等于患病概率变化。','help'));
      }
    }else{
      preview.append(el('p',r.status==='outside'?'本次不适用这份筛查评分':'还需补齐评分资料','diabetes-verdict'),el('p',r.interpretation,'help'));
      out.append(el('p',r.interpretation,'diabetes-pending'));
      if(r.status==='incomplete'){
        out.append(el('p','还需要：'+r.missing.map(item=>item.label).join('、')+'。点击下面的项目可回到填写处。','help'));
        const missing=el('div','','diabetes-missing');r.missing.forEach(item=>{const button=el('button','填写'+item.label);button.type='button';button.onclick=()=>{$('personal-'+item.id).focus();$('personal-'+item.id).scrollIntoView({block:'center'})};missing.append(button)});out.append(missing);
      }
    }
    preview.append(el('p','这是糖尿病筛查分值，不是全病种风险或患病百分比。','help'));
    const jump=el('button','查看分项与计分依据');jump.type='button';jump.onclick=()=>{$('personal-diabetes-title').focus();$('personal-diabetes-title').scrollIntoView({block:'start'})};preview.append(jump);
    r.items.forEach(item=>{const row=el('tr');row.dataset.factor=item.id;for(const value of [item.label,item.value,item.band,item.points===null?'—':item.points+' 分'])row.append(el('td',String(value)));$('personal-diabetes-rows').append(row)});
    out.append(el('p','0—51是风险得分范围，51不是“健康满分”。本页不把分值换算成患病概率。','help'));
  }
  function renderReport(){
    for(const id of ['personal-risk-rows','personal-habit-chart','personal-activity-chart','personal-report-plan','personal-diabetes-result','personal-diabetes-rows'])$(id).replaceChildren();
    const ready=!!state.result&&filled(),r=state.result;
    $('personal-report-content').hidden=!ready;$('personal-report-empty').hidden=ready;
    $('personal-csv').disabled=!ready;$('personal-print').disabled=!ready;
    $('personal-report-meta').textContent=ready?[r.values.recordDate?'记录日期：'+r.values.recordDate:'记录日期未填',has(r.values.age)?r.values.age+'岁':'年龄未填',r.values.sex?display('sex',r.values.sex):'判定所用性别未填',display('scope',r.values.scope),'资料来源：'+state.mode].join(' · '):'';
    $('personal-report-empty').textContent=state.result?'填写资料或导入保存的文件后，这里会生成你的评价表。不清楚的项目可以留空，表中会保留“待补资料”。':'请先核对上方输入，评价表暂不显示，以免沿用旧结果。';
    if(!ready){$('personal-diabetes-csv').disabled=true;return}
    renderDiabetes();
    if(!r.applicable)$('personal-habit-chart').append(el('p',r.scopeMessage,'help'));
    else{
      const chart=el('div','','habit-composition'),ring=el('div','','habit-donut');
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 160 160');svg.setAttribute('aria-hidden','true');
      let offset=0;const segments=[['met',r.met,'达到参照'],['review',r.review,'需要留意'],['unknown',r.unknown,'待补资料']];
      for(const [status,count]of segments){if(!count)continue;const c=document.createElementNS(svg.namespaceURI,'circle');for(const [k,v]of Object.entries({cx:80,cy:80,r:62,pathLength:8,fill:'none','stroke-width':18,'stroke-dasharray':count+' '+(8-count),'stroke-dashoffset':-offset,transform:'rotate(-90 80 80)',class:'donut-segment '+status}))c.setAttribute(k,v);svg.append(c);offset+=count}
      ring.setAttribute('role','img');ring.setAttribute('aria-label','8项生活习惯：'+r.met+'项达到参照，'+r.review+'项需要留意，'+r.unknown+'项待补资料');
      const center=el('div','','donut-center');center.append(el('strong',r.met+' / 8'),el('span','项达到参照'));ring.append(svg,center);chart.append(ring);
      const legend=el('div','','composition-legend');segments.forEach(([status,count,label])=>{const row=el('div','','composition-key '+status);row.append(el('span',label),el('strong',count+' 项'));legend.append(row)});chart.append(legend);$('personal-habit-chart').append(chart);
    }
    if(!r.applicable)$('personal-activity-chart').append(el('p','保留活动量记录，暂不套用一般成年人的统一参照。','help'));
    else{
      const previous=state.reference&&state.mode.includes('模拟')===state.referenceMode.includes('模拟')?analyse(state.reference):null;
      const past=previous?.applicable?previous.activity:null,known=[r.activity,past].filter(v=>v!==null),max=Math.ceil(Math.max(300,...known)/50)*50;
      const chart=$('personal-activity-chart');
      for(const [label,value,cls]of [['本次',r.activity,'current'],...(past!==null?[['上次',past,'previous']]:[])]){
        const line=el('div','','activity-row '+cls),heading=el('div','','activity-row-heading');heading.append(el('span',label),el('strong',value===null?'待补两种强度的分钟数':fmt(value)+' 分钟'));line.append(heading);
        const track=el('div','','activity-track'),target=el('span','','activity-target');target.style.left=150/max*100+'%';target.setAttribute('aria-hidden','true');track.append(target);
        if(value!==null){const bar=el('div','','activity-fill');bar.style.width=value/max*100+'%';track.append(bar)}else track.classList.add('missing');line.append(track);chart.append(line);
      }
      const axis=el('div','','activity-axis');axis.append(el('span','0'),el('span',fmt(max)+' 分钟'));chart.append(axis,el('p','竖线：每周150分钟中等强度等效活动的参照。','help'));
    }
    let group='';
    evaluationRows(r.values).forEach(x=>{
      if(x.group!==group){group=x.group;const row=el('tr','','risk-group'),th=el('th',group);th.colSpan=6;th.scope='rowgroup';row.append(th);$('personal-risk-rows').append(row)}
      const row=el('tr','','risk-row '+x.status);row.dataset.factor=x.id;
      const label=el('th',x.label);label.scope='row';row.append(label);
      for(const [key,heading]of [['value','本次资料'],['criterion','参照与依据'],['assessment','本次评价'],['action','可以怎样做']]){const cell=el('td');cell.dataset.label=heading;cell.append(el(key==='assessment'?'span':'div',x[key],key==='assessment'?'risk-status '+x.status:''));row.append(cell)}
      const source=el('td');source.dataset.label='来源';if(x.source){const a=link(x.source);a.textContent='查看原文';a.setAttribute('aria-label',x.label+'：'+sources[x.source].name);source.append(a)}else source.append(el('small','本次自述或本人报告；不作独立量表计分'));row.append(source);$('personal-risk-rows').append(row);
    });
    if(r.values.plan||r.values.reviewDate){$('personal-report-plan').append(el('h4','我的下一步'));if(r.values.plan)$('personal-report-plan').append(el('p',r.values.plan));if(r.values.reviewDate)$('personal-report-plan').append(el('p','计划复评：'+r.values.reviewDate,'help'))}
  }
  function render(){
    const out=$('personal-summary');out.replaceChildren();$('personal-score-preview').replaceChildren();$('personal-measures').replaceChildren();$('personal-next').replaceChildren();$('personal-comparison').replaceChildren();$('personal-print-data').replaceChildren();$('personal-error').textContent='';state.result=null;
    try{
      state.result=analyse(state.values);const r=state.result;
      $('personal-result-title').textContent=filled()?'这次记录的情况':'填写后在这里看结果';
      if(r.applicable){
        out.append(el('h4','生活习惯参照'));
        const band=el('div','','personal-count');band.append(el('strong',r.met+' / 8'),el('span','项习惯达到所列参照'));out.append(band);
        out.append(el('p','已评价'+(8-r.unknown)+'项 · 可再了解或调整'+r.review+'项 · 待补资料'+r.unknown+'项','help'));
        const track=el('div','','habit-track');r.habits.forEach(h=>{const part=el('span','','habit-segment '+h.status);part.title=h.label+'：'+({met:'达到参照',review:'可再调整',unknown:'待补资料'})[h.status];track.append(part)});track.setAttribute('aria-label',r.met+'项达到参照，'+r.review+'项可再调整，'+r.unknown+'项待补资料');out.append(track);
      }else out.append(el('p',r.scopeMessage,'help'));
      out.append(el('p','资料来源：'+state.mode,'help'));
      if(state.mode.includes('模拟'))out.append(el('p','当前是模拟资料，不能写成自己的调查结果。','personal-example-note'));
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
    renderReport();$('personal-save').disabled=!filled()||!state.result;$('personal-reference').disabled=!filled()||!state.result;
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
    const diabetes=diabetesRisk(state.values);lines.push('中国糖尿病风险评分（NCDRS）','适用：中国20—74岁、尚未确诊糖尿病的一般成年人。');
    diabetes.items.forEach(item=>lines.push(item.label+'：'+item.value+'；'+item.band+'；'+(item.points===null?'暂不计分':item.points+'分')));
    lines.push(diabetes.score===null?'总分：暂未计算':'总分：'+diabetes.score+'/51分；筛查切点≥25分',diabetes.interpretation,'分值不是患病概率，不与生活习惯项数合并。','计分依据：'+sources.diabetes.url,'');
    lines.push('生活习惯对照（8项）',r.applicable?'达到参照'+r.met+'项；可再了解或调整'+r.review+'项；待补资料'+r.unknown+'项。':r.scopeMessage,'项数是参照完成记录，不是经验证的量表总分，不代表患病概率。');
    lines.push('','个人危险因素评价表');evaluationRows(r.values).forEach(x=>lines.push(x.group+' / '+x.label+'：'+x.value+'；'+x.assessment+'\n参照：'+x.criterion+'\n可以怎样做：'+x.action+'\n来源：'+(x.source?sources[x.source].url:'本次自述或本人报告；不作独立量表计分')));
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
    const jump=()=>{$('personal-report-title').focus();$('personal-report-title').scrollIntoView({block:'start'})};
    $('personal-jump').onclick=jump;const review=el('button','生成 / 查看个人评价表','primary');review.type='button';review.onclick=jump;$('personal-form').append(review);
    $('personal-edit').onclick=()=>{$('personal-form').scrollIntoView({block:'start'});$('personal-recordDate').focus({preventScroll:true})};
    $('personal-csv').onclick=()=>{if(!state.result||!filled())return;download(tableCsv(state.values,state.mode),'个人危险因素评价表.csv','text/csv');$('personal-status').textContent='已下载本次评价表，内容与页面上的逐项结果一致。'};
    $('personal-diabetes-csv').onclick=()=>{if(!state.result)return;download(diabetesCsv(state.values,state.mode),'中国糖尿病风险评分表.csv','text/csv');$('personal-status').textContent='已下载6项指标、分值、总分及解释，附有原研究网址。'};
    $('personal-print').onclick=()=>{document.body.classList.add('printing-personal-report');root.print()};
    root.addEventListener('afterprint',()=>document.body.classList.remove('printing-personal-report'));
    Object.keys(sources).forEach(k=>{const li=el('li');li.append(link(k));$('personal-sources').append(li)});
    for(const text of ['年龄（岁）：20—24＝0；25—34＝4；35—39＝8；40—44＝11；45—49＝12；50—54＝13；55—59＝15；60—64＝16；65—74＝18。','性别：女＝0；男＝2。','BMI（kg/m²）：<22＝0；22—<24＝1；24—<30＝3；≥30＝5。','腰围（cm），男/女：<75/<70＝0；75—<80/70—<75＝3；80—<85/75—<80＝5；85—<90/80—<85＝7；90—<95/85—<90＝8；≥95/≥90＝10。','收缩压（mmHg）：<110＝0；110—<120＝1；120—<130＝3；130—<140＝6；140—<150＝7；150—<160＝8；≥160＝10。','一级亲属糖尿病史：无＝0；有＝6。6项分值相加，总分0—51，筛查切点≥25分。'])$('personal-diabetes-rules').append(el('p',text,'help'));
    $('hra-personal-tab').onclick=()=>setView('personal');$('hra-example-tab').onclick=()=>setView('classroom');
    $('personal-save').onclick=()=>{if(!state.result)return;download(JSON.stringify({kind:'social-medicine-personal-hra',version:1,values:state.values,reference:state.reference,mode:state.mode,referenceMode:state.referenceMode},null,2),'个人健康资料.json','application/json');$('personal-status').textContent='已保存为资料文件。下次导入可继续填写，对照记录也一并保留。'};
    $('personal-import').onchange=async()=>{
      const input=$('personal-import'),file=input.files?.[0];if(!file)return;
      try{if(file.size>100000)throw Error('文件过大，请选择从本页保存的个人资料文件');const data=validateSnapshot(JSON.parse((await file.text()).replace(/^\uFEFF/,'')));if(!confirmReplace())return;state.mode=data.mode;state.reference=data.reference;state.referenceMode=data.referenceMode;apply(data.values);$('personal-status').textContent='已恢复保存的资料，可接着填写。'}catch(e){$('personal-status').textContent='没有导入，当前资料保留。'+(e instanceof SyntaxError?'文件不是有效的JSON。':e.message)}finally{input.value=''}
    };
    $('personal-clear').onclick=()=>{if((filled()||state.reference)&&!root.confirm('清空当前资料和临时对照？需要保留的话，请先保存。'))return;state.reference=null;state.referenceMode=null;state.mode='自行填写';apply(blank());$('personal-status').textContent='已清空，可以重新填写。'};
    $('personal-demo').onclick=()=>{if(!confirmReplace())return;state.mode='模拟资料';state.reference=null;state.referenceMode=null;apply({...blank(),age:'21',scope:'general',sex:'male',height:'172',weight:'68',waist:'82',diabetesHistory:'no',diabetesFamily:'no',bpContext:'clinic',sbp:'120',dbp:'78',moderate:'60',vigorous:'0',strength:'1',sleep:'6',sitting:'9',fruitveg:'250',alcohol:'0',smoke:'never',secondhand:'2',family:'no',stress:'some',support:'yes'});$('personal-status').textContent='已载入虚构的模拟资料，糖尿病风险评分为11分；食盐和血糖、血脂仍留空。请不要当作本人的结果。'};
    $('personal-reference').onclick=()=>{if(!state.result)return;if(state.reference&&!root.confirm('替换之前保留的对照记录吗？'))return;state.reference={...state.values};state.referenceMode=state.mode;render();$('personal-status').textContent='已保留本次资料。修改当前填写后，可以比较两次都有资料的项目；保存文件会同时保存这次对照。'};
    $('personal-unreference').onclick=()=>{state.reference=null;state.referenceMode=null;render()};
    render();setView('personal');
  }
  const api={sources,groups,fields,blank,validate,analyse,evaluationRows,tableCsv,diabetesRisk,diabetesCsv,validateSnapshot,init,report,get view(){return state.view},get ready(){return !!state.result&&filled()}};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PersonalHra=api;
})(typeof window!=='undefined'?window:globalThis);
