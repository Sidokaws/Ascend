'use strict';
/* Microcobertura auditada: 20min DOS 70min de sexta, nunca adicional. */
(function(){
const themes=[
['Fases processuais e consulta ao Vade','Reconhecer denúncia, citação, sentença e recurso; 1 mini-caso sem gabarito.','CEISC cronograma original, p.1–4'],
['Iter criminis, tentativa e crime impossível','Construir quadro: preparação / execução / consumação / impossibilidade; localizar CPP/CP e escrever um micro-TBFP.','CEISC cronograma original, p.3'],
['Prisão temporária e flagrante','Diferenciar flagrante, preventiva, temporária e consequências; indicar pedido adequado no caso.','CEISC cronograma original, p.11'],
['Descriminante putativa','Contrastar erro de tipo, excludentes e descriminante putativa; resolver hipótese curta sem ler padrão.','CEISC cronograma original, p.5'],
['Desistência e arrependimento','Distinguir desistência voluntária, arrependimento eficaz e posterior, com efeitos legais.','CEISC cronograma original, p.3'],
['Emendatio e mutatio libelli','Explicar o que muda na imputação e em quais fases, localizando o fundamento no CPP.','CEISC cronograma original, p.8'],
['Prova pericial e cadeia de custódia','Localizar dispositivos no CPP e redigir tese apenas se o caso revelar a irregularidade.','CEISC cronograma original, p.7 (Provas); Vade Mecum'],
['Nulidades com prejuízo','Reconhecer vício, prejuízo e pedido correspondente, sem fórmulas genéricas.','CEISC cronograma original, p.10'],
['Crimes contra a honra e ação privada','Relacionar espécie de ação penal, legitimidade, queixa e prazo.','CEISC cronograma original, p.1–2'],
['Pronúncia e primeira fase do Júri','Contrastar pronúncia, impronúncia e absolvição sumária com recurso cabível.','CEISC cronograma original, p.5'],
['Apelação do Júri e contrarrazões','Checar limites das razões recursais e pedido do recorrido; não usar provimento se defende sentença.','CEISC cronograma original, p.7'],
['Execução e benefícios','Confrontar progressão, remição e livramento, com juízo e Agravo quando cabível.','CEISC cronograma original, p.9–10'],
['Defesa preliminar da Lei de Drogas','Identificar etapa especial anterior ao recebimento e requerimentos pertinentes.','CEISC cronograma original, p.12–14'],
['Concurso de pessoas e efeito extensivo','Identificar fundamento comum versus pessoal e aplicar a recurso/teses.','CEISC cronograma original, p.8'],
['Crimes contra a Administração e medidas de segurança','Ler texto legal pertinente no Vade; sem inventar apostila/página não auditada.','Lacuna do roteiro executável; verificar edital e Vade'],
['REsp, ROC e MS criminal','Comparar decisão, órgão, hipótese recursal e limitações de cada medida.','CEISC cronograma original, p.15–16'],
['CTB, organização criminosa e erros persistentes','Consultar as leis do tema no Vade e reescrever a pior resposta de legislação especial.','Q095 e Q099 do banco ASCEND; Vade Mecum']
];
const original=render;
render=function(){
 original();if(!plan)return;
 const day=getDay(selectedDate);if(day?.weekday!=='sexta-feira')return;
 const [title,instruction,source]=themes[day.week-1]||[];
 if(!title)return;
 const slot=$('dailyMissions');if(!slot)return;
 slot.innerHTML+='<div class="item" style="border-color:#5676ab"><span class="tag blue">20min JÁ INCLUÍDOS NA COBERTURA DE 70min</span><div class="item-title">'+safe(title)+'</div>'
 +'<p class="item-meta">'+safe(instruction)+'</p><p class="item-meta">Referência: '+safe(source)+'. Se a fonte completa não estiver disponível, consulte o Vade e deixe a lacuna para auditoria final — não invente páginas.</p>'
 +'<p class="item-meta"><b>Entrega:</b> quatro linhas de explicação ou um micro-TBFP para corrigir junto à atividade de cobertura. Sem tempo extra e sem XP isolado.</p></div>';
};
})();