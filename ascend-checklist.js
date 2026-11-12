/* SYSTEM // ASCEND — checklist rápido. Não altera nem remove registros antigos. */
(function(){
 'use strict';
 const byId=id=>document.getElementById(id);
 const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const hasDone=m=>m.activity_done===true || (m.activity_done===undefined && m.validated===true);
 const hasSent=m=>m.sent_for_correction===true || (m.sent_for_correction===undefined && (m.validated===true || !!m.submitted_at || !!m.correction));
 const oldStatusBadge=statusBadge;
 statusBadge=function(m){
   if(m.checklist_only===true) return '<span class="tag '+(m.validated?'green':hasDone(m)?'amber':'blue')+'">'+(m.validated?'✓ Concluída':hasDone(m)?'Feita · falta marcar envio':'Pendente')+'</span>';
   return oldStatusBadge(m);
 };
 function drawChecks(m){
  const id=escapeHtml(m.id);
  return '<div class="ascend-checklist" data-checklist-id="'+id+'">'+
   '<label><input type="checkbox" data-check-field="activity_done" data-check-id="'+id+'" '+(hasDone(m)?'checked':'')+'> Atividade feita</label>'+
   '<label><input type="checkbox" data-check-field="sent_for_correction" data-check-id="'+id+'" '+(hasSent(m)?'checked':'')+'> Enviada para correção</label>'+
   '</div>';
 }
 const previousDaily=renderDaily;
 renderDaily=function(){
  previousDaily();
  const root=byId('dailyMissions');
  if(!root)return;
  root.querySelectorAll('[data-open-mission]').forEach(b=>{
   const m=state.missions[b.dataset.openMission],container=b.closest('.item');
   if(!m||!container||container.querySelector('.ascend-checklist'))return;
   b.insertAdjacentHTML('beforebegin',drawChecks(m));
  });
 };
 const previousOpen=openMission;
 openMission=function(id){
  previousOpen(id);
  const m=state.missions[id],f=byId('missionForm'),validation=byId('validateBlock');
  if(!m||!f)return;
  // Keep old inputs in DOM so older scripts remain compatible, but don't request their completion.
  Array.from(f.children).forEach(el=>{
   if(el.matches('input[name="id"]'))return;
   el.classList.add('ascend-old-field');
  });
  f.querySelectorAll('[required]').forEach(el=>el.required=false);
  let quick=byId('ascendQuickForm');
  if(!quick){quick=document.createElement('div');quick.id='ascendQuickForm';f.prepend(quick)}
  quick.innerHTML='<p class="muted small">Marque somente o que realmente fez. A correção é realizada na conversa, não automaticamente.</p>'+
    drawChecks(m)+'<div class="actions"><button type="button" class="btn primary" data-check-close>Salvar e fechar</button></div>';
  // Hide redundant validation form; past records remain untouched.
  if(validation)validation.classList.add('hidden');
 };
 function updateCheck(id,field,checked){
  const m=state?.missions?.[id];if(!m)return;
  m.activity_done=field==='activity_done'?checked:hasDone(m);
  m.sent_for_correction=field==='sent_for_correction'?checked:hasSent(m);
  m.checklist_only=true;
  // A checklist reflects completion, not an FGV score or a pedagogical assessment.
  m.validated=m.activity_done && m.sent_for_correction;
  m.status=m.validated?'Concluída (marcação manual)':m.activity_done?'Atividade feita':'Pendente';
  if(m.sent_for_correction && !m.submitted_at)m.submitted_at=new Date().toISOString();
  save();
  render();
  const quick=byId('ascendQuickForm');if(quick && byId('missionDialog')?.open){
   quick.innerHTML='<p class="muted small">Marque somente o que realmente fez. A correção é realizada na conversa, não automaticamente.</p>'+drawChecks(m)+
    '<div class="actions"><button type="button" class="btn primary" data-check-close>Salvar e fechar</button></div>';
  }
 }
 document.addEventListener('change',e=>{
  const target=e.target.closest('[data-check-id][data-check-field]');
  if(target)updateCheck(target.dataset.checkId,target.dataset.checkField,target.checked);
 });
 document.addEventListener('click',e=>{
  if(e.target.closest('[data-check-close]'))byId('missionDialog')?.close();
 });
 document.addEventListener('submit',e=>{
  if(e.target.id!=='missionForm')return;
  e.preventDefault();e.stopImmediatePropagation();
  byId('missionDialog')?.close();
 },true);
})();
