'use strict';
/* ASCEND // ROTEIRO INEQUÍVOCO, SEM ALTERAR V2.1
 * Todas as 119 datas usam atividades e minutagem do plano já existente.
 * O código é apenas uma visualização fiel da ordem, sem criar novas missões.
 */
(function(){
const TEST_WEEKS=new Set([3,5,7,8,10,11,12,14,15,16]);
const hh=mins=>Math.floor(mins/60)+'h'+String(mins%60).padStart(2,'0');
const esc=v=>safe(String(v??''));
const isAnswerKey=v=>/padr[aã]o.{0,25}resposta|gabarito|espelho|resolu[cç][aã]o/i.test(String(v||''));
function calendarBudget(day){
 const wd=day.weekday,w=Number(day.week);
 if(wd==='sábado')return {minutes:0,type:'descanso'};
 if(wd==='domingo')return TEST_WEEKS.has(w)?{minutes:300,type:'simulado'}:{minutes:120,type:'revisao'};
 if(wd==='terça-feira'||wd==='quinta-feira')return {minutes:195,type:'peca'};
 return {minutes:wd==='segunda-feira'&&TEST_WEEKS.has(w-1)?225:180,type:'regular'};
}
function missionsFor(day,budget){
 if(budget.type==='descanso')return [];
 if(budget.type==='revisao'&&Number(day.week)>2){
  const id='REV-DOM-'+day.date.replace(/-/g,'');
  return state.missions[id]?[state.missions[id]]:[{id,title:'Revisão escrita das seis peças prioritárias',duration_min:120,type:'revisao_otimizada',step_by_step:[
   {minutos:30,instrução:'Refaça a estrutura de uma peça prioritária sem modelo.'},
   {minutos:40,instrução:'Reescreva a tese ou pedido que deixou de pontuar na última correção.'},
   {minutos:30,instrução:'Refaça uma discursiva A/B antes de conferir o padrão.'},
   {minutos:20,instrução:'Consulte Vade e banco de erros, agendando revisão.'}],deliverable:'Estrutura e discursiva reescritas, erro registrado'}];
 }
 return plan.missions.filter(m=>m.date===day.date);
}
function sourceList(m,step){
 if(m.type==='diagnostico')return '';
 const source=(step.fontes||[]).filter(f=>f.arquivo&&!isAnswerKey(f.arquivo));
 if(source.length===0)return '';
 return '<ul class="exe-sources">'+source.map(f=>'<li>'+esc(f.arquivo)+(Array.isArray(f.paginas)?' • pp. '+esc(f.paginas[0])+'–'+esc(f.paginas[1]??f.paginas[0]):'')+'</li>').join('')+'</ul>';
}
function numberedSteps(m){
 if(m.type==='simulado_completo')return '<ol class="exe-substeps"><li>Prepare o material permitido e verifique a liberação da prova.</li><li>Faça uma peça completa e quatro discursivas A/B, sem consultar respostas.</li><li>Confira pedidos, fundamentos e registre o tempo. Corrija somente depois do envio.</li></ol>';
 if(m.type==='correcao'){
  const piece=plan.missions.find(x=>x.date===m.date&&['peca_completa','treino_guiado_peca'].includes(x.type));
  if(piece&&!state.missions[piece.id]?.evidence)return '<p class="exe-locked">Primeiro escreva e salve a produção da atividade '+esc(piece.id)+'. Só então abra o padrão e registre esta correção.</p>';
 }
 return '<ol class="exe-substeps">'+(m.step_by_step||[]).map(step=>
  '<li><b>'+esc(step.minutos??'?')+' min</b> — '+esc(step.instrução||'Etapa sem instrução específica.')
  +sourceList(m,step)+'</li>').join('')+'</ol>';
}
function retest(day){
 const piece=plan.missions.find(m=>m.date===day.date&&['peca_completa','treino_guiado_peca'].includes(m.type));
 const correction=plan.missions.find(m=>m.date===day.date&&m.type==='correcao');
 if(!piece||!correction)return '';
 const name=String(piece.title||'Peça').replace(/^(Oficina guiada de|Treino progressivo de)\s+/i,'').replace(/\s+[—–]\s+.*$/,'');
 return '<details class="exe-task"><summary><b>15 min</b><span>Reteste da própria peça: '+esc(name)+'</span><small>Somente após correção</small></summary>'
  +'<ol class="exe-substeps"><li>3 min: de memória, recorde a estrutura desta peça.</li><li>9 min: reescreva UM trecho indicado como errado ou omitido na correção; se não houve erro, refaça um fundamento ou pedido de memória.</li><li>3 min: compare, consulte o Vade e registre o que corrigiu e quando revisará.</li></ol>'
  +'<p class="exe-deliverable"><b>Entrega:</b> trecho reescrito e conferido da própria '+esc(name)+'. Estes 15 min já estão nas 3h15 do dia.</p></details>';
}
function renderDayPlan(){
 if(!plan)return;
 const target=document.getElementById('dailyExecutionGuide');if(!target)return;
 const day=plan.days.find(d=>d.date===selectedDate);
 if(!day){target.innerHTML='';return}
 const budget=calendarBudget(day),base=missionsFor(day,budget);
 if(budget.type==='descanso'){
  target.innerHTML='<section class="exe-guide"><span class="eyebrow">ROTEIRO DO DIA • DESCANSO</span><p>Hoje não há tarefa obrigatória, prova ou revisão acumulada.</p></section>';return;
 }
 const counted=base.reduce((sum,m)=>sum+Number(m.duration_min||0),0),additional=budget.type==='peca'?15:budget.type==='regular'&&day.weekday==='segunda-feira'&&TEST_WEEKS.has(Number(day.week)-1)?45:0;
 // Days after a simulated exam already use 180-min base + 45-min triage.
 const total=counted+additional;
 const heading='<div class="exe-heading"><div><span class="eyebrow">EXECUÇÃO PARAMETRIZADA • '+esc(day.day_id)+'</span><h3>O que fazer hoje, na ordem</h3><p>'+esc(day.objetivo_do_dia||day.topic||'Treinamento')+'</p></div><strong>'+hh(budget.minutes)+'</strong></div>';
 const tasks=base.map((m,i)=>{
  const submitted=!!state.missions[m.id]?.evidence;
  const locked=m.type==='correcao'&&!submitted&&!state.missions[base.find(x=>['peca_completa','treino_guiado_peca'].includes(x.type))?.id]?.evidence;
  return '<details class="exe-task" '+(i===0?'open':'')+'><summary><b>'+esc(m.duration_min||0)+' min</b><span>'+esc(m.title)+'</span><small>'+(submitted?'Tentativa registrada':locked?'Após produzir a peça':'Abrir instruções')+'</small></summary>'
  +(m.type==='simulado_completo'?'<p class="exe-locked">Enunciados da prova permanecem bloqueados até a liberação da atividade. Nenhum gabarito será mostrado aqui.</p>':'')
  +numberedSteps(m)
  +'<p class="exe-deliverable"><b>Entregar:</b> '+esc(m.deliverable||m.evidence_required||'Produção escrita verificável')+'</p>'
  +'<p class="exe-deliverable"><b>Concluído quando:</b> '+esc(m.success_condition||'Produção enviada e corrigida pelo mentor')+'</p>'
  +'<button type="button" class="btn small-btn" data-open-mission="'+esc(m.id)+'">'+(submitted?'Consultar tentativa / correção':'Abrir atividade para registrar produção')+'</button></details>';
 }).join('');
 const correction45=budget.type==='regular'&&day.weekday==='segunda-feira'&&TEST_WEEKS.has(Number(day.week)-1)?
 '<details class="exe-task"><summary><b>45 min</b><span>Correção do simulado de domingo</span><small>Após prova efetivamente realizada</small></summary><ol class="exe-substeps"><li>12 min: conferir a peça pelo espelho oficial identificado ou correção pedagógica.</li><li>18 min: conferir os itens A/B das quatro questões e seus fundamentos.</li><li>10 min: reescrever o item de maior perda.</li><li>5 min: registrar erros e revisões futuras.</li></ol><p class="exe-deliverable">Esta correção já faz parte das 3h45 da segunda-feira.</p></details>':'';
 const allocated=(budget.type==='peca'?15:0)+(correction45?45:0);
 const amount=counted+allocated;
 const warning=amount!==budget.minutes?'<p class="exe-warning">Há diferença entre a soma das etapas exibidas ('+amount+' min) e o orçamento diário ('+budget.minutes+' min). NÃO acrescente tarefas para compensar; solicite conferência da data.</p>':'';
 target.innerHTML='<section class="exe-guide">'+heading+'<p class="exe-intro">Abra o primeiro exercício, execute e registre a tentativa. Os seguintes permanecem aqui para você visualizar o dia, mas não consulte padrões antes de responder. As leituras estão dentro destes tempos.</p>'
 +'<div class="exe-tasks">'+tasks+(budget.type==='peca'?retest(day):'')+correction45+'</div>'
 +'<div class="exe-footer"><b>Tempo total: '+hh(budget.minutes)+'</b> · '+base.length+' missão(ões)-base'+(allocated?' + '+allocated+' min de correção/reteste já orçados':'')+'. Não somar outro bloco teórico de 45 min.</div>'+warning+'</section>';
}
const prev=render;
render=function(){prev();renderDayPlan()};
})();
