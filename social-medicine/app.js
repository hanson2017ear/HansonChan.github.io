'use strict';
const $=id=>document.getElementById(id);
const fmt=(n,p=2)=>Number(n).toLocaleString('zh-CN',{maximumFractionDigits:p,useGrouping:false});
const copy=value=>JSON.parse(JSON.stringify(value));
const el=(tag,text='',className='')=>{const n=document.createElement(tag);n.textContent=text;if(className)n.className=className;return n};
const put=(id,value)=>{$(id).textContent=value};
const letter=value=>value===''||value===undefined?'':String.fromCharCode(64+SocialMed.answerValue(value));
const online='https://hanson2017ear.github.io/HansonChan.github.io/social-medicine/';
let raw={},whoMode='自行填写的答卷',whoResult=null,reference=null,whoGroupIndex=0;
let qResult=null,currentTab='whoqol';
const reflections={whoqol:{observation:'',action:''},hra:{observation:'',action:''},qaly:{observation:'',action:''}};

function renderWhoFields(){
  $('who-fields').replaceChildren();
  $('who-group').replaceChildren();
  [...CourseData.domains,{name:'总体评价',facets:['G']}].forEach(domain=>{
    const group=el('optgroup');group.label=domain.name;
    domain.facets.forEach(id=>{
      const index=CourseData.facets.findIndex(f=>f.id===id),option=el('option');
      option.value=index;option.dataset.facet=id;group.append(option);
    });$('who-group').append(group);
  });
  CourseData.facets.forEach((facet,index)=>{
    const section=el('section','','question-group');section.dataset.group=index;
    [1,2,3,4].forEach(i=>{
      const key=CourseData.itemId(facet.id,i),question=WhoQuestions.byId[key];
      const field=el('fieldset','','question');field.dataset.question=key;
      const legend=el('legend');legend.tabIndex=-1;
      legend.append(el('span',String(index*4+i).padStart(2,'0')+'. ','question-number'),el('span',question.text),el('small',key,'question-code'));
      field.append(legend);const options=el('div','','answer-options');
      question.options.forEach((text,j)=>{
        const value=String.fromCharCode(65+j),label=el('label','','answer-option'),input=el('input');
        input.type='radio';input.name=key;input.value=value;input.dataset.item=key;
        input.checked=letter(raw[key])===value;input.setAttribute('aria-label',key+' '+value+' '+text);
        input.addEventListener('change',()=>{
          raw[key]=value;if(whoMode.includes('示例'))whoMode='修改后的示例答卷';
          field.classList.add('answered');put('who-navigation-note','');put('who-save-status','答案有改动，离开前请保存。');updateWho();
        });
        label.append(input,el('span',value,'option-letter'),el('span',text,'option-text'));options.append(label);
      });
      field.classList.toggle('answered',letter(raw[key])!=='');field.append(options);
      const clear=el('button','暂不回答','answer-clear');clear.type='button';clear.setAttribute('aria-label',key+' 暂不回答');
      clear.onclick=()=>{raw[key]='';field.querySelectorAll('input').forEach(n=>n.checked=false);field.classList.remove('answered');put('who-save-status','答案有改动，离开前请保存。');updateWho()};field.append(clear);section.append(field);
    });$('who-fields').append(section);
  });
  showWhoGroup(whoGroupIndex);
}
function showWhoGroup(index,scroll=false){
  whoGroupIndex=Math.max(0,Math.min(CourseData.facets.length-1,index));
  const facet=CourseData.facets[whoGroupIndex],domain=CourseData.domains.find(d=>d.facets.includes(facet.id));
  document.querySelectorAll('.question-group').forEach(n=>n.hidden=Number(n.dataset.group)!==whoGroupIndex);
  $('who-group').value=whoGroupIndex;put('who-group-context',(domain?.name||'总体评价')+' · 第'+(whoGroupIndex+1)+'组 / 共25组');
  $('who-prev').disabled=whoGroupIndex===0;put('who-next',whoGroupIndex===24?'查看结果':'下一组');
  if(scroll){$('who-question-top').scrollIntoView({behavior:'smooth',block:'start'});$('who-group').focus({preventScroll:true})}
}
function firstUnanswered(){return CourseData.itemIds.findIndex(id=>!letter(raw[id]))}
function reviewWho(){
  const missing=firstUnanswered();
  if(missing<0){$('who-results').scrollIntoView({behavior:'smooth',block:'start'});$('who-result-title').focus({preventScroll:true});return}
  showWhoGroup(Math.floor(missing/4),true);put('who-navigation-note','已跳到尚未填写的第'+(missing+1)+'题。');
  document.querySelector('[data-question="'+CourseData.itemIds[missing]+'"] legend').focus({preventScroll:true});
}
function replaceWhoAllowed(){
  return whoMode.includes('示例')||Object.values(raw).every(v=>!letter(v))||
    window.confirm('当前答卷会被替换。如果还要保留，请先点“保存答卷”。确定继续吗？');
}

