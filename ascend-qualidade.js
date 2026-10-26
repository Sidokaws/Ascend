
'use strict';
/* QUALITY CONTROL / OAB 48
 * The original 274 missions and 85 learning sessions remain intact.
 * Extra correction blocks are time-budget supplements, not automatic XP or proof of mastery.
 */
(function(){
const PRIMARY=[
 {key:'Apelação',description:'Sentença, interposição, razões, teses subsidiárias e pedidos'},
 {key:'Memoriais',description:'Instrução encerrada, alegações finais, preliminares e pedidos'},
 {key:'Resposta à Acusação',description:'Citação, fase, requerimentos defensivos, testemunhas e pedidos'},
 {key:'RESE',description:'Cabimento vinculado à decisão, interposição e razões'},
 {key:'Agravo em Execução',description:'Juízo da execução, cabimento, fundamentos e pedidos'},
 {key:'Contrarrazões',description:'Recurso interposto pela outra parte: admissibilidade, resposta e manutenção'}
];
const ID='QUAL-';
let qualitySchedule=null;
function qesc(v){return safe(v)}
function isoAfter(x,days){
 const d=new Date(x+'T12:00:00');d.setDate(d.getDate()+days);
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
}
function normalizeKey(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR')}
function pieceForCorrection(c){
 return plan.missions.find(m=>m.date===c.date&&['peca_completa','treino_guiado_peca'].includes(m.type))||null;
}
function actualPieceName(m){
 if(!m)return 'Peça deste dia — vinculação a conferir';
 return String(m.title||'').replace(/^(Oficina guiada de|Treino progressivo de)\s+/i,'')
 .replace(/\s+[—–]\s+.*$/,'').trim();
}
function recall(piece){
 const p=normalizeKey(piece);
 if(p.startsWith('apelacao'))return 'interposição, juízo de origem e sequência das razões';
 if(p.startsWith('memoriais'))return 'endereçamento, estrutura de mérito e pedidos';
 if(p.startsWith('resposta a acusacao'))return 'endereçamento, fundamento e pedidos/testemunhas se cabíveis';
 if(p==='rese')return 'interposição, eventual retratação (art. 589 do CPP) e razões';
 if(p.startsWith('agravo em execucao'))return 'juízo da execução, fundamento, interposição e pedidos';
 if(p.startsWith('contrarrazoes'))return 'petição de apresentação, destinatário e pedidos adequados à parte recorrida';
 return 'destinatário, fundamento, estrutura e pedidos desta mesma medida';
}
function makeQualityPlan(){
 const entries=[],corrections=plan.missions.filter(m=>m.type==='correcao'),sims=plan.simulations;
 corrections.forEach(c=>{
 const prior=pieceForCorrection(c),piece=actualPieceName(prior),caseId=prior?.piece_case_id||'não identificado';
 const steps=[
 '3 min — SEM MODELO: escreva de memória '+recall(piece)+'.',
 '9 min — REESCRITA: escolha UM erro ou omissão da correção de '+piece+' (por exemplo artigo, tese TBFP, pedido, ou estrutura) e REESCREVA ESSE TRECHO DE MEMÓRIA, SEM COPIAR A CORREÇÃO recém-feita. Se nenhum erro foi identificado, reproduza sem consultar um fundamento ou pedido já correto, para testar a memória.',
 '3 min — CONFERÊNCIA: compare seu novo trecho com a correção e o Vade. Anote se corrigiu a falha e qual revisão fará.'
 ];
 entries.push({id:ID+'RET-'+c.date.replace(/-/g,''),date:c.date,mins:15,type:'reforco_peca',
 focus:piece,caseId,source_id:c.id,depends_on:prior?.id||null,
 title:'Reteste da peça de hoje — '+piece+' ('+caseId+')',steps,
 deliverable:'Um trecho de '+piece+' reescrito, conferido e registrado. Não escrever uma peça inteira em 15 minutos.',
 instruction:steps.join(' ')});
 });
 sims.filter(s=>[3,5,7,8,10,11,12,14,15,16].includes(Number(s.week))).forEach(s=>{
 const next=isoAfter(s.date,1);
 entries.push({id:ID+'SIM-'+s.id,date:next,mins:45,type:'correcao_simulado',focus:s.id,source_id:s.id,
 depends_on:'ASC-'+s.date.replace(/-/g,'')+'-01',
 title:'Pós-simulado — correção orientada '+s.id,
 instruction:'12 min: triagem da peça pelo espelho oficial identificado ou rubrica pedagógica. 18 min: confira as quatro discursivas A/B; registre os itens incorretos e fundamentos. 10 min: reescreva a tese de maior perda. 5 min: banco de erros e revisões D+1/7/15/30. Correção profunda continua nas oficinas e auditoria de sexta; não marcar sem produzir e avaliar.'});
 });
 entries.sort((a,b)=>a.date.localeCompare(b.date)||a.type.localeCompare(b.type));
 return entries;
}
function ensure(){
 if(!plan)return;
 if(!state.qualityRecords||typeof state.qualityRecords!=='object')state.qualityRecords={};
 if(!state.exposureRecords||typeof state.exposureRecords!=='object')state.exposureRecords={};
 qualitySchedule=makeQualityPlan();
}
function completed(s){return !!state.qualityRecords?.[s.id]?.complete}
function canLog(s){
 if(s.type==='reforco_peca')return !!(s.depends_on&&state.missions[s.depends_on]?.evidence&&state.missions[s.source_id]?.evidence);
 if(s.type!=='correcao_simulado')return true;
 const sim=plan.simulations.find(x=>x.id===s.focus);
 if(!sim)return false;
 const m=state.missions['ASC-'+sim.date.replace(/-/g,'')+'-01'];
 return !!m?.evidence;
}
function status(s){
 const done=completed(s),ready=canLog(s);
 return '<span class="tag '+(done?'green':ready?'blue':'amber')+'">'+(done?'✓ Reteste registrado':ready?'Correção registrada — pronto para reteste':s.type==='reforco_peca'?'Aguardando produção e correção':'Aguardando simulado')+'</span>';
}
function stepsHTML(s){
 if(!s.steps)return '<p class="item-meta">'+qesc(s.instruction)+'</p>';
 return '<p class="item-meta"><b>Quando:</b> somente depois da produção e da correção de 45 minutos da peça '+qesc(s.caseId)+' deste mesmo dia.</p>'
 +'<ol class="quality-steps">'+s.steps.map(x=>'<li>'+qesc(x)+'</li>').join('')+'</ol>'
 +'<p class="item-meta"><b>O que entregar:</b> '+qesc(s.deliverable)+'</p>';
}
function budgetLabel(s){return s.type==='reforco_peca'?'15 minutos JÁ INCLUÍDOS nas 3h15 do dia (não somar de novo)':'45 minutos JÁ INCLUÍDOS na segunda após simulado';}
function retestButton(s){
 return '<button class="btn small-btn" data-quality-log="'+qesc(s.id)+'" '+(canLog(s)?'':'disabled aria-disabled="true"')+'>'
 +(canLog(s)?'Registrar reescrita concluída':s.type==='reforco_peca'?'Aguardar correção desta peça':'Aguardar realização do simulado')+'</button>';
}
function qualityContext(){
 const done=qualitySchedule.filter(completed);
 const byType=t=>qualitySchedule.filter(x=>x.type===t);
 const official='Padrões oficiais: <a href="https://examedeordem.oab.org.br/EditaisProvas" target="_blank" rel="noopener noreferrer">Exame de Ordem (OAB)</a>. Quando inexistente, indicar "pedagógico"; não simular distribuição oficial de pontos.';
 $('qualityStats').innerHTML='<div class="quality-summary"><div><small>RETESTES DAS PEÇAS</small><strong>'+done.filter(x=>x.type==='reforco_peca').length+' / '+byType('reforco_peca').length+'</strong><small>15 min da própria peça, incluídos no dia</small></div><div><small>PÓS-SIMULADO</small><strong>'+done.filter(x=>x.type==='correcao_simulado').length+' / '+byType('correcao_simulado').length+'</strong><small>45 min após prova, incluídos no dia</small></div><div><small>TEMPO DE REVISÃO RESERVADO</small><strong>16h</strong><small>8h30 retestes + 7h30 correções de 10 simulados</small></div><div><small>CARGA MÁXIMA PROJETADA</small><strong>335h</strong><small>Teoria já dentro dos 334h-base; 5 simulados convertidos</small></div></div>'
 +'<div class="notice">As 34 correções originais de 45 min foram preservadas. Os retestes de 15 min trabalham apenas a peça corrigida no mesmo dia, nunca uma peça escolhida por rodízio. Os dez pós-simulados de 45 min só ocorrem após a prova. Todos os tempos já fazem parte das 335h. Não ocupar sábado nem 22–27/02 (Revisão Turbo).</div>';
 $('qualityPrimary').innerHTML=PRIMARY.map((p,i)=>'<div class="item"><div class="section-head"><span class="tag blue">FOCO '+(i+1)+'</span><b class="small">'+qesc(p.key)+'</b></div><p class="item-meta">'+qesc(p.description)+'</p><p class="item-meta">Treino: reconhecer → estrutura → escrever → corrigir → reescrever → caso diferente. Repetir até desempenho demonstrado, sem presumir domínio.</p></div>').join('');
 $('qualityExamRules').innerHTML='<div class="quality-two"><div><b>Prova histórica não resolvida</b><p class="muted small">Vale como primeira exposição. O treino é legítimo mesmo que o enunciado tenha aparecido em provas anteriores. Conferir se o padrão corresponde à edição usada.</p></div><div><b>Segundo contato com o mesmo caso</b><p class="muted small">Vale como revisão e treino de velocidade, mas não como prova independente. O painel registra a exposição declarada.</p></div><div><b>Simulado autoral de chat separado</b><p class="muted small">Peça-surpresa + 4 discursivas, 5 horas, sem prévia do enunciado. Espelho pedagógico pontuado; nunca rotular como FGV oficial.</p></div><div><b>Último domingo, 21/02</b><p class="muted small">Janela SIM-15 do plano original: convertido em revisão final de 2h, sem prova completa no domingo anterior à Revisão Turbo. Não agendar correção na Revisão Turbo a partir de 22/02.</p></div></div><p class="muted small">'+official+'</p>'
 +'<details class="item"><summary>Registrar contato anterior com cada caso</summary><p class="muted small">Não confunde origem do material com experiência pessoal; origem FGV ou CEISC deve ser confirmada nas fontes.</p>'
 +Object.entries(plan.piece_case_catalog||{}).map(([id,p])=>'<div class="item"><b class="small">'+qesc(id+' · '+p.titulo)+'</b><select aria-label="Contato com '+qesc(id)+'" data-quality-exposure="'+qesc(id)+'">'
 +[['nao_informado','Não informado'],['primeiro_contato','Nunca resolvi — primeiro contato'],['ja_resolvido','Já resolvi — revisão'],['repetido_corrigido','Já corrigi — reteste']].map(([value,label])=>'<option value="'+value+'" '+((state.exposureRecords?.[id]||'nao_informado')===value?'selected':'')+'>'+label+'</option>').join('')+'</select></div>').join('')+'</details>';
}
function qualityList(){
 const completedCount=qualitySchedule.filter(completed).length;
 $('qualitySlots').innerHTML='<p class="muted small">Retestes documentados: '+completedCount+' / '+qualitySchedule.length+'. Nenhum exercício é validado sem produção e correção.</p><div class="quality-scroll">'
 +qualitySchedule.map(s=>'<div class="item"><div class="section-head"><b class="small">'+format(s.date)+' · '+qesc(s.title)+'</b>'+status(s)+'</div>'
 +stepsHTML(s)+'<p class="item-meta"><b>'+qesc(budgetLabel(s))+'</b></p>'
 +(completed(s)?'<p class="item-meta">Produção refeita: '+qesc(state.qualityRecords[s.id].evidence)+'</p>':retestButton(s))+'</div>').join('')+'</div>';
}
function daySection(){
 if(!qualitySchedule)return;
 const todays=qualitySchedule.filter(s=>s.date===selectedDate);
 if(!todays.length)return;
 const container=$('dailyMissions');
 container.innerHTML+='<div class="quality-day"><div class="eyebrow">FIXAÇÃO APÓS FEEDBACK</div><h3 class="heading">Reteste da peça que você acabou de corrigir</h3>'
 +todays.map(s=>'<div class="item"><div class="section-head"><b>'+qesc(s.title)+'</b>'+status(s)+'</div>'
 +stepsHTML(s)+'<p class="item-meta"><b>'+qesc(budgetLabel(s))+'</b></p>'
 +(completed(s)?'<span class="tag green">Produção refeita e registrada</span>':retestButton(s))+'</div>').join('')+'</div>';
}
function log(id){
 const task=qualitySchedule?.find(x=>x.id===id);if(!task||completed(task))return;
 if(!canLog(task)){notify(task.type==='reforco_peca'?'Registre primeiro a produção e a correção de 45 minutos da mesma peça.':'Registre primeiro a produção do simulado.');return}
 const ref=prompt('Qual correção foi utilizada? Informe a edição da prova/espelho oficial ou a referência da correção pedagógica. Se não foi corrigido, cancele.');
 if(!ref||ref.trim().length<6)return;
 const evidence=prompt('Escreva o que você REESCREVEU e verificou (tese, fundamento, aplicação, pedido e resultado). Não basta marcar "li".');
 if(!evidence||evidence.trim().length<18){notify('É necessária evidência escrita real do reteste.');return}
 state.qualityRecords[id]={complete:true,date:today(),correctionReference:ref.trim(),evidence:evidence.trim(),minutesTarget:task.mins};
 save();render();notify('Correção e reescrita documentadas. Sem XP automático.');
}
const mainRender=render;
render=function(){mainRender();if(!plan)return;if(!qualitySchedule)ensure();qualityContext();qualityList();daySection()};
const uiSetup=()=>{
 document.addEventListener('click',e=>{const b=e.target.closest('[data-quality-log]');if(b)log(b.dataset.qualityLog)});
 document.addEventListener('change',e=>{const field=e.target.closest('[data-quality-exposure]');if(!field)return;state.exposureRecords[field.dataset.qualityExposure]=field.value;save();notify('Exposição anterior registrada, sem alterar notas ou XP.');});
};
document.addEventListener('DOMContentLoaded',uiSetup);
})();