(function (root) {
  'use strict';
  const facets = [
    ['F1','疼痛与不适',[],true], ['F2','精力与疲倦',[2,4]],
    ['F3','睡眠与休息',[2,4]], ['F4','积极感受',[]],
    ['F5','思维、学习、记忆与注意力',[]], ['F6','自尊',[]],
    ['F7','身体意象与外貌',[2,3]], ['F8','消极感受',[],true],
    ['F9','行动能力',[3,4]], ['F10','日常生活能力',[2,4]],
    ['F11','对药物或治疗的依赖',[],true], ['F12','工作能力',[]],
    ['F13','人际关系',[1]], ['F14','社会支持',[]], ['F15','性生活',[4]],
    ['F16','安全保障',[3]], ['F17','居住环境',[]], ['F18','经济来源',[2,4]],
    ['F19','卫生与社会保健服务',[]], ['F20','获取信息与技能的机会',[]],
    ['F21','休闲与娱乐',[]], ['F22','自然环境',[2]], ['F23','交通条件',[2,4]],
    ['F24','精神、宗教与个人信念',[]], ['G','总体生命质量与健康',[]]
  ].map(([id,name,reverse,negative=false]) => ({id,name,reverse,negative}));
  const domains = [
    {name:'生理',facets:['F1','F2','F3']},
    {name:'心理',facets:['F4','F5','F6','F7','F8']},
    {name:'独立性',facets:['F9','F10','F11','F12']},
    {name:'社会关系',facets:['F13','F14','F15']},
    {name:'环境',facets:['F16','F17','F18','F19','F20','F21','F22','F23']},
    {name:'精神、宗教与个人信念',facets:['F24']}
  ];
  const itemId = (facet,index) => facet==='G' ? 'G'+index : facet+'.'+index;
  // Codes are the original facet/item identifiers, not a translated form's page order.
  const itemIds = facets.flatMap(f => [1,2,3,4].map(i => itemId(f.id,i)));
  function whoExample(followup=false) {
    const values = {};
    const positive = {F1:[3,3,4,3], F2:[2,3,2,2], F3:[2,2,2,3], F4:[3,3,3,4],
      F8:[3,3,4,3], F9:[4,4,5,4], F11:[4,5,4,4], F14:[3,4,3,4],
      F17:[3,3,3,3], F18:[3,3,3,3], F21:[2,2,3,2], G:[3,3,3,3]};
    facets.forEach(f => [1,2,3,4].forEach((i) => {
      let score = (positive[f.id] || [3,4,3,4])[i-1];
      if (followup && ['F2','F3','F21'].includes(f.id)) score=Math.min(5,score+1);
      const native = f.negative ? 6-score : score;
      values[itemId(f.id,i)] = f.reverse.includes(i) ? 6-native : native;
    }));
    return values;
  }
  const f = (name,observed,before,after=before,action='') => ({name,observed,before,after,action});
  const hraCase = [
    {name:'冠心病',baseline:1877,factors:[f('血压','16.0/9.3 kPa',.4),f('胆固醇','192 mg/dl',.6),f('糖尿病史','无',1),f('体力活动','坐着工作',2.5,1,'活动'),f('家族史','无',.9),f('吸烟','不吸',.5),f('体重','超重30%',1.3,1,'体重')]},
    {name:'车祸',baseline:285,factors:[f('饮酒','不饮',.5),f('驾车里程','25000 km/年',2.5),f('安全带使用','90%',.8)]},
    {name:'自杀',baseline:264,factors:[f('抑郁','经常',2.5,1.5,'抑郁'),f('家族史','无',1)]},
    {name:'肝硬化',baseline:222,factors:[f('饮酒','不饮',.1)]},
    {name:'脑血管病',baseline:222,factors:[f('血压','16.0/9.3 kPa',.4),f('胆固醇','192 mg/dl',.6),f('糖尿病史','无',1),f('吸烟','不吸',.8)]},
    {name:'肺癌',baseline:202,factors:[f('吸烟','不吸',.2)]},
    {name:'慢性风湿性心脏病',baseline:167,factors:[f('心脏杂音','无',1),f('风湿热','无',1),f('症状体征','无',.1)]},
    {name:'肺炎',baseline:111,factors:[f('饮酒','不饮',1),f('肺气肿','无',1),f('吸烟','不吸',1)]},
    {name:'肠癌',baseline:111,factors:[f('肠息肉','无',1),f('肛门出血','无',1),f('肠炎','无',1),f('直肠镜检查','无',1,.3,'筛查')]},
    {name:'高血压心脏病',baseline:56,factors:[f('血压','16.0/9.3 kPa',.4),f('体重','超重30%',1.3,1,'体重')]},
    {name:'肺结核',baseline:56,factors:[f('X线检查','阴性',.2),f('结核活动','无',1)]},
    {name:'其他',baseline:1987,factors:[f('其他原因','按教材基准',1)]}
  ];
  // Table 11-3: the male column for actual ages ending in 1 or 6; restricted to this example.
  const age41Male = [[3030,35],[3330,36],[3670,37],[4060,38],[4510,39],[5010,40],[5560,41],
    [6160,42],[6830,43],[7570,44],[8380,45],[9260,46],[10190,47]];
  const conversions = [
    {name:'收缩压',unit:'mmHg',factor:0,example:120,points:[[120,.4],[140,.8],[160,1.4],[180,2.2],[200,3.2]]},
    {name:'舒张压',unit:'mmHg',factor:0,example:88,points:[[82,.4],[88,.8],[94,1.3],[100,2],[106,3.7]]},
    {name:'胆固醇',unit:'mg/dl',factor:1,example:192,points:[[180,.5],[220,1],[280,1.5]]},
    {name:'糖尿病史',factor:2,options:[['有',3],['已控制',2.5],['无',1]]},
    {name:'体力活动',factor:3,options:[['坐着工作和娱乐',2.5],['有些活动的工作',1],['中度锻炼',.6],['较强度锻炼',.5],['坐着工作且定期锻炼',1],['其他工作且定期锻炼',.5]]},
    {name:'家族史',factor:4,options:[['父母二人60岁以前死于冠心病',1.4],['父母之一60岁以前死于冠心病',1.2],['父母健在，未满60岁',1],['父母健在，已满60岁',.9]]},
    {name:'吸烟',factor:5,options:[['每天不少于10支',1.5],['每天少于10支',1.1],['雪茄或烟斗',1],['戒烟不足10年',.7],['不吸或戒烟10年以上',.5]]},
    {name:'体重（教材分类）',factor:6,options:[['超重75%',2.5],['超重50%',1.5],['超重15%',1],['超重10%以下',.8],['降到平均体重',1]]}
  ];
  const api = {facets,domains,itemIds,itemId,whoExample,hraCase,age41Male,conversions};
  if (typeof module!=='undefined' && module.exports) module.exports=api;
  else root.CourseData=api;
})(typeof window!=='undefined' ? window : globalThis);