function addBar(parent,value,ref=false){
  const track=el('div','',ref?'bar-track reference':'bar-track'),fill=el('div','','bar-fill');
  fill.style.width=value+'%';track.append(fill);parent.append(track);
}
function updateWho(){
  const answered=CourseData.itemIds.filter(id=>raw[id]!==''&&raw[id]!==undefined).length;
  put('who-progress','已答 '+answered+' / 100 题');$('who-progress-bar').value=answered;$('who-save').disabled=answered===0;
  put('who-mode',whoMode.includes('示例')?whoMode+'，仅用于演示计分，不是真实调查。':'请按最近两周的实际感受选择。可以先跳过不方便回答的题，留空的题不会计为0分。');
  document.querySelectorAll('#who-group option').forEach(n=>{
    const facet=CourseData.facets[Number(n.value)],ids=[1,2,3,4].map(i=>CourseData.itemId(facet.id,i));
    n.textContent=(Number(n.value)+1)+'. '+facet.name+'（'+ids.filter(id=>letter(raw[id])).length+'/4）';
  });
  whoResult=null;put('who-error','');$('who-chart').replaceChildren();$('who-legend').replaceChildren();
  try{
    whoResult=SocialMed.whoqol100(raw,CourseData);
    $('who-legend').append(el('span','当前结果'));
    if(reference)$('who-legend').append(el('span','对照结果','reference'));
    whoResult.domains.forEach((d,i)=>{
      const row=el('div','','score-row'),label=el('div','','score-label');
      label.append(el('span',d.name));const score=el('strong',fmt(d.score100,1));score.append(el('small','/ 100'));label.append(score);row.append(label);
      addBar(row,d.score100);
      if(reference){const before=reference.result.domains[i].score100;addBar(row,before,true);row.append(el('div','对照 '+fmt(before,1)+'；变化 '+(d.score100-before>0?'+':'')+fmt(d.score100-before,1)+' 分','delta'))}
      row.setAttribute('aria-label',d.name+'：'+fmt(d.score100,2)+'分');$('who-chart').append(row);
    });
    const axis=el('div','','bar-axis');[0,25,50,75,100].forEach(n=>axis.append(el('span',n)));$('who-chart').append(axis);
    put('who-class-summary',fmt(whoResult.classSummary,2));
    put('who-general',fmt(whoResult.general.score100,2));
    put('who-general-items',whoResult.general.items.map(i=>i.id+' '+letter(i.original)+'（'+i.original+'）').join('　')+'；合计 '+whoResult.general.native+'/20');
    put('who-comment','图中使用0—100分制。课堂五领域均分按老师给的评分说明计算，不能用来诊断疾病。');
  }catch(e){
    if(answered===100)put('who-error',e.message);
    const waiting=el('div','','empty');waiting.append(el('strong',answered?'还剩 '+(100-answered)+' 题':'填写后查看结果'),el('p','100题填完整后，这里会显示六个领域的分数。可以随时保存答卷，下次再导入接着填。'));$('who-chart').append(waiting);
    ['who-class-summary','who-general'].forEach(id=>put(id,'—'));put('who-general-items','');put('who-comment','尚未填写的题会保留为空。');
  }
  $('who-result-details').hidden=!whoResult;$('who-reference').disabled=!whoResult;$('who-unreference').hidden=!reference;
  put('who-reference-note',reference?'对照答卷：'+reference.mode+'。刷新后对照会清空，请先导出结果。':'复评时，可以先保留这次结果作对照，再填写同一版本的问卷。');
  updateWhoSteps();updateExportState();
}
function updateWhoSteps(){
  if(!whoResult){put('who-steps','填完问卷后，可以在这里核对每一项分数。');return}
  const f=whoResult.facets.find(f=>f.id===$('who-facet').value);
  const detail=f.items.map(i=>i.id+'：'+letter(i.original)+' → 原值'+i.original+(i.classReversed?' → 6−'+i.original+'＝'+i.classScored+'（反向）':' → '+i.classScored+'（正向）'));
  detail.push('课堂转向后方面分＝'+f.items.map(i=>i.classScored).join('＋')+'＝'+fmt(f.positive));
  detail.push('方面标准分＝（'+fmt(f.positive)+'−4）÷16×100＝'+fmt(f.score100)+' 分');
  const domain=whoResult.domains.find(d=>d.facets.includes(f.id));
  if(domain){detail.push(domain.name+'领域＝'+domain.facets.map(id=>id+'('+fmt(whoResult.facets.find(f=>f.id===id).score100)+')').join('＋')+'，再除以'+domain.facets.length+'＝'+fmt(domain.score100)+' 分')}
  else detail.push('G1—G4单列，未计入课堂五领域平均分。');
  put('who-steps',detail.join('\n'));
}
function loadWho(followup=false){
  if(!replaceWhoAllowed())return;
  raw=CourseData.whoExample(followup);whoMode=followup?'示例复评答卷':'示例答卷';
  reference=followup?{result:SocialMed.whoqol100(CourseData.whoExample(),CourseData),mode:'示例初次答卷'}:null;
  whoGroupIndex=0;
  renderWhoFields();updateWho();put('who-save-status','当前为示例答卷。填写自己的问卷前，请点“重新填写”。');
}
CourseData.facets.forEach(f=>{const option=el('option',f.id+' '+f.name);option.value=f.id;$('who-facet').append(option)});
$('who-facet').value='F3';$('who-facet').onchange=updateWhoSteps;
$('who-demo').onclick=()=>loadWho();$('who-followup').onclick=()=>loadWho(true);
$('who-clear').onclick=()=>{if(!replaceWhoAllowed())return;raw={};whoMode='自行填写的答卷';reference=null;whoGroupIndex=0;renderWhoFields();updateWho();put('who-save-status','离开前请保存答卷。未填完也可以保存，下次导入后接着填。');put('who-navigation-note','')};
$('who-group').onchange=()=>showWhoGroup(Number($('who-group').value));
$('who-prev').onclick=()=>showWhoGroup(whoGroupIndex-1,true);
$('who-next').onclick=()=>whoGroupIndex===24?reviewWho():showWhoGroup(whoGroupIndex+1,true);
$('who-review').onclick=reviewWho;
$('who-save').onclick=()=>{download('item,score\n'+CourseData.itemIds.map(id=>id+','+letter(raw[id])).join('\n'),'WHOQOL100_答卷.csv','text/csv');put('who-save-status','答卷已准备下载。保存好这个CSV文件，下次导入即可继续填写。')};
$('who-reference').onclick=()=>{if(whoResult){reference={result:copy(whoResult),mode:whoMode};updateWho()}};
$('who-unreference').onclick=()=>{reference=null;updateWho()};
$('who-template').onclick=()=>download('item,score\n'+CourseData.itemIds.map(id=>id+',').join('\n'),'WHOQOL100_原始答案模板.csv','text/csv');
$('who-import').onchange=async event=>{
  const file=event.target.files[0];if(!file)return;
  try{
    if(file.size>100000)throw Error('请选择100题的单份CSV，文件应小于100KB');
    const next=SocialMed.parseWhoCsv(await file.text(),CourseData);
    if(!replaceWhoAllowed())return;
    if(reference&&reference.mode.includes('示例'))reference=null;
    raw=next;whoMode='导入的答卷';whoGroupIndex=Math.max(0,Math.floor(CourseData.itemIds.findIndex(id=>!letter(next[id]))/4));renderWhoFields();updateWho();put('who-save-status','已导入答卷，可以继续填写或查看结果。');
  }catch(e){put('who-error','没能导入：'+e.message+'。当前答案没有改动。')}
  finally{event.target.value=''}
};

