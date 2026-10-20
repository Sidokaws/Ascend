
'use strict';
/**
 * Trilha teórica complementar v1.0.
 * Lê referências existentes no plano 1.2; não inventa páginas não fornecidas.
 * 85 dias úteis, 45 min adicionais por dia, IDs próprios e progresso independente.
 * O plano canônico de 274 missões continua intacto.
 */
(function(){
const PREFIX='LEIT-',MINUTES=45,CHUNK=10;
let schedule=null,sourcesTotal=0,segmentsTotal=0;
const errSafe=safe,isoDate=d=>d.slice(0,10);
function isStudyMaterial(name){return /^E-book|^Slides/i.test(name||'')&&/\.pdf$/i.test(name||'')}
function makeSourcePlan(data){
const books=new Map();
for(const m of data.missions){
 for(const step of (m.step_by_step||[])){
  for(const ref of (step.fontes||[])){
   const name=ref.arquivo||'',pg=ref.paginas||[];
   if(!isStudyMaterial(name)||pg.length!==2)continue;
   const a=Number(pg[0]),b=Number(pg[1]);
   if(!Number.isInteger(a)||!Number.isInteger(b)||a<1||b<a)continue;
   if(!books.has(name))books.set(name,[]);
   books.get(name).push({first:a,last:b,date:m.date});
  }
 }
}
const entries=[];
for(const [file,citations] of books){
 const spans=citations.map(x=>[x.first,x.last]).sort((a,b)=>a[0]-b[0]);
 const union=[];
 for(const [a,b] of spans){
  const last=union.at(-1);
  if(last&&a<=last[1]+1)last[1]=Math.max(last[1],b);
  else union.push([a,b]);
 }
 for(const [lo,hi] of union){
  for(let first=lo;first<=hi;first+=CHUNK){
   const last=Math.min(first+CHUNK-1,hi);
   const relevant=citations.filter(c=>c.first<=last&&c.last>=first);
   const firstDate=(relevant.length?relevant:citations).map(x=>x.date).sort()[0];
   entries.push({file,first,last,firstDate,kind:file.startsWith('Slides')?'Slides':'E-book',reinforcement:false});
  }
 }
}
entries.sort((a,b)=>a.firstDate.localeCompare(b.firstDate)||a.file.localeCompare(b.file,'pt-BR')||a.first-b.first);
const weekdays=data.days.filter(d=>d.weekday!=='sábado'&&d.weekday!=='domingo');
const slots=new Map();
const free=weekdays.map(d=>d.date);
for(const entry of entries){
 let i=free.findIndex(date=>date>=entry.firstDate);
 if(i<0)i=free.length-1;
 if(i<0)throw Error('Capacidade insuficiente para as leituras citadas no plano');
 const date=free.splice(i,1)[0];
 slots.set(date,{...entry,date,scheduledAhead:date<entry.firstDate});
}
for(const date of free){
 const choices=[...slots.values()].filter(x=>x.date<=date).sort((a,b)=>b.date.localeCompare(a.date));
 const chosen=choices[0]||entries[0];
 if(!chosen)continue;
 slots.set(date,{...chosen,date,firstDate:chosen.firstDate,reinforcement:true});
}
// Prefer that a day's deeper reading follows its main thematic theory/cobertura.
const prioritized=['cobertura','teoria'];
for(const day of weekdays){
 const goals=data.missions.filter(m=>m.date===day.date&&prioritized.includes(m.type));
 const targetFiles=[];
 for(const mission of goals)for(const part of mission.step_by_step||[])for(const r of part.fontes||[])
  if(isStudyMaterial(r.arquivo)&&!targetFiles.includes(r.arquivo))targetFiles.push(r.arquivo);
 const selected=targetFiles.find(name=>[...slots.values()].some(x=>x.file===name));
 if(!selected)continue;
 const current=slots.get(day.date);
 if(current?.file===selected)continue;
 const other=[...slots.entries()].filter(([date,item])=>item.file===selected)
  .sort((a,b)=>Math.abs(new Date(a[0]+'T12:00:00')-new Date(day.date+'T12:00:00'))-Math.abs(new Date(b[0]+'T12:00:00')-new Date(day.date+'T12:00:00')))[0];
 if(!other||!current)continue;
 const [otherDate,otherReading]=other;
 slots.set(day.date,{...otherReading,date:day.date,scheduledAhead:day.date<otherReading.firstDate});
 slots.set(otherDate,{...current,date:otherDate,scheduledAhead:otherDate<current.firstDate});
}
return {slots,books:books.size,segments:entries.length,weekdayCount:weekdays.length};
}
function topic(file){
return file.replace(/^E-book-\s*Aulas\s*_\s*/,'').replace(/^Slides\s*_\s*/,'').replace(/\.pdf$/i,'').trim();
}
function stableReading(ref){
const base=ref.kind==='Slides'?'Leitura de slides':'Estudo de e-book';
const title=(ref.reinforcement?'Reteste teórico: ':base+': ')+topic(ref.file)+(ref.reinforcement?'':'');
const id=PREFIX+ref.date.replace(/-/g,'');
const label=ref.file+', p. '+ref.first+'–'+ref.last;
const steps=ref.reinforcement?[
 {'minutos':5,'instrução':'Sem consultar o material, escreva o que consegue lembrar do tema, inclusive o que ainda confunde. Não basta reler passivamente.','fontes':[]},
 {'minutos':25,'instrução':'Releia criticamente '+label+'. Compare os pontos que esqueceu, as hipóteses de incidência, a base legal e as exceções relevantes. Não invente artigos.','fontes':[{arquivo:ref.file,paginas:[ref.first,ref.last],referencia:label}]},
 {'minutos':15,'instrução':'Produza uma síntese de cinco linhas, localize dois fundamentos no Vade e redija um micro-TBFP com exemplo seu. Registre as dúvidas para o mentor.','fontes':[]}
]:[
 {'minutos':5,'instrução':'Faça uma pré-leitura: identifique qual tópico será estudado e anote uma dúvida ou conhecimento prévio.','fontes':[]},
 {'minutos':30,'instrução':'ESTUDAR TEORIA, sem apressar para responder questões: leia '+label+'. Marque conceitos, requisitos, exceções, prazos, teses e fundamentos que o material realmente apresentar. Se não concluir, anote a página atingida e continue depois.','fontes':[{arquivo:ref.file,paginas:[ref.first,ref.last],referencia:label}]},
 {'minutos':10,'instrução':'Feche o PDF. Em cinco linhas próprias, explique o conteúdo, identifique ao menos dois dispositivos para conferir no Vade, e escreva uma aplicação ou uma dúvida objetiva. Envie ao mentor para revisão, sem alegar que leu páginas não concluídas.','fontes':[]}
];
return {id,day_id:ref.date,type:'leitura_teorica',date:ref.date,title,summary_title:title,
source:label,step_by_step:steps,duration_min:MINUTES,xp_base:30,
validated:false,status:'Pendente',evidence:'',
learning_stage:'leitura_aprofundada',stage:'Estudo teórico',
evidence_required:'Registrar páginas REALMENTE lidas, síntese com palavras próprias, pelo menos dois fundamentos consultados no Vade e uma aplicação TBFP/dúvida. Se não concluir a faixa, registrar apenas o que fez.',
deliverable:'Ficha de teoria: arquivo, páginas efetivamente lidas, cinco linhas de síntese, dois artigos localizados, uma aplicação TBFP e dúvida pendente.',
success_condition:'Compreensão e recuperação ativa demonstradas por texto próprio, corrigido pelo mentor. Não contar livro inteiro por trecho lido.',
teacher_note:'Bloco complementar às 334 horas base; 45 min estimados, registrar tempo efetivo e estender se necessário. Leitura isolada não demonstra domínio da matéria.',
sources_detailed:[{arquivo:ref.file,paginas:[ref.first,ref.last],referencia:label}],
theory_kind:ref.kind,theory_reinforcement:ref.reinforcement,reading_source:ref.file,reading_pages:[ref.first,ref.last],reading_schedule_version:'1.0'};
}
function syncReadings(){
if(!plan)return;
const built=makeSourcePlan(plan);
schedule=built.slots;sourcesTotal=built.books;segmentsTotal=built.segments;
for(const [date,ref] of schedule){
 const fresh=stableReading(ref),old=state.missions[fresh.id]||{};
 const keys=['validated','status','evidence','evidence_link','actual_minutes','correction','correction_ref','learning_stage','is_full_piece','used_model','submitted_at','validated_date','gross_seconds','pause_seconds','effective_seconds','saved_at'];
 const merged={...fresh};for(const k of keys)if(old[k]!==undefined&&old[k]!==null)merged[k]=old[k];
 if(old.validated===true&&Number.isFinite(Number(old.xp_base)))merged.xp_base=Number(old.xp_base);
 state.missions[fresh.id]=merged;
}
state.theoryPlanVersion='1.0';
save();
}
function thHtml(ref){
return '<div class="theory-banner"><div class="eyebrow">BLOCO EXTRA DE TEORIA · +45 MIN</div><p><strong>'+errSafe(ref.reinforcement?'Releitura ativa':'Estudar '+ref.kind)+': '+topic(ref.file)+'</strong><br>'+errSafe(ref.file)+' · páginas '+ref.first+'–'+ref.last+'</p><p>30 minutos para compreender o material, com pré-leitura e síntese final. O objetivo é aprender a teoria antes de apenas resolver questões. O tempo é uma estimativa; se precisar, divida a leitura.</p><button class="btn primary small-btn" data-open-mission="'+PREFIX+ref.date.replace(/-/g,'')+'">Abrir roteiro de leitura</button></div>';
}
function sourceCounts(){
if(!plan)return{books:0,slides:0};const files=new Set([...schedule.values()].map(x=>x.file));
return{books:[...files].filter(f=>f.startsWith('E-book')).length,slides:[...files].filter(f=>f.startsWith('Slides')).length};
}
function renderTab(){
if(!plan||!schedule)return;
const count=sourceCounts();const done=[...schedule.keys()].filter(date=>state.missions[PREFIX+date.replace(/-/g,'')]?.validated===true).length;
$('theoryOverview').innerHTML='<div class="theory-metrics"><div class="theory-metric"><small>E-BOOKS MENCIONADOS NO PLANO</small><strong>'+count.books+'</strong><small>Não equivale ao acervo total</small></div><div class="theory-metric"><small>CONJUNTOS DE SLIDES REFERENCIADOS</small><strong>'+count.slides+'</strong><small>Faixas de páginas citadas</small></div><div class="theory-metric"><small>BLOCOS DE LEITURA</small><strong>'+done+' / '+schedule.size+'</strong><small>45 min cada; evidência e validação</small></div><div class="theory-metric"><small>CARGA TOTAL PROPOSTA</small><strong>397h45</strong><small>334h base + 63h45 teoria</small></div></div><div class="theory-intro"><strong>Importante:</strong><p class="theory-note">Esta trilha trata das <b>faixas de páginas citadas</b> na versão 1.2. Não é inventário concluído, nem afirma que todos os arquivos e páginas enviados foram estudados. Após “finalizei os envios”, auditar o acervo completo para cobrir o que faltar. Se o dia estiver pesado, remanejar a leitura sem empilhar tarefas.</p></div>';
$('theorySchedule').innerHTML=[...schedule.values()].map(ref=>{
 const m=state.missions[PREFIX+ref.date.replace(/-/g,'')];
 return '<div class="theory-row"><b>'+format(ref.date)+'</b><div><strong>'+errSafe(topic(ref.file))+'</strong><div class="theory-file">'+errSafe(ref.file)+'</div><div class="muted">p. '+ref.first+'–'+ref.last+' · '+MINUTES+' min · '+(ref.reinforcement?'Recuperação ativa':ref.scheduledAhead?'Estudo antecipado':'Leitura estruturada')+'</div><button class="btn small-btn" style="margin-top:7px" data-open-mission="'+errSafe(m.id)+'">Abrir leitura</button></div>'+statusBadge(m)+'</div>';
}).join('');
}
const mainRender=render;
render=function(){
if(plan&&(!schedule||!state.theoryPlanVersion))syncReadings();
mainRender();
if(!plan||!schedule)return;
setText('statMissions',numValid()+' / '+(plan.missions.length+schedule.size));
renderTab();
};
const dailyBase=renderDaily;
renderDaily=function(){
dailyBase();
if(!schedule)return;
const ref=schedule.get(selectedDate);if(!ref)return;
const container=$('dailyMissions');
const id=PREFIX+selectedDate.replace(/-/g,'');
if(!container.innerHTML.includes(id))container.innerHTML+=thHtml(ref);
const baseMinutes=Math.round((getDay(selectedDate)?.planned_hours||0)*60);
container.innerHTML=container.innerHTML.replace(baseMinutes+' minutos previstos',baseMinutes+' min do roteiro + 45 min de teoria = '+(baseMinutes+45)+' min planejados');
const heading=$('dayHeading');if(heading)heading.textContent+=' · +45 min estudo teórico (bloco complementar)';
};
const calendarBase=renderCalendar;
renderCalendar=function(){
calendarBase();
if(!schedule)return;
const r=schedule.get(selectedDate);
if(r){$('calDayDetails').innerHTML+='<div class="theory-banner"><b>Leitura adicional: +45 min</b><p>'+errSafe(topic(r.file))+' — p. '+r.first+'–'+r.last+'</p></div>';}
};
})();
