'use strict';
/* SYSTEM // ASCEND: biblioteca privada de PDFs no próprio computador.
 * Segurança: não envia PDFs ou nomes para o servidor; nenhum token/senha no GitHub.
 * GitHub Pages em HTTPS; conexão persistente via FileSystemDirectoryHandle em IndexedDB
 * quando suportado; seletor individual local como contingência.
 */
(function(){
 const DB_NAME='AscendPdfLocalV1', STORE='handles', HANDLE_KEY='studyFolder', FILE_PREFIX='file:', ALIAS_KEY='ascendPdfMappingV1';
 const MAX_SCAN=2000, MAX_DAY=14;
 let dbPromise=null,dirHandle=null,index=new Map(),indexedFiles=[],status='inicializando',errorMsg='',connectedMode='nenhum';
 let aliases={};
 try{aliases=JSON.parse(localStorage.getItem(ALIAS_KEY)||'{}')}catch{aliases={}}
 const $pdf=id=>document.getElementById(id);
 const normalize=name=>String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR')
    .replace(/\.(pdf)$/i,'').replace(/\s*\(\d+\)$/,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
 const escape=safe;
 const isPdf=name=>/\.pdf$/i.test(String(name||''));
 const isRestricted=name=>/gabarito|espelho|padr[aã]o.{0,25}resposta|solu[cç][aã]o|resposta correta/i.test(String(name||''));
 const importantName=name=>isPdf(name)&&!isRestricted(name);
 const efile=key=>FILE_PREFIX+key;
 function database(){
  if(!('indexedDB' in window))return Promise.resolve(null);
  if(dbPromise)return dbPromise;
  dbPromise=new Promise((resolve,reject)=>{
   const req=indexedDB.open(DB_NAME,1);
   req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE)};
   req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('Falha no banco local'));
  }).catch(e=>{dbPromise=null;console.warn('Biblioteca IndexedDB indisponível',e);return null});
  return dbPromise;
 }
 async function readSaved(key){
  const db=await database();if(!db)return null;
  return new Promise(resolve=>{try{const req=db.transaction(STORE,'readonly').objectStore(STORE).get(key);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>resolve(null)}catch{resolve(null)}});
 }
 async function saveLocal(key,value){
  const db=await database();if(!db)return false;
  return new Promise(resolve=>{try{const req=db.transaction(STORE,'readwrite').objectStore(STORE).put(value,key);
   req.onsuccess=()=>resolve(true);req.onerror=()=>resolve(false)}catch{resolve(false)}});
 }
 async function clearLocal(key){
  const db=await database();if(!db)return;
  await new Promise(resolve=>{try{const req=db.transaction(STORE,'readwrite').objectStore(STORE).delete(key);
   req.onsuccess=()=>resolve();req.onerror=()=>resolve()}catch{resolve()}});
 }
 function rememberAlias(expected,actual){
  aliases[normalize(expected)]={path:actual,name:expected};try{localStorage.setItem(ALIAS_KEY,JSON.stringify(aliases))}catch{}
 }
 function coverage(){
  if(!plan)return {names:[],available:0};
  const names=new Set();
  for(const m of plan.missions||[])for(const step of m.step_by_step||[])for(const f of step.fontes||[])
    if(importantName(f.arquivo))names.add(f.arquivo);
  for(const w of window.ASCEND_PEDAGOGIA?.weeks||[])for(const entry of w.entries||[])
    for(const part of String(entry[2]||'').split('+')){
     const key=part.split(':')[0],filename=window.ASCEND_PEDAGOGIA.aliases[key];
     if(importantName(filename))names.add(filename);
    }
  const all=[...names];return {names:all,available:all.filter(n=>!!findMatch(n)).length};
 }
 async function scan(dir,rel='',depth=0){
  if(depth>10||index.size>MAX_SCAN)throw Error('A pasta contém arquivos demais; escolha uma pasta dedicada aos PDFs da OAB.');
  for await(const [name,handle] of dir.entries()){
   if(handle.kind==='directory'){
    if(!['.git','node_modules','.venv'].includes(name))await scan(handle,rel+name+'/',depth+1);
   }else if(isPdf(name)){
    const path=rel+name;
    index.set(path,{handle,name,path,key:normalize(name),source:'pasta'});
   }
   if(index.size>MAX_SCAN)throw Error('Limite de '+MAX_SCAN+' PDFs excedido; selecione somente seus materiais de estudo.');
  }
 }
 async function restoreIndex(){
  dirHandle=await readSaved(HANDLE_KEY);
  if(!dirHandle||typeof dirHandle.queryPermission!=='function'){status='desconectado';return}
  try{
   const permission=await dirHandle.queryPermission({mode:'read'});
   if(permission!=='granted'){status='reautorizar';connectedMode='pasta';return}
   index.clear();await scan(dirHandle);
   status='pronto';connectedMode='pasta';
  }catch(err){status='reautorizar';errorMsg=String(err.message||err)}
 }
 async function connectFolder(){
  if(typeof window.showDirectoryPicker!=='function'){
   status='incompativel';errorMsg='Esse navegador não permite vincular pasta de forma persistente. Experimente Chrome ou Edge atualizado; você também pode associar um PDF específico.';paint();return;
  }
  try{
   // Chamado DIRETAMENTE pelo clique, sem awaits prévios: preserva user activation.
   const selected=await window.showDirectoryPicker({id:'ascend-oab-pdfs',mode:'read'});
   status='indexando';paint();
   const temp=new Map();const prev=index;index=temp;
   try{await scan(selected)}catch(e){index=prev;throw e}
   dirHandle=selected;const saved=await saveLocal(HANDLE_KEY,selected);
   status='pronto';connectedMode='pasta';errorMsg=saved?'':'O navegador não permitiu salvar a autorização. Esta sessão permanece conectada, mas pode exigir nova seleção depois.';
   paint();
  }catch(err){if(err?.name!=='AbortError'){status=index.size?'pronto':'desconectado';errorMsg='Não foi possível conectar: '+String(err.message||err);paint()}}
 }
 async function authorize(){
  if(!dirHandle)return connectFolder();
  try{
   const granted=await dirHandle.requestPermission({mode:'read'});
   if(granted!=='granted'){errorMsg='A pasta não foi autorizada.';paint();return}
   index.clear();await scan(dirHandle);status='pronto';errorMsg='';paint();
  }catch(e){errorMsg='Falha na autorização: '+String(e.message||e);paint()}
 }
 function findMatch(name){
  if(!isPdf(name))return null;
  const key=normalize(name),hint=aliases[key]?.path;
  if(hint&&index.has(hint))return index.get(hint);
  const exact=[...index.values()].filter(x=>x.key===key);
  if(exact.length===1)return exact[0];
  // Nunca chutar com nomes similares: risco de abrir material incorreto.
  if(exact.length>1)return {ambiguous:exact.map(x=>x.path)};
  const remembered=indexedFiles.find(x=>x.key===key);
  if(remembered)return {stored:true,name:remembered.name,key};
  return null;
 }
 async function loadSingle(expected){
  const x=findMatch(expected);
  if(x?.ambiguous)throw new Error('Há '+x.ambiguous.length+' PDFs com o mesmo nome; organize duplicatas ou associe o arquivo correto individualmente.');
  if(x?.stored){
   const file=await readSaved(efile(x.key));if(file)return file;
  }
  if(!x)throw new Error('Arquivo ainda não associado: '+expected+'. Confira se está na pasta conectada ou use "Associar um PDF".');
  if(typeof x.handle.getFile!=='function')throw new Error('Arquivo inacessível: '+expected);
  return x.handle.getFile();
 }
 function openBlob(file,page,popup){
  const url=URL.createObjectURL(file);
  const hash='#page='+Math.max(1,parseInt(page,10)||1);
  try{
   if(popup&&!popup.closed){popup.opener=null;popup.location.replace(url+hash)}
   else{
    const link=document.createElement('a');link.href=url+hash;link.target='_blank';link.rel='noopener noreferrer';link.click();
   }
   setTimeout(()=>URL.revokeObjectURL(url),10*60*1000);
  }catch(e){URL.revokeObjectURL(url);throw e}
 }
 async function openDocument(name,page){
  if(isRestricted(name)){notify('Espelhos e gabaritos só devem ser abertos depois da tentativa e liberação de correção.');return}
  let existing=findMatch(name);
  if(!existing){
   notify('PDF ainda não associado. Selecione a pasta da OAB ou associe o arquivo correto na Biblioteca.');
   const hub=$pdf('pdfLibraryHub');hub?.scrollIntoView?.({behavior:'smooth',block:'center'});
   return;
  }
  if(existing.ambiguous){errorMsg='PDF duplicado: '+name+'. Selecione a versão correta na biblioteca.';paint();notify(errorMsg);return}
  // Abre aba enquanto o clique ainda tem ativação; não publica conteúdo.
  const popup=window.open('about:blank','_blank');
  try{
   const file=await loadSingle(name);
   if(!file||!isPdf(file.name))throw new Error('Não é um PDF válido');
   openBlob(file,page,popup);
  }catch(e){try{popup?.close()}catch{}errorMsg=String(e.message||e);paint();notify(errorMsg)}
 }
 function listNeededForDate(date){
  if(!plan)return [];
  const results=[],seen=new Set();
  function add(name,page,kind){
   if(!importantName(name))return;
   const key=normalize(name)+':'+page;if(seen.has(key))return;
   seen.add(key);results.push({name,page:Math.max(1,Number(page)||1),kind});
  }
  for(const m of plan.missions||[]){
   if(m.date!==date)continue;
   for(const step of m.step_by_step||[])for(const f of step.fontes||[])add(f.arquivo,f.paginas?.[0]||1,'Missão');
  }
  const reading=state?.missions?.['LEIT-'+date.replace(/-/g,'')];
  for(const f of reading?.sources_detailed||[])add(f.arquivo,f.paginas?.[0]||1,'Trilha teórica');
  return results.slice(0,MAX_DAY);
 }
 function buttonHtml(x){
  const present=findMatch(x.name),found=!!present&&!present.ambiguous;
  return '<button type="button" class="btn small-btn pdf-source '+(found?'pdf-found':'pdf-missing')+'" data-pdf-name="'+escape(x.name)+'" data-pdf-page="'+x.page+'" title="'+escape(x.name)+'">'
  +(found?'📖 Abrir PDF':'⚠ Associar PDF')+' · p. '+x.page+'</button>';
 }
 function hub(){
  const el=$pdf('pdfLibraryHub');if(!el)return;
  const {names,available}=coverage();
  const linked=status==='pronto';
  el.innerHTML='<div class="pdf-library"><div class="pdf-head"><div><small>ARQUIVOS PRIVADOS // BIBLIOTECA LOCAL</small><h3>Seus PDFs, direto na página correta</h3></div><span class="pdf-pill">'+(linked?'Conectada':status==='reautorizar'?'Autorização necessária':'Não conectada')+'</span></div>'
   +'<p>Escolha <b>uma única pasta</b> onde estão seus PDFs da OAB. O ASCEND reconhece automaticamente os nomes dos materiais no cronograma. A pasta continua no seu computador; nenhum PDF é publicado ou enviado ao GitHub.</p>'
   +'<div class="pdf-actions"><button type="button" class="btn primary" data-pdf-action="'+(status==='reautorizar'?'authorize':'connect')+'">'+(status==='reautorizar'?'Reautorizar acesso à pasta':linked?'Trocar pasta de PDFs':'Conectar pasta de PDFs')+'</button>'
   +'<button type="button" class="btn" data-pdf-action="single">Associar um PDF específico</button>'
   +(typeof window.showDirectoryPicker!=='function'?'<span class="muted small">Para seleção de pasta persistente, use Chrome ou Edge atualizado.</span>':'')+'</div>'
   +'<p class="pdf-count">'+(linked?'Encontrados automaticamente: <b>'+available+' de '+names.length+'</b> arquivos citados no roteiro. ':'Referências no roteiro: <b>'+names.length+'</b>. ')
   +'Nomes duplicados ou diferentes precisam de associação manual. <b>Não usa senha:</b> o próprio sistema de permissões do navegador protege o acesso.</p>'
   +(errorMsg?'<div class="pdf-warning">'+escape(errorMsg)+'</div>':'')
   +'<p class="pdf-note">Funciona neste computador e navegador. Em outro dispositivo, conecte sua pasta novamente. Se o navegador retirar a permissão, basta clicar em reautorizar.</p></div>';
 }
 function dayButtons(){
  const el=$pdf('dayPdfLinks');if(!el)return;
  const items=listNeededForDate(selectedDate);
  if(!items.length){el.innerHTML='';return}
  el.innerHTML='<div class="pdf-day"><div class="section-head"><strong>Materiais indicados para este dia</strong><span class="muted small">Abertura na página prevista</span></div>'
   +'<div class="pdf-day-grid">'+items.map(item=>'<div class="pdf-day-item"><span>'+escape(item.name)+'<small>'+escape(item.kind)+'</small></span>'+buttonHtml(item)+'</div>').join('')+'</div>'
   +'<p class="pdf-note">Espelhos e gabaritos não são liberados nesta área antes da tentativa.</p></div>';
 }
 function theoryButtons(){
  const rows=$pdf('theorySchedule')?.querySelectorAll?.('.theory-row')||[];
  const planned=plan?.days?.filter(d=>d.weekday!=='sábado'&&d.weekday!=='domingo')||[];
  rows.forEach((row,i)=>{
   if(row.querySelector('.pdf-in-row'))return;
   const date=planned[i]?.date;if(!date)return;
   const refs=state.missions['LEIT-'+date.replace(/-/g,'')]?.sources_detailed||[];
   const valid=refs.filter(f=>importantName(f.arquivo)).slice(0,3);
   if(!valid.length)return;
   const panel=document.createElement('div');panel.className='pdf-in-row';
   panel.innerHTML=valid.map(f=>buttonHtml({name:f.arquivo,page:f.paginas?.[0]||1})).join(' ');
   row.querySelector('div:nth-child(2)')?.appendChild(panel);
  });
 }
 function missionButtons(){
  const root=$pdf('missionDialog');if(!root)return;
  root.querySelectorAll('[data-pdf-name]').forEach(el=>{
   const x=el.dataset,match=findMatch(x.pdfName);
   el.textContent=(match&&!match.ambiguous?'📖 Abrir arquivo':'📁 Associar arquivo')+' — página '+(Number(x.pdfPage)||1);
   el.title=x.pdfName;el.classList.add('pdf-existing-button');
  });
 }
 function paint(){hub();dayButtons();theoryButtons();missionButtons()}
 function singlePicker(expected=null){
  const input=$pdf('pdfLibrarySingleFile');if(!input)return;
  input.dataset.expected=expected||'';input.value='';input.click();
 }
 async function pickedOne(file,expected){
  if(!file||!isPdf(file.name)){notify('Selecione um arquivo PDF válido.');return}
  const key=normalize(expected||file.name);
  // Arquivos avulsos ficam somente no IndexedDB local, nunca no servidor.
  const ok=await saveLocal(efile(key),file);
  if(!ok){notify('Não foi possível guardar esse arquivo no navegador. Considere conectar a pasta completa pelo Chrome/Edge.');return}
  if(!indexedFiles.some(x=>x.key===key))indexedFiles.push({key,name:file.name});
  rememberAlias(expected||file.name,file.name);
  errorMsg='';connectedMode=dirHandle?'pasta + avulsos':'PDF avulso';
  if(!dirHandle)status='pronto';
  paint();notify('Arquivo associado localmente. Agora o botão abre o PDF na página correta.');
 }
 async function initLibrary(){
  await restoreIndex();
  // Reconstituir referências a arquivos avulsos, sem carregar seu conteúdo na memória.
  const db=await database();
  if(db){
   const keys=await new Promise(resolve=>{try{const req=db.transaction(STORE,'readonly').objectStore(STORE).getAllKeys();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>resolve([])}catch{resolve([])}});
   indexedFiles=keys.filter(k=>typeof k==='string'&&k.startsWith(FILE_PREFIX)).map(k=>({key:k.slice(FILE_PREFIX.length),name:k.slice(FILE_PREFIX.length)}));
   if(indexedFiles.length&&status!=='pronto')status='pronto';
  }
  paint();
 }
 function bind(){
  const input=document.createElement('input');input.type='file';input.id='pdfLibrarySingleFile';input.accept='.pdf,application/pdf';input.style.display='none';document.body.appendChild(input);
  input.addEventListener('change',async()=>{const expected=input.dataset.expected||null;await pickedOne(input.files?.[0],expected)});
  // CAPTURE: substitui apenas o fluxo antigo de seleção repetitiva do V1.2;
  // impede acionar o seletor legado com cada novo clique.
  document.addEventListener('click',e=>{
   const action=e.target.closest('[data-pdf-action]');
   if(action){e.preventDefault();if(action.dataset.pdfAction==='connect')connectFolder();
    else if(action.dataset.pdfAction==='authorize')authorize();
    else if(action.dataset.pdfAction==='single')singlePicker();return}
   const btn=e.target.closest('[data-pdf-name]');
   if(!btn)return;
   e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();
   const name=btn.dataset.pdfName,page=btn.dataset.pdfPage;
   if(!findMatch(name)){singlePicker(name);return}
   openDocument(name,page);
  },true);
  initLibrary();
 }
 const olderRender=render;
 render=function(){olderRender();if(!plan)return;paint()};
 const olderOpen=openMission;
 openMission=function(id){olderOpen(id);missionButtons()};
 document.addEventListener('DOMContentLoaded',bind);
})();