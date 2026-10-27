/* Layout helpers only. All scores and reports come from the existing calculators. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const variants = ['whoqol', 'hra', 'qaly', 'notes'];
  const motion = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  function jump(id) {
    const target = byId(id);
    if (!target) return;
    if (target.tagName === 'DETAILS') target.open = true;
    target.scrollIntoView({block:'start', behavior:motion()});
    if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
    target.focus({preventScroll:true});
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-ai-target]');
    if (button) jump(button.dataset.aiTarget);
  });
  function groupLinks() {
    const labels = ['血压、血脂与病史', '活动、吸烟与体重', '出行、饮酒与情绪', '其他疾病相关因素'];
    const links = byId('ai-group-links'); links.replaceChildren();
    document.querySelectorAll('#lesson-fields .lesson-group').forEach((group, i) => {
      group.id = 'ai-variable-group-' + i;
      const button = document.createElement('button');
      button.type = 'button'; button.dataset.aiTarget = group.id;
      button.textContent = labels[i] || group.querySelector('legend').textContent;
      links.append(button);
    });
  }
  function overview() {
    const progress = byId('lesson-progress').textContent;
    const counts = progress.match(/当前已完成\s+(\d+)\s*\/\s*12.*改善后已完成\s+(\d+)\s*\/\s*12/);
    const n = counts ? Number(counts[1]) : 0;
    byId('ai-live-count').replaceChildren(document.createTextNode(String(n)));
    const total = document.createElement('span'); total.textContent = '/12'; byId('ai-live-count').append(total);
    byId('ai-ring-value').style.strokeDasharray = `${n / 12 * 314.159} 314.159`;
    byId('ai-live-progress').textContent = counts ? `当前已完成${counts[1]}项，改善后已完成${counts[2]}项。` : progress;
    byId('ai-live-mode').textContent = byId('lesson-mode').textContent.split('；')[0] || '等待填写';
    const output = byId('ai-live-metrics'), metrics = byId('lesson-metrics');
    output.replaceChildren();
    if (metrics.childElementCount) {
      for (const metric of metrics.children) output.append(metric.cloneNode(true));
    } else {
      const empty = document.createElement('p'); empty.className = 'ai-empty-note';
      empty.textContent = '尚无完整结果。补齐资料后显示合计；空白不计为0。'; output.append(empty);
    }
  }
  const observe = (id, update, options) => new MutationObserver(update).observe(byId(id), options);
  observe('lesson-fields', groupLinks, {childList:true});
  observe('lesson-metrics', overview, {childList:true});
  observe('lesson-progress', overview, {childList:true});
  groupLinks(); overview();
  function originalLink() {
    const hash = variants.includes(location.hash.slice(1)) ? location.hash : '#hra';
    byId('ai-original-link').href = 'index.html' + hash;
  }
  function moduleChanged() { originalLink(); window.scrollTo({top:0, behavior:'instant'}); }
  originalLink(); window.addEventListener('hashchange', moduleChanged);
  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', moduleChanged));
  if (!location.hash) byId('tab-hra').click();
  requestAnimationFrame(() => window.scrollTo({top:0, behavior:'instant'}));
})();
