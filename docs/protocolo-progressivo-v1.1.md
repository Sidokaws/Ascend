# SYSTEM // ASCEND — OAB 48 | Protocolo progressivo v1.1

Data da revisão: 19/10/2026. **Esta versão substitui a exigência prematura de escrever peças completas de memória nas semanas 1 e 2.**

## Regra prioritária

Não exigir peça integral sem antes ensinar reconhecimento, base legal, estrutura completa, teses TBFP e pedidos. O mentor demonstra, o aluno reproduz por blocos, o aluno escreve com apoio, depois escreve integralmente e só então tenta sem modelo. Cada etapa é corrigida. A atividade pode ser adaptada no mesmo dia se o diagnóstico mostrar lacunas. Nunca registrar execução ou domínio antes de evidência.

## Portões de desenvolvimento

1. **Reconhecimento:** fase processual, ato final do enunciado, nome da peça e modalidade.
2. **Vade:** cabimento, artigo, prazo e juízo competente, com consulta orientada.
3. **Estrutura:** endereçamento, preâmbulo, tempestividade, fatos, teses, pedidos, fechamento; distinguir interposição, razões e contrarrazões.
4. **TBFP:** redigir pelo menos um parágrafo com tese → base legal → aplicação aos fatos → pedido coerente.
5. **Peça guiada:** construir do começo ao fim consultando roteiro e modelo.
6. **Peça autônoma:** escrever sem modelo, utilizando o Vade autorizado, corrigir pelo espelho disponível e repetir com variação.
7. **Simulado:** uma peça-surpresa + quatro discursivas A/B em até 5h, com consultas permitidas e controle de tempo.

**Portão de prontidão:** antes de atribuir peça integral autônoma, testar se consegue identificar a modalidade, localizar artigo e prazo, estruturar o texto e redigir uma tese TBFP. Caso ainda não consiga, converter a tarefa para oficina guiada sem penalidade. Contar como peça completa apenas a peça realmente produzida integralmente e corrigida. Para os simulados, se não houver prontidão, transformar a janela em preparação dirigida e **não** contabilizá-la como simulado completo.

## Primeiros 14 dias — aproximação realista

| Data | Foco principal | Produção esperada |
|---|---|---|
| Seg 26/10 | Diagnóstico 6 mini-casos, Apelação e TBFP | Identificações e esqueleto com consulta; 1 discursiva A/B guiada |
| Ter 27/10 | Oficina Apelação P018 | Interposição + esquema de razões e 1 tese TBFP, com modelo |
| Qua 28/10 | Apelação e introdução à Resposta à Acusação | Duas discursivas A/B; flashcards; dúvidas corrigidas |
| Qui 29/10 | Oficina Resposta à Acusação P016 | Preâmbulo, 1 tese e pedido, com modelo |
| Sex 30/10 | Apelação x Resposta à Acusação | 2 discursivas, quadro comparativo e banco de erros |
| Sáb 31/10 | Descanso | Sem penalidades |
| Dom 01/11 | Reteste das estruturas | Reproduzir trechos e reescrever duas teses TBFP |
| Seg 02/11 | Revisar anteriores; introduzir Memoriais e RESE | Roteiro dos Memoriais e 1 discursiva |
| Ter 03/11 | Oficina Memoriais P017 | Fatos, 1 tese, pedidos com modelo, corrigidos |
| Qua 04/11 | Memoriais x RESE | 2 discursivas e revisão de base legal |
| Qui 05/11 | Oficina RESE P020 | Interposição, esquema de razões, pedidos e correção |
| Sex 06/11 | Comparar quatro peças | 2 discursivas, reteste e auditoria |
| Sáb 07/11 | Descanso | Sem penalidades |
| Dom 08/11 | Portão de prontidão | Reteste de quatro peças e tentativa integral guiada, apenas se viável |