const qExample=[{name:'健康',years:65.2,weight:1},{name:'非卧床功能丧失',years:4.5,weight:.59},{name:'卧床功能丧失',years:1.9,weight:.34}];
function qrow(r={name:'',years:'',weight:''}){
  const tr=el('tr');
  for(const [key,label] of [['name','健康状态名称'],['years','持续年数'],['weight','健康权重']]){
    const td=el('td'),input=el('input');input.type=key==='name'?'text':'number';input.value=r[key];input.dataset.field=key;input.setAttribute('aria-label',label);
    if(key!=='name'){input.step='any';if(key==='years')input.min='0';else input.max='1'}input.addEventListener('input',updateQaly);td.append(input);tr.append(td);
  }
  const result=el('td','—');result.className='part';tr.append(result);const td=el('td'),remove=el('button','×','remove');remove.setAttribute('aria-label','删除这一健康状态');remove.onclick=()=>{tr.remove();updateQaly()};td.append(remove);tr.append(td);$('qrows').append(tr);
}
function loadQaly(){$('qrows').replaceChildren();qExample.forEach(qrow);updateQaly()}
function updateQaly(){
  qResult=null;put('qerror','');$('qbars').replaceChildren();
  try{
    const rows=[...$('qrows').children];qResult=SocialMed.qaly(rows.map(tr=>Object.fromEntries([...tr.querySelectorAll('input')].map(input=>[input.dataset.field,input.value]))));
    rows.forEach((tr,i)=>tr.querySelector('.part').textContent=fmt(qResult.parts[i].weighted,3));
    put('qtotal',fmt(qResult.qaly,3));put('ytotal','未调整年数：'+fmt(qResult.years,3)+' 年');
    put('qsteps',qResult.parts.map(r=>(r.name||'未命名状态')+'：'+r.years+'×'+r.weight+'＝'+fmt(r.weighted,6)).join('\n')+'\n合计：'+fmt(qResult.qaly,6)+' QALY');
    if(qResult.years>0&&qResult.qaly>=0){for(const [label,value] of [['未调整年数',qResult.years],['质量调整后',qResult.qaly]]){const row=el('div','','score-row');row.append(el('div',label+'　'+fmt(value,3),'help'));addBar(row,Math.min(100,value/qResult.years*100));$('qbars').append(row)}}
  }catch(e){put('qerror',e.message);put('qtotal','—');put('ytotal','');put('qsteps','');document.querySelectorAll('#qrows .part').forEach(n=>n.textContent='—')}
  updateExportState();
}
$('loadq').onclick=loadQaly;$('addrow').onclick=()=>{qrow();updateQaly()};
function updateEq(){
  try{const result=SocialMed.eqState([...$('eqfields').querySelectorAll('select')].map(n=>n.value),$('vas').value);put('eqcode',result.code);put('eqerror','VAS：'+result.vas+' / 100');$('eqerror').style.color='var(--muted)'}catch(e){put('eqcode','—');put('eqerror',e.message);$('eqerror').style.color='var(--red)'}
}
['行动','自我照顾','日常活动','疼痛／不适','焦虑／抑郁'].forEach((name,i)=>{const label=el('label',name),select=el('select');select.setAttribute('aria-label','EQ-5D '+name);for(const v of ['1','2','3']){const o=el('option','等级 '+v);o.value=v;select.append(o)}select.value=[1,1,2,2,3][i];select.onchange=updateEq;label.append(select);$('eqfields').append(label)});$('vas').oninput=updateEq;

