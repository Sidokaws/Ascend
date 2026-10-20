'use strict';
/**
 * ASCEND · Dia 1 — Oficina de identificação.
 * Preserva os seis fatos-gatilho originais da V1.2; adiciona narrativa autoral
 * e campos para TENTATIVA sem gabarito. Dados locais permanecem na V3.
 */
(function(){
const DIA1='ASC-20261026-01',letters=['A','B','C','D','E','F'];
const cases=[
{letter:'A',title:'A primeira manifestação de Lucas',body:'Lucas, um jovem de 23 anos, responde a uma acusação de furto. O Ministério Público ofereceu denúncia, que foi recebida pelo juiz da vara criminal. Alguns dias depois, um oficial de justiça entregou pessoalmente a Lucas a citação do processo. Assustado, ele procura sua defensora. Até aquele momento, não houve audiência nem depoimento de testemunhas. A defensora precisa escolher qual documento apresentar agora, nessa primeira oportunidade de manifestação escrita.'},
{letter:'B',title:'O processo de Rafaela depois da audiência',body:'Rafaela está sendo processada por receptação. Ao longo da audiência, o juiz ouviu as testemunhas da acusação, as testemunhas da defesa e interrogou a acusada. Nenhuma outra prova ficou pendente de produção. Em vez de receber a manifestação final oralmente naquela audiência, o magistrado decidiu conceder prazos sucessivos para que acusação e defesa apresentassem suas considerações finais por escrito. Chegou a vez da defesa de Rafaela.'},
{letter:'C',title:'A condenação de Marcos',body:'Marcos respondeu a um processo por furto perante um juiz singular. Depois da produção de provas e das manifestações das partes, o juiz proferiu sentença condenatória. Na decisão, além de considerar Marcos culpado, fixou uma pena e definiu seu regime de cumprimento. A defensora foi intimada da sentença. Ela entende que a prova não é suficiente para a condenação e, subsidiariamente, discorda da pena estabelecida. Precisa escolher como impugnar essa decisão.'},
{letter:'D',title:'Uma decisão antes do plenário do Júri',body:'Eduardo responde a processo pela acusação de homicídio doloso. O procedimento está na primeira fase do Tribunal do Júri, em que o juiz analisa se o caso deve seguir para julgamento pelos jurados. Depois de ouvir testemunhas e examinar os elementos apresentados, o magistrado proferiu decisão de pronúncia, determinando que Eduardo seja submetido ao julgamento em plenário. A defesa foi intimada, discorda dessa decisão e pretende impugná-la antes do julgamento pelos jurados.'},
{letter:'E',title:'O pedido de remição de André',body:'André já foi condenado definitivamente e está cumprindo pena privativa de liberdade. Durante o cumprimento da pena, realizou atividades que, segundo sua defesa, poderiam justificar a remição de parte do tempo de pena. Seu defensor apresentou o pedido ao juízo da execução penal. O juiz analisou a documentação e indeferiu o pedido. A defesa acaba de ser intimada dessa decisão e deseja contestá-la.'},
{letter:'F',title:'A absolvição de Camila é contestada',body:'Camila foi acusada em um processo criminal, mas, depois da instrução, o juiz proferiu sentença favorável a ela. O Ministério Público não concordou com o resultado e interpôs recurso de apelação para tentar modificar a sentença. A defesa de Camila foi intimada para se manifestar sobre os argumentos apresentados pelo Ministério Público. Seu objetivo agora é defender a manutenção da decisão favorável, respondendo ao recurso já apresentado.'}
];
const srcEsc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function draft(){if(!state.diagnosticoDia1Draft||typeof state.diagnosticoDia1Draft!=='object')state.diagnosticoDia1Draft={};return state.diagnosticoDia1Draft}
function validAttempt(a){return Boolean((a?.phase||a?.piece||a?.doubt||'').trim())&&['0','1','2'].includes(String(a?.confidence??''))}
function attemptedCount(){return letters.filter(l=>validAttempt(draft()[l])).length}
function card(c,i){
const d=draft()[c.letter]||{},original=plan.study_pack?.diagnostico_seis_situacoes?.find(x=>x[0]==='DIA1-'+c.letter)?.[1]||'';
const input=(name,label,hint,optional=false)=>'<label for="diag-'+c.letter+'-'+name+'">'+label+(optional?' <span class="muted">(se souber)</span>':'')+'</label><input id="diag-'+c.letter+'-'+name+'" data-diag-case="'+c.letter+'" data-diag-field="'+name+'" placeholder="'+srcEsc(hint)+'" value="'+srcEsc(d[name]||'')+'" maxlength="500" autocomplete="off">';
return '<details class="dia1-situation" data-case-panel="'+c.letter+'" '+(i===0?'open':'')+'><summary><span class="dia1-index">'+c.letter+'</span><span class="dia1-summary"><strong>'+srcEsc(c.title)+'</strong><small>Situação '+c.letter+' · caso autoral contextualizado</small></span><span class="dia1-chip" id="diag-chip-'+c.letter+'">'+(validAttempt(d)?'Rascunho preenchido':'A responder')+'</span></summary><div class="dia1-card-body"><p class="dia1-story">'+srcEsc(c.body)+'</p><div class="dia1-help">Sua tarefa: observe o <strong>último ato processual</strong> e o que o defensor precisa fazer agora. Não tente descobrir um crime ou uma tese de mérito neste diagnóstico.</div><div class="dia1-fields">'+input('phase','1. Qual foi o último ato ou em que fase está?','Ex.: foi proferida uma decisão / ainda não sei')+input('piece','2. Que peça ou medida você apresentaria?','Nome da peça ou “não sei”')+input('basis','3. Fundamento legal / onde procuraria no Vade','Ex.: CPP, art. ... / não sei',true)+'<label for="diag-'+c.letter+'-confidence">4. Qual seu grau de segurança?</label><select id="diag-'+c.letter+'-confidence" data-diag-case="'+c.letter+'" data-diag-field="confidence"><option value="">Escolha uma opção</option>'+[['0','0 — não faço ideia'],['1','1 — tenho um palpite'],['2','2 — estou seguro']].map(([v,label])=>'<option value="'+v+'" '+(String(d.confidence??'')===v?'selected':'')+'>'+label+'</option>').join('')+'</select>'+input('doubt','5. Ficou alguma dúvida?','Ex.: confundo o momento dessa peça',true)+'</div><button class="btn small-btn dia1-unsure" type="button" data-dia1-unknown="'+c.letter+'">Não sei responder este caso</button><details class="dia1-original"><summary>Consultar texto curto original do plano</summary><p>'+srcEsc(original)+'</p></details></div></details>';
}
function diagnosticHTML(){
return '<div class="dia1-intro"><span class="eyebrow">DIA 01 · IDENTIFICAÇÃO DE PEÇAS</span><h3>Seis histórias, seis tentativas</h3><p><strong>O “Caderno de Diagnóstico” está aqui mesmo.</strong> Não é outro PDF ou uma página escondida. Abra as situações A–F abaixo e escreva nos campos que aparecem em cada cartão.</p><p>O exercício não mede quantos você acertou de primeira. Ele mede se você já consegue reconhecer a fase e a medida processual. Você pode escrever <strong>“não sei”</strong> e marcar segurança 0.</p><div class="dia1-example"><strong>Exemplo de COMO responder (não é um dos seis casos):</strong><p><em>“O juiz apenas marcou uma audiência e comunicou a data às partes.”</em></p><dl><dt>Último ato/fase</dt><dd>Foi marcada uma audiência; ainda vai acontecer.</dd><dt>Peça ou medida</dt><dd>Não sei se preciso apresentar alguma peça.</dd><dt>Fundamento legal</dt><dd>Ainda não sei localizar.</dd><dt>Segurança</dt><dd>0 — não faço ideia.</dd><dt>Dúvida</dt><dd>Qual intimação exige uma manifestação escrita?</dd></dl></div><p class="dia1-caption">O exemplo mostra o <strong>formato</strong>, não é um gabarito. As respostas das seis situações não são mostradas antes de você tentar.</p></div><div class="dia1-progress" role="status"><span id="diag-progress">Rascunhos preenchidos: '+attemptedCount()+'/6</span><span>Salvo automaticamente neste navegador</span></div><div class="dia1-cards">'+cases.map(card).join('')+'</div><div class="dia1-finish"><p><strong>Depois de preencher A–F:</strong> copie as respostas para nossa conversa e peça a correção. O botão de salvar do ASCEND guarda sua tentativa <strong>neste navegador</strong>; ele não envia mensagens automaticamente ao ChatGPT.</p><div class="actions"><button class="btn primary" type="button" id="diag-copy">Copiar minhas seis respostas para a mentoria</button></div></div>';
}
const baseOpen=openMission;
openMission=function(id){
baseOpen(id);
if(id!==DIA1)return;
const box=$('v12MissionOutline');const doc=box.innerHTML;
const a=doc.indexOf('<div class="v12-section-title">Caderno de diagnóstico');
const b=doc.indexOf('<div class="v12-section-title">Roteiro de execução</div>',a);
if(a<0||b<0){notify('O roteiro do diagnóstico não pôde ser carregado.');return}
let amended=doc.slice(0,a)+diagnosticHTML()+doc.slice(b);
amended=amended.replace('Abra no site o CADERNO DE DIAGNÓSTICO, situações DIA1-A até DIA1-F; são seis enunciados completos incluídos no pacote. Não leia a resposta de nenhuma delas.','Abra os seis cartões A–F que aparecem ACIMA, nesta mesma missão. Não existe outro caderno para localizar. Leia o enunciado de cada cartão sem consultar gabaritos.');
amended=amended.replace('Para CADA situação, escreva: (1) último ato ou fase, (2) nome da peça/medida, (3) artigo ou onde iria procurar no Vade, (4) grau de segurança 0–2. Deixe em branco o que não souber; não há obrigação de acertar.','Preencha os campos de cada cartão: último ato/fase, peça, fundamento (opcional), grau de segurança 0–2 e dúvida. Você pode escrever “não sei”. Um exemplo de preenchimento aparece acima dos casos.');
amended=amended.replace('Envie as seis linhas para correção diagnóstica. Só DEPOIS consulte','Copie as seis respostas e envie na conversa com seu mentor para correção. Só DEPOIS consulte');
box.innerHTML=amended;
$('missionDialogHelp').textContent='45 minutos · Abra as situações A–F abaixo e registre suas hipóteses. Nenhuma resposta correta é exibida.';
const btn=$('missionForm').querySelector('button[type="submit"]');if(btn)btn.textContent='Salvar tentativa no painel (sem enviar ao ChatGPT)';
if(state.missions[id]?.evidence)notify('Você já tem uma tentativa registrada. Os rascunhos são independentes da produção enviada.');
};
function formatAnswers(){
return 'SYSTEM // ASCEND — Dia 1 · Diagnóstico (tentativa para correção)\n'+cases.map(c=>{const d=draft()[c.letter]||{};return '\nSITUAÇÃO '+c.letter+'\nÚltimo ato/fase: '+(d.phase||'Não sei')+'\nPeça/medida: '+(d.piece||'Não sei')+'\nFundamento legal: '+(d.basis||'Não sei')+'\nSegurança: '+(d.confidence??'Não informado')+'/2\nDúvida: '+(d.doubt||'Nenhuma registrada')}).join('\n')+'\n\nPor favor, corrija minha tentativa sem revelar o gabarito das próximas atividades.';
}
function updateProgress(){
const p=$('diag-progress');if(p)p.textContent='Rascunhos preenchidos: '+attemptedCount()+'/6';
letters.forEach(l=>{const chip=$('diag-chip-'+l);if(chip)chip.textContent=validAttempt(draft()[l])?'Rascunho preenchido':'A responder'});
}
function eventChange(e){
const el=e.target;const c=el?.dataset?.diagCase,field=el?.dataset?.diagField;
if(!letters.includes(c)||!['phase','piece','basis','confidence','doubt'].includes(field))return;
const d=draft();if(!d[c])d[c]={};d[c][field]=el.value;save();updateProgress();
}
function unknown(c){
const d=draft();d[c]={...d[c],phase:'Não sei identificar o último ato',piece:'Não sei',confidence:'0',doubt:'Preciso aprender a distinguir a fase e a peça.'};
for(const [field,value] of Object.entries(d[c])){const el=document.querySelector('[data-diag-case="'+c+'"][data-diag-field="'+field+'"]');if(el)el.value=value}
save();updateProgress();notify('Caso '+c+' marcado como tentativa sem identificação. Isso não é erro automático.');
}
function ensureAll(e){
if($('missionForm')?.elements?.id?.value!==DIA1)return;
const unfilled=letters.filter(l=>!validAttempt(draft()[l]));
if(unfilled.length){e.preventDefault();e.stopImmediatePropagation();notify('Preencha uma tentativa e escolha segurança 0–2 para os casos: '+unfilled.join(', ')+'. Pode escrever “não sei”.');return}
$('missionForm').elements.evidence.value=formatAnswers();
}
async function copyAll(){
const unfilled=letters.filter(l=>!validAttempt(draft()[l]));
if(unfilled.length){notify('Para copiar todas as respostas, preencha também: '+unfilled.join(', ')+'. Se não souber, marque “não sei”.');return}
const data=formatAnswers();
try{await navigator.clipboard.writeText(data);notify('Respostas copiadas! Cole na conversa com seu mentor para correção.')}catch{window.prompt('Copie as respostas abaixo e cole na conversa com seu mentor:',data)}
}
document.addEventListener('DOMContentLoaded',()=>{
document.addEventListener('input',eventChange);
document.addEventListener('change',eventChange);
document.addEventListener('click',e=>{
 const unk=e.target.closest('[data-dia1-unknown]');if(unk){unknown(unk.dataset.dia1Unknown);return}
 if(e.target.closest('#diag-copy')){copyAll();return}
});
const form=$('missionForm');if(form)form.addEventListener('submit',ensureAll,true);
});
})();