'use strict';
/* ASCEND // COPIAR PARA O CHATGPT
 * Integra a produção já registrada com dados reais do treino.
 * Somente copia para a área de transferência; nunca envia por rede.
 */
(function(){
const labelStage={reconhecimento:'Reconhecimento / fundamento',guiado:'Com modelo / orientado',
 integral_consulta:'Integral com consulta',autonomo:'Integral sem modelo'};
const labelMaterials={sem_consulta:'Sem consulta',vade:'Somente Vade Mecum',
 slides_ebooks:'Slides / e-books',modelo:'Modelo de peça / roteiro',
 outros:'Outros materiais / combinação'};
const get=id=>document.getElementById(id);
const present=value=>value!==null&&value!==undefined&&String(value).trim()!=='';
const formatTime=seconds=>{const n=Math.max(0,Math.floor(Number(seconds)||0));return Math.floor(n/3600)+'h '+String(Math.floor(n%3600/60)).padStart(2,'0')+'min '+String(n%60).padStart(2,'0')+'s'};
const boolLabel=x=>x===true?'Sim':x===false?'Não':'Não informado';
const plain=x=>String(x??'').replace(/\r\n/g,'\n');
function fieldsFor(id){
 const f=get('missionForm');
 if(!f||f.elements.id.value!==id)return null;
 return {
  evidence:f.elements.evidence?.value||'',
  evidence_link:f.elements.evidence_link?.value||'',
  actual_minutes:f.elements.actual_minutes?.value||'',
  learning_stage:f.elements.learning_stage?.value||'',
  materials_mode:f.elements.materials_mode?.value||'',
  materials_notes:f.elements.materials_notes?.value||''
 };
}
function diagDraft(){
 const draft=state.diagnosticoDia1Draft;
 if(!draft||typeof draft!=='object')return '';
 const letters=['A','B','C','D','E','F'];
 const hasAny=letters.some(l=>draft[l]&&Object.values(draft[l]).some(present));
 if(!hasAny)return '';
 return letters.map(l=>{
  const d=draft[l]||{};
  return ['Situação '+l,
   'Fase/último ato: '+(d.phase||'Não preenchido'),
   'Peça/medida: '+(d.piece||'Não preenchido'),
   'Base legal: '+(d.basis||'Não preenchido'),
   'Confiança: '+(present(d.confidence)?d.confidence+'/2':'Não preenchida'),
   'Dúvida: '+(d.doubt||'Não preenchida')].join('\n');
 }).join('\n\n');
}
function sourceRefs(m){
 const refs=new Set();
 function include(o){
  if(!o?.arquivo||/padr[aã]o.{0,25}resposta|gabarito|espelho/i.test(o.arquivo))return;
  const p=o.paginas;
  refs.add(o.arquivo+(Array.isArray(p)&&p.length?(' — p. '+p[0]+(p[1]&&p[1]!==p[0]?'–'+p[1]:'')):''));
 }
 for(const s of m.step_by_step||[])for(const f of s.fontes||[])include(f);
 for(const f of m.sources_detailed||[])include(f);
 return [...refs].slice(0,10);
}
function formatMission(id,inDialog){
 const m=state.missions[id];if(!m)throw Error('Missão não localizada no painel.');
 const current=inDialog?fieldsFor(id):null;
 const isUnsaved=!!current&&(
   current.evidence.trim()!==(m.evidence||'').trim()||
   current.evidence_link.trim()!==(m.evidence_link||'').trim()||
   (current.actual_minutes!==''&&Number(current.actual_minutes)!==Number(m.actual_minutes??0))||
   current.learning_stage!==m.learning_stage&&present(current.learning_stage)||
   current.materials_mode!==(m.copy_context?.materials_mode||'')||
   current.materials_notes.trim()!==(m.copy_context?.materials_notes||'')
 );
 const ev=current?current.evidence.trim():String(m.evidence||'').trim();
 const ref=current?current.evidence_link.trim():String(m.evidence_link||'').trim();
 const timeField=current?.actual_minutes;
 const minutes=present(timeField)?Number(timeField):m.actual_minutes;
 const stage=current?.learning_stage||m.learning_stage||'';
 const materials=current?current.materials_mode:m.copy_context?.materials_mode;
 const materialsNotes=current?current.materials_notes:m.copy_context?.materials_notes;
 const pdate=m.date||'Data não registrada',pieces=m.piece_case_id,questions=m.question_ids;
 const lines=[
  'SYSTEM // ASCEND — PRODUÇÃO PARA CORREÇÃO',
  '',
  'MISSÃO: '+id+' — '+(m.title||'Sem título'),
  'DATA DO CRONOGRAMA: '+pdate,
  'TIPO: '+(m.type||'Não informado'),
  'STATUS NO SITE: '+(m.status||'Pendente'),
  'ORIGEM DO REGISTRO: '+(inDialog?(isUnsaved?'Rascunho do formulário (alterações NÃO salvas)':'Formulário aberto; confira se já salvou'):'Dados salvos no ASCEND'),
 ];
 if(pieces)lines.push('CASO DE PEÇA: '+pieces);
 if(questions)lines.push('QUESTÃO(ÕES): '+questions);
 lines.push('TEMPO PREVISTO DA MISSÃO (REFERÊNCIA): '+(present(m.duration_min)?m.duration_min+' min':'Não informado'));
 lines.push('TEMPO REAL INFORMADO: '+(present(minutes)&&Number.isFinite(Number(minutes))?Number(minutes)+' min':'Não registrado'));
 if(present(m.gross_seconds))lines.push('CRONÔMETRO ENCERRADO — BRUTO: '+formatTime(m.gross_seconds)
  +' | PAUSAS: '+formatTime(m.pause_seconds)+' | EFETIVO: '+formatTime(m.effective_seconds));
 if(state.timer?.missionId===id){
  lines.push('CRONÔMETRO: ainda em andamento; os números acima NÃO incluem esta sessão não encerrada.');
 }
 lines.push('ETAPA DECLARADA: '+(labelStage[stage]||'Não informada'));
 lines.push('MATERIAIS UTILIZADOS: '+(labelMaterials[materials]||'Não informado'));
 if(present(materialsNotes))lines.push('DETALHES DOS MATERIAIS: '+plain(materialsNotes));
 if(m.is_full_piece!==undefined)lines.push('PEÇA INTEGRAL VALIDADA: '+boolLabel(m.is_full_piece));
 if(m.used_model!==undefined&&m.correction)lines.push('MODELO NA VALIDAÇÃO: '+boolLabel(m.used_model));
 if(ref){
  lines.push('REFERÊNCIA DA PRODUÇÃO (ARQUIVO/FOTO/LINK): '+plain(ref));
  lines.push('AVISO: referência não anexa arquivos automaticamente. Se houver foto/documento, enviarei o arquivo separadamente no chat.');
 }
 if(present(m.source))lines.push('FONTE INFORMADA NO PLANO: '+m.source);
 const refs=sourceRefs(m);
 if(refs.length)lines.push('PÁGINAS INDICADAS NO ROTEIRO:\n'+refs.map(x=>'- '+x).join('\n'));
 lines.push('','PRODUÇÃO / RESPOSTA REGISTRADA:');
 if(ev)lines.push(plain(ev));
 else if(m.type==='diagnostico'&&diagDraft())lines.push(diagDraft());
 else lines.push('[Ainda não inseri uma produção escrita neste campo.]');
 const ad=state.adendo2510?.discursive?.[id];
 if(ad){
  lines.push('','ITENS A/B REGISTRADOS NA CORREÇÃO (SE EXISTENTES):');
  for(const [key,desc] of [['a','Item A'],['b','Item B'],['corr_a','Correção A'],['corr_b','Correção B'],['erro','Erros registrados']]){
   if(present(ad[key]))lines.push(desc+': '+plain(ad[key]));
  }
 }
 if(m.correction){
  lines.push('','CORREÇÃO JÁ REGISTRADA NO SITE:',plain(m.correction));
  if(m.correction_ref)lines.push('REFERÊNCIA DA CORREÇÃO: '+plain(m.correction_ref));
 }
 lines.push('','PEDIDO AO MENTOR:');
 lines.push('Corrija a produção acima conforme o espelho oficial da edição, quando identificado e disponível. Se não houver espelho oficial, informe que a avaliação é pedagógica. Examine fase, peça, cabimento, prazo, fundamento, TBFP, pedidos, itens A/B e omissões que efetivamente se apliquem. Não invente nota nem considere uma evidência descritiva como resposta integral. Aguarde minha próxima tentativa para liberar a próxima atividade.');
 return lines.join('\n');
}
function fallbackCopy(textValue){
 const ta=document.createElement('textarea');ta.value=textValue;ta.setAttribute('readonly','');ta.style.position='fixed';
 ta.style.left='-9999px';document.body.appendChild(ta);ta.select();
 let ok=false;try{ok=typeof document.execCommand==='function'&&document.execCommand('copy')}catch{}
 ta.remove();
 if(ok)return true;
 let dialog=get('copyExportDialog');
 if(!dialog){
  dialog=document.createElement('dialog');dialog.id='copyExportDialog';dialog.className='dialog copy-export-dialog';
  dialog.innerHTML='<header><h2>Copiar relatório de estudo</h2><button type="button" class="close-btn" data-copy-close aria-label="Fechar">×</button></header>'
   +'<p>O navegador não permitiu a cópia automática. Selecione o relatório abaixo e copie com Ctrl+C.</p>'
   +'<textarea id="copyExportText" readonly rows="12"></textarea>'
   +'<div class="actions"><button class="btn primary" type="button" id="copyExportSelect">Selecionar tudo</button></div>';
  document.body.appendChild(dialog);
  dialog.addEventListener('click',e=>{
   if(e.target.closest('[data-copy-close]'))dialog.close();
   if(e.target.closest('#copyExportSelect'))get('copyExportText')?.select();
  });
 }
 get('copyExportText').value=textValue;dialog.showModal();get('copyExportText').select();
 return false;
}
async function copyMission(id,inDialog=false){
 if(!state.missions[id]){notify('Missão não localizada.');return}
 const textValue=formatMission(id,inDialog);
 try{
  if(!navigator.clipboard?.writeText)throw Error('Clipboard API indisponível');
  await navigator.clipboard.writeText(textValue);
  notify(inDialog?'Relatório copiado. Se ainda é rascunho, salve a tentativa no painel. Cole no ChatGPT com Ctrl+V.':'Relatório completo copiado. Cole no ChatGPT com Ctrl+V para solicitar a correção.');
 }catch{
  if(fallbackCopy(textValue))notify('Relatório copiado. Cole no ChatGPT com Ctrl+V.');
 }
}
function paintCardButtons(){
 const container=get('dailyMissions');if(!container)return;
 for(const btn of container.querySelectorAll('[data-open-mission]')){
  const id=btn.dataset.openMission,m=state.missions[id];if(!m||!present(m.evidence))continue;
  const actions=btn.closest('.item-actions');
  if(!actions||actions.querySelector('[data-copy-report]'))continue;
  const copy=document.createElement('button');copy.type='button';copy.className='btn small-btn copy-report-button';
  copy.dataset.copyReport=id;copy.textContent='⧉ Copiar para o ChatGPT';
  actions.appendChild(copy);
 }
}
const priorOpen=openMission;
openMission=function(id){
 priorOpen(id);
 const m=state.missions[id],f=get('missionForm');if(!m||!f)return;
 f.elements.materials_mode.value=m.copy_context?.materials_mode||'';
 f.elements.materials_notes.value=m.copy_context?.materials_notes||'';
 const note=get('copyMissionNote');if(note)note.textContent='O botão copia todo o relatório do formulário, inclusive alterações ainda não salvas; para manter seu progresso, salve primeiro no ASCEND. Não há envio automático.';
 const btn=get('copyMissionInDialog');if(btn)btn.disabled=f.classList.contains('hidden');
};
const priorRecord=recordMission;
recordMission=function(event){
 const f=event?.target,id=f?.elements?.id?.value;
 const m=id&&state.missions[id];
 const evidence=f?.elements?.evidence?.value?.trim()||'';
 const context=f?.elements?{
  materials_mode:f.elements.materials_mode?.value||'',
  materials_notes:(f.elements.materials_notes?.value||'').trim()
 }:null;
 priorRecord(event);
 if(m&&context&&evidence.length>=10&&m.evidence===evidence&&!m.validated){
  m.copy_context=context;save();
 }
};
const priorRender=render;
render=function(){priorRender();if(!plan)return;paintCardButtons()};
document.addEventListener('DOMContentLoaded',()=>{
 document.addEventListener('click',event=>{
  const b=event.target.closest('#copyMissionInDialog');
  if(b){
   event.preventDefault();const id=get('missionForm')?.elements?.id?.value;
   if(!id||get('missionForm')?.classList.contains('hidden')){notify('Abra uma missão liberada para copiar.');return}
   copyMission(id,true);return;
  }
  const card=event.target.closest('[data-copy-report]');
  if(card){event.preventDefault();event.stopPropagation();copyMission(card.dataset.copyReport,false)}
 });
});
})();