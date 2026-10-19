
'use strict';
const PLAN_URL='./data/plano-oab48-119-dias-v1.1.json',KEY='ascendOab48V3',PREV='ascendOab48V2';
const stages=['Não avaliado','Reconhecimento','Estrutura guiada','Peça integral com consulta','Peça integral autônoma'];
const pieceNames=['Apelação — procedimento comum','Memoriais — procedimento comum','Resposta à Acusação','RESE — Recurso em Sentido Estrito','Agravo em Execução','Contrarrazões de Apelação','Contrarrazões de RESE','Apelação — Tribunal do Júri','Memoriais — primeira fase do Júri','RESE — pronúncia','Apelação — JECRIM','Queixa-Crime','Queixa-Crime subsidiária','Habeas Corpus','Revisão Criminal','Liberdade Provisória','Relaxamento de Prisão','Revogação da Prisão Preventiva','Defesa Preliminar — Lei de Drogas','Defesa Preliminar — Funcionário Público','Embargos de Declaração','Embargos Infringentes e de Nulidade','Carta Testemunhável','Recurso Ordinário Constitucional','Mandado de Segurança Criminal','Recurso da Acusação / Assistente','Contrarrazões de Agravo em Execução','Outras medidas do edital'];
const awards=[['✦','Primeiro passo','Uma missão validada',s=>numValid(s)>=1],['⛨','Disciplina crescente','Cinco missões validadas',s=>numValid(s)>=5],['⚔','Aprendiz das peças','Uma peça integral corrigida',s=>pieceCount(s)>=1],['◇','Fundamento sólido','Dez discursivas corrigidas',s=>questionCount(s)>=10],['♜','Caçador de bosses','Um simulado completo e corrigido',s=>simCount(s)>=1],['✧','Rotina sustentada','Trinta missões validadas',s=>numValid(s)>=30],['❖','Revisão consciente','Dez revisões realizadas com evidência',s=>Object.keys(s.reviewDone).length>=10],['✪','Rumo ao Rank S','Dez simulados completos',s=>simCount(s)>=10]];
let plan=null,selectedDate='2026-10-26',monthView=new Date(2026,9,1),currentTab='dashboard';
const $=id=>document.getElementById(id),safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const format=iso=>iso?iso.slice(8,10)+'/'+iso.slice(5,7)+'/'+iso.slice(0,4):'—';
const number=v=>Number(v)||0;
const templateState=()=>({version:3,missions:{},grades:[],errors:[],reviewDone:{},timer:null,selectedDate:'2026-10-26',legacyImported:false});
function loadState(){let s;try{s=JSON.parse(localStorage.getItem(KEY))}catch{};if(!s||s.version!==3)s=templateState();return {...templateState(),...s,missions:s.missions||{},grades:Array.isArray(s.grades)?s.grades:[],errors:Array.isArray(s.errors)?s.errors:[],reviewDone:s.reviewDone||{}}}
let state=loadState();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){notify('Armazenamento cheio ou indisponível. Exporte um backup.')}};
function migrateV2(){
if(state.legacyImported)return;
try{const old=JSON.parse(localStorage.getItem(PREV));if(old&&Array.isArray(old.missions)){
old.missions.forEach(m=>{if(!m.id.startsWith('seed')||m.done){const id='v2-'+m.id;if(!state.missions[id])state.missions[id]={id,date:m.date,title:m.title,type:m.kind||'teoria',source:m.source||'Registro legado',xp_base:0,evidence:m.evidence||'',status:m.done?'Enviado para revisão':'Pendente',validated:false,legacy:true}}});
(old.grades||[]).forEach((g,i)=>{const id='v2-grade-'+i;if(!state.grades.some(a=>a.id===id))state.grades.push({...g,id,imported:true,confirmed:false})});
(old.errors||[]).forEach((e,i)=>{const id='v2-error-'+i;if(!state.errors.some(a=>a.id===id))state.errors.push({...e,id})});
}
}catch(e){console.warn('V2 não pôde ser lida',e)}
state.legacyImported=true;save();
}
function mergePlan(data){
if(!data||data.days?.length!==119||data.missions?.length!==274)throw Error('Plano inesperado: conferência de 119 dias e 274 missões falhou');
const rows={};for(const m of data.missions){if(rows[m.id])throw Error('ID repetido '+m.id);rows[m.id]=true;const old=state.missions[m.id]||{};state.missions[m.id]={...m,...old,id:m.id,source:m.source,notes:m.notes,validated:old.validated===true,status:old.status||'Pendente',evidence:old.evidence||'',correction:old.correction||''}}
plan=data;selectedDate=data.days.some(d=>d.date===state.selectedDate)?state.selectedDate:(data.days.some(d=>d.date===today())?today():data.date_start);
state.selectedDate=selectedDate;monthView=new Date(Number(selectedDate.slice(0,4)),Number(selectedDate.slice(5,7))-1,1);save();
}
function missions(){return Object.values(state.missions)}
function dayMissions(date){return missions().filter(m=>m.date===date).sort((a,b)=>a.id.localeCompare(b.id))}
function numValid(s=state){return Object.values(s.missions||{}).filter(m=>m.validated===true).length}
function validGrades(type,s=state){return (s.grades||[]).filter(g=>g.type===type&&g.confirmed===true)}
function simCount(s=state){return new Set(validGrades('Simulado',s).filter(g=>g.complete===true&&g.is_full_piece===true).map(g=>g.simId||g.topic||g.id)).size}
function pieceCount(s=state){
const keys=new Set();
for(const m of Object.values(s.missions||{})){if(m.validated===true&&m.is_full_piece===true&&m.type!=='simulado_completo')keys.add(m.piece_case_id||m.id)}
for(const g of validGrades('Peça',s)){if(g.is_full_piece===true){const linked=Object.values(s.missions||{}).find(m=>m.validated===true&&m.is_full_piece===true&&m.piece_case_id&&String(g.topic).includes(m.piece_case_id));keys.add(linked?.piece_case_id||g.case_id||g.topic||g.id)}}
for(const g of validGrades('Simulado',s)){if(g.complete===true&&g.is_full_piece===true)keys.add('sim-'+(g.simId||g.topic||g.id))}
return keys.size;
}
function questionCount(s=state){
const ids=new Set();
for(const m of Object.values(s.missions||{})){if(m.validated!==true||m.type!=='discursiva')continue;const found=String(m.question_ids||'').match(/Q\d{3}/g);(found?.length?found:[m.id]).forEach(q=>ids.add(q))}
for(const g of validGrades('Discursiva',s)){const found=String(g.topic||'').match(/Q\d{3}/g);(found?.length?found:[g.id]).forEach(q=>ids.add(q))}
return ids.size+4*simCount(s);
}
function totalXp(){return missions().filter(m=>m.validated===true).reduce((sum,m)=>sum+number(m.xp_base||40),0)}
function levelInfo(){let level=1,left=totalXp();while(left>=500+(level-1)*125&&level<200){left-=500+(level-1)*125;level++}return {level,current:left,needed:500+(level-1)*125}}
function rankFor(n){return n>=40?'S':n>=30?'A':n>=22?'B':n>=15?'C':n>=8?'D':'E'}
function statusBadge(m){const a=m.validated===true;const b=m.status==='Enviado para revisão'||m.status==='Ajustar';return '<span class="tag '+(a?'green':m.status==='Ajustar'?'red':b?'amber':'blue')+'">'+(a?'✓ Validada':m.status==='Ajustar'?'↻ Refazer':b?'Aguardando correção':'Pendente')+'</span>'}
function notify(t){const el=$('snackbar');el.textContent=t;el.classList.remove('hidden');clearTimeout(notify.t);notify.t=setTimeout(()=>el.classList.add('hidden'),3800)}
function setText(id,v){const el=$(id);if(el)el.textContent=v}
function setTab(tab){
currentTab=tab;document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===tab));document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+tab));
const labels={dashboard:['PLAYER STATUS // OAB 48','Painel de evolução'],calendar:['TACTICAL MAP','Cronograma completo'],pieces:['ARSENAL // PEÇAS','Matriz de domínio'],questions:['TRAINING // TBFP','Desafios discursivos'],sims:['DUNGEONS // BOSSES','Simulados completos'],reviews:['RECOVERY PROTOCOL','Revisões e erros'],awards:['SYSTEM REWARDS','Conquistas'],settings:['SYSTEM CONTROL','Configurações e dados']};
setText('pageEyebrow',labels[tab][0]);setText('pageTitle',labels[tab][1]);render();window.scrollTo({top:0,behavior:'smooth'});
}
function getDay(date){return plan?.days.find(d=>d.date===date)}
function setDay(date){if(!getDay(date))return;selectedDate=date;state.selectedDate=date;monthView=new Date(Number(date.slice(0,4)),Number(date.slice(5,7))-1,1);save();render()}
function render(){
if(!plan)return;
const inf=levelInfo();const rank=rankFor(inf.level);
setText('globalRank','RANK '+rank);setText('introFooter','PLAYER: WESLEY  |  RANK '+rank+'  |  A JORNADA COMEÇA AQUI');setText('heroRank',rank);setText('heroXp',totalXp().toLocaleString('pt-BR')+' XP');setText('heroLevel','LV '+String(inf.level).padStart(2,'0'));
$('heroXpBar').style.width=Math.min(100,inf.current/inf.needed*100)+'%';
setText('statMissions',numValid()+' / '+plan.missions.length);setText('statPieces',pieceCount()+' / 45');setText('statQuestions',questionCount()+' / 145');setText('statSims',simCount()+' / 15');
const elapsed=Math.max(0,plan.days.findIndex(d=>d.date===today())+1);setText('heroDays','Dia '+(elapsed||'pré-temporada')+' / 119');
$('seasonBar').style.width=Math.max(0,Math.min(100,elapsed/119*100))+'%';
$('daySelect').value=selectedDate;renderDaily();renderCalendar();renderPieces();renderQuestions();renderSims();renderReviews();renderAwards();renderSettings();renderTimer();
}
function renderDaily(){
const day=getDay(selectedDate);setText('dayHeading',day?'D'+String(plan.days.indexOf(day)+1).padStart(3,'0')+' • Semana '+day.week+' • '+day.phase+' • '+day.topic:'Dia fora do treinamento');
const task=dayMissions(selectedDate);
$('dailyMissions').innerHTML=day?.mode==='Descanso'?'<div class="notice">✦ DESCANSO PROGRAMADO — sem débito ou penalidade. O sistema não conta esse dia como falta.</div>':task.map(m=>'<div class="item"><div class="section-head" style="margin:0">'+statusBadge(m)+'<span class="muted tiny">'+number(m.duration_min)+' min · '+number(m.xp_base)+' XP</span></div><div class="item-title">'+safe(m.title)+'</div><div class="item-meta">Etapa: '+safe(m.learning_stage||'fundação')+(m.question_ids?' · Questões: '+safe(m.question_ids):'')+(m.piece_case_id?' · Caso: '+safe(m.piece_case_id):'')+'</div><details><summary class="muted tiny">Referências e critério de evidência</summary><div class="item-meta" style="margin-top:8px">Fonte: '+safe(m.source||'A definir')+'<br>Evidência: '+safe(m.evidence_required||'Produção documentada')+'<br>'+safe(m.notes||'')+'</div></details>'+(m.evidence?'<p class="item-meta"><b>Evidência enviada:</b> '+safe(m.evidence)+'</p>':'')+(m.correction?'<p class="item-meta"><b>Correção:</b> '+safe(m.correction)+'</p>':'')+'<div class="item-actions">'+(m.validated?'<button class="btn small-btn" data-open-mission="'+safe(m.id)+'">Consultar registro</button>':'<button class="btn primary small-btn" data-open-mission="'+safe(m.id)+'">'+(m.status==='Enviado para revisão'?'Registrar correção':'Registrar produção')+'</button>')+'</div></div>').join('')||'<div class="empty">Nenhuma missão prevista para esta data.</div>';
$('timerMission').innerHTML='<option value="">Sem vincular missão</option>'+task.map(m=>'<option value="'+safe(m.id)+'">'+safe(m.title.slice(0,63))+'</option>').join('');
if(state.timer?.missionId)$('timerMission').value=state.timer.missionId;
}
function renderCalendar(){
const y=monthView.getFullYear(),m=monthView.getMonth();setText('calMonth',monthView.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).toUpperCase());
let html=['D','S','T','Q','Q','S','S'].map(d=>'<div class="cal-heading">'+d+'</div>').join('');const start=new Date(y,m,1).getDay();for(let i=0;i<start;i++)html+='<div class="cal-day empty"></div>';
const days=new Date(y,m+1,0).getDate();for(let d=1;d<=days;d++){const iso=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');const record=getDay(iso);const task=dayMissions(iso);const all=task.length>0&&task.every(a=>a.validated===true);html+='<button class="cal-day '+(record?.mode==='Descanso'?'rest ':'')+(selectedDate===iso?'selected ':'')+(all?'done-day':'')+'" data-date="'+iso+'" '+(!record?'disabled':'')+'>'+d+(record?.mode==='Descanso'?'<span class="muted tiny">DESC</span>':task.length?'<span class="tiny muted">'+task.filter(a=>a.validated).length+'/'+task.length+' missões</span>':'')+(record?.mode!=='Descanso'&&task.length?'<span class="dot"></span>':'')+'</button>'} $('calGrid').innerHTML=html;
const day=getDay(selectedDate);setText('calDayTitle',day?format(day.date)+' • '+day.topic:'Selecione um dia do plano');
$('calDayDetails').innerHTML=day?'<p class="muted">'+safe(day.weekday)+' · Semana '+day.week+' · '+safe(day.phase)+'</p><p><span class="tag">'+safe(day.mode)+'</span> &nbsp; '+day.planned_hours+' horas planejadas</p><p class="muted">'+safe(day.notes||'')+'</p><hr><b>Atividades do dia</b>'+dayMissions(day.date).map(m=>'<p class="muted">• '+safe(m.title)+'</p>').join('')+'<details><summary>Referências (fornecidas no plano)</summary><p class="muted">'+safe(day.source||'')+'</p></details>':'';
}
function findPieceGrade(name){const s=name.toLocaleLowerCase('pt-BR');return validGrades('Peça').filter(g=>String(g.topic).toLocaleLowerCase('pt-BR').includes(s)||s.includes(String(g.topic).toLocaleLowerCase('pt-BR'))).sort((a,b)=>b.date.localeCompare(a.date))[0]}
function renderPieces(){
$('pieceRows').innerHTML=pieceNames.map((n,i)=>{const g=findPieceGrade(n);const stage=g?stages[g.learning_stage==='autonomo'?4:g.learning_stage==='integral_consulta'?3:2]:'Não avaliado';return '<tr><td><b>'+safe(n)+'</b></td><td>'+safe(stage)+'</td><td>'+(g?'1+':'0')+'</td><td>'+format(g?.date)+'</td><td><button class="btn small-btn" data-eval="Peça" data-topic="'+safe(n)+'">Avaliar</button></td></tr>'}).join('');
}
function renderQuestions(){
const tasks=plan.missions.filter(m=>m.type==='discursiva');const future=tasks.filter(m=>m.date>=selectedDate).slice(0,14);const list=future.length?future:tasks.slice(-12);
$('questionsList').innerHTML=list.map(m=>'<div class="item"><div class="section-head"><b class="small">'+format(m.date)+' · '+safe(m.question_ids||'Discursiva')+'</b>'+statusBadge(state.missions[m.id]||m)+'</div><p class="item-meta">'+safe(m.title)+'</p><button class="btn small-btn" data-date-go="'+m.date+'">Ver dia e fonte ↗</button></div>').join('');
$('questionHistory').innerHTML=gradeHistory('Discursiva');
}
function gradeHistory(type){
const a=state.grades.filter(g=>g.type===type).slice().sort((x,y)=>String(y.date).localeCompare(String(x.date))).slice(0,14);
return a.map(g=>'<div class="item"><div class="section-head"><b class="small">'+safe(g.topic)+'</b><span class="tag '+(g.confirmed?'green':'amber')+'">'+safe(g.score)+'/'+safe(g.max)+'</span></div><div class="item-meta">'+format(g.date)+' · '+safe(g.basis||'Pedagógica')+(g.imported?' · Importado (não homologado)':'')+'</div><p class="item-meta">'+safe(g.feedback||'')+'</p></div>').join('')||'<div class="empty">Nenhuma correção registrada.</div>';
}
function renderSims(){
$('simList').innerHTML=plan.simulations.map(s=>{const grade=validGrades('Simulado').find(g=>g.simId===s.id||g.topic===s.id);const completed=grade?.complete===true&&grade?.is_full_piece===true;return '<div class="item"><div class="section-head"><b>'+safe(s.id)+' · '+format(s.date)+'</b><span class="tag '+(completed?'green':'amber')+'">'+(completed?'Corrigido':'Condicional')+'</span></div><div class="item-meta">Semana '+s.week+' • peça-surpresa + 4 discursivas • 300 min</div><div class="item-actions"><button class="btn small-btn" data-date-go="'+s.date+'">Consultar missão</button><button class="btn small-btn" data-eval="Simulado" data-topic="'+safe(s.id)+'">Registrar resultado</button></div></div>'}).join('');$('simHistory').innerHTML=gradeHistory('Simulado');
}
function addDays(date,days){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+days);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function reviews(){
let a=[];for(const g of validGrades('Peça').concat(validGrades('Discursiva'),validGrades('Simulado')))for(const n of [1,7,15,30])a.push({key:'g-'+g.id+'-'+n,date:addDays(g.date,n),topic:g.topic,offset:n});
for(const m of missions().filter(m=>m.validated&&m.validated_date&&!m.grade_link))for(const n of [1,7,15,30])a.push({key:'m-'+m.id+'-'+n,date:addDays(m.validated_date,n),topic:m.title,offset:n});
return a.sort((x,y)=>x.date.localeCompare(y.date))}
function renderReviews(){
const due=reviews().filter(r=>!state.reviewDone[r.key]);const overdue=due.filter(r=>r.date<=today()).slice(0,14);const next=due.filter(r=>r.date>today()).slice(0,14);const list=overdue.concat(next);
$('reviewList').innerHTML=list.map(r=>'<div class="item"><div class="section-head"><span class="tag '+(r.date<today()?'amber':'blue')+'">D+'+r.offset+'</span><small class="muted">'+format(r.date)+'</small></div><b class="small">'+safe(r.topic)+'</b><div class="actions"><button class="btn small-btn" data-review="'+safe(r.key)+'">Registrar reteste com evidência</button></div></div>').join('')||'<div class="empty">Nenhuma revisão pendente. Uma correção registrada gera D+1/7/15/30.</div>';
$('errorList').innerHTML=state.errors.slice().reverse().slice(0,25).map(e=>'<div class="item"><b class="small">'+safe(e.topic)+'</b><p class="item-meta">'+safe(e.detail)+'</p></div>').join('')||'<p class="muted small">Nenhum erro documentado.</p>';
}
function renderAwards(){
$('awardsList').innerHTML=awards.map(([icon,title,description,fn])=>'<div class="span-4"><div class="achievement '+(fn(state)?'':'locked')+'"><div class="medal">'+icon+'</div><div><strong>'+safe(title)+'</strong><small>'+safe(description)+'</small><small>'+(fn(state)?'✓ DESBLOQUEADA':'BLOQUEADA')+'</small></div></div></div>').join('');
}
function renderSettings(){
setText('dataStatus','Plano v'+safe(plan.schema_version)+' · '+plan.days.length+' dias · '+plan.missions.length+' missões planejadas · '+numValid()+' validadas · '+state.grades.length+' registros de correção. Exportação manual, sem nuvem.');
}
function openDialog(id){$(id).showModal()}
function openMission(id){
const m=state.missions[id];if(!m)return;
$('missionDialogTitle').textContent='MISSÃO // '+m.id;
$('missionDialogHelp').textContent=m.title+' — '+(m.evidence_required||'Registre evidência da produção');
const f=$('missionForm');f.elements.id.value=m.id;f.elements.evidence.value=m.evidence||'';f.elements.evidence_link.value=m.evidence_link||'';f.elements.actual_minutes.value=m.actual_minutes??'';f.elements.learning_stage.value=['guiado','integral_consulta','autonomo'].includes(m.learning_stage)?m.learning_stage:'reconhecimento';
const v=$('validateForm');v.elements.id.value=id;v.elements.correction.value=m.correction||'';v.elements.correction_ref.value=m.correction_ref||'';v.elements.outcome.value=m.status==='Ajustar'?'ajustar':'validado';v.elements.is_full_piece.value=String(m.is_full_piece===true);v.elements.used_model.value=String(m.used_model!==false);
$('validateBlock').classList.toggle('hidden',!(m.evidence&&!m.validated));f.querySelector('button[type=submit]').disabled=m.validated===true;
openDialog('missionDialog');
}
function openGrade(type,topic=''){
const f=$('gradeForm');f.reset();f.elements.type.value=type;f.elements.topic.value=topic;f.elements.date.value=today();f.elements.max.value=5;
$('gradeDialogTitle').textContent='AVALIAÇÃO // '+type.toUpperCase();$('simGradeFields').classList.toggle('hidden',type!=='Simulado');
openDialog('gradeDialog');
}
function recordMission(e){
e.preventDefault();const f=e.target,id=f.elements.id.value,m=state.missions[id];if(!m||m.validated)return;
const ev=f.elements.evidence.value.trim();if(ev.length<10){notify('Descreva evidência real com pelo menos 10 caracteres.');return}
m.evidence=ev;m.evidence_link=f.elements.evidence_link.value.trim();m.actual_minutes=f.elements.actual_minutes.value?Number(f.elements.actual_minutes.value):null;m.learning_stage=f.elements.learning_stage.value;m.status='Enviado para revisão';m.validated=false;m.submitted_at=new Date().toISOString();
save();$('missionDialog').close();render();notify('Produção enviada. Aguarda correção/verificação para XP.');
}
function validateMission(e){
e.preventDefault();const f=e.target,m=state.missions[f.elements.id.value];if(!m||!m.evidence)return;
const correction=f.elements.correction.value.trim(),ref=f.elements.correction_ref.value.trim();
if(correction.length<10||!ref){notify('Registre a correção e sua referência.');return}
const approved=f.elements.outcome.value==='validado',full=f.elements.is_full_piece.value==='true',without=f.elements.used_model.value==='false';
if(approved&&full&&m.learning_stage==='autonomo'&&!confirm('Portão de prontidão demonstrado? Reconhecimento da peça e fase, artigo/prazo no Vade, estrutura completa e uma tese TBFP. Confirmar APENAS se essas etapas foram realmente avaliadas.'))return;
if(approved&&m.type==='simulado_completo'&&full){notify('Para contabilizar simulado, registre separadamente o resultado da peça e das 4 discursivas em BOSS BATTLES.')}
m.correction=correction;m.correction_ref=ref;m.status=approved?'Validada':'Ajustar';m.validated=approved;m.validated_date=approved?today():null;m.is_full_piece=approved&&full&&(!!m.piece_case_id||['peca_completa','treino_guiado_peca'].includes(m.type));m.used_model=!without;
save();$('missionDialog').close();render();notify(approved?'Validação documentada e XP liberado.':'Nova tentativa necessária, sem punição.');
}
function recordGrade(e){
e.preventDefault();const f=e.target;const d=Object.fromEntries(new FormData(f));const score=Number(d.score),max=Number(d.max),disc=Number(d.disc_score||0);
if(!Number.isFinite(score)||!Number.isFinite(max)||score>max||max<=0){notify('Confira os limites da nota.');return}
if(d.type==='Simulado'&&(max!==5||score>5||disc>5)){notify('Simulado: peça e discursivas devem ter máximos de 5 pontos cada.');return}
if(d.type==='Simulado'&&d.complete==='true'&&d.is_full_piece!=='true'){notify('Para contabilizar simulado completo, a peça deve estar integral e corrigida.');return}
const g={...d,id:'grade-'+Date.now()+'-'+Math.floor(Math.random()*10000),score,max,disc_score:disc,complete:d.complete==='true',is_full_piece:d.is_full_piece==='true',confirmed:true,imported:false};
if(d.type==='Simulado'&&/^SIM-\d{2}$/.test(d.topic))g.simId=d.topic;
state.grades.push(g);save();$('gradeDialog').close();render();notify('Nota registrada. Correção e revisões programadas.');
}
function renderTimer(){
const t=state.timer;const running=t?.startedAt;const now=Date.now();const gross=running?Math.max(0,Math.floor((now-t.startedAt)/1000)):0;const pause=running?number(t.pauseSeconds)+(t.pausedAt?Math.max(0,Math.floor((now-t.pausedAt)/1000)):0):0;const effective=Math.max(0,gross-pause);
const h=String(Math.floor(effective/3600)).padStart(2,'0'),m=String(Math.floor(effective%3600/60)).padStart(2,'0'),s=String(effective%60).padStart(2,'0');
setText('timerDigits',h+':'+m+':'+s);setText('timerMeta','Tempo bruto: '+Math.floor(gross/60)+' min · Pausas: '+Math.floor(pause/60)+' min');
$('timerStart').textContent=t?.pausedAt?'Continuar':t?'Em andamento':'Iniciar';$('timerStart').disabled=!!t&&!t.pausedAt;$('timerPause').disabled=!t||!!t.pausedAt;$('timerEnd').disabled=!t;
}
function timerAction(action){
const now=Date.now();let t=state.timer;
if(action==='start'){if(!t){state.timer={startedAt:now,pausedAt:null,pauseSeconds:0,missionId:$('timerMission').value||null}}else if(t.pausedAt){t.pauseSeconds+=Math.max(0,Math.floor((now-t.pausedAt)/1000));t.pausedAt=null}}
if(action==='pause'&&t&&!t.pausedAt)t.pausedAt=now;
if(action==='end'&&t){const gross=Math.max(0,Math.floor((now-t.startedAt)/1000));const totalPause=number(t.pauseSeconds)+(t.pausedAt?Math.max(0,Math.floor((now-t.pausedAt)/1000)):0);const eff=Math.max(0,gross-totalPause),mission=t.missionId?state.missions[t.missionId]:null;
if(mission){mission.actual_minutes=Math.round(eff/60);mission.gross_seconds=gross;mission.pause_seconds=totalPause;mission.effective_seconds=eff;notify('Tempo registrado. Missão NÃO foi marcada como concluída.')}
else notify('Sessão encerrada: '+Math.round(eff/60)+' min efetivos. Sem missão vinculada.');
state.timer=null}
save();renderTimer();
}
function exportBackup(){
const obj={format:'ASCEND_OAB48_BACKUP_V3',exportedAt:new Date().toISOString(),state};const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
link.href=url;link.download='ascend-oab48-backup-'+today()+'.json';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),500);notify('Backup JSON exportado.');
}
async function importBackup(f){
try{const raw=JSON.parse(await f.text());const imported=raw.format==='ASCEND_OAB48_BACKUP_V3'?raw.state:raw;
if(!imported||imported.version!==3||typeof imported.missions!=='object'||!Array.isArray(imported.grades)||!Array.isArray(imported.errors))throw Error('Arquivo não corresponde a um backup ASCEND V3');
if(!confirm('O backup substituirá os registros locais da V3. Recomendamos exportar antes. Continuar?'))return;
const fresh=templateState();state={...fresh,...imported,reviewDone:imported.reviewDone||{}};mergePlan(plan);save();render();notify('Backup restaurado; IDs do plano atualizados sem duplicar.')}catch(e){notify('Não foi possível importar: '+e.message)}
}
function setupEvents(){
$('enterBtn').addEventListener('click',()=>{const intro=$('intro');$('enterBtn').textContent='✓ ACESSO AUTORIZADO';intro.classList.add('entering');document.body.classList.add('entered');setTimeout(()=>{intro.classList.add('hidden');$('pageTitle').focus?.()},870)});
$('backToIntro').addEventListener('click',()=>{$('intro').classList.remove('hidden','entering');$('enterBtn').textContent='✦   INICIAR DESPERTAR   ✦';});
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.page)));
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.goto)));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
document.querySelectorAll('.dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));
document.addEventListener('click',e=>{
const mission=e.target.closest('[data-open-mission]'),evalBtn=e.target.closest('[data-eval]'),day=e.target.closest('[data-date-go]'),rev=e.target.closest('[data-review]');
if(mission)openMission(mission.dataset.openMission);
if(evalBtn)openGrade(evalBtn.dataset.eval,evalBtn.dataset.topic||'');
if(day){setDay(day.dataset.dateGo);setTab('dashboard')}
if(rev){const r=reviews().find(x=>x.key===rev.dataset.review);if(!r)return;const evidence=prompt('Descreva o reteste realmente feito e o resultado:');if(!evidence||evidence.trim().length<10)return;state.reviewDone[r.key]={at:today(),evidence:evidence.trim()};save();render();notify('Revisão registrada com evidência.')}
});
$('missionForm').addEventListener('submit',recordMission);$('validateForm').addEventListener('submit',validateMission);$('gradeForm').addEventListener('submit',recordGrade);
$('daySelect').addEventListener('change',e=>setDay(e.target.value));
for(const [id,step] of [['prevDay',-1],['nextDay',1]])$(id).addEventListener('click',()=>{const i=plan.days.findIndex(d=>d.date===selectedDate),n=plan.days[i+step];if(n)setDay(n.date)});
for(const [id,step] of [['prevMonth',-1],['nextMonth',1]])$(id).addEventListener('click',()=>{monthView.setMonth(monthView.getMonth()+step);renderCalendar()});
$('calGrid').addEventListener('click',e=>{const b=e.target.closest('[data-date]');if(b)setDay(b.dataset.date)});
$('openCalendarDay').addEventListener('click',()=>setTab('dashboard'));
$('timerStart').addEventListener('click',()=>timerAction('start'));$('timerPause').addEventListener('click',()=>timerAction('pause'));$('timerEnd').addEventListener('click',()=>timerAction('end'));
$('exportBtn').addEventListener('click',exportBackup);$('importBtn').addEventListener('click',()=>$('importFile').click());$('importFile').addEventListener('change',async e=>{if(e.target.files?.[0])await importBackup(e.target.files[0]);e.target.value=''});
$('errorForm').addEventListener('submit',e=>{e.preventDefault();const f=e.target;const d=Object.fromEntries(new FormData(f));if(!d.topic.trim()||!d.detail.trim())return;state.errors.push({...d,id:'err-'+Date.now(),date:today()});save();f.reset();render();notify('Erro documentado.')});
$('customForm').addEventListener('submit',e=>{e.preventDefault();const f=e.target,d=Object.fromEntries(new FormData(f));if(!d.title.trim())return;const id='custom-'+Date.now();state.missions[id]={...d,id,xp_base:40,evidence_required:'Produção registrada',status:'Pendente',validated:false};save();f.reset();f.elements.date.value=today();render();notify('Missão adicionada. Aguarda evidência e validação.')});
}
async function init(){
migrateV2();setupEvents();setText('clockDate',new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase());$('customForm').elements.date.value=today();
try{const response=await fetch(PLAN_URL,{cache:'no-cache'});if(!response.ok)throw Error('HTTP '+response.status);mergePlan(await response.json());render()}catch(err){notify('Falha ao carregar plano de 119 dias. Atualize a página.');console.error(err);setText('dayHeading','Não foi possível carregar os dados do cronograma.');}
setInterval(()=>{if(state.timer)renderTimer()},1000);
}
document.addEventListener('DOMContentLoaded',init);