function updateExportState(){
  $('export-record').disabled=currentTab==='whoqol'?!whoResult:currentTab==='hra'?!HraLesson.ready:currentTab==='qaly'?!qResult:true;
}
function saveReflection(){if(reflections[currentTab])reflections[currentTab]={observation:$('reflection-observation').value,action:$('reflection-action').value}}
function showTab(name){
  if(!['whoqol','hra','qaly','notes'].includes(name))name='whoqol';saveReflection();currentTab=name;
  document.querySelectorAll('[data-tab]').forEach(n=>{const selected=n.dataset.tab===name;n.setAttribute('aria-selected',String(selected));n.tabIndex=selected?0:-1});
  document.querySelectorAll('.panel').forEach(n=>n.hidden=n.id!==name);$('application').hidden=name==='notes';
  if(reflections[name]){$('reflection-observation').value=reflections[name].observation;$('reflection-action').value=reflections[name].action}
  const hints={whoqol:'哪些方面的分数值得进一步了解？如果要做健康管理，还需要问清楚哪些生活情况？',hra:'试着只改一项，比如体力活动，看看哪些结果跟着变了。',qaly:'可以记下年数和权重各自怎样影响结果，以及题目中的权重来自哪里。'};
  put('application-hint',hints[name]||'');put('export-status','');
  if(name!=='notes'){$('tool-qr').src='qr-'+name+'.svg';$('tool-qr').alt=name==='hra'?'危险因素评价工具入口二维码':name==='qaly'?'QALY练习入口二维码':'生命质量评分工具入口二维码';$('tool-link').href=online+'#'+name}
  updateExportState();
}
document.querySelectorAll('[data-tab]').forEach(button=>{
  button.onclick=()=>{history.replaceState(null,'','#'+button.dataset.tab);showTab(button.dataset.tab)};
  button.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...document.querySelectorAll('[data-tab]')];let i=tabs.indexOf(button);i=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[i].click();tabs[i].focus()};
});window.addEventListener('hashchange',()=>{
  const module=location.hash.slice(1);
  if(['whoqol','hra','qaly','notes'].includes(module))showTab(module);
});
['reflection-observation','reflection-action'].forEach(id=>{
  $(id).addEventListener('input',saveReflection);
  const mirror=el('div','','print-value');mirror.id=id+'-print';$(id).after(mirror);
});
window.addEventListener('beforeprint',()=>{
  saveReflection();
  ['reflection-observation','reflection-action'].forEach(id=>put(id+'-print',$(id).value||'（未填写）'));
});
$('reflection-example').onclick=()=>{
  let observation,action;
  if(currentTab==='whoqol'){
    observation='例如，体检没有明显异常，也可能有睡不好、白天容易累的困扰。看具体方面的分数，比只看平均分更容易发现这些情况。';
    action='如果想先改善白天疲劳，可以了解作息、宿舍噪声和课业压力，和本人商量一个做得到的调整，约好时间后用同一版本问卷复评。这里的例子没有实际干预数据。';
  }else if(currentTab==='hra'){
    const r=HraLesson.result;
    observation=r?.complete?'这次计算的总危险由'+fmt(r.before)+'变为'+fmt(r.after)+' /10万。对照各项结果，可以看看哪些改变的影响较大。':'先载入课堂例题，试着改一项数值，看看它会影响哪些结果。';
    action='我可以先只改体力活动，再分别调整其他因素，比较每次的差别。';
  }else{
    observation=qResult?'这次输入的年数合计为'+fmt(qResult.years)+'年，质量调整后为'+fmt(qResult.qaly,3)+' QALY。改动权重后，可以看到生活状态怎样影响结果。':'评价健康效果时，除了活了多少年，还要考虑这些年的健康状态。';
    action='比较两种方案前，需要核对各自的持续时间和权重来源。若用EQ-5D效用值，应注明版本和价值集，不能把VAS或WHOQOL领域分直接填成效用权重。';
  }
  $('reflection-observation').value=observation;$('reflection-action').value=action;saveReflection();put('export-status','已放入写法示例。提交作业时，请换成自己的实际观察和想法。');
};
function recordText(){
  const lines=['社会医学课程练习记录',new Date().toLocaleString('zh-CN'),''];
  if(currentTab==='whoqol'){
    if(!whoResult)throw Error('先补齐有效的100题');lines.push('WHOQOL-100 / '+whoMode,'课堂口径：30个反向条目；方面标准分后求领域均值。');
    whoResult.domains.forEach((d,i)=>lines.push(d.name+'：'+fmt(d.score100,4)+'/100（4—20分制：'+fmt(d.score,4)+'）'+(reference?'；对照'+fmt(reference.result.domains[i].score100,4)+'；变化'+fmt(d.score100-reference.result.domains[i].score100,4):'')));
    lines.push('课堂五领域均分：'+fmt(whoResult.classSummary,4)+'；排除精神信仰领域及G1—G4，不称为WHO统一总分。','G1—G4：'+whoResult.general.items.map(i=>i.id+'='+letter(i.original)).join('，'),'','各方面的计分');
    whoResult.facets.forEach(f=>lines.push(f.id+' '+f.name+'：'+f.items.map(i=>i.id+' '+letter(i.original)+(i.classReversed?'反向':'')+'→'+i.classScored).join('；')+'；转向后合计'+f.positive+'；标准分'+fmt(f.score100,4)));
    lines.push('','逐题作答');WhoQuestions.items.forEach(q=>{const value=SocialMed.answerValue(raw[q.id]);lines.push(q.id+' '+q.text+'\n'+letter(value)+' '+q.options[value-1])});
    lines.push('','来源：课堂WHOQOL-100评分说明第8页；WHO提供的计分手册第19—22页。','https://www.who.int/tools/whoqol/whoqol-100');
  }else if(currentTab==='hra'){
    lines.push(HraLesson.report(HraLesson.state));
  }else{
    if(!qResult)throw Error('先填写有效QALY数据');lines.push('QALY：Σ（持续年数×权重）',...qResult.parts.map(r=>(r.name||'未命名状态')+'：'+r.years+'×'+r.weight+'='+fmt(r.weighted,6)),'未调整年数：'+fmt(qResult.years,6),'QALY：'+fmt(qResult.qaly,6),'权重采用本次输入值，未进行量表效用换算。','来源：课程课件第139页。');
  }
  saveReflection();const r=reflections[currentTab];lines.push('','应用或启发','我从结果中看到什么：',r.observation||'（未填写）','可以怎么做、怎样再评价：',r.action||'（未填写）','',online+'#'+currentTab);return lines.join('\n');
}
function download(text,name,type='text/plain'){
  const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:type+';charset=utf-8'})),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
$('export-record').onclick=()=>{try{download(recordText(),'社会医学_'+currentTab+'_计算与应用记录.txt');put('export-status','已导出计算过程与当前填写的应用记录。')}catch(e){put('export-status',e.message)}};
$('print-record').onclick=()=>window.print();
HraLesson.init({download,onChange:updateExportState});
renderWhoFields();updateWho();loadQaly();updateEq();showTab(location.hash.slice(1));
