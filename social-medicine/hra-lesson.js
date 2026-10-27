(function(root){
  'use strict';
  const calc=typeof module!=='undefined'&&module.exports?require('./calc.js'):root.SocialMed;
  const course=typeof module!=='undefined'&&module.exports?require('./course-data.js'):root.CourseData;
  const source='课堂补充表12-1（第150—151页）、表12-2（第153页）、表12-3（第154页）；课程课件第163—174页；李鲁《社会医学》第5版第137页（肺癌：男性40—44岁、每天20支）。';
  const choose=(id,label,options,hint='')=>({id,label,options,hint});
  const num=(id,label,min,max,unit,hint='')=>({id,label,min,max,unit,hint});
  const fields=[
    num('sbp','收缩压',0,400,'按所选单位','高压、低压都可记录，计算时只使用上方选中的一项。'),
    num('dbp','舒张压',0,250,'按上方血压单位'),
    num('cholesterol','胆固醇',0,1000,'mg/dl','请先确认检验单单位；这里使用mg/dl。'),
    choose('diabetes','糖尿病史',[['none','无'],['controlled','有，已控制'],['yes','有'],['other','其他或待核对']]),
    choose('activity','体力活动',[['sedentary','坐着工作和娱乐'],['some','有些活动的工作'],['moderate','中度锻炼'],['vigorous','较强度锻炼'],['regular','坐着工作，有定期锻炼'],['otherRegular','其他工作，有定期锻炼'],['other','其他或待核对']]),
    choose('chdFamily','冠心病家族史',[['none','无（表12-1给定0.9）'],['old','父母健在，均已满60岁'],['young','父母健在，未满60岁'],['one','父母之一60岁以前死于冠心病'],['both','父母二人60岁以前死于冠心病'],['other','其他或待核对']]),
    choose('smoke','吸烟',[['never','不吸烟'],['twenty','每天20支（教材正文示例）'],['heavy','每天不少于10支（未具体到20支）'],['light','每天少于10支'],['pipe','雪茄或烟斗'],['recentQuit','戒烟不足10年'],['longQuit','戒烟10年以上'],['other','其他或待核对']],'第5版第137页补有每天20支时的肺癌分数1.9；其他吸烟情况须分别查相应死因的分数。'),
    choose('weightBasis','体重状况',[['percent','填写超重百分比'],['le10','超重10%以下（表12-2分类）'],['average','降到平均体重（原题条件）'],['other','其他或待核对']],'按教材中的超重百分比填写，和BMI不是同一个指标。'),
    num('excess','超重百分比',0,300,'%','只在体重状况选择“填写超重百分比”时使用。例如超重30%填30。'),
    choose('alcohol','饮酒',[['none','不饮酒'],['yes','饮酒'],['other','其他情况，需相应死因的分数']]),
    num('mileage','每年驾车里程',0,1000000,'km/年','例题中25000 km/年对应2.5；其他里程需要补充转换依据。'),
    num('seatbelt','安全带使用比例',0,100,'%','表12-1的90%与改善后的100%均给定0.8，工具按原表保留。'),
    choose('depression','抑郁状况（原题分类）',[['frequent','经常（原题给定2.5）'],['treated','治疗抑郁（原题给定1.5）'],['other','其他情况，需补充分数']],'这是课堂变量，不是抑郁症筛查量表。'),
    choose('suicideFamily','自杀相关家族史',[['none','无'],['yes','有'],['other','其他或待核对']]),
    choose('murmur','心脏杂音',[['none','无'],['yes','有'],['other','其他或待核对']]),
    choose('rheumatic','风湿热',[['none','无'],['yes','有'],['other','其他或待核对']]),
    choose('symptoms','风湿性心脏病相关症状体征',[['none','无'],['yes','有'],['other','其他或待核对']]),
    choose('emphysema','肺气肿',[['none','无'],['yes','有'],['other','其他或待核对']]),
    choose('polyps','肠息肉',[['none','无'],['yes','有'],['other','其他或待核对']]),
    choose('bleeding','肛门出血',[['none','无'],['yes','有'],['other','其他或待核对']]),
    choose('colitis','肠炎',[['none','无'],['yes','有'],['other','其他或待核对']]),
    choose('proctoscopy','直肠镜检查（原题条件）',[['none','无'],['annual','每年检查一次（原题给定0.3）'],['other','其他或待核对']],'仅复现课堂历史题设，不作为现实筛查建议。'),
    choose('xray','结核相关X线检查',[['negative','阴性'],['positive','阳性'],['other','其他或待核对']]),
    choose('tb','结核活动',[['none','无'],['yes','有'],['other','其他或待核对']]),
    choose('social','经济和社会地位',[['middle','中等（原题条件）'],['other','其他或待核对']])
  ];
  const byId=Object.fromEntries(fields.map(f=>[f.id,f]));
  const literature=[
    {key:'qin2002',causes:[2],factors:['suicideFamily'],title:'家族自杀史：父母或兄弟姐妹',citation:'Qin P, Agerbo E, Mortensen PB. Lancet. 2002;360:1126–1130.',url:'https://pubmed.ncbi.nlm.nih.gov/12387960/',doi:'10.1016/S0140-6736(02)11197-4',population:'丹麦登记资料；9—45岁，4262名自杀死亡者与80238名匹配对照。',outcome:'自杀死亡',condition:'父母或兄弟姐妹有自杀死亡史。',estimates:[{label:'家族自杀史',metric:'OR',value:2.58,low:1.84,high:3.61}],compatible:false,reason:'这是与无该家族史者相比的OR，不是以课堂同龄男性平均死亡危险为参照的r。'},
    {key:'tidemalm2011',causes:[2],factors:['suicideFamily'],title:'家族史要区分亲属关系',citation:'Tidemalm D, et al. Psychological Medicine. 2011;41:2527–2534.',url:'https://pubmed.ncbi.nlm.nih.gov/21733212/',doi:'10.1017/S0033291711000833',population:'瑞典全人口登记，涉及1140万人；1952—2003年自杀死亡者的亲属与人群对照比较。',outcome:'亲属的自杀死亡',condition:'原文分别估计同胞、子女等关系，并非所有家族史共用一个值。',estimates:[{label:'亲兄弟姐妹',metric:'OR',value:3.1,low:2.8,high:3.5},{label:'子女',metric:'OR',value:2,low:1.9,high:2.2}],compatible:false,reason:'亲属类别与参照组均有明确限定，不能直接代替“家族史：有”的课堂r。'},
    {key:'olen2020',causes:[8],factors:['colitis'],title:'溃疡性结肠炎与结直肠癌',citation:'Olén O, et al. Lancet. 2020;395:123–131.',url:'https://pubmed.ncbi.nlm.nih.gov/31929014/',doi:'10.1016/S0140-6736(19)32545-0',population:'丹麦与瑞典，96447名溃疡性结肠炎患者与949207名匹配参照者；1969—2017年。',outcome:'分别报告结直肠癌发病与死亡',condition:'确诊溃疡性结肠炎；不适用于一般急性肠炎。',estimates:[{label:'结直肠癌死亡',metric:'HR',value:1.59,low:1.46,high:1.72},{label:'结直肠癌发病',metric:'HR',value:1.66,low:1.57,high:1.76}],compatible:false,reason:'虽包含死亡结局，但仍是另一人群、另一参照组的HR，尚未换算成课堂模型的标准化r。'},
    {key:'he2020',causes:[8],factors:['polyps'],title:'息肉的大小和病理类型会改变结果',citation:'He X, et al. Gastroenterology. 2020;158:852–861.e4.',url:'https://pubmed.ncbi.nlm.nih.gov/31302144/',doi:'10.1053/j.gastro.2019.06.039',population:'美国三个人群队列，122899名接受下消化道内镜的参与者；中位随访10年。',outcome:'息肉切除后的结直肠癌发病',condition:'进展期腺瘤：≥10 mm、高级别异型增生或绒毛成分；大锯齿状息肉：≥10 mm。',estimates:[{label:'进展期腺瘤',metric:'HR',value:4.07,low:2.89,high:5.72},{label:'大锯齿状息肉',metric:'HR',value:3.35,low:1.37,high:8.15},{label:'非进展期腺瘤',metric:'HR',value:1.21,low:.68,high:2.16}],compatible:false,reason:'结局是发病，且病变已切除；不能作为“有肠息肉”的统一死亡危险分数。'},
    {key:'rectal2006',causes:[8],factors:['bleeding'],title:'直肠出血：这里报告的是诊断预测值',citation:'Risk in primary care of colorectal cancer from new onset rectal bleeding: 10 year prospective study. BMJ. 2006;333:69–70.',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC1489264/',doi:'10.1136/bmj.38846.684850.2F',population:'英国全科前瞻性观察；≥45岁，265名报告新发直肠出血的就诊者。',outcome:'新发直肠出血就诊者检出结直肠癌的概率',condition:'新近出现直肠出血并到全科就诊；不等同于一般人群的死亡风险。',estimates:[{label:'阳性预测值',metric:'PPV',value:5.7,low:3.2,high:9.2}],compatible:false,reason:'5.7%是阳性预测值，不是RR、HR或r；不能填成5.7或0.057去计算总死亡危险。'},
    {key:'colak2017',causes:[7],factors:['emphysema'],title:'慢阻肺与肺炎：有无症状分开估计',citation:'Çolak Y, et al. Lancet Respiratory Medicine. 2017;5:426–434.',url:'https://pubmed.ncbi.nlm.nih.gov/28389225/',doi:'10.1016/S2213-2600(17)30119-4',population:'丹麦普通人群前瞻性队列，筛查95288人；对符合肺功能标准而未诊断的慢阻肺者进行随访。',outcome:'肺炎发病，按年龄和性别调整',condition:'肺功能标准定义的未诊断慢阻肺；有症状和无症状分别分析，不等同于单纯“肺气肿：有”。',estimates:[{label:'无症状、未诊断慢阻肺',metric:'HR',value:1.7,low:1.3,high:2.2},{label:'有症状、未诊断慢阻肺',metric:'HR',value:2.8,low:2.4,high:3.3}],compatible:false,reason:'研究对象与课堂变量不完全相同，且结局是肺炎发病，不是肺炎死亡。'},
    {key:'inactiveTB2025',causes:[10],factors:['xray'],title:'胸片非活动性结核病灶与后续发病',citation:'Association of inactive pulmonary tuberculosis lesions with the risk of active disease development in the elderly: a population-based retrospective study. ERJ Open Research. 2025.',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12278313/',doi:'10.1183/23120541.01231-2024',population:'中国老年人群，154028人，年龄≥65岁，随访2年。',outcome:'后续微生物学确诊的活动性肺结核',condition:'胸片提示非活动性肺结核病灶，与胸片正常者比较；不是所有胸片“阳性”共用这个值。',estimates:[{label:'非活动性结核病灶',metric:'aHR',value:6,low:4.85,high:7.43}],compatible:false,reason:'这是≥65岁人群的发病HR，不能配给40—44岁男性的课堂肺结核死亡基准率。'},
    {key:'brown1983',causes:[6,8],factors:['murmur','rheumatic','symptoms','colitis'],title:'早期HRA原始分类：有些项目需要进一步细分',citation:'Brown RL, Brown KS. Toward Computerized Underwriting—A Biological Age Model. Transactions of Society of Actuaries. 1983;35:393–416. 附录第410页。',url:'https://www.soa.org/globalassets/assets/library/research/transactions-of-society-of-actuaries/1983/january/tsa83v3514.pdf',doi:'',population:'早期HRA问卷的因素编码及方法资料。',outcome:'变量分类；该附录不是危险分数表',condition:'区分风湿性杂音、是否接受预防用药、风湿热史及有无杂音；溃疡性结肠炎区分病程不足10年和≥10年。',estimates:[],compatible:false,reason:'附录中的1、2、3等是选项编码，不是r。一般心脏杂音、风湿热史或普通肠炎不能据此直接赋一个阳性分数。'}
  ];
  const evidenceFor=(cause,id)=>literature.filter(item=>item.causes.includes(cause)&&item.factors.includes(id));
  const groups=[['血压、血脂与糖尿病史',['sbp','dbp','cholesterol','diabetes']],['活动、家族史与体重',['activity','chdFamily','smoke','weightBasis','excess']],['出行、饮酒与抑郁状况',['alcohol','mileage','seatbelt','depression','suicideFamily']],['其他疾病相关因素',['murmur','rheumatic','symptoms','emphysema','polyps','bleeding','colitis','proctoscopy','xray','tb','social']]];
  const bindings=[
    ['sbp','cholesterol','diabetes','activity','chdFamily','smoke','weightBasis'],
    ['alcohol','mileage','seatbelt'],['depression','suicideFamily'],['alcohol'],
    ['sbp','cholesterol','diabetes','smoke'],['smoke'],['murmur','rheumatic','symptoms'],
    ['alcohol','emphysema','smoke'],['polyps','bleeding','colitis','proctoscopy'],['sbp','weightBasis'],['xray','tb'],['social']
  ];
  const clean=()=>Object.fromEntries(fields.map(f=>[f.id,'']));
  function blank(){return{kind:'social-medicine-classroom-hra',version:1,age:'41',sex:'male',bpUnit:'mmHg',bpIndicator:'sbp',policy:'table',roundFirst:true,mode:'自行填写的课堂练习',before:clean(),after:clean(),overrides:{},drafts:{}}}
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
        else if(!Number.isFinite(Number(v))||Number(v)<f.min||Number(v)>f.max)throw Error(f.label+'请填'+f.min+'—'+f.max+'之间的数值');s[phase][f.id]=f.options?v:String(Number(v));
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
    if(raw.drafts!==undefined){
      if(!raw.drafts||typeof raw.drafts!=='object'||Array.isArray(raw.drafts))throw Error('系数草稿格式不正确');
      for(const [key,value]of Object.entries(raw.drafts)){
        const match=key.match(/^(\d+)-(\d+)$/);if(!match||!bindings[+match[1]]?.[+match[2]])throw Error('不认识的草稿项目：'+key);
        if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['before','after','source'].includes(k)))throw Error('系数草稿格式不正确');
        const draft={before:'',after:'',source:''};for(const part of ['before','after','source']){const v=value[part]??'';if(typeof v!=='string'||v.length>(part==='source'?500:64))throw Error('系数草稿内容过长或格式不正确');draft[part]=v}s.drafts[key]=draft;
      }
    }
    return s;
  }
  function applyCoefficient(raw,key,entry){
    if((has(entry.before)||has(entry.after))&&!String(entry.source||'').trim())throw Error('请先填写这项系数的来源，原结果已保留。');
    const next={...raw,overrides:{...raw.overrides,[key]:entry},drafts:{...raw.drafts}};delete next.drafts[key];return validate(next);
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
      const map={diabetes:{none:1,controlled:2.5,yes:3},activity:{sedentary:2.5,some:1,moderate:.6,vigorous:.5,regular:1,otherRegular:.5},chdFamily:{none:.9,old:.9,young:1,one:1.2,both:1.4},smoke:{never:.5,twenty:1.5,heavy:1.5,light:1.1,pipe:1,recentQuit:.7,longQuit:.5}};
      if(Object.hasOwn(map[id]||{},v[id]))return{score:map[id][v[id]],note:(id==='chdFamily'&&v[id]==='none'?'表12-1给定':'表12-2分类')+'：'+observed(s,v,id)+' → '+map[id][v[id]]};return unknown;
    }
    if(cause===5&&v.smoke==='twenty')return{score:1.9,note:'李鲁《社会医学》第5版第137页（PDF第161页）：男性40—44岁，每天吸烟20支，肺癌r＝R＝1.9'};
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
    const beforeComplete=applicable&&rows.every(r=>r.before),afterComplete=applicable&&rows.every(r=>r.after),complete=beforeComplete&&afterComplete;
    const b=beforeComplete?rows.reduce((sum,r)=>sum+r.before.d,0):null,a=afterComplete?rows.reduce((sum,r)=>sum+r.after.d,0):null;
    rows.forEach(r=>r.contribution=beforeComplete&&b>0&&r.delta!==null?r.delta/b*100:null);
    const beforeAge=beforeComplete?ageLookup(b,s.age):null,afterAge=afterComplete?ageLookup(a,s.age):null;
    return{state:s,rows,pending,applicable,beforeComplete,afterComplete,complete,before:b,after:a,delta:complete?b-a:null,percent:complete&&b>0?(b-a)/b*100:null,beforeAge,afterAge,finished:rows.filter(r=>r.before&&r.after).length};
  }
  function csv(raw){
    const r=analyse(raw);if(Object.keys(r.state.drafts).length)throw Error('还有系数草稿未应用，请先应用或放弃草稿。');if(!r.complete)throw Error('请补齐变量和必要系数，并核对男性40—44岁参数适用条件。');
    const quote=v=>{let text=typeof v==='number'?String(Number(v.toPrecision(14))):String(v??'');if(typeof v==='string'&&/^[=+\-@\t\r]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"'};
    const data=[['(1)死亡原因','(2)死亡概率/10万','(3)疾病诱发因素','(4)指标值','(5)危险分数','(6)组合危险分数','(7)存在死亡危险/10万','(8)改变危险因素','(9)新危险分数','(10)新组合危险分数','(11)新存在死亡危险/10万','(12)降低量/10万','(13)占原总危险百分比','当前分数来源','改善后分数来源','计算口径','资料标记']];
    for(const row of r.rows)row.factors.forEach((f,i)=>data.push([i===0?row.name:'',i===0?row.baseline:'',f.name,f.beforeValue,f.before,i===0?row.before.applied:'',i===0?row.before.d:'',f.afterChange,f.after,i===0?row.after.applied:'',i===0?row.after.d:'',i===0?row.delta:'',i===0?row.contribution:'',f.beforeNote,f.afterNote,r.state.policy==='given'?'优先采用表12-1给定值':'冠心病按表12-2内插',r.state.mode]));
    data.push(['合计',5560,'','','','',r.before,'','','',r.after,r.delta,r.percent,'','',r.state.policy,r.state.mode]);
    data.push(['实际年龄',r.state.age,'评价年龄',r.beforeAge?.age??'超出参照范围','增长年龄',r.afterAge?.age??'超出参照范围','年龄列',Number(r.state.age)%5,'来源',source]);
    return data.map(row=>[...row,...Array(Math.max(0,data[0].length-row.length)).fill('')].map(quote).join(',')).join('\r\n');
  }
  function report(raw){
    const r=analyse(raw);if(Object.keys(r.state.drafts).length)throw Error('还有系数草稿未应用，请先应用或放弃草稿。');if(!r.complete)throw Error('表12-1尚未全部算完，请核对待补项目。');
    const lines=['健康危险因素评价 · 课堂表12-1至12-3','资料标记：'+r.state.mode,'参数组：男性40—44岁；实际年龄：'+r.state.age,'计算口径：'+(r.state.policy==='given'?'优先采用表12-1给定值':'冠心病按表12-2内插')+'；'+(r.state.roundFirst?'R先保留2位':'R使用完整精度'),''];
    r.rows.forEach(row=>{lines.push(row.name+'（基准率'+row.baseline+'/10万）');row.factors.forEach(f=>lines.push(f.name+'：'+f.beforeValue+' → r='+f.before+'；改善后'+f.afterValue+' → r='+f.after+'\n依据：'+f.beforeNote+'；'+f.afterNote));
      for(const [title,value]of [['当前',row.before],['改善后',row.after]])lines.push(title+'：X='+fmt(value.x,6)+'；Y='+fmt(value.y,6)+'；R='+fmt(value.r,6)+'；采用R='+fmt(value.applied,6)+'；D='+value.m+'×'+fmt(value.applied,6)+'='+fmt(value.d,6)+' /10万');lines.push('降低量：'+fmt(row.delta,6)+'；占原总危险：'+fmt(row.contribution,6)+'%','');
    });
    lines.push('总危险：'+fmt(r.before,6)+' → '+fmt(r.after,6)+' /10万','降低量：'+fmt(r.delta,6)+'；总危险变化：'+riskChange(r.before,r.after).description,'实际年龄：'+r.state.age+'；评价年龄：'+(r.beforeAge?fmt(r.beforeAge.age,6):'超出表内区段')+'；增长年龄：'+(r.afterAge?fmt(r.afterAge.age,6):'超出表内区段'),'评价年龄与增长年龄是风险对应年龄，不是预计寿命或延寿年数。','来源：'+source,'课堂历史参数演算，不作为现实诊断、死亡概率预测或筛查安排。');return lines.join('\n');
  }
  let state=blank(),result=null,document,notify=()=>{},save;
  const $=id=>document.getElementById(id),el=(tag,text='',cls='')=>{const node=document.createElement(tag);node.textContent=text;if(cls)node.className=cls;return node};
  const policyLabel=s=>s.policy==='given'?'沿用表12-1给定分数':'冠心病按表12-2内插';
  function changeBadge(change){const badge=el('span','','lesson-change '+change.direction);badge.setAttribute('aria-label',change.description);badge.title=change.description;const arrow=el('span',change.arrow,'lesson-change-arrow');arrow.setAttribute('aria-hidden','true');badge.append(arrow,el('span',change.label));return badge}
  function changed(){if(state.mode==='课堂表12-1算例')state.mode='修改后的课堂算例';$('lesson-status').textContent='填写内容已更新，尚未下载保存。'}
  const sameValue=(id,a,b)=>!byId[id]?.options&&has(a)&&has(b)&&Number.isFinite(Number(a))&&Number.isFinite(Number(b))?Number(a)===Number(b):a===b;
  function clearAffected(previous,next,id){
    for(let ci=0;ci<bindings.length;ci++)for(let fi=0;fi<bindings[ci].length;fi++){
      const factorId=bindings[ci][fi];if(!deps(next,factorId).includes(id))continue;
      const key=ci+'-'+fi;
      for(const store of ['overrides','drafts']){
        const entry=previous[store]?.[key];if(!entry)continue;const updated={...entry};
        for(const phase of ['before','after']){
          const oldValues=effective(previous,phase),newValues=effective(next,phase);
          const keys=factorId==='weightBasis'&&oldValues.weightBasis!=='percent'&&newValues.weightBasis!=='percent'?['weightBasis']:deps(next,factorId);
          if(keys.some(k=>!sameValue(k,oldValues[k],newValues[k])))updated[phase]='';
        }
        if(has(updated.before)||has(updated.after))next[store][key]=updated;else delete next[store][key];
      }
    }
  }
  function setVariable(s,phase,id,value){
    if(!['before','after'].includes(phase)||!byId[id])throw Error('不认识的填写项目');
    if(sameValue(id,s[phase][id],value))return s;
    const next={...s,[phase]:{...s[phase],[id]:value},overrides:{...s.overrides},drafts:{...s.drafts}};
    clearAffected(s,next,id);return next;
  }
  function inputField(f,phase){
    const input=el(f.options?'select':'input');input.id='lesson-'+phase+'-'+f.id;input.setAttribute('aria-label',(phase==='before'?'当前 ':'改善后 ')+f.label);
    if(f.options){const empty=el('option',phase==='after'?'保持当前':'请选择 / 暂不填');empty.value='';input.append(empty);f.options.forEach(([value,label])=>{const option=el('option',label);option.value=value;input.append(option)})}
    else{input.type='number';input.min=f.min;input.max=f.max;input.step='any';input.inputMode='decimal';if(phase==='after')input.placeholder='留空＝保持当前'}
    input.value=state[phase][f.id];input.addEventListener('input',()=>{state=setVariable(state,phase,f.id,input.value);changed();render()});return input;
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
  function syncActions(){
    const draftCount=Object.keys(state.drafts||{}).length,ready=!!result?.complete&&!draftCount;
    for(const id of ['lesson-csv','lesson-print']){$(id).disabled=!ready;$(id).title=draftCount?'请先应用或放弃系数草稿':''}
    $('lesson-save').disabled=!result;notify();
  }
  function focusPending(p){
    const id=bindings[p.cause][p.factor],isEmpty=/未填/.test(p.note);
    if(isEmpty){
      let targetId=id==='sbp'?state.bpIndicator:id;
      if(id==='weightBasis'&&state.before.weightBasis==='percent')targetId='excess';
      const phase=has(state.before[targetId])?p.phase:'before',target=$('lesson-'+phase+'-'+targetId);
      if(target){target.scrollIntoView({block:'center'});target.focus();return}
    }
    $('lesson-conversion').open=true;
    const cause=$('lesson-factor-details').querySelector('[data-cause="'+p.cause+'"]');cause.open=true;
    const manual=cause.querySelector('[data-factor="'+p.cause+'-'+p.factor+'"]');manual.open=true;
    const evidence=cause.querySelector('[data-evidence="'+p.cause+'-'+p.factor+'"]');if(evidence)evidence.open=true;
    (evidence||manual).scrollIntoView({block:'center'});manual.querySelector('[data-phase="'+p.phase+'"]').focus({preventScroll:true});
  }
  function render(){
    result=null;for(const id of ['lesson-metrics','lesson-summary-rows','lesson-full-rows','lesson-ages','lesson-pending','lesson-risk-chart'])$(id).replaceChildren();$('lesson-error').textContent='';
    try{result=analyse(state)}catch(e){$('lesson-error').textContent=e.message}
    const r=result,complete=!!r?.complete;
    const modeName={'课堂表12-1算例':'课堂例题','修改后的课堂算例':'已修改的课堂例题','自行填写的课堂练习':'自行填写'}[state.mode]||state.mode;
    $('lesson-mode').textContent=r?modeName+'；'+policyLabel(state)+'，'+(state.roundFirst?'组合分数保留2位小数。':'组合分数不提前取整。'):'';
    if(!r){$('lesson-progress').textContent='请先修正上面的输入。已填资料和系数草稿仍保留。';$('lesson-age-note').textContent='';$('lesson-factor-details').replaceChildren();for(const row of $('lesson-age-rows').children)row.classList.remove('current','after');syncActions();return}
    const currentCount=r.rows.filter(row=>row.before).length,afterCount=r.rows.filter(row=>row.after).length,draftCount=Object.keys(state.drafts||{}).length;
    $('lesson-progress').textContent='当前已完成 '+currentCount+' / 12 项；改善后已完成 '+afterCount+' / 12 项。'+(draftCount?'还有'+draftCount+'项系数草稿未应用。':complete?'可以导出完整表格。':'两边分别计算，已完成的结果会保留。');
    if(!r.applicable)$('lesson-pending').append(el('p','这组参数适用于男性40—44岁。其他人群需要对应的基准率和转换表。','lesson-waiting'));
    if(r.pending.length){
      const entries=new Map();for(const p of r.pending){const key=p.cause+'-'+p.factor;if(!entries.has(key))entries.set(key,{...p,phases:[]});entries.get(key).phases.push(p.phase==='before'?'当前':'改善后')}
      const list=el('details','','lesson-pending-list');list.open=entries.size<=4;list.append(el('summary','还有'+entries.size+'项需要补充'));
      for(const p of entries.values()){const row=el('div','','lesson-pending-item');row.append(el('span',p.label+'（'+p.phases.join('、')+'）'));const button=el('button',/未填/.test(p.note)?'去填写':evidenceFor(p.cause,bindings[p.cause][p.factor]).length?'查看文献 / 补充分数':'补充系数');button.type='button';button.setAttribute('aria-label',p.label+' '+button.textContent);button.onclick=()=>focusPending(p);row.append(button);list.append(row)}$('lesson-pending').append(list);
    }
    if(r.beforeComplete||r.afterComplete){
      const changeLabel=r.delta!==null&&r.delta<0?'增加量':'减少量';
      for(const [label,value]of [['当前总危险',r.before],['改善后总危险',r.after],[changeLabel,r.delta===null?null:Math.abs(r.delta)]]){const card=el('div','','metric');card.append(el('span',label),el('strong',value===null?'待补资料':fmt(value,2)),el('small',value===null?'补齐对应阶段后显示':'/10万'));$('lesson-metrics').append(card)}
      const card=el('div','','metric lesson-total-change'),change=complete?riskChange(r.before,r.after):null;card.append(el('span','总危险变化'),change?changeBadge(change):el('strong','待补资料'),el('small',change?(change.percent===null?change.description:'与当前总危险相比'):'两阶段齐全后比较'));$('lesson-metrics').append(card);
    }
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
    const known=r.rows.flatMap(row=>[row.before?.d,row.after?.d]).filter(Number.isFinite);
    if(known.length){
      const max=Math.max(1,...known);r.rows.forEach(row=>{
        const line=el('div','','lesson-bar-row');line.append(el('span',row.name,'lesson-bar-label'));
        for(const [phase,label]of [['before','当前'],['after','改善后']]){const track=el('div','','lesson-bar-track '+phase);if(row[phase]){const bar=el('span','','lesson-bar-fill');bar.style.width=row[phase].d/max*100+'%';track.append(bar);track.setAttribute('aria-label',row.name+' '+label+' '+fmt(row[phase].d,2)+' /10万')}else{track.classList.add('pending');track.setAttribute('aria-label',row.name+' '+label+'待补资料')}line.append(track)}
        const stats=el('div','','lesson-bar-stats'),change=row.before&&row.after?riskChange(row.before.d,row.after.d):null;stats.append(change?changeBadge(change):el('span','待补资料','lesson-change pending'),el('small',(row.before?fmt(row.before.d,2):'—')+' → '+(row.after?fmt(row.after.d,2):'—')));line.append(stats);$('lesson-risk-chart').append(line);
      });$('lesson-risk-chart').append(el('p','横轴单位：/10万；各项使用相同刻度。'+(complete?'':'虚线表示资料未齐，未计作0。'),'help'));
    }else $('lesson-risk-chart').append(el('p','填完资料后，这里会显示各项改善前后的变化。','help'));
    if(r.beforeComplete||r.afterComplete){
      for(const [label,value,ready]of [['实际年龄',+state.age,true],['评价年龄',r.beforeAge?.age,r.beforeComplete],['增长年龄',r.afterAge?.age,r.afterComplete]]){const row=el('div','','age-row');row.append(el('span',label),el('strong',!ready?'待补资料':value===undefined?'超出表内区段':fmt(value,2)+' 岁'));$('lesson-ages').append(row)}
      const explain=(name,value,a,ready)=>!ready?name+'：对应阶段的资料尚未齐全。':!a?name+'：超出表内1600—61640的参照范围，不外推。':name+'：'+fmt(value,2)+'位于'+a.low[0]+'（'+a.low[1]+'岁）与'+a.high[0]+'（'+a.high[1]+'岁）之间，内插得'+fmt(a.age,6)+'岁。';
      $('lesson-age-note').textContent='实际年龄末位'+(+state.age%10)+'，使用表12-3的'+(+state.age%5)+' / '+(+state.age%5+5)+'列。\n'+explain('评价年龄',r.before,r.beforeAge,r.beforeComplete)+'\n'+explain('增长年龄',r.after,r.afterAge,r.afterComplete);
    }else $('lesson-age-note').textContent='当前和改善后的资料分别齐全后，各自查表12-3计算年龄。';
    for(const row of $('lesson-age-rows').children){row.classList.remove('current','after');const risk=Number(row.dataset.risk);if(r.beforeAge&&(risk===r.beforeAge.low[0]||risk===r.beforeAge.high[0]))row.classList.add('current');if(r.afterAge&&(risk===r.afterAge.low[0]||risk===r.afterAge.high[0]))row.classList.add('after');row.children[1].textContent=String(Number(row.dataset.base)+(+state.age%5||0))}
    renderConversions();syncActions();
  }
  function renderConversions(){
    const host=$('lesson-factor-details'),open=new Set([...host.children].filter(n=>n.open).map(n=>n.dataset.cause)),manualOpen=new Set([...host.querySelectorAll('.lesson-manual[open]')].map(n=>n.dataset.factor));host.replaceChildren();if(!result)return;
    result.rows.forEach((row,ci)=>{
      const details=el('details','','lesson-cause');details.dataset.cause=String(ci);details.open=open.has(String(ci));details.append(el('summary',row.name+' · '+row.factors.filter(f=>f.before!==null&&f.after!==null).length+'/'+row.factors.length+'项分数已确定'));
      row.factors.forEach(f=>{
        const box=el('div','','lesson-factor');box.append(el('h4',f.name));
        for(const [title,value,score,note]of [['当前',f.beforeValue,f.before,f.beforeNote],['改善后',f.afterValue,f.after,f.afterNote]])box.append(el('p',title+'：'+value+' → r＝'+numberCell(score)),el('p',note,'help'));
        const references=evidenceFor(ci,f.id);if(references.length){const evidence=el('details','','lesson-evidence');evidence.dataset.evidence=f.key;evidence.open=f.before===null||f.after===null;evidence.append(el('summary','相关研究与原文（'+references.length+'项）'),el('p','以下为原研究报告的OR、HR或预测值，尚未换算为本模型的r，仅供核对，未计入总危险。','help'));for(const item of references){const article=el('article');article.append(el('h5',item.title));for(const estimate of item.estimates){const unit=estimate.metric==='PPV'?'%':'';article.append(el('p',estimate.label+'：'+estimate.metric+' '+fmt(estimate.value,2)+unit+'（95% CI '+fmt(estimate.low,2)+unit+'—'+fmt(estimate.high,2)+unit+'）','lesson-evidence-value'))}article.append(el('p','适用条件：'+item.condition),el('p','研究人群：'+item.population,'help'),el('p','研究结局：'+item.outcome,'help'),el('p','用于课堂计算：'+item.reason,'help'));const link=el('a',item.citation);link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';article.append(link);if(item.doi)article.append(el('p','DOI：'+item.doi,'help'));evidence.append(article)}box.append(evidence)}
        const manual=el('details','','lesson-manual');manual.dataset.factor=f.key;manual.open=manualOpen.has(f.key);manual.append(el('summary','补充或更正这项危险分数'),el('p','填写与本模型适用条件一致的危险分数r，并注明来源。文献中的OR、HR或百分比不能直接代入。未应用的草稿会一并保存。','help'));
        const grid=el('div','','lesson-manual-grid'),inputs={},entry=state.drafts?.[f.key]||state.overrides[f.key]||{},draftNote=el('p',state.drafts?.[f.key]?'草稿尚未应用。':'','help'),manualError=el('p','','error');manualError.setAttribute('role','status');
        for(const phase of ['before','after']){const label=el('label',phase==='before'?'补充当前r':'补充改善后r'),input=el('input');input.type='number';input.min=0;input.max=1000000;input.step='any';input.value=entry[phase]||'';input.dataset.phase=phase;input.setAttribute('aria-label',row.name+' '+f.name+' '+(phase==='before'?'补充当前分数':'补充改善后分数'));input.placeholder='留空使用自动转换';label.append(input);inputs[phase]=input;grid.append(label)}
        const label=el('label','补充分数的来源'),sourceInput=el('input');sourceInput.type='text';sourceInput.maxLength=500;sourceInput.value=entry.source||'';sourceInput.setAttribute('aria-label',row.name+' '+f.name+' 补充分数来源');sourceInput.placeholder='填写表号、页码或原网址';label.append(sourceInput);grid.append(label);
        const apply=el('button','应用这项系数'),discard=el('button','放弃这项草稿');apply.type=discard.type='button';apply.setAttribute('aria-label',row.name+' '+f.name+' 应用这项系数');discard.setAttribute('aria-label',row.name+' '+f.name+' 放弃草稿');discard.hidden=!state.drafts?.[f.key];
        const remember=()=>{state.drafts??={};state.drafts[f.key]={before:inputs.before.value,after:inputs.after.value,source:sourceInput.value};changed();draftNote.textContent='草稿尚未应用，保存时会一并保留。';manualError.textContent='';discard.hidden=false;syncActions()};for(const input of [...Object.values(inputs),sourceInput])input.addEventListener('input',remember);
        apply.onclick=()=>{try{state=applyCoefficient(state,f.key,{before:inputs.before.value,after:inputs.after.value,source:sourceInput.value});changed();render()}catch(e){manualError.textContent=e.message}};
        discard.onclick=()=>{delete state.drafts[f.key];changed();render()};const toolbar=el('div','','toolbar compact');toolbar.append(apply,discard);manual.append(grid,draftNote,toolbar,manualError);box.append(manual);details.append(box);
      });
      if(row.before||row.after){const steps=el('div','','steps');steps.textContent=[['当前',row.before],['改善后',row.after]].map(([name,v])=>!v?name+'：资料尚未齐全。':name+'：X＝'+(v.high.length?v.high.map(n=>'('+n+'−1)').join('＋'):'0')+'＝'+fmt(v.x,6)+'\nY＝'+(v.low.length?v.low.join('×'):'1')+'＝'+fmt(v.y,6)+'\nR＝X＋Y＝'+fmt(v.r,6)+'；采用R＝'+fmt(v.applied,6)+'\nD＝'+v.m+'×'+fmt(v.applied,6)+'＝'+fmt(v.d,6)+' /10万').join('\n\n');details.append(steps)}host.append(details);
    });
  }

  function openPrintPreview(){
    if(!result?.complete||Object.keys(state.drafts||{}).length){$('lesson-status').textContent='请先补齐资料，并应用或放弃系数草稿。';return}
    const previousFocus=document.activeElement,main=document.querySelector('main'),wasInert=main?.inert;
    let preview=$('lesson-print-preview');if(!preview){preview=el('section','','lesson-print-preview');preview.id='lesson-print-preview';document.body.append(preview)}
    preview.replaceChildren();preview.hidden=false;preview.setAttribute('role','dialog');preview.setAttribute('aria-modal','true');preview.setAttribute('aria-label','健康危险因素评价打印排版预览');
    const tools=el('div','','lesson-print-tools'),close=el('button','返回填写'),print=el('button','打印 / 保存为PDF','primary');close.type=print.type='button';
    tools.append(el('strong','打印排版预览'),el('span','A4纵向；系统窗口中可选择保存为PDF。实际分页以系统预览为准。'),close,print);preview.append(tools);
    const paper=el('article','','lesson-print-paper');paper.append(el('p','社会医学 · 课堂练习','lp-kicker'),el('h1','健康危险因素评价'));
    paper.append(el('p','男性40—44岁参数；实际年龄 '+state.age+' 岁；'+policyLabel(state)+'；'+(state.roundFirst?'R先保留2位小数':'R使用完整精度')+'。','lp-meta'));
    const summary=el('section','','lp-summary');summary.append(el('h2','结果总览'),$('lesson-metrics').cloneNode(true));
    summary.lastChild.removeAttribute('id');const totals=$('lesson-summary-rows').closest('table').cloneNode(true);totals.querySelector('tbody').removeAttribute('id');[...totals.tBodies[0].rows].forEach((tr,i)=>{tr.cells[2].textContent=numberCell(result.rows[i].before.applied);tr.cells[3].textContent=numberCell(result.rows[i].after.applied)});summary.append(totals,el('p','r、R最多显示6位小数，D与总量显示2位。计算使用所选取整方式；降低量为负时表示增加。','lp-meta'));
    const ages=$('lesson-ages').cloneNode(true);ages.removeAttribute('id');summary.append(el('h3','年龄查表'),ages,el('p',$('lesson-age-note').textContent,'lp-age-note'),el('p','评价年龄与增长年龄是风险对应年龄，不代表预计寿命或延寿年数。','lp-meta'));paper.append(summary);
    const chart=el('section','','lp-page-start');chart.append(el('h2','改善前后对照'));const figure=$('lesson-risk-chart').closest('figure').cloneNode(true);figure.querySelector('#lesson-risk-chart').removeAttribute('id');chart.append(figure,el('p','计算式：R＝Σ(r＞1时的r−1)＋Π(r≤1时的r)；D＝M×R。各项D相加得到总危险。表末“占原总危险%”以原总危险为分母；图旁箭头以该项当前D为分母。','lp-meta'));paper.append(chart);
    const factors=el('section','','lp-page-start');factors.append(el('h2','表12-1 · 逐项取值'),el('p','总览对应原表第1、2、6、7、10—13列；以下明细对应第3、4、5、8、9列。两部分合起来保留完整13列内容。','lp-meta'));
    for(const row of result.rows){
      const block=el('section','','lp-cause');block.append(el('h3',row.name),el('p','基准率M＝'+row.baseline+' /10万；R：'+numberCell(row.before.applied)+' → '+numberCell(row.after.applied)+'；D：'+fmt(row.before.d,2)+' → '+fmt(row.after.d,2)+' /10万。','lp-meta'));
      const table=el('table','','lp-factor-table'),head=el('thead'),tr=el('tr');for(const label of ['(3)因素','(4)当前指标','(5)r','(8)改善设定','(9)新r']){const th=el('th',label);th.scope='col';tr.append(th)}head.append(tr);table.append(head);const body=el('tbody');
      for(const f of row.factors){const line=el('tr');for(const value of [f.name,f.beforeValue,numberCell(f.before),f.afterChange,numberCell(f.after)])line.append(el('td',value));body.append(line)}table.append(body);block.append(table);factors.append(block);
    }
    paper.append(factors);const sources=el('section','','lp-sources');sources.append(el('h2','取值依据'),el('p',source),el('p','第5版第136页将完整统计模型指向配套融合教材。现有纸本、课件与补充表没有列出的阳性条件不自动赋分，也不借用冠心病或其他模型的分数。'));
    for(const row of result.rows)for(const f of row.factors){const notes=[...new Set([f.beforeNote,f.afterNote.replace(/^沿用当前分数；/,'')])].filter(n=>/^手工补充：/.test(n));if(notes.length)sources.append(el('p',row.name+'／'+f.name+'：'+notes.join('；')))}
    const notes=[['结果与发现',$('reflection-observation')?.value],['后续计划与复评',$('reflection-action')?.value]];for(const [label,text]of notes)if(text?.trim())sources.append(el('h3',label),el('p',text));sources.append(el('p','所用数值为课堂历史参数，仅供课程演算。','lp-meta'));paper.append(sources);preview.append(paper);
    const leave=()=>{preview.hidden=true;document.body.classList.remove('previewing-lesson','printing-lesson');if(main)main.inert=wasInert;previousFocus?.focus({preventScroll:true})};
    close.onclick=leave;print.onclick=()=>{document.body.classList.add('printing-lesson');root.print()};
    preview.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();leave()}else if(e.key==='Tab'){e.preventDefault();(document.activeElement===close?print:close).focus()}};
    document.body.classList.add('previewing-lesson');if(main)main.inert=true;preview.scrollTop=0;close.focus({preventScroll:true});
  }

  function hasWork(){return Object.values(state.before).some(has)||Object.values(state.after).some(has)||Object.keys(state.overrides).length>0||Object.keys(state.drafts||{}).length>0}
  function replaceAllowed(){return !hasWork()||root.confirm('当前课堂资料将被替换。需要保留的话请先下载保存文件，继续吗？')}
  function init(options={}){
    document=root.document;notify=options.onChange||(()=>{});save=options.download||((text,name,type='text/plain')=>{const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:type+';charset=utf-8'})),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)});
    ageRows.forEach(([risk,base])=>{const row=el('tr');row.dataset.risk=String(risk);row.dataset.base=String(base);row.append(el('td',String(risk)),el('td',String(base+1)));$('lesson-age-rows').append(row)});
    for(const id of ['age','sex','bpUnit','bpIndicator','policy'])$('lesson-'+id).addEventListener('input',()=>{state[id]=$('lesson-'+id).value;changed();render();if(['bpUnit','bpIndicator','policy'].includes(id)&&Object.keys(state.overrides).length)$('lesson-status').textContent='选项已更新。手工系数及来源已保留；请核对它们是否仍适用于当前设定。'});
    $('lesson-round').onchange=()=>{state.roundFirst=$('lesson-round').checked;changed();render()};
    $('lesson-form').onsubmit=e=>e.preventDefault();
    $('lesson-demo').onclick=()=>{if(!replaceAllowed())return;state=example();renderFields();render();$('lesson-status').textContent='已载入课堂例题，计算结果已更新。'};
    $('lesson-clear').onclick=()=>{if(!replaceAllowed())return;state=blank();renderFields();render();$('lesson-status').textContent='已清空变量。当前值未知就留空，改善后留空表示保持当前。'};
    $('lesson-unchanged').onclick=()=>{state.after=clean();Object.values(state.overrides).forEach(o=>o.after='');for(const [key,draft]of Object.entries(state.drafts||{})){draft.after='';if(!has(draft.before))delete state.drafts[key]}changed();renderFields();render();$('lesson-status').textContent='已将改善后设为保持当前，当前填写的资料没有改动。'};
    $('lesson-four').onclick=()=>{for(const [id,value]of Object.entries({activity:'regular',weightBasis:'average',depression:'treated',proctoscopy:'annual'}))state=setVariable(state,'after',id,value);changed();renderFields();render();$('lesson-status').textContent='已填入课件第174页的4项改变，结果已更新。'};
    $('lesson-save').onclick=()=>{const s=validate(state);save(JSON.stringify(s,null,2),'健康危险因素评价_课堂资料.json','application/json');$('lesson-status').textContent=Object.keys(s.drafts).length?'填写内容和未应用的系数草稿都在下载的JSON文件中。请保管好文件，下次点击“导入已存资料”恢复。':'请保管下载的JSON文件，下次点击“导入已存资料”恢复。刷新页面不会自动续填。'};
    $('lesson-import').onchange=async()=>{const input=$('lesson-import'),file=input.files?.[0];if(!file)return;try{if(file.size>150000)throw Error('请选择小于150KB的单份课堂资料');const next=validate(JSON.parse((await file.text()).replace(/^\uFEFF/,'')));if(!replaceAllowed())return;state=next;renderFields();render();$('lesson-status').textContent='已从文件恢复课堂资料。'}catch(e){$('lesson-status').textContent='没有导入，原资料保留。'+(e instanceof SyntaxError?'文件不是有效JSON。':e.message)}finally{input.value=''}};
    $('lesson-csv').onclick=()=>{try{save(csv(state),'健康危险因素评价_表12-1完整结果.csv','text/csv');$('lesson-status').textContent='已导出表12-1的13列、分数依据、合计及查表年龄。'}catch(e){$('lesson-status').textContent=e.message}};
    $('lesson-print').textContent='打印预览 / 保存PDF';$('lesson-print').onclick=openPrintPreview;root.addEventListener('beforeprint',()=>{if($('lesson-print-preview')&&!$('lesson-print-preview').hidden)document.body.classList.add('printing-lesson')});root.addEventListener('afterprint',()=>document.body.classList.remove('printing-lesson'));
    $('lesson-view').onclick=()=>{$('lesson-results-title').focus();$('lesson-results-title').scrollIntoView({block:'start'})};
    renderFields();render();
  }
  const api={fields,groups,bindings,source,literature,evidenceFor,ageRows,blank,example,validate,analyse,ageLookup,riskChange,csv,report,setVariable,applyCoefficient,openPrintPreview,init,get ready(){return !!result?.complete&&!Object.keys(state.drafts||{}).length},get result(){return result},get state(){return state}};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HraLesson=api;
})(typeof window!=='undefined'?window:globalThis);
