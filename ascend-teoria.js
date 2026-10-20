
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
