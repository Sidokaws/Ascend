const STORAGE_KEY = 'systemAscendV1';
const todayKey = new Date().toISOString().slice(0, 10);

const categories = {
  study:   { name: 'Conhecimento', short: 'ESTUDO', icon: '◈' },
  fitness: { name: 'Físico',       short: 'TREINO', icon: '▲' },
  routine: { name: 'Disciplina',   short: 'ROTINA', icon: '◆' },
  work:    { name: 'Competência',  short: 'TRABALHO', icon: '▣' },
  finance: { name: 'Gestão',       short: 'FINANÇAS', icon: '◇' }
};

const defaultMissions = [
  { id: 'oab-1h', title: 'Estudar OAB por 1 hora', category: 'study', xp: 100 },
  { id: 'q30', title: 'Resolver 30 questões', category: 'study', xp: 80 },
  { id: 'review', title: 'Revisar erros do estudo', category: 'study', xp: 50 },
  { id: 'fitness-45', title: 'Treino ou atividade física', category: 'fitness', xp: 90 },
  { id: 'work-focus', title: 'Concluir uma prioridade importante do trabalho', category: 'work', xp: 60 },
  { id: 'finance-log', title: 'Registrar gastos e compromissos do dia', category: 'finance', xp: 35 },
  { id: 'tomorrow', title: 'Organizar as prioridades de amanhã', category: 'routine', xp: 35 }
];

const emergencyPool = [
  { title: 'Resolver 10 questões sem interrupção', category: 'study', xp: 35 },
  { title: 'Revisar o caderno de erros por 15 minutos', category: 'study', xp: 30 },
  { title: 'Fazer 20 minutos de atividade física', category: 'fitness', xp: 30 },
  { title: 'Organizar uma pendência que está sendo adiada', category: 'routine', xp: 25 },
  { title: 'Revisar os gastos dos últimos 3 dias', category: 'finance', xp: 25 },
  { title: 'Executar 25 minutos de foco total em uma tarefa', category: 'work', xp: 30 }
];

function freshState() {
  return {
    player: { name: 'SIDMAR WESLEY', totalXp: 0, gold: 0 },
    attributes: { study: 0, fitness: 0, routine: 0, work: 0, finance: 0 },
    customMissions: [],
    completed: {},
    history: []
  };
}

let state = loadState();

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return raw ? { ...freshState(), ...raw, player: { ...freshState().player, ...raw.player }, attributes: { ...freshState().attributes, ...raw.attributes } } : freshState();
  } catch { return freshState(); }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function xpNeeded(level) { return 500 + (level - 1) * 125; }
function levelInfo(totalXp) {
  let level = 1, remaining = totalXp;
  while (remaining >= xpNeeded(level)) { remaining -= xpNeeded(level); level++; }
  return { level, current: remaining, needed: xpNeeded(level), pct: Math.min(100, (remaining / xpNeeded(level)) * 100) };
}
function rankFor(level) {
  if (level >= 40) return ['S', 'MONARCA'];
  if (level >= 30) return ['A', 'ELITE'];
  if (level >= 22) return ['B', 'VETERANO'];
  if (level >= 15) return ['C', 'ESPECIALISTA'];
  if (level >= 8)  return ['D', 'EM ASCENSÃO'];
  return ['E', 'DESPERTANDO'];
}
function allMissions() { return [...defaultMissions, ...state.customMissions]; }
function completionKey(id) { return `${todayKey}:${id}`; }
function isDone(id) { return !!state.completed[completionKey(id)]; }

function streak() {
  const days = new Set(Object.keys(state.completed).filter(k => state.completed[k]).map(k => k.slice(0,10)));
  let count = 0;
  const d = new Date();
  if (!days.has(d.toISOString().slice(0,10))) d.setDate(d.getDate() - 1);
  while (days.has(d.toISOString().slice(0,10))) { count++; d.setDate(d.getDate() - 1); }
  return count;
}

function completeMission(mission) {
  const key = completionKey(mission.id);
  if (state.completed[key]) return;
  const before = levelInfo(state.player.totalXp).level;
  state.completed[key] = true;
  state.player.totalXp += mission.xp;
  state.player.gold += Math.max(1, Math.round(mission.xp / 10));
  state.attributes[mission.category] += mission.xp;
  state.history.unshift({ date: new Date().toISOString(), title: mission.title, category: mission.category, xp: mission.xp });
  state.history = state.history.slice(0, 60);
  saveState(); render();
  toast(`MISSÃO CONCLUÍDA · <strong>+${mission.xp} XP</strong>`);
  const after = levelInfo(state.player.totalXp).level;
  if (after > before) showLevelUp(after);
}

function addMission(title, category, xp) {
  state.customMissions.push({ id: `custom-${Date.now()}`, title, category, xp: Number(xp), custom: true });
  saveState(); render();
}

