
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
const spec=window.ASCEND_PEDAGOGIA;
if(!spec||spec.version!=='2.0-pedagogica'||spec.weeks.length!==17)throw Error('Curadoria pedagógica não foi carregada');
const index=new Map();
for(const m of data.missions)for(const step of m.step_by_step||[])for(const r of step.fontes||[]){
const name=r.arquivo,span=r.paginas;if(!name||!Array.isArray(span)||span.length<2)continue;
if(!index.has(name))index.set(name,[]);
index.get(name).push([Number(span[0]),Number(span[1])]);
}
const weekdays=data.days.filter(d=>!['sábado','domingo'].includes(d.weekday));
if(weekdays.length!==85)throw Error('O plano não tem os 85 dias úteis esperados');
const slots=new Map(),warnings=[],materialSet=new Set();
for(let week=1;week<=17;week++){
const config=spec.weeks[week-1],days=weekdays.filter(d=>d.week===week);
if(!config||config.entries.length!==5||days.length!==5)throw Error('Semana '+week+' fora do cronograma');
for(let i=0;i<5;i++){
const item=config.entries[i],day=days[i],[title,path,token,timing]=item;
const sources=token.split('+').map(expr=>{
const parts=expr.match(/^([A-Za-z0-9]+):(\d+)-(\d+)$/);
if(!parts)throw Error('Referência inválida: '+expr);
const [,alias,a0,b0]=parts,first=Number(a0),last=Number(b0),file=spec.aliases[alias];
if(!file)throw Error('Arquivo não identificado na curadoria: '+alias);
const matches=index.get(file)||[];
if(!matches.some(([lo,hi])=>first>=lo&&last<=hi)){
warnings.push({day:day.date,file,pages:[first,last],error:'Trecho não localizado nas referências fornecidas'});
return null;
}
materialSet.add(file);
return {file,first,last,kind:file.startsWith('Slides')?'Slides':'E-book'};
}).filter(Boolean);
if(!sources.length)throw Error('Leitura sem fonte verificada em '+day.date);
if(sources.reduce((n,r)=>n+r.last-r.first+1,0)>18)warnings.push({day:day.date,error:'Faixa extensa: ajustar duração após observação'});
slots.set(day.date,{date:day.date,week,weekTheme:config.theme,title,path,timing,sources,
file:sources[0].file,first:sources[0].first,last:sources[0].last,kind:sources[0].kind,
reinforcement:/reteste|recupera|revisão|consolid/i.test(title),version:spec.version});
}
}
return {slots,books:materialSet.size,segments:slots.size,weekdayCount:weekdays.length,warnings};
}
function topic(file){
return file.replace(/^E-book-\s*Aulas\s*_\s*/,'').replace(/^Slides\s*_\s*/,'').replace(/\.pdf$/i,'').trim();
}
function stableReading(ref){
const title='TEORIA • '+ref.title;
const id=PREFIX+ref.date.replace(/-/g,'');
const citations=ref.sources.map(r=>({arquivo:r.file,paginas:[r.first,r.last],referencia:r.file+', p. '+r.first+'–'+r.last}));
const refsLabel=citations.map(x=>x.referencia).join('; ');
const prereq=ref.path;
const start=ref.date==='2026-10-26'
 ?'Primeiro resolva os seis casos diagnósticos A–F, sem consultar a teoria. Depois inicie esta leitura, antes da Q003.'
 :'Antes de abrir o PDF, recupere de memória a ideia da etapa anterior: '+prereq+'. Se não souber, escreva a dúvida e prossiga com a leitura guiada.';
const studyTime=27,parts=ref.sources.length;
let left=studyTime;
const readingSteps=ref.sources.map((r,i)=>{
const minutes=i===parts-1?left:Math.max(8,Math.floor(studyTime*(r.last-r.first+1)/ref.sources.reduce((n,x)=>n+x.last-x.first+1,0)));
left-=minutes;
const reference=r.file+', p. '+r.first+'–'+r.last;
return {minutos:minutes,instrução:'ESTUDO COMPREENSIVO: leia '+reference+'. Identifique as condições, consequências e exceções relevantes; registre as páginas realmente lidas. Não avance se faltar compreensão; use o tempo medido e continue o trecho no próximo encontro se necessário.',fontes:[{arquivo:r.file,paginas:[r.first,r.last],referencia:reference}]};
});
const steps=[
{minutos:5,instrução:start,fontes:[]},
...readingSteps,
{minutos:13,instrução:'Feche os materiais. Explique o ponto central com palavras próprias em cinco linhas. Confira ao menos dois fundamentos no Vade Mecum (se aplicáveis ao conteúdo) e redija uma aplicação aos fatos pelo TBFP ou uma dúvida concreta. Não veja padrões de resposta antes da tentativa.',fontes:[]}
];
return {id,day_id:'D'+String(1+Math.round((new Date(ref.date+'T12:00:00')-new Date('2026-10-26T12:00:00'))/86400000)).padStart(3,'0'),
type:'leitura_teorica',date:ref.date,title,summary_title:ref.title,source:refsLabel,step_by_step:steps,duration_min:MINUTES,xp_base:30,
validated:false,status:'Pendente',evidence:'',
stage:'Estudo teórico em sequência',learning_stage:'leitura_aprofundada',
evidence_required:'Resumo autoral, páginas realmente lidas, fundamentos localizados no Vade e aplicação TBFP/dúvida. Conteúdo apenas visualizado não conta como dominado.',
deliverable:'Ficha de leitura: '+ref.title+' — páginas realizadas, cinco linhas de síntese, fundamentos e miniaplicação.',
success_condition:'Evidência escrita e correção, demonstrando compreensão do pré-requisito e do assunto. Não é necessário concluir o PDF inteiro.',
teacher_note:'Encadeamento pedagógico: '+ref.path+'. Ordem no dia: '+ref.timing+'. 45 min adicionais aos exercícios originais, com ajuste de tempo conforme desempenho.',
sources_detailed:citations,prerequisites:ref.path,theory_timing:ref.timing,theory_week_theme:ref.weekTheme,
theory_kind:ref.sources.map(r=>r.kind).join(' + '),theory_reinforcement:ref.reinforcement,
reading_source:ref.file,reading_pages:[ref.first,ref.last],reading_schedule_version:'2.0-pedagogica'};
}
function syncReadings(){
if(!plan)return;
const built=makeSourcePlan(plan);
schedule=built.slots;sourcesTotal=built.books;segmentsTotal=built.segments;
state.theoryPlanWarnings=built.warnings;
for(const [date,ref] of schedule){
 const fresh=stableReading(ref),old=state.missions[fresh.id]||{};
 const changed=old.reading_schedule_version && old.reading_schedule_version!==fresh.reading_schedule_version
 && (old.source!==fresh.source || old.title!==fresh.title);
 if(changed&&(old.validated||old.evidence||old.correction||old.submitted_at)){
  const archivedId='LEITHIST-'+date.replace(/-/g,'');
  if(!state.missions[archivedId])state.missions[archivedId]={...old,id:archivedId,
    title:(old.title||'Leitura anterior')+' [histórico preservado]',
    theory_archived:true,legacy:true};
 }
 const preserve=!(changed&&(old.validated||old.evidence||old.correction||old.submitted_at));
 const keys=['validated','status','evidence','evidence_link','actual_minutes','correction','correction_ref','learning_stage','is_full_piece','used_model','submitted_at','validated_date','gross_seconds','pause_seconds','effective_seconds','saved_at'];
 const merged={...fresh};
 if(preserve)for(const k of keys)if(old[k]!==undefined&&old[k]!==null)merged[k]=old[k];
 if(preserve&&old.validated===true&&Number.isFinite(Number(old.xp_base)))merged.xp_base=Number(old.xp_base);
 state.missions[fresh.id]=merged;
}
state.theoryPlanVersion='2.0-pedagogica';
save();
}
function refLabel(ref){return ref.sources.map(x=>x.file+', pp. '+x.first+'–'+x.last).join('; ')}
function thHtml(ref){
const id=PREFIX+ref.date.replace(/-/g,'');
return '<div class="theory-banner"><div class="eyebrow">1. TEORIA E PRÉ-REQUISITOS • +45 MIN</div><p><strong>'+errSafe(ref.title)+'</strong><br>'+errSafe(refLabel(ref))+'</p>'
+'<p><b>Sequência:</b> '+errSafe(ref.path)+'<br><b>Quando fazer:</b> '+errSafe(ref.timing)+'</p>'
+'<button class="btn primary small-btn" data-open-mission="'+id+'">Abrir leitura guiada (passo a passo)</button></div>';
}
function sourceCounts(){
if(!plan)return {books:0,slides:0};
const files=new Set([...schedule.values()].flatMap(x=>x.sources.map(y=>y.file)));
return {books:[...files].filter(f=>f.startsWith('E-book')).length,
slides:[...files].filter(f=>f.startsWith('Slides')).length};
}
function renderTab(){
if(!plan||!schedule)return;
const count=sourceCounts(),done=[...schedule.keys()].filter(d=>state.missions[PREFIX+d.replace(/-/g,'')]?.validated).length;
const weekdayCount=schedule.size,minutes=weekdayCount*MINUTES,base=plan.targets?.planned_hours||334;
const formatted=(n)=>Math.floor(n/60)+'h'+(n%60?String(n%60).padStart(2,'0'):'');
$('theoryOverview').innerHTML='<div class="theory-metrics"><div class="theory-metric"><small>E-BOOKS NO ROTEIRO CURADO</small><strong>'+count.books+'</strong><small>Faixas efetivamente indicadas</small></div><div class="theory-metric"><small>CONJUNTOS DE SLIDES</small><strong>'+count.slides+'</strong><small>Sem confundir trecho com PDF completo</small></div><div class="theory-metric"><small>LEITURAS DOCUMENTADAS</small><strong>'+done+' / '+weekdayCount+'</strong><small>45 min; só conta com correção</small></div><div class="theory-metric"><small>CARGA COM A TRILHA</small><strong>'+formatted(base*60+minutes)+'</strong><small>'+base+'h base + '+formatted(minutes)+' teoria</small></div></div>'
+'<div class="theory-intro"><strong>Ordem pedagógica, não lista aleatória de PDFs.</strong><p class="theory-note">As leituras seguem 17 etapas: reconhecimento processual → peças-base → recursos → teses penais → modalidades especiais → consolidação. O roteiro original de peças e discursivas continua. Cada sessão indica pré-requisito, motivo, PDF, páginas e produção escrita. O bloco teórico deve anteceder os exercícios relacionados, exceto no diagnóstico inicial, que precisa ser espontâneo.</p><p class="theory-note">A revisão integral do acervo aguarda “finalizei os envios”. Páginas citadas são as do plano recebido; arquivos não hospedados precisam ser selecionados no computador. Caso falte tempo, registre o realizado e replaneje, sem fingir leitura concluída.</p></div>';
$('theorySchedule').innerHTML=[...schedule.values()].map(ref=>{
 const m=state.missions[PREFIX+ref.date.replace(/-/g,'')];
 return '<div class="theory-row"><b>'+format(ref.date)+'</b><div><strong>'+errSafe(ref.title)+'</strong>'
 +'<div class="theory-file">'+errSafe(refLabel(ref))+'</div><div class="muted">45 min • '+errSafe(ref.path)+'</div><div class="muted"><b>Ordem:</b> '+errSafe(ref.timing)+'</div>'
 +'<button class="btn small-btn" style="margin-top:7px" data-open-mission="'+errSafe(m.id)+'">Abrir etapas</button></div>'+statusBadge(m)+'</div>';
}).join('');
}
const mainRender=render;
render=function(){
if(plan&&(!schedule||state.theoryPlanVersion!=='2.0-pedagogica'))syncReadings();
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
const container=$('dailyMissions');let html=container.innerHTML;
const block=thHtml(ref);
const first=html.indexOf('<div class="item"');
const second=first===-1?-1:html.indexOf('<div class="item"',first+5);
if(selectedDate==='2026-10-26'){
 // Em diagnóstico, NUNCA antecipar a teoria: primeiro o aluno tenta A–F.
 html=second>=0?html.slice(0,second)+block+html.slice(second):html+block;
}else html=first>=0?html.slice(0,first)+block+html.slice(first):html+block;
const baseMinutes=Math.round((getDay(selectedDate)?.planned_hours||0)*60);
html=html.replace(baseMinutes+' minutos previstos',baseMinutes+' min do roteiro + 45 min de teoria = '+(baseMinutes+45)+' min planejados');
container.innerHTML=html;
const heading=$('dayHeading');if(heading)heading.textContent+=' · ordem pedagógica '+(selectedDate==='2026-10-26'?'diagnóstico → teoria → prática':'teoria → prática')+' · +45 min';
};
const calendarBase=renderCalendar;
renderCalendar=function(){
calendarBase();if(!schedule)return;const ref=schedule.get(selectedDate);if(!ref)return;
$('calDayDetails').innerHTML+='<div class="theory-banner"><b>Etapa teórica adicional: 45 min</b>'
+'<p>'+errSafe(ref.title)+'<br>'+errSafe(refLabel(ref))+'</p>'
+'<p>Ordem: '+errSafe(ref.timing)+'</p></div>';
};
})();
