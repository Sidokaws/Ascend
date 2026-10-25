# Integração controlada — Adendo de execução de 25/10/2026

**Natureza:** complemento pedagógico incremental à versão sustentável V2.1 do SYSTEM // ASCEND. O documento do usuário não substitui o plano, não autoriza apagar progresso nem alterar datas por suposição.

## O que permaneceu intacto
- JSON canônico V1.2, seus 119 dias, 274 missões e os 15 pacotes arquivados.
- Orçamento **V2.1 de 335 horas** (teoria integrada); dez domingos de prova, cinco domingos convertidos em revisão, sábados livres.
- Meta de até 30 oficinas e 85 discursivas avulsas + dez provas de peça e quatro discursivas (não confundir oportunidades com produções concluídas).
- Identificadores das missões, fontes/páginas, estudos das seis peças prioritárias e fluxos atuais da V1/V2/V3.
- Dados já registrados em localStorage, backups e notas históricas. Nenhum registro foi promovido a “aprovado” automaticamente.

## Ajustes realmente necessários
1. A aba Correção e prioridades recebeu **meta flexível 70%/30%** (seis peças-base x demais), sem reordenar os 119 dias sem evidência de necessidade.
2. Cada treino de peça pode documentar **contato teórico, esqueleto, oficina guiada ou peça integral autônoma**. O registro é distinto de validação: integral requer produção autônoma completa, sem modelo pronto, e correção; uso permitido do Vade não é copiar modelo. Progresso antigo preservado, sem recalcular automaticamente.
3. Para **novas avaliações discursivas**, os itens A/B têm campos de respostas, correções e erros; uma validação não avança por mero clique. Nas avaliações novas de simulado completo, devem constar **quatro notas separadas, cada uma limitada a 1,25 ponto**, e parecer A/B de cada questão. Soma automática das quatro notas; peça registrada à parte (máximo 5).
4. Simulados V2.1 podem ser rotulados manualmente “primeiro contato para o estudante” ou “revisão”; nenhum rótulo é inferido de simples agendamento, pois o aluno pode não ter resolvido o caso. A interface sinaliza **possível repetição do caso** se a mesma peça foi agendada antes e destaca quando existe produção anterior documentada. O SIM-01 da V1.2 usa P016, anteriormente agendado em D004: revisar exposição efetiva antes de declarar ineditismo.
5. Auditoria semanal registra texto verificável: modalidades, última peça integral, TBFP, prazo/fundamento, erros D+1/D+7/D+15/D+30, enunciados ainda não vistos e remanejamento de faltas **sem empilhar**. Registrar a auditoria não conclui missões.
6. Alerta visual do reaproveitamento: edital complementar **previsto para 12/11/2026** no calendário oficial atual; inscrições **23 a 30/11/2026**, sujeitas a alterações. Verificar edital complementar e regras de consulta antes da prova.
7. Contadores exibidos no painel V2.1 corrigidos para **274 missões-base, 40 oportunidades de peça, 125 discursivas e dez simulados**, separando referências teóricas extras e as cinco janelas de simulado convertidas.

A nova lógica vive exclusivamente em `ascend-adendo.js` / `ascend-adendo.css` e quatro espaços da interface `index.html`. Dados incrementais: `state.adendo2510` dentro do backup V3 existente. Não houve migração destrutiva nem reescrita dos arquivos originais.

## Limites e decisões pendentes
- A meta 70%/30% é orientadora, **não distribuição estatística validada**. A composição exata dos 30 treinos só pode ser rebalanceada após mensurar o domínio.
- Respostas, notas e espelhos são inseridos pelo aluno/mentor; o aplicativo não possui verificador automático da qualidade jurídica.
- Correções pré-existentes não receberam nota individual A/B retroativamente. Evidência ausente continua ausente; não inventar avaliação.
- Não foram publicados nem modificados PDFs de estudo. Auditar acervo integral somente após “finalizei os envios”.
- O alerta de inscrição é **somente dentro do painel**, não é notificação agendada ou inscrição realizada.
- Não foram criados simulados inéditos nesta alteração; os casos antigos foram preservados.

## Pedido expresso de verificação de conflitos para qualquer próximo revisor/assistente

**Antes de modificar mais arquivos, confira cuidadosamente o código e os dados vigentes da V2.1. Não reconstrua o cronograma inteiro. Atualize somente o item em conflito, com backup e teste de regressão.**

Confira especialmente:
- Conflito entre **15 pacotes da V1.2** e **dez provas integrantes da V2.1**; não reabilitar automaticamente as cinco janelas de revisão.
- Rótulo “inédito” vs. “revisão” por contato **efetivo** do aluno, especialmente P016/SIM-01/D004, e não por constar no catálogo.
- Contadores 274/40/125/10 vs. bases legadas 359/45/145/15; impedir dupla contagem das leituras já integradas às 335h.
- As quatro notas da discursiva de simulado (0–1,25), a pontuação da peça (0–5), o espelho aplicável e a distinção entre correção **FGV oficial identificada** e avaliação pedagógica.
- O correto status dos quatro estágios de escrita e a exclusão de oficinas parciais dos totais de peças integrais.
- Cronograma Dia 1, **26/10: 45min diagnóstico A–F → 90min Apelação interposição/razões → 45min Q003 A/B**, sem mostrar solução prévia; estado inicial pendente.
- Sábado sem tarefa; atualização de avisos administrativos pelo **calendário oficial OAB**; preservação do backup V3.

**Critério de aceite:** nenhuma data ou missão-base apagada, nenhum XP/nota/etapa presumido, nenhuma sobreposição de horas, renderização no desktop e mobile sem quebras, submissão A/B validada e backup JSON funcionando. Se algum conflito persistir, reportar a causa e a intervenção mínima necessária antes de mexer no cronograma.

Fonte oficial: https://examedeordem.oab.org.br/Calendario
