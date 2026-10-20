
'use strict';
/* ASCEND 1.2: layer over original dashboard. Personal data stays only in localStorage. */
(function(){
const esc=safe;
const htmlSrc=f=>{const n=esc(f?.arquivo||'Arquivo não identificado');const p=f?.paginas||[];const page=Number(p[0])||0;return '<div class="v12-source"><strong>'+n+'</strong>'+(p.length?'<div>Página'+(p[1]&&p[1]!==p[0]?'s '+p[0]+'–'+p[1]:' '+p[0])+'</div>':'')+'<button type="button" class="v12-file-button" data-pdf-name="'+n+'" data-pdf-page="'+page+'">Selecionar PDF original</button></div>'};
let pendingPdf=null,activeMissionId=null;
function correctedDependency(m){
 if(m.type!=='correcao')return false;
 const day=dayMissions(m.date),i=day.findIndex(x=>x.id===m.id);
 const previous=day.slice(0,i).reverse().find(x=>x.type!=='correcao');
 return Boolean(previous&&!previous.evidence);
}
function secretSim(m){return m?.type==='simulado_completo'&&!m.release_state}
function allowedPattern(m){return !!m?.evidence && (m.type!=='correcao'||!correctedDependency(m))}
function omitPattern(f){return /padr[aã]o.{0,18}resposta/i.test(f?.arquivo||'')}
function sourcesHtml(files,showPattern=false){
const filtered=(files||[]).filter(f=>showPattern||!omitPattern(f));
const uniq=new Set();
return filtered.filter(f=>{const k=f.arquivo+JSON.stringify(f.paginas);if(uniq.has(k))return false;uniq.add(k);return true}).map(htmlSrc).join('')||'<p class="v12-note">Sem PDF específico nesta etapa. Consulte o Vade Mecum e o roteiro.</p>';
}
function questionCatalogHtml(m){
const ids=String(m.question_ids||m.title||'').match(/Q\d{3}/g)||[];
return ids.map(id=>{
const q=plan.question_catalog?.[id];if(!q)return '';
return '<div class="v12-source"><strong>'+esc(id+' — '+q.tema)+'</strong><div>Enunciado: Treinamento de Questões _ Enunciado.pdf, p. '+esc(q.pagina_enunciado)+'</div>'+(q.lacuna?'<span class="v12-phrase">Sem apostila específica no acervo; '+esc(q.apoio_vade||'usar Vade')+'</span>':'')+'<button type="button" class="v12-file-button" data-pdf-name="Treinamento de Questões _ Enunciado.pdf" data-pdf-page="'+esc(q.pagina_enunciado)+'">Selecionar PDF do enunciado</button></div>'
}).join('');
}
function caseHtml(m){
const id=String(m.piece_case_id||'').trim();
if(!id)return '';
const author=plan.study_pack?.casos_autorais_identificados?.[id];
if(author){return '<div class="v12-section-title">Enunciado autoral — sem espelho oficial</div><div class="v12-case"><h4>'+esc(author[0])+' · '+esc(id)+'</h4><p>'+esc(author[1])+'</p></div>'}
const p=plan.piece_case_catalog?.[id];
return p?'<div class="v12-section-title">Caso '+esc(id)+' · '+esc(p.titulo)+'</div>'+htmlSrc(p.enunciado)+(allowedPattern(m)?'<details><summary>Padrão CEISC — disponibilizado após a tentativa</summary>'+htmlSrc(p.padrao_resposta)+'</details>':'<p class="v12-note">O padrão CEISC só será indicado após enviar sua tentativa.</p>'):'';
}
function diagnosisHtml(){
const items=plan.study_pack?.diagnostico_seis_situacoes||[];
return '<div class="v12-section-title">Caderno de diagnóstico — situações reais do plano</div><div class="notice">Os 6 mini-casos abaixo são exercícios autorais, não questões oficiais da FGV. Identifique fase, peça, fundamento no Vade e confiança 0–2. Não há gabarito nesta tela.</div>'+items.map(item=>'<div class="v12-case"><h4>'+esc(item[0])+'</h4><p>'+esc(item[1])+'</p></div>').join('');
}
function packageHtml(m){
const pkg=Object.values(plan.simulation_packages||{}).find(p=>p.data===m.date);
if(!pkg)return '<div class="v12-note">Pacote não localizado neste plano.</div>';
const cas=plan.piece_case_catalog?.[pkg.caso];
return '<div class="v12-section-title">Pacote de revisão liberado · '+esc(pkg.id)+'</div><div class="notice">Simulado de REVISÃO, composto por itens já presentes no banco. Não é prova inédita. Não consulte padrões de resposta antes de enviar.</div><div class="v12-case"><h4>Peça '+esc(pkg.caso)+' — '+esc(cas?.titulo||'')+'</h4>'+(cas?htmlSrc(cas.enunciado):'')+'</div><div class="v12-section-title">Quatro discursivas A/B</div>'+pkg.questoes.map(q=>{const o=plan.question_catalog?.[q];return '<div class="v12-source"><strong>'+esc(q+' · '+(o?.tema||''))+'</strong><div>Treinamento de Questões _ Enunciado.pdf, p. '+esc(o?.pagina_enunciado||'não catalogada')+'</div><button class="v12-file-button" type="button" data-pdf-name="Treinamento de Questões _ Enunciado.pdf" data-pdf-page="'+esc(o?.pagina_enunciado||'')+'">Selecionar PDF</button></div>'}).join('')+'<div class="v12-note">Caso e questões ficam visíveis no aplicativo após o início. O JSON de um site estático não é proteção contra acesso técnico ao pacote.</div>';
}
function renderGuide(m){
let out='';
if(correctedDependency(m))return '<div class="v12-locked"><h4>⛨ Correção bloqueada</h4><p>Envie primeiro a produção da missão anterior. O padrão de resposta só pode ser consultado após a tentativa.</p></div>';
if(secretSim(m))return '<div class="v12-locked"><h4>♜ PORTÃO DE PRONTIDÃO</h4><p>Este é um simulado de revisão. Antes de revelar os casos, confirme que o mentor avaliou sua prontidão. Se não houver prontidão, transforme a sessão em oficina guiada; ela não contará como simulado integral.</p><div class="actions"><button type="button" class="btn primary" data-release-mode="full" data-release-id="'+esc(m.id)+'">Iniciar com liberação da mentoria</button><button type="button" class="btn" data-release-mode="guided" data-release-id="'+esc(m.id)+'">Adaptar para oficina guiada</button></div><p class="v12-note">A liberação é um registro manual: o aplicativo não verifica automaticamente o mentor.</p></div>';
out+='<div class="v12-summary"><div><span class="eyebrow">TEMPO PREVISTO</span><strong>'+esc(m.duration_min)+' minutos</strong></div><div><span class="eyebrow">ETAPA DE APRENDIZAGEM</span><strong>'+esc(m.stage||m.learning_stage||'Oficina')+'</strong></div></div>';
if(m.requires_readiness_gate)out+='<div class="notice">Portão de prontidão: reconhecimento, Vade, estrutura e TBFP devem ser demonstrados antes de treino autônomo. Se necessário, utilize modelo e registre como oficina guiada.</div>';
if(m.type==='diagnostico')out+=diagnosisHtml();
if(m.piece_case_id&&m.type!=='simulado_completo')out+=caseHtml(m);
if(m.type==='simulado_completo')out+=packageHtml(m);
if(m.question_ids)out+='<div class="v12-section-title">Questões e páginas do enunciado</div>'+questionCatalogHtml(m);
out+='<div class="v12-section-title">Roteiro de execução</div>';
const steps=Array.isArray(m.step_by_step)?m.step_by_step:[];
out+=steps.map((p,i)=>'<div class="v12-step"><div class="v12-step-num">'+(i+1).toString().padStart(2,'0')+'</div><div class="v12-step-body"><div class="v12-step-head"><span>ETAPA '+(i+1)+'</span><span>'+esc(p.minutos||0)+' min</span></div><p>'+esc(p.instrução||p.instrucao||'')+'</p>'+((p.fontes||[]).length?'<details><summary>Materiais exatos desta etapa</summary>'+sourcesHtml(p.fontes,allowedPattern(m))+'</details>':'')+'</div></div>').join('');
out+='<div class="v12-section-title">Entrega obrigatória</div><div class="v12-objective"><p>'+esc(m.deliverable||m.evidence_required||'Registrar produção.')+'</p></div>';
out+='<div class="v12-section-title">Critério de sucesso</div><p class="v12-note">'+esc(m.success_condition||'Produção enviada e corrigida.')+'</p>';
if(m.teacher_note)out+='<p class="v12-note"><b>Nota da mentoria:</b> '+esc(m.teacher_note)+'</p>';
return out;
}
const oldOpenMission=openMission;
openMission=function(id){
const m=state.missions[id];if(!m)return;
activeMissionId=id;oldOpenMission(id);
$('v12MissionOutline').innerHTML=renderGuide(m);
const blocked=secretSim(m)||correctedDependency(m);
$('missionForm').classList.toggle('hidden',blocked);
$('validateBlock').classList.toggle('hidden',blocked||!m.evidence||m.validated===true);
$('v12MissionAction').innerHTML=blocked?'<p class="v12-phrase">Produção e validação permanecerão bloqueadas até cumprir esta condição.</p>':'';
};
function objectiveHtml(day,simLocked){
if(!day)return '';
return '<div class="v12-objective"><span class="v12-focus-tag">'+esc(day.day_id)+' · '+esc(day.weekday)+' · SEMANA '+day.week+'</span><h3>'+esc(day.objetivo_do_dia||day.topic)+'</h3><p>'+esc(day.topic)+' · '+Math.round(Number(day.planned_hours||0)*60)+' minutos previstos</p></div>'+(!simLocked?'<details><summary class="muted small">Materiais principais do dia — nomes e páginas</summary>'+sourcesHtml(day.materiais_principais||[])+'</details>':'<div class="v12-note">Referências do pacote serão liberadas ao iniciar o simulado.</div>');
}
renderDaily=function(){
const day=getDay(selectedDate),all=dayMissions(selectedDate);
setText('dayHeading',day?day.day_id+' · '+day.weekday+' · Semana '+day.week:'Dia fora do período');
if(!day){$('dailyMissions').innerHTML='<div class="empty">Nenhuma atividade para esta data.</div>';return}
if(day.mode==='Descanso'){$('dailyMissions').innerHTML=objectiveHtml(day,false)+'<div class="notice">Descanso programado: nenhuma penalidade ou recuperação compulsória.</div>';return}
const simLocked=all.some(m=>secretSim(m));
const next=all.find(m=>!m.validated)||all[0];
const items=all.map(m=>{
const current=m.id===next?.id,blocked=correctedDependency(m);
const concealed=secretSim(m);
let html='<div class="item" style="'+(current?'border-color:#8069d0;box-shadow:inset 3px 0 0 #9478ff':'')+'"><div class="section-head" style="margin:0">'+statusBadge(m)+'<span class="muted tiny">'+esc(m.duration_min)+' min · '+esc(m.xp_base)+' XP</span></div>';
html+='<div class="item-title">'+esc(m.summary_title||m.title)+'</div>';
if(current)html+='<div class="v12-focus-tag">✦ MISSÃO PRIORITÁRIA</div>';
if(concealed)html+='<p class="item-meta">Pacote de revisão sigiloso até o início autorizado.</p>';
else if(blocked)html+='<p class="item-meta">Correção liberada após a produção anterior.</p>';
else html+='<p class="item-meta">Entrega: '+esc(m.deliverable||m.evidence_required||'Produção escrita')+'</p>';
if(m.evidence)html+='<p class="item-meta"><b>Produção registrada:</b> '+esc(m.evidence.slice(0,180))+(m.evidence.length>180?'…':'')+'</p>';
html+='<div class="item-actions"><button class="btn '+(current?'primary':'')+' small-btn" data-open-mission="'+esc(m.id)+'">'+(concealed?'Ver portão de prontidão':m.evidence?'Ver correção/registro':'Abrir passo a passo')+'</button></div></div>';
return html;
}).join('');
$('dailyMissions').innerHTML=objectiveHtml(day,simLocked)+items;
$('timerMission').innerHTML='<option value="">Sem vincular missão</option>'+all.map(m=>'<option value="'+esc(m.id)+'">'+esc(m.summary_title||m.title).slice(0,65)+'</option>').join('');
if(state.timer?.missionId)$('timerMission').value=state.timer.missionId;
};
const oldCalendar=renderCalendar;
renderCalendar=function(){
oldCalendar();const m=dayMissions(selectedDate).find(secretSim);
if(m){const d=getDay(selectedDate);$('calDayDetails').innerHTML='<p class="muted">'+esc(d.weekday)+' · Semana '+d.week+'</p><span class="tag amber">Simulado de revisão condicional</span><p class="v12-note">Conteúdo oculto até iniciar o pacote com liberação da mentoria.</p>';}
};
const oldQuestions=renderQuestions;
renderQuestions=function(){oldQuestions();renderQuestionCatalog($('questionCatalogSearch')?.value||'')};
const oldPieces=renderPieces;
renderPieces=function(){oldPieces();renderPieceCatalog($('pieceCatalogSearch')?.value||'')};
function renderQuestionCatalog(query){
const target=$('v12QuestionCatalog');if(!target||!plan)return;
const t=query.toLocaleLowerCase('pt-BR');const catalog=Object.values(plan.question_catalog||{}).filter(q=>(q.id+' '+q.tema).toLocaleLowerCase('pt-BR').includes(t));target.innerHTML=catalog.map(q=>'<div class="item"><b>'+esc(q.id+' · '+q.tema)+'</b><p>Enunciado: Treinamento de Questões _ Enunciado.pdf, p. '+esc(q.pagina_enunciado)+'</p>'+(q.lacuna?'<span class="tag amber">Lacuna de material teórico</span><p>'+esc(q.apoio_vade)+'</p>':'')+'<button type="button" class="v12-file-button" data-pdf-name="Treinamento de Questões _ Enunciado.pdf" data-pdf-page="'+esc(q.pagina_enunciado)+'">Selecionar PDF original</button></div>').join('');
}
function renderPieceCatalog(query){
const target=$('v12PieceCatalog');if(!target||!plan)return;
const t=query.toLocaleLowerCase('pt-BR');const catalog=Object.values(plan.piece_case_catalog||{}).filter(p=>(p.id+' '+p.titulo).toLocaleLowerCase('pt-BR').includes(t));
target.innerHTML=catalog.map(p=>'<div class="item"><b>'+esc(p.id+' · '+p.titulo)+'</b><p>'+esc(p.enunciado?.referencia||'Sem referência')+'</p><button type="button" class="v12-file-button" data-pdf-name="'+esc(p.enunciado?.arquivo||'')+'" data-pdf-page="'+esc(p.enunciado?.paginas?.[0]||'')+'">Selecionar enunciado original</button></div>').join('');
}
const oldGrade=recordGrade;
recordGrade=function(e){
const form=e.target,typ=form?.elements?.type?.value;
if(typ==='Simulado'&&form.elements.complete.value==='true'){
const id=form.elements.topic.value;
const session=missions().find(m=>m.type==='simulado_completo'&&(m.title.includes(id)||Object.values(plan.simulation_packages||{}).some(p=>p.id===id&&p.data===m.date)));
if(!session||session.release_state!=='full'||!session.release_reference||!session.evidence){
e.preventDefault();notify('Simulado completo exige liberação documentada, produção enviada e prontidão demonstrada.');return;
}}
oldGrade(e);
};
function releasePackage(id,mode){
const m=state.missions[id];if(!m||!secretSim(m))return;
let ref='';
if(mode==='full'){
ref=prompt('Referência da confirmação de prontidão/liberação pelo mentor (ex.: sessão e data). O aplicativo não verifica esta informação:');
if(!ref||ref.trim().length<5){notify('Sem referência de liberação, use oficina guiada.');return}
if(!confirm('Confirma prontidão demonstrada (fase/peça, Vade, estrutura e TBFP) e liberação do mentor? O pacote será revelado ao começar.'))return;
}else if(!confirm('Converter esta janela em oficina guiada? Ela NÃO contará como simulado integral.'))return;
if(state.timer?.startedAt){notify('Encerre ou pause a sessão de cronômetro atual antes de começar outra.');return}
m.release_state=mode;m.release_reference=mode==='full'?ref.trim():'Oficina guiada – simulado não integral';m.released_at=new Date().toISOString();m.adapted_simulation=mode==='guided';
state.timer={startedAt:Date.now(),pausedAt:null,pauseSeconds:0,missionId:m.id};
save();$('missionDialog').close();openMission(id);render();notify(mode==='full'?'Pacote de revisão liberado; cronômetro iniciado.':'Oficina guiada aberta; cronômetro iniciado.');
}
function bindV12(){
document.addEventListener('click',e=>{
const b=e.target.closest('[data-release-mode]');if(b)releasePackage(b.dataset.releaseId,b.dataset.releaseMode);
const pdf=e.target.closest('[data-pdf-name]');if(pdf){pendingPdf={name:pdf.dataset.pdfName,page:pdf.dataset.pdfPage};$('pdfFileInput').click();}
});
$('pdfFileInput')?.addEventListener('change',e=>{
const file=e.target.files?.[0];if(!file||!pendingPdf)return;
if(file.name.toLocaleLowerCase('pt-BR')!==pendingPdf.name.toLocaleLowerCase('pt-BR')&&!confirm('O arquivo selecionado tem nome diferente do referenciado no plano. Abrir mesmo assim?')){e.target.value='';return}
const url=URL.createObjectURL(file)+'#page='+encodeURIComponent(pendingPdf.page||1);
const w=window.open(url,'_blank','noopener,noreferrer');if(!w)notify('Pop-up bloqueado: autorize a abertura de arquivos locais.');
setTimeout(()=>URL.revokeObjectURL(url.split('#')[0]),60000);e.target.value='';pendingPdf=null;
});
$('questionCatalogSearch')?.addEventListener('input',e=>renderQuestionCatalog(e.target.value));
$('pieceCatalogSearch')?.addEventListener('input',e=>renderPieceCatalog(e.target.value));
$('undoV12Btn')?.addEventListener('click',()=>{
if(state.migration_disabled===true){if(!confirm('Reaplicar o plano executável V1.2, preservando os registros atuais?'))return;state.migration_disabled=false;delete state.plan_version;mergePlan(plan);render();$('undoV12Btn').textContent='↶ Desfazer migração V1.2';notify('V1.2 reaplicada com registros preservados.');return}
let old;try{old=JSON.parse(localStorage.getItem('ascendOab48V3_PreMigration_v12'))}catch{}
if(!old?.state){notify('Não há cópia local anterior à migração neste navegador.');return}
if(!confirm('Restaurar o estado anterior à migração V1.2 neste navegador? Faça backup atual antes: alterações posteriores poderão ser perdidas.'))return;
state={...old.state,migration_disabled:true};save();render();$('undoV12Btn').textContent='↻ Reaplicar instruções V1.2';notify('Estado anterior restaurado. Reaplicação V1.2 suspensa neste navegador.');
});
}
document.addEventListener('DOMContentLoaded',()=>{
bindV12();const el=$('undoV12Btn');if(el&&state.migration_disabled===true)el.textContent='↻ Reaplicar instruções V1.2';
});
})();
