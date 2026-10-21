
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
function focusFor(m,index){
 const title=normalizeKey(m.title||'');
 const p=PRIMARY.find(x=>title.includes(normalizeKey(x.key)));
 return p?.key||PRIMARY[index%PRIMARY.length].key;
}
function makeQualityPlan(){
 const entries=[],corrections=plan.missions.filter(m=>m.type==='correcao'),sims=plan.simulations;
 corrections.forEach((m,i)=>{
 const prior=plan.missions.filter(x=>x.date===m.date&&['peca_completa','treino_guiado_peca'].includes(x.type));
 const focus=prior.length?focusFor(prior[0],i):PRIMARY[i%6].key;
 entries.push({id:ID+'RET-'+m.date.replace(/-/g,''),date:m.date,mins:15,type:'reforco_peca',
 focus,source_id:m.id,depends_on:prior[0]?.id||null,
 title:'Reescrita de alta precisão — '+focus,
 instruction:'Após a correção de 45 min já prevista: 3 min refaça a estrutura de memória; 9 min reescreva o bloco TBFP/pedido mais fraco; 3 min confira Vade + registre erro e reteste. Se for peça secundária, faça a correção normal dessa peça e use os 15 min para uma das seis principais. Não dá XP automático.'});
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
 if(s.type!=='correcao_simulado')return true;
 const sim=plan.simulations.find(x=>x.id===s.focus);
 if(!sim)return false;
 const m=state.missions['ASC-'+sim.date.replace(/-/g,'')+'-01'];
 return !!m?.evidence;
}
function status(s){
 const done=completed(s),readiness=canLog(s);
 return '<span class="tag '+(done?'green':readiness?'blue':'amber')+'">'+(done?'✓ Revisado':readiness?'Programado':'Após envio')+'</span>';
}
function qualityContext(){
 const done=qualitySchedule.filter(completed);
 const byType=t=>qualitySchedule.filter(x=>x.type===t);
 const official='Padrões oficiais: <a href="https://examedeordem.oab.org.br/EditaisProvas" target="_blank" rel="noopener noreferrer">Exame de Ordem (OAB)</a>. Quando inexistente, indicar "pedagógico"; não simular distribuição oficial de pontos.';
 $('qualityStats').innerHTML='<div class="quality-summary"><div><small>RETTESTES DAS PEÇAS</small><strong>'+done.filter(x=>x.type==='reforco_peca').length+' / '+byType('reforco_peca').length+'</strong><small>+15 min cada, focados nas 6</small></div><div><small>PÓS-SIMULADO</small><strong>'+done.filter(x=>x.type==='correcao_simulado').length+' / '+byType('correcao_simulado').length+'</strong><small>+45 min após teste realizado</small></div><div><small>TEMPO DE CORREÇÃO EXTRA</small><strong>16h</strong><small>8h30 retestes + 7h30 correções de 10 simulados</small></div><div><small>CARGA MÁXIMA PROJETADA</small><strong>335h</strong><small>Teoria já dentro dos 334h-base; 5 simulados convertidos</small></div></div>'
 +'<div class="notice">A programação de 34 correções originais com 45 min foi preservada. O bloco de +15 min é específico para recuperação escrita. As 10 correções pós-simulado (45min) são condicionais, somente após realmente realizar o teste. Não ocupar sábado nem 22–27/02 (Revisão Turbo).</div>';
 $('qualityPrimary').innerHTML=PRIMARY.map((p,i)=>'<div class="item"><div class="section-head"><span class="tag blue">FOCO '+(i+1)+'</span><b class="small">'+qesc(p.key)+'</b></div><p class="item-meta">'+qesc(p.description)+'</p><p class="item-meta">Treino: reconhecer → estrutura → escrever → corrigir → reescrever → caso diferente. Repetir até desempenho demonstrado, sem presumir domínio.</p></div>').join('');
 $('qualityExamRules').innerHTML='<div class="quality-two"><div><b>Prova histórica não resolvida</b><p class="muted small">Vale como primeira exposição. O treino é legítimo mesmo que o enunciado tenha aparecido em provas anteriores. Conferir se o padrão corresponde à edição usada.</p></div><div><b>Segundo contato com o mesmo caso</b><p class="muted small">Vale como revisão e treino de velocidade, mas não como prova independente. O painel registra a exposição declarada.</p></div><div><b>Simulado autoral de chat separado</b><p class="muted small">Peça-surpresa + 4 discursivas, 5 horas, sem prévia do enunciado. Espelho pedagógico pontuado; nunca rotular como FGV oficial.</p></div><div><b>Último domingo, 21/02</b><p class="muted small">Janela SIM-15 do plano original: convertido em revisão final de 2h, sem prova completa no domingo anterior à Revisão Turbo. Não agendar correção na Revisão Turbo a partir de 22/02.</p></div></div><p class="muted small">'+official+'</p>'
 +'<details class="item"><summary>Registrar contato anterior com cada caso</summary><p class="muted small">Não confunde origem do material com experiência pessoal; origem FGV ou CEISC deve ser confirmada nas fontes.</p>'
 +Object.entries(plan.piece_case_catalog||{}).map(([id,p])=>'<div class="item"><b class="small">'+qesc(id+' · '+p.titulo)+'</b><select aria-label="Contato com '+qesc(id)+'" data-quality-exposure="'+qesc(id)+'">'
 +[['nao_informado','Não informado'],['primeiro_contato','Nunca resolvi — primeiro contato'],['ja_resolvido','Já resolvi — revisão'],['repetido_corrigido','Já corrigi — reteste']].map(([value,label])=>'<option value="'+value+'" '+((state.exposureRecords?.[id]||'nao_informado')===value?'selected':'')+'>'+label+'</option>').join('')+'</select></div>').join('')+'</details>';
}
function qualityList(){
 const completedCount=qualitySchedule.filter(completed).length;
 $('qualitySlots').innerHTML='<p class="muted small">Registros validados: '+completedCount+' / '+qualitySchedule.length+'. Um reteste é contado só com referência da correção e evidência da reescrita.</p><div class="quality-scroll">'
 +qualitySchedule.map(s=>'<div class="item"><div class="section-head"><b class="small">'+format(s.date)+' · '+qesc(s.title)+'</b>'+status(s)+'</div><p class="item-meta">'+s.mins+' min adicionais. '+qesc(s.instruction)+'</p>'
 +(completed(s)?'<p class="item-meta">Evidência: '+qesc(state.qualityRecords[s.id].evidence)+'</p>':'<button class="btn small-btn" data-quality-log="'+qesc(s.id)+'">'+(canLog(s)?'Registrar reteste corrigido':'Aguardar produção do simulado')+'</button>')+'</div>').join('')+'</div>';
}
function daySection(){
 if(!qualitySchedule)return;
 const todays=qualitySchedule.filter(s=>s.date===selectedDate);
 if(!todays.length)return;
 const container=$('dailyMissions');
 container.innerHTML+='<div class="quality-day"><div class="eyebrow">FIXAÇÃO APÓS FEEDBACK</div><h3 class="heading">Correção e reescrita programadas</h3>'
 +todays.map(s=>'<div class="item"><div class="section-head"><b>'+qesc(s.title)+'</b>'+status(s)+'</div><p class="item-meta">'+qesc(s.instruction)+'</p><p class="item-meta"><b>'+s.mins+' minutos adicionais</b> — só executar depois da produção/correção aplicável.</p>'
 +(!completed(s)?'<button class="btn small-btn" data-quality-log="'+qesc(s.id)+'">'+(canLog(s)?'Registrar após correção':'Pendente de simulado')+'</button>':'<span class="tag green">Reteste documentado</span>')+'</div>').join('')+'</div>';
}
function log(id){
 const task=qualitySchedule?.find(x=>x.id===id);if(!task||completed(task))return;
 if(!canLog(task)){notify('Registre primeiro a produção do simulado. O painel não presume que ela foi feita.');return}
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