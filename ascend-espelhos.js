'use strict';
(function(){
const checklists=[
 ['Apelação',['Identificar sentença e modalidade do Art. 593 do CPP','Interposição no juízo de origem, fundamento e prazo','Razões no tribunal competente, partes e fatos essenciais','Preliminares e teses defensivas com base aplicada','Pedidos de conhecimento e provimento, ajustados ao caso','Subsidiárias (dosimetria, regime, etc.) e fechamento']],
 ['Memoriais',['Verificar encerramento de instrução e procedimento','Endereçamento e fundamento conforme rito','Preliminares e nulidades efetivamente cabíveis','Mérito principal e subsidiário com TBFP','Pedidos correspondentes e testemunhas somente quando aplicáveis','Local, data, assinatura, OAB']],
 ['Resposta à Acusação',['Citação e fase correta antes da instrução','Juízo competente e fundamento da resposta','Prazo, qualificação e defesa técnica','Preliminares e absolvição sumária quando cabíveis','Pedidos, provas e rol de testemunhas quando cabíveis','Fecho completo']],
 ['RESE',['Decisão específica enquadrada nas hipóteses do Art. 581 do CPP','Interposição e razões na ordem correta','Prazo e preparo do recurso conforme previsão legal','Pedido de juízo de retratação e Art. 589 CPP quando aplicáveis','Pedidos de conhecimento e provimento corretamente formulados','Fatos, fundamento e fechos pertinentes']],
 ['Agravo em Execução',['Ato do juízo da execução e legitimidade','Fundamento na LEP e prazo aplicável conferido no Vade','Destinatário, interposição/razões conforme prática pertinente','Condição do apenado, prova documental e tese aplicada','Pedido de reforma/provimento adequado','Fechos e requerimentos específicos sem copiar recurso inadequado']],
 ['Contrarrazões',['Já existe recurso da parte contrária; não é recurso da defesa','Petição de apresentação/juntada ao juízo de origem','Razões ao órgão julgador competente e prazo conforme recurso','Admissibilidade: não conhecimento total/parcial quando cabível','Mérito: desprovimento, manutenção do julgado e teses subsidiárias','Fechamento em folhas corretas; no Júri verificar limites da interposição']]
];
const prev=render;
render=function(){
prev();if(!plan)return;
const el=$('qualityPrimary');if(!el)return;
el.innerHTML+='<div class="item"><div class="eyebrow">CHECKLIST DE ESPELHO — SEM PONTUAÇÃO FICTÍCIA</div><p class="muted small">Marque mentalmente os itens que deverão constar quando o caso permitir. A FGV pontua exigências específicas por edição: estes itens são controle pedagógico, não rubrica oficial.</p>'
+checklists.map(([title,items])=>'<details class="item"><summary><b>'+safe(title)+'</b></summary><ol style="font-size:12px;line-height:1.8;color:#c1d6ef;padding-left:22px">'+items.map(t=>'<li>'+safe(t)+'</li>').join('')+'</ol></details>').join('')
+'<p class="muted small"><a target="_blank" rel="noopener noreferrer" href="https://examedeordem.oab.org.br/EditaisProvas">Fonte para padrões e provas oficiais da OAB</a>. Nota e descontos só após confronto do espelho da edição exata.</p></div>';
};
})();