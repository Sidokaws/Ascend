'use strict';
/* ASCEND 2.1 — replanejamento sem sobrepor teoria e correção. */
(function(){
const simWeeks=new Set([3,5,7,8,10,11,12,14,15,16]);
let budgets=null;
const hrs=m=>Math.floor(m/60)+'h'+String(m%60).padStart(2,'0');
function days(){
budgets=new Map();
for(const day of plan.days){
const w=Number(day.week),weekday=day.weekday;
let minutes=180,kind='rotina';
if(weekday==='sábado'){minutes=0;kind='descanso'}
else if(weekday==='domingo'){minutes=simWeeks.has(w)?300:120;kind=simWeeks.has(w)?'simulado':'revisao'}
else if(weekday==='terça-feira'||weekday==='quinta-feira'){minutes=195;kind='peca'}
else if(weekday==='segunda-feira'&&simWeeks.has(w-1)){minutes=225;kind='pos_simulado'}
budgets.set(day.date,{week:w,minutes,kind,date:day.date});
}
const total=[...budgets.values()].reduce((n,x)=>n+x.minutes,0);
if(total!==20100)throw Error('Orçamento diferente de 335h: '+total);
for(const b of budgets.values()){
if(b.kind!=='revisao'||b.week<=2)continue;
const id='REV-DOM-'+b.date.replace(/-/g,'');
if(!state.missions[id])state.missions[id]={id,date:b.date,type:'revisao_otimizada',title:'Domingo de recuperação e correção — semana '+b.week,
status:'Pendente',validated:false,xp_base:0,duration_min:120,evidence_required:'Estrutura de peça, resposta A/B refeita e erros demonstrados.',
step_by_step:[
{minutos:30,'instrução':'Recupere de memória o esqueleto de uma das seis peças prioritárias.',fontes:[]},
{minutos:40,'instrução':'Reescreva a tese e os pedidos de maior dificuldade identificada na correção.',fontes:[]},
{minutos:30,'instrução':'Refaça uma discursiva A/B sem consultar o padrão antes.',fontes:[]},
{minutos:20,'instrução':'Confira base legal no Vade, registre erros e planeje revisão D+1/7/15/30.',fontes:[]}],
deliverable:'Peça estruturada, discursiva reescrita e erros documentados',success_condition:'Recuperação ativa efetiva, validada pelo mentor',source:'Produções já corrigidas e Vade Mecum'};
}
state.scheduleVersion='2.1-sustentavel';
save();
}
function renderOpt(){
if(!plan)return;
if(!budgets)days();
const b=budgets.get(selectedDate);if(!b)return;
const label=b.kind==='simulado'?'5h de prova, condicionada à prontidão':b.kind==='revisao'?'2h de revisão (não simulado)':b.kind==='descanso'?'Descanso sem débito':b.kind==='pos_simulado'?'3h-base +45min correção do simulado':b.kind==='peca'?'3h-base +15min reescrita':'3h integradas (teoria + prática)';
$('optimizedDayBudget').innerHTML='<div class="notice"><b>PLANO OTIMIZADO V2.1 — '+hrs(b.minutes)+'</b><p>'+safe(label)+'. A leitura dos slides/e-books faz parte dos 180min-base: não somar outros 45min por fora.</p>'
+'<small>119 dias · 335h · 10 simulados de 5h · 7 domingos de revisão · sábados livres · 30 peças avulsas + 10 em simulados · 85 discursivas + 40 em simulados (metas condicionais).</small></div>';
setText('dayHeading',getDay(selectedDate).day_id+' · semana '+b.week+' · carga revisada: '+hrs(b.minutes));
if(b.kind==='revisao'&&b.week>2){
const id='REV-DOM-'+selectedDate.replace(/-/g,'');
$('dailyMissions').innerHTML='<div class="item"><span class="tag blue">REVISÃO SUBSTITUI SIMULADO</span><h3>Corrigir, reescrever e retestar — 2h</h3><p class="item-meta">30min estrutura; 40min pior tese/pedidos; 30min discursiva; 20min Vade e banco de erros.</p><button class="btn primary" data-open-mission="'+id+'">Abrir revisão escrita</button></div>';
}
if(b.kind==='descanso')$('dailyMissions').innerHTML='<div class="notice">Descanso programado. Nenhuma atividade pendente será transferida automaticamente.</div>';
const theory=$('theoryOverview');if(theory)theory.innerHTML='<div class="notice"><b>85 referências teóricas CURADAS, dentro das horas-base.</b> Não são 85 sessões extras: e-books, slides e modelos entram no bloco de teoria/cobertura ou na consulta da oficina. A carga total revisada é <b>335h</b>, não 420h15. Registre páginas efetivamente lidas, sem concluir PDFs por presunção.</div>';
const oldSchedule=$('theorySchedule');if(oldSchedule)oldSchedule.innerHTML=oldSchedule.innerHTML.replace(/45 min •/g,'Referência integrada •');
const sims=$('simList');
if(sims)sims.innerHTML=plan.simulations.map(s=>{
const active=simWeeks.has(Number(s.week));
return '<div class="item"><div class="section-head"><b>'+safe(s.id)+' · '+format(s.date)+'</b><span class="tag '+(active?'blue':'amber')+'">'+(active?'Simulado 5h':'Revisão 2h')+'</span></div>'
+'<p class="item-meta">'+(active?'Primeira tentativa; peça + 4 discursivas, padrão oculto até enviar.':'Janela original do simulado preservada como reserva, fora da meta dos dez simulados.')+'</p>'
+'<button class="btn small-btn" data-date-go="'+s.date+'">Ver dia</button></div>'}).join('');
setText('statSims',simCount()+' / 10');
const current=$('calDayDetails');if(current)current.innerHTML+='<p class="muted">Orçamento otimizado: <b>'+hrs(b.minutes)+'</b> — '+safe(label)+'</p>';
}
const oldRender=render;
render=function(){oldRender();renderOpt()};
const oldOpen=openMission;
openMission=function(id){
oldOpen(id);
if(state.missions[id]?.type==='leitura_teorica'){
$('missionDialogHelp').textContent='Fonte de leitura vinculada ao tempo do treino-base. Não acrescenta 45 minutos ao orçamento do dia.';
$('v12MissionOutline').innerHTML='<div class="notice"><b>Leitura integrada:</b> estas etapas orientam o uso das horas que já constam na rotina de peças, teoria e questões. Não marque como lido o que não tiver estudado.</div>'+$('v12MissionOutline').innerHTML;
}
};
})();