function render() {
  const info = levelInfo(state.player.totalXp);
  const [rank, clazz] = rankFor(info.level);
  document.getElementById('playerName').textContent = state.player.name;
  document.getElementById('levelText').textContent = String(info.level).padStart(2,'0');
  document.getElementById('xpText').textContent = `${info.current} / ${info.needed} XP`;
  document.getElementById('xpFill').style.width = `${info.pct}%`;
  document.getElementById('totalXpText').textContent = `${state.player.totalXp} XP TOTAL`;
  document.getElementById('nextLevelText').textContent = `${info.needed - info.current} XP PARA O PRÓXIMO NÍVEL`;
  document.getElementById('rankText').textContent = `RANK ${rank}`;
  document.getElementById('classText').textContent = clazz;
  document.getElementById('streakText').textContent = streak();
  document.getElementById('coinsText').textContent = state.player.gold;

  const missions = allMissions();
  const doneCount = missions.filter(m => isDone(m.id)).length;
  document.getElementById('completedText').textContent = doneCount;
  document.getElementById('missionPercent').textContent = `${missions.length ? Math.round(doneCount / missions.length * 100) : 0}%`;
  document.getElementById('missionList').innerHTML = missions.map(m => `
    <article class="mission ${isDone(m.id) ? 'done' : ''}">
      <div class="mission-icon">${categories[m.category].icon}</div>
      <div><div class="mission-title">${escapeHtml(m.title)}</div><div class="mission-meta">${categories[m.category].short}${m.custom ? ' · MISSÃO PERSONALIZADA' : ' · MISSÃO DIÁRIA'}</div></div>
      <div class="xp-reward">+${m.xp} XP</div>
      <button class="complete-btn" data-id="${m.id}" ${isDone(m.id) ? 'disabled' : ''}>${isDone(m.id) ? '✓' : '○'}</button>
    </article>`).join('');

  document.querySelectorAll('.complete-btn:not([disabled])').forEach(btn => btn.addEventListener('click', () => completeMission(missions.find(m => m.id === btn.dataset.id))));

  document.getElementById('attributeList').innerHTML = Object.entries(categories).map(([key,c]) => {
    const xp = state.attributes[key] || 0;
    const lvl = Math.floor(xp / 250) + 1;
    const pct = (xp % 250) / 250 * 100;
    return `<div class="attribute-row"><div class="attribute-icon">${c.icon}</div><div class="attribute-info"><div class="attribute-top"><span>${c.name.toUpperCase()}</span><span>${xp} XP</span></div><div class="mini-bar"><div class="mini-fill" style="width:${pct}%"></div></div></div><div class="attribute-level">${String(lvl).padStart(2,'0')}<small>LV</small></div></div>`;
  }).join('');

  document.getElementById('historyList').innerHTML = state.history.length ? state.history.slice(0,8).map(h => {
    const dt = new Date(h.date);
    return `<div class="history-row"><div class="history-dot"></div><div><strong>${escapeHtml(h.title)}</strong><span>${dt.toLocaleDateString('pt-BR')} · ${dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})} · ${categories[h.category]?.short || 'SISTEMA'}</span></div><span class="history-xp">+${h.xp} XP</span></div>`;
  }).join('') : `<div class="empty-state">NENHUMA ATIVIDADE REGISTRADA AINDA.<br>O SISTEMA ESTÁ AGUARDANDO SUA PRIMEIRA MISSÃO.</div>`;
}

function escapeHtml(s) { return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function toast(html) { const el = document.getElementById('toast'); el.innerHTML = html; el.classList.add('show'); clearTimeout(window.__toast); window.__toast = setTimeout(() => el.classList.remove('show'), 2600); }
function showLevelUp(level) { const el = document.getElementById('levelUp'); document.getElementById('newLevelText').textContent = `LV. ${level}`; el.classList.add('show'); el.setAttribute('aria-hidden','false'); setTimeout(() => { el.classList.remove('show'); el.setAttribute('aria-hidden','true'); }, 2600); }

const dialog = document.getElementById('missionDialog');
document.getElementById('addMissionBtn').addEventListener('click', () => dialog.showModal());
document.getElementById('closeDialog').addEventListener('click', () => dialog.close());
document.getElementById('missionForm').addEventListener('submit', e => {
  e.preventDefault();
  addMission(document.getElementById('missionTitle').value.trim(), document.getElementById('missionCategory').value, document.getElementById('missionXp').value);
  e.target.reset(); document.getElementById('missionXp').value = 50; dialog.close(); toast('NOVA MISSÃO ADICIONADA AO SISTEMA');
});
document.getElementById('emergencyBtn').addEventListener('click', () => {
  const q = emergencyPool[Math.floor(Math.random() * emergencyPool.length)];
  const id = `emergency-${todayKey}-${Date.now()}`;
  state.customMissions.push({ ...q, id, custom: true }); saveState(); render(); toast(`MISSÃO DE EMERGÊNCIA GERADA · <strong>+${q.xp} XP</strong>`);
});

document.getElementById('todayLabel').textContent = new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).toUpperCase();
render();
