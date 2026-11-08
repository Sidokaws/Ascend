'use strict';
/* SYSTEM // ASCEND — calendário de 105 dias / 300 horas
   Importação LOCAL, backup automático e integridade das versões anteriores.
   Não publica o plano do aluno nem abre gabaritos antes da tentativa.
*/
(function(){
const TARGET='2.3-105',ACTIVE_KEY='ascendPlanSelected',PLAN_KEY='ascendOab48Plan105_v23',PREBACKUP='ascendOab48V3_Backup_105_20261109';
const initialSchema=()=>plan?.schema_version===TARGET;
const I=id=>document.getElementById(id);
const ns=v=>safe(String(v??''));
function validate(data){
 if(!data||data.schema_version!==TARGET||!Array.isArray(data.days)||data.days.length!==105||!Array.isArray(data.missions)||data.missions.length!==276)throw Error('Arquivo não é o cronograma executável de 105 dias produzido para esta atualização.');
 const [first,last]=[data.days[0]?.date,data.days.at(-1)?.date];
 if(first!=='2026-11-09'||last!=='2027-02-21')throw Error('Datas do plano divergentes.');
 if(data.simulations?.length!==10||data.date_start!==first||data.targets?.planned_hours!==300)throw Error('Simulados, data inicial ou 300 horas divergentes.');
 const dates=new Set(),ids=new Set();let sum=0,rest=0,off=0,disc=0,sim=0;
 for(const day of data.days){
  if(dates.has(day.date))throw Error('Data duplicada: '+day.date);
  dates.add(day.date);
  const d=new Date(day.date+'T12:00:00');
  const weekday=d.getDay();
  if(day.weekday!==(weekday===0?'domingo':['segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'][weekday-1]))throw Error('Dia da semana incorreto: '+day.date);
  sum+=Number(day.planned_minutes||0);
  if(weekday===6){rest++;if(day.planned_minutes!==0)throw Error('Sábado com carga: '+day.date)}
 }
 for(const m of data.missions){
  if(ids.has(m.id)||!dates.has(m.date))throw Error('Missão duplicada ou fora da agenda: '+m.id);
  ids.add(m.id);
  if((m.step_by_step||[]).reduce((n,s)=>n+Number(s.minutos||0),0)!==Number(m.duration_min))throw Error('Soma dos passos divergente: '+m.id);
  if(m.type==='treino_guiado_peca')off++;
  if(m.type==='discursiva')disc++;
  if(m.type==='simulado_completo')sim++;
 }
 if(rest!==15||sum!==18000||off!==30||disc!==85||sim!==10)throw Error('Contagens do cronograma inconsistentes: '+JSON.stringify({rest,sum,off,disc,sim}));
 for(const d of data.days){
  const total=data.missions.filter(m=>m.date===d.date).reduce((n,m)=>n+Number(m.duration_min),0);
  if(total!==d.planned_minutes)throw Error('Tempo diário não fecha: '+d.date);
 }
 return data;
}
function statusPanel(){
 const info=I('plan105Info');if(!info)return;
 const active=initialSchema();
 const saved=localStorage.getItem(PLAN_KEY);
 info.innerHTML=active?'<b>VIGENTE: 105 dias (09/11/2026–21/02/2027) • 300 horas.</b> Backup dos 119 dias preservado. As atividades com enunciado pendente permanecerão bloqueadas até receber fonte identificada.'
 :'<b>VIGENTE: 119 dias (histórico V2.1).</b> '+(saved?'A agenda de 105 dias já está armazenada. Selecione o botão de ativação para voltar a ela.':'Para ativar a agenda revisada, selecione o arquivo JSON de 105 dias fornecido na conversa. É uma operação única neste navegador.');
 I('restorePlan119').disabled=!active;
}
function countPlan(){
 if(!initialSchema())return;
 const activeM=plan.missions;
 const validated=activeM.filter(m=>state.missions[m.id]?.validated===true).length;
 const pieces=activeM.filter(m=>m.type==='treino_guiado_peca'&&state.missions[m.id]?.validated===true&&state.missions[m.id]?.is_full_piece===true).length;
 const simGrades=(state.grades||[]).filter(g=>g.type==='Simulado'&&g.confirmed&&g.complete&&g.is_full_piece&&g.plan_schema===TARGET);
 const sims=new Set(simGrades.map(g=>g.simId||g.topic)).size;
 const disc=activeM.filter(m=>m.type==='discursiva'&&state.missions[m.id]?.validated===true).length+4*sims;
 setText('statMissions',validated+' / '+activeM.length);
 setText('statPieces',(pieces+sims)+' / 40');
 setText('statQuestions',disc+' / 125');
 setText('statSims',sims+' / 10');
 setText('heroDays','Dia '+Math.max(0,plan.days.findIndex(d=>d.date===today())+1)+' / 105');
 const now=Math.max(0,plan.days.findIndex(d=>d.date===today())+1);
 I('seasonBar').style.width=Math.min(100,now/105*100)+'%';
 const objective=document.querySelector('.statsline span');
 // Static legacy season text is updated only when a 105-day plan is active.
 for(const e of document.querySelectorAll('.statsline span')){
  if(e.textContent?.includes('26/10/2026 – 21/02/2027'))e.textContent='09/11/2026 – 21/02/2027';
 }
 const nav=document.querySelector('[data-page="calendar"] .nav-text');
 if(nav)nav.textContent='105 dias';
 for(const e of document.querySelectorAll('#page-calendar h3, #page-theory .notice')){
  if(e.textContent?.includes('Mapa de 119 dias'))e.textContent='Mapa de 105 dias';
  if(e.textContent?.includes('335 horas totais'))e.textContent='Na reprogramação de 105 dias, e-books e slides já estão incluídos nas 300 horas totais, sem carga adicional. Registre as páginas efetivamente estudadas.';
 }
 const txt=I('dataStatus');
 if(txt)txt.textContent='PLANO VIGENTE: OAB 48 — 105 dias · 300 horas · 276 atividades · '+validated+' validadas nesta temporada. Histórico V2.1 e XP mantidos. Não presume enunciados inexistentes.';
}
function auditStats(){
 if(!initialSchema())return;
 const failed=plan.missions.filter(m=>state.missions[m.id]?.source_pending&&['discursiva','treino_guiado_peca','simulado_completo'].includes(m.type));
 const missingDisc=failed.filter(m=>m.type==='discursiva').length;
 const missingOffice=failed.filter(m=>m.type==='treino_guiado_peca').length;
 const missingSim=failed.filter(m=>m.type==='simulado_completo').length;
 const el=I('plan105Banner');
 if(el)el.innerHTML='<div class="notice plan105-status"><b>OAB 48 · 105 DIAS · 300 HORAS · 09/11 → 21/02</b>'
  +'<p>30 oficinas (22 prioritárias + 8 complementares) · 85 discursivas avulsas · 10 simulados de cinco horas · 15 sábados protegidos.</p>'
  +'<p class="muted small">Fontes ainda a vincular: <b>'+missingDisc+' discursivas avulsas</b>, <b>'+missingOffice+' oficinas</b> e <b>'+missingSim+' pacotes de simulado</b> (40 questões-surpresa). Essas reservas não serão contabilizadas como produzidas sem enunciados reais. Para vincular, acesse Correção e prioridades.</p></div>';
 const destination=I('qualitySlots');if(destination){
  destination.innerHTML+='<div class="item plan105-binding"><b>Enunciados pendentes — vinculação segura</b><p class="muted small">A planilha indica o tema, mas não contém o enunciado para '+missingDisc+' questões. Você pode selecionar um Q-ID existente e confirmar sua origem antes de estudar. Isso não atribui nota nem considera o caso inédito automaticamente.</p>'
  +'<label for="bindQuestionMission">Discursiva pendente</label><select id="bindQuestionMission">'+failed.filter(m=>m.type==='discursiva').map(m=>'<option value="'+ns(m.id)+'">'+ns(m.date)+' · '+ns(m.question_slot)+' · '+ns(m.topic_requested)+'</option>').join('')+'</select>'
  +'<label for="bindQuestionId">Questão do catálogo CEISC (confirmar se corresponde ao tema)</label><select id="bindQuestionId">'+Object.values(plan.question_catalog||{}).map(q=>'<option value="'+ns(q.id)+'">'+ns(q.id)+' — '+ns(q.tema)+' · p. '+ns(q.pagina_enunciado)+'</option>').join('')+'</select>'
  +'<div class="actions"><button class="btn small-btn" id="bindQuestionBtn">Vincular após conferir o enunciado</button></div><p class="muted small">Não selecione um ID só para preencher a vaga. Abra o PDF do enunciado, confira o assunto e confirme que você ainda não resolveu aquela questão.</p></div>';
 }
}
function bindQuestion(){
 const m=state.missions[I('bindQuestionMission')?.value],qid=I('bindQuestionId')?.value;
 const q=plan?.question_catalog?.[qid];
 if(!m||m.type!=='discursiva'||!m.source_pending||!q)return notify('Seleção inválida ou missão já vinculada.');
 const used=plan.missions.filter(t=>t.id!==m.id&&state.missions[t.id]?.question_ids===qid);
 if(used.length){notify('Questão já vinculada a '+used.length+' outra(s) atividade(s). Para evitar repetição involuntária, escolha outra.');return}
 if(!confirm('Confirmar que você verificou no PDF o enunciado '+qid+' (página '+q.pagina_enunciado+'), que corresponde ao tema e que ainda NÃO o resolveu?'))return;
 m.question_ids=qid;m.source='Treinamento de Questões _ Enunciado.pdf, p. '+q.pagina_enunciado;
 m.step_by_step[0].fontes=[{arquivo:'Treinamento de Questões _ Enunciado.pdf',paginas:[q.pagina_enunciado,q.pagina_enunciado]}];
 m.source_page=q.pagina_enunciado;m.source_pending=false;m.case_status='enunciado_verificado_pelo_usuario';
 m.source_bind_date=today();
 state.missions[m.id]=m;
 if(!state.sourceBindings105)state.sourceBindings105={};
 state.sourceBindings105[m.id]={id:qid,file:'Treinamento de Questões _ Enunciado.pdf',page:q.pagina_enunciado,confirmed_at:today()};
 save();render();notify('Vínculo registrado. Abra a atividade; o enunciado fica identificado, mas continua sem gabarito.');
}
function isBlocked(m){
 if(!initialSchema()||!m)return false;
 if(m.source_pending&&['discursiva','treino_guiado_peca','simulado_completo'].includes(m.type))return true;
 if(['reteste','correcao_simulado','correcao'].includes(m.type)&&m.depends_on&&!state.missions[m.depends_on]?.evidence)return true;
 return false;
}
const prevOpen=openMission;
openMission=function(id){
 prevOpen(id);
 const m=state.missions[id];if(!isBlocked(m))return;
 I('missionForm').classList.add('hidden');
 I('validateBlock').classList.add('hidden');
 I('missionDialogHelp').textContent=m.source_pending?'Enunciado verificável ainda não vinculado. O cronograma reservou tempo, mas não fornece texto do caso.':'Primeiro registre a produção/correção anterior desta atividade.';
 I('v12MissionOutline').innerHTML='<div class="v12-locked"><h4>'+(m.source_pending?'Fonte pendente — não inventar enunciado':'Etapa anterior pendente')+'</h4><p>'+ns(m.title)+'</p><p>'+(m.source_pending?'Antes de executar, vincule o enunciado real no banco CEISC/FGV, com arquivo, página e ID. Use Correção e prioridades para identificar discursivas; oficinas e simulados exigem um pacote auditado pela mentoria.':'Registre primeiro a produção ou a correção anterior. O bloqueio impede que uma atividade seja registrada sem as etapas necessárias.')+'</p></div>';
};
const prevRender=render;
render=function(){
 prevRender();if(!plan)return;
 statusPanel();
 if(initialSchema()){countPlan();auditStats();}
 else if(I('plan105Banner'))I('plan105Banner').innerHTML='<div class="notice"><b>Reprogramação 09/11 disponível.</b> Selecione o plano JSON de 105 dias na aba Dados/Backup para ativá-lo. O progresso atual não será apagado.</div>';
};
const previousGrade=recordGrade;
recordGrade=function(e){
 const before=state.grades.length;
 previousGrade(e);
 if(initialSchema()&&state.grades.length>before){
  const grade=state.grades.at(-1);
  grade.plan_schema=TARGET;save();render();
 }
};
function events(){
 I('activatePlan105')?.addEventListener('click',()=>{
  const cached=localStorage.getItem(PLAN_KEY);
  if(cached&&!initialSchema()){
   if(confirm('Reativar o plano de 105 dias já validado neste navegador? Os dados antigos serão preservados.')){
    try{validate(JSON.parse(cached));localStorage.setItem(ACTIVE_KEY,'105');location.reload()}catch(e){notify('Plano armazenado inválido: '+e.message)}
   }
  }else I('plan105Input')?.click();
 });
 I('plan105Input')?.addEventListener('change',async e=>{
  const file=e.target.files?.[0];e.target.value='';if(!file)return;
  try{
   if(file.size>5_000_000)throw Error('Arquivo muito grande. Use o JSON do plano, não o XLSX.');
   const parsed=validate(JSON.parse(await file.text()));
   if(!confirm('Ativar a temporada de 105 dias? O sistema guardará um backup do progresso atual e NÃO apagará as missões antigas.'))return;
   save();
   const original=localStorage.getItem('ascendOab48V3');
   if(!localStorage.getItem(PREBACKUP)&&original)localStorage.setItem(PREBACKUP,original);
   localStorage.setItem(PLAN_KEY,JSON.stringify(parsed));
   localStorage.setItem(ACTIVE_KEY,'105');
   location.reload();
  }catch(err){notify('Importação recusada: '+(err.message||String(err)));console.error('Validação de plano 105',err)}
 });
 I('restorePlan119')?.addEventListener('click',()=>{
  if(!initialSchema())return;
  if(!confirm('Exibir novamente a versão de 119 dias? Nenhum progresso ou plano de 105 dias será excluído.'))return;
  localStorage.setItem(ACTIVE_KEY,'119');location.reload();
 });
 document.addEventListener('click',e=>{if(e.target.closest('#bindQuestionBtn'))bindQuestion()});
}
document.addEventListener('DOMContentLoaded',events);
})();