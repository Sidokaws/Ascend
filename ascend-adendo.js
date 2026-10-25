'use strict';
/* Adendo 25/10/2026 — incremental e reversível: dados em state.adendo2510. */
(function(){
const ACTIVE_WEEKS=new Set([3,5,7,8,10,11,12,14,15,16]);
const ESPECIALIDADES=['Apelação','Memoriais','Resposta à Acusação','RESE','Agravo em Execução','Contrarrazões'];
const formatPoints=n=>Number(n||0).toFixed(2).replace('.',',');
function st(){if(!state.adendo2510||typeof state.adendo2510!=='object')state.adendo2510={};const a=state.adendo2510;a.discursive=a.discursive||{};a.exposure=a.exposure||{};a.audits=a.audits||{};return a}
function actionCount(type){return plan?.missions?.filter(m=>m.type===type).length||0}
function officialSim(s){return ACTIVE_WEEKS.has(Number(s.week))}
function sampleStatus(id){return st().exposure[id]||'pendente'}
function htmlEscape(value){return safe(String(value??''))}
function sourceSim(s){
const pkg=plan.simulation_packages?.[s.id]||Object.values(plan.simulation_packages||{}).find(x=>x.id===s.id||x.data===s.date);
const caseId=pkg?.caso||null;
const prev=caseId?plan.missions.filter(m=>m.date<s.date&&m.piece_case_id===caseId):[];
return {caseId,prev};
}
function scoreProgress(){
const exams=(state.grades||[]).filter(g=>g.type==='Simulado'&&g.confirmed&&g.complete&&g.is_full_piece&&officialSim(plan.simulations.find(s=>s.id===(g.simId||g.topic))||{week:0})&&sampleStatus(g.simId||g.topic)==='primeiro');
const chosen=[...new Map(exams.map(g=>[g.simId||g.topic,g])).values()].sort((a,b)=>a.date.localeCompare(b.date));
let streak=0;for(let i=chosen.length-1;i>=0;i--){const g=chosen[i];if(!Array.isArray(g.question_scores)||g.question_scores.length!==4)break;const total=Number(g.score)+g.question_scores.reduce((n,x)=>n+Number(x.score||0),0);if(total>=7.5)streak++;else break}
return {streak,completed:chosen.length};
}
function renderQuality(){
if(!plan)return;const el=$('addendumQuality');if(!el)return;const prog=scoreProgress();
const day=plan.days.find(x=>x.date===selectedDate),week=day?.week||1;
const saved=st().audits[week],missions=plan.missions.filter(m=>Number(m.week)===Number(week));
const done=missions.filter(m=>state.missions[m.id]?.validated===true).length;
const lastPiece=(state.grades||[]).filter(g=>g.type==='Peça'&&g.confirmed).sort((a,b)=>b.date.localeCompare(a.date))[0];
const due=typeof reviews==='function'?reviews().filter(x=>x.date<=today()&&!state.reviewDone?.[x.key]).length:0;
el.innerHTML='<div class="adendo-box"><div class="eyebrow">ADENDO DE EXECUÇÃO • 25/10/2026</div><h3>Prioridade, evidência e revisão sem aumentar as 335h</h3>'
+'<p>Objetivo flexível: <b>cerca de 70%</b> das oportunidades escritas nas seis grandes famílias e <b>30%</b> nas demais medidas. Não é previsão de probabilidade. Nenhuma atividade do plano-base foi removida.</p>'
+'<p>Materiais: slides, PDFs, modelos e Vade Mecum CEISC. Videoaulas somente para dúvidas pontuais; sem recomendação de recompra do curso nesta etapa.</p>'
+'<p><b>Prontidão em simulados de primeiro contato:</b> '+prog.streak+' resultado(s) consecutivo(s) ≥ 7,5/10 com notas por questão; objetivo interno de três. Não equivale à garantia de aprovação.</p>'
+'<div class="adendo-alert"><b><span aria-hidden="true">◈</span> REAPROVEITAMENTO OAB 48</b><p>Edital complementar previsto para <b>12/11/2026</b>. Inscrição prevista de <b>23 a 30/11/2026</b>, sujeita a mudanças. Verifique edital e condições no <a href="https://examedeordem.oab.org.br/Calendario" target="_blank" rel="noopener noreferrer">calendário oficial da OAB</a>. Conferir também materiais permitidos antes dos simulados finais.</p></div>'
+'<div class="adendo-audit"><h4>Auditoria semanal de cobertura (sem pontuação automática)</h4>'
+'<label for="adendoWeek">Semana a verificar</label><select id="adendoWeek">'+Array.from({length:17},(_,i)=>'<option value="'+(i+1)+'" '+(week===i+1?'selected':'')+'>Semana '+(i+1)+'</option>').join('')+'</select>'
+'<p class="muted small" id="adendoAuditStats">Semana '+week+': '+done+'/'+missions.length+' missões-base validadas; última peça corrigida: '+htmlEscape(lastPiece?.topic||'nenhuma')+'; revisões vencidas sem registro: '+due+'.</p>'
+'<label for="adendoAuditText">Conferência: peças/modalidades, TBFP, fundamentos e prazo, itens A/B, erros D+1/7/15/30, ineditismo dos enunciados e faltas priorizadas</label>'
+'<textarea id="adendoAuditText" placeholder="Anote o que foi verificado, lacunas, prioridades e como remanejar sem empilhar...">'+htmlEscape(saved?.notes||'')+'</textarea>'
+'<button class="btn small-btn" id="adendoAuditSave">Registrar auditoria executada</button><p class="muted small">Último registro dessa semana: '+htmlEscape(saved?.date||'nenhum')+'. Relatar pendências não marca atividades como concluídas.</p></div>'
+'</div>';
}
function renderSim(){
const el=$('addendumSims');if(!el||!plan)return;
const sessions=plan.simulations.filter(officialSim);
el.innerHTML='<div class="adendo-box"><h3>Primeiro contato ou revisão? (10 simulados obrigatórios)</h3>'
+'<p>Caso anteriormente agendado não significa caso já resolvido. O rótulo depende do que você efetivamente viu ou corrigiu. Não confundir os 15 pacotes arquivados da V1.2 com as dez provas da V2.1.</p>'
+sessions.map(s=>{
const source=sourceSim(s),already=source.prev.length>0,actual=source.prev.some(m=>!!state.missions[m.id]?.evidence);
return '<div class="adendo-sim"><b>'+htmlEscape(s.id)+'</b> · '+format(s.date)+' · Caso '+htmlEscape(source.caseId||'a confirmar')
 +(already?'<p class="muted small">Atenção: o caso aparece no roteiro anterior'+(actual?' e já há produção registrada.':' (sem produção confirmada).')+' Conferir exposição antes de chamar de inédito.</p>':'')
 +'<label for="exposure-'+s.id+'">Classificação da sua primeira tentativa</label>'
 +'<select id="exposure-'+s.id+'" data-adendo-exposure="'+s.id+'">'+[['pendente','Ainda não confirmado'],['primeiro','INÉDITO PARA MIM — sem contato prévio'],['revisao','REVISÃO — já vi ou resolvi']].map(([v,t])=>'<option value="'+v+'" '+(sampleStatus(s.id)===v?'selected':'')+'>'+t+'</option>').join('')+'</select></div>';
}).join('')+'</div>';
}
function renderMission(){
const el=$('addendumMission');if(!el)return;el.innerHTML='';
const id=$('missionForm').elements.id.value,m=state.missions[id];if(!m)return;
const piece=['peca_completa','treino_guiado_peca','oficina_peca'].includes(m.type)||Boolean(m.piece_case_id);
if(piece){
const map={reconhecimento:'Contato teórico',guiado:'Oficina guiada',integral_consulta:'Peça integral com apoio',autonomo:'Peça integral autônoma'};
el.innerHTML='<div class="adendo-box"><b>Quatro etapas de escrita</b><p class="muted small">1. Contato teórico → 2. Esqueleto → 3. Oficina guiada → 4. Peça integral autônoma. A etapa registrada é "'+htmlEscape(map[m.learning_stage]||'não avaliada')+'".</p>'
+'<p class="muted small">Para contar como peça integral: texto do início ao fim, tentativa própria sem modelo pronto, correção e registro expresso de autonomia. Uso do Vade permitido não equivale a copiar modelo.</p></div>';
}
if(m.type==='discursiva'&&m.evidence&&!m.validated){
const prior=st().discursive[id]||{};
el.innerHTML='<div class="adendo-box"><b>Discursiva — comprovar A e B para validar</b><p class="muted small">A correção do mentor é manual. Preencha dois itens e a análise separada; identifique o erro ou registre explicitamente que não houve.</p>'
+[['a','Resposta produzida — A'],['b','Resposta produzida — B'],['corr_a','Correção do item A (fundamento e conclusão)'],['corr_b','Correção do item B (fundamento e conclusão)'],['erro','Erros observados ou "sem erros após conferência"']].map(([key,label])=>'<label for="adendo-disc-'+key+'">'+label+'</label><textarea id="adendo-disc-'+key+'" data-adendo-disc="'+key+'" rows="2">'+htmlEscape(prior[key]||'')+'</textarea>').join('')
+'</div>';
}
}
function renderGrade(){
const el=$('addendumGrade');if(!el)return;const form=$('gradeForm'),typ=form.elements.type.value;
if(typ==='Simulado'){
el.innerHTML='<div class="adendo-box"><b>Quatro discursivas — registrar cada questão</b><p class="muted small">Cada questão tem máximo de 1,25 ponto. O total será somado automaticamente ao campo de discursivas. Registrar os itens A/B corrigidos e seus erros antes de concluir a prova.</p>'
+Array.from({length:4},(_,i)=>'<label>Questão '+(i+1)+' — nota (0 a 1,25)</label><input id="ad-sim-score-'+i+'" type="number" min="0" max="1.25" step=".01" placeholder="Nota corrigida">'
+'<label>Itens A e B corrigidos — Questão '+(i+1)+'</label><textarea id="ad-sim-review-'+i+'" rows="2" placeholder="Item A: ...; Item B: ...; erros, se houver"></textarea>').join('')
+'<p class="muted small">Peça: pontuação no campo principal (máximo 5). Use fonte oficial identificada ou marque correção pedagógica.</p></div>';
}else if(typ==='Discursiva'){
el.innerHTML='<div class="adendo-box"><b>Correção A/B</b>'
+['Resposta A','Resposta B','Correção do item A','Correção do item B','Erros ou ausência verificada'].map((label,i)=>'<label>'+label+'</label><textarea id="ad-single-'+i+'" rows="2"></textarea>').join('')+'</div>';
}else el.innerHTML='';
}
const previousOpenGrade=openGrade;
openGrade=function(type,topic=''){previousOpenGrade(type,topic);renderGrade()};
const previousOpenMission=openMission;
openMission=function(id){previousOpenMission(id);renderMission()};
const previousRecordGrade=recordGrade;
recordGrade=function(e){
const f=e.target,typ=f?.elements?.type?.value;if(!f)return previousRecordGrade(e);
const before=state.grades.length;
let meta=null;
if(typ==='Simulado'&&f.elements.complete.value==='true'){
const questions=[];
for(let i=0;i<4;i++){
const score=$('ad-sim-score-'+i)?.value,review=$('ad-sim-review-'+i)?.value?.trim();
if(score===''||score==null||!review||review.length<8){e.preventDefault();notify('Para concluir, informe a nota e a correção A/B de cada uma das quatro questões.');return}
const number=Number(score);if(!Number.isFinite(number)||number<0||number>1.25){e.preventDefault();notify('Cada discursiva admite nota de 0 a 1,25.');return}
questions.push({score:number,review});
}
f.elements.disc_score.value=questions.reduce((sum,x)=>sum+x.score,0).toFixed(2);
meta={questions};
}
if(typ==='Discursiva'){
const details=Array.from({length:5},(_,i)=>$('ad-single-'+i)?.value?.trim()||'');
if(details.some(x=>x.length<8)){e.preventDefault();notify('Para validar a discursiva, registre A, B, as duas correções e os erros (ou ausência deles).');return}
meta={items:{a:details[0],b:details[1],cor_a:details[2],cor_b:details[3],erro:details[4]}};
}
previousRecordGrade(e);
if(meta&&state.grades.length>before){
const g=state.grades.at(-1);if(meta.questions)g.question_scores=meta.questions;if(meta.items)g.items_ab=meta.items;
save();render();
}
};
const previousValidate=validateMission;
validateMission=function(e){
const f=e.target,id=f.elements.id.value,m=state.missions[id];
if(m?.type==='discursiva'&&f.elements.outcome.value==='validado'){
const keys=['a','b','corr_a','corr_b','erro'];const values={};
for(const k of keys){values[k]=$('adendo-disc-'+k)?.value?.trim()||'';if(values[k].length<8){e.preventDefault();notify('Antes de validar, complete as respostas e correções dos itens A/B e registre os erros.');return}}
st().discursive[id]={...values,date:today()};
}
const piece=!!m?.piece_case_id||['peca_completa','treino_guiado_peca'].includes(m?.type);
if(piece&&f.elements.outcome.value==='validado'&&f.elements.is_full_piece.value==='true'){
if(m.learning_stage!=='autonomo'||f.elements.used_model.value!=='false'){
e.preventDefault();notify('Uma peça só conta como integral autônoma depois de produção própria completa, sem modelo pronto e correção. Se foi oficina guiada, marque peça integral: Não.');return
}
}
previousValidate(e);
};
function bind(){
document.addEventListener('change',e=>{const field=e.target.closest('[data-adendo-exposure]');if(!field)return;st().exposure[field.dataset.adendoExposure]=field.value;save();render()});
document.addEventListener('click',e=>{if(e.target.id!=='adendoAuditSave')return;const week=$('adendoWeek')?.value,notes=$('adendoAuditText')?.value?.trim();if(!week||!notes||notes.length<20){notify('Descreva o que foi de fato conferido e as pendências desta semana.');return}st().audits[week]={notes,date:today()};save();render();notify('Auditoria semanal registrada; nenhuma missão marcada como concluída.')});
}
const previousRender=render;
render=function(){previousRender();if(!plan)return;st();renderQuality();renderSim()};
document.addEventListener('DOMContentLoaded',bind);
})();