**Fontes:** `Slides _ Apelação .pdf`, pp. 3–27 e 57–74; `estrutura de peça.pdf`, pp. 57–61 (Apelação), 8–11 (Resposta à Acusação), 12–15 (Memoriais); `Slides _ Resposta à Acusação.pdf`, pp. 3–11 e 27–36; `E-book- Aulas _ Memoriais.pdf`, pp. 5–24; `E-book- Aulas _ Recurso em Sentido Estrito (Hipótese de cabimento).pdf`, pp. 5–18; `Peças _ Enunciados.pdf`, pp. 25, 27, 29 e 33. **Só consultar `Peças _ Padrão de Resposta .pdf` depois da tentativa.**

## Metas revisadas, sem inflar contagens

- **119 dias (26/10 a 21/02) e 334 horas programadas**, incluindo 5 dias de estudo por semana, sábados livres e 17 domingos programados (2 para recuperação, 15 janelas de simulado).
- **4 oficinas iniciais de peças** nas duas primeiras semanas. Não contam antecipadamente como peças integrais.
- **30 janelas avulsas de treino de peça integral** (semanas 3–17), sempre condicionais ao portão de prontidão.
- **15 janelas de simulados completos** (semanas 3–17). Somente contam como simulados se forem realmente concluídos e corrigidos. São metas de agenda, não obrigação incondicional.
- **Até 45 peças integrais planejadas**, considerando 30 janelas avulsas + 15 de simulados. As oficinas iniciais podem resultar em uma peça completa adicional, mas nunca serão contadas antes de acontecer.
- **85 questões discursivas avulsas** previstas e **até 60 nos 15 simulados**, total potencial de 145. Redação desde a primeira semana, primeiro com apoio e depois autônoma.
- As contagens de trabalho realizado iniciam em zero. Um simulado contém uma peça; não contar a peça duas vezes.

A contagem real pode variar porque o mentor tem obrigação de corrigir a trajetória se a base não estiver pronta. Melhor diminuir ou adiar um teste de 5h do que fazer uma avaliação improdutiva por bloqueio total. O sistema recompensará recuperação e superação de erros.

## Dados para a aplicação

Use `OAB48_ASCEND_Plano_119_Dias_v1_1.json` como **fonte de verdade**. Contém `schema_version=1.1`, 119 dias, 274 missões e protocolo `readiness_protocol`. Os IDs das missões são os mesmos da v1.0; ao importar, **atualize por ID (upsert)** e **não duplique as missões antigas**. Use os CSVs v1.1 para importação tabular e a planilha `OAB48_Cronograma_ASCEND_Progressivo_v1_1.xlsx` para revisão humana.

O `targets.full_simulations` é o número 15. As flags `targets.full_simulations_conditional` e `missions[].requires_readiness_gate` definem que algumas tarefas são condicionais. Não bloquear os registros de estudo: uma missão guiada pode ser concluída com trechos corrigidos, ainda que não configure uma peça completa. Na ficha de cada peça, registrar `learning_stage` (reconhecimento, guiado, integral com consulta, integral autônoma), `is_full_piece`, `used_model`, `evidence`, `corrected`, `grade`, `duration`, `next_review`.

Controle de horas: `gross_seconds = ended_at - started_at`; `effective_seconds = gross_seconds - pause_seconds` para pausas marcadas, com edição auditável. Horas não comprovam domínio. Não conceder automaticamente XP ou rank de domínio por marcar tarefas.

Revisões a partir da produção *real* em D+1, D+7, D+15 e D+30, conforme os erros e retestes. Os sábados de descanso programado não geram punição. Atualizações oficiais e materiais consultáveis obedecem ao edital da OAB 48, incluindo marco legislativo indicado, e modelos do CEISC não devem ser apresentados como espelhos oficiais sem verificação.

**Estado inicial:** todos os registros de desempenho, estudos e avaliações permanecem zerados. Este arquivo não implementa sincronização automática com a aplicação: o desenvolvedor deverá importar os dados e implementar a atualização segura, sem apagar registros existentes.