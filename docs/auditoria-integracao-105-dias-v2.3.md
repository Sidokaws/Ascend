# OAB 48 — Auditoria de integração da agenda de 105 dias (08/11/2026)

## Origem, escopo e decisão

Arquivo autoritativo da reprogramação: `OAB48_ASCEND_105_Dias_AUDITORIA_PRIORIDADES_09-11-2026(1).xlsx`, recebido do usuário. A versão executável V2.3 foi gerada externamente como **`ASCEND_Plano_105_Dias_09-11-2026_v2_3.json`** e deve ser selecionada **uma única vez** em **Dados/Backup → Ativar cronograma 105 dias (arquivo JSON)**. Por motivo de segurança e limitação dos conectores, o JSON não foi publicado no repositório: o navegador o valida e o guarda em armazenamento local, sem upload.

Os documentos-fonte anteriores (JSON V1.2 de 119 dias e suas 274 missões) continuam intactos no GitHub. A V2.3 usa IDs exclusivos `ASC105-...`. A atualização não apaga `state.missions`, notas, evidências, XP, rankings, banco de erros ou PDFs vinculados. A ativação grava o backup `ascendOab48V3_Backup_105_20261109` e permite retornar à agenda de 119 dias sem descartar os registros. **Importante:** voltar ao calendário anterior altera a visualização, não apaga nem restaura retroativamente XP.

## Verificação dos 105 dias

| Item | Resultado |
| --- | --- |
| Datas | 09/11/2026–21/02/2027, 105 dias consecutivos, 15 semanas |
| Pausas | 15 sábados, zero tarefa programada |
| Carga regular | 18.000 minutos = **300 horas** |
| Missões | **276**; cada uma com passo a passo, duração, entrega e critério de sucesso |
| Oficinas | **30 = 22 prioritárias + 8 complementares**; produção 135min, correção 45min, reteste 15min (195min no total) |
| Questões avulsas | **85**, itens A/B |
| Simulados | **10** de 5 horas; 40 discursivas A/B, total previsto **125** |
| Simulados em | 06/12, 13/12, 20/12, 03/01, 10/01, 17/01, 24/01, 31/01, 07/02, 14/02 |
| Reta final | 21/02 revisão; 22–27/02 Revisão Turbo; prova-alvo 28/02 |

**A conformidade estrutural foi testada para todos os 105 dias**, incluindo dia da semana, passo a passo e soma diária, gênero de atividade e ausência de tempo em sábados. Isso **não equivale** a dizer que todos os enunciados das 105 datas estão identificados.

## Pendências documentais explícitas

- **64 das 85 questões avulsas** ainda aguardam Q-ID, página e verificação do enunciado; apenas 21 puderam ser associadas com segurança ao catálogo Q001–Q100 da V1.2.
- **14 oficinas** ainda aguardam correspondência exata entre o enunciado da peça e uma fonte/página: 13 casos reservados e a modalidade JECRIM `MENTORIA44` sem equivalência confirmada no catálogo P001–P027.
- **10 pacotes de simulados**, com dez casos de peça e quarenta questões, precisam ser selecionados preferencialmente entre situações nunca resolvidas, com identificação e padrão de correção.
- Os dez simulados continuam previstos no calendário, mas não serão liberados como completos até haver pacote real. Não publicar gabarito com antecedência. Para autorais, usar espelho **pedagógico** e não rotular de oficial da FGV.
- O índice mestre definitivo dos PDFs não estava disponível como documento independente nesta execução. As referências confirmadas são as páginas efetivamente documentadas na planilha e no JSON original V1.2, **sem inventar páginas ausentes**.

O painel identifica essas pendências no início da temporada e impede registrar peça/questão/simulado sem enunciado. Há seleção de um Q-ID catalogado, sujeita à conferência manual do usuário, em **Correção e prioridades**. Para oficinas e simulados sem fonte, é necessário conferir os PDFs e vincular um caso; não prometer execução automática.

## Correções de conflitos na integração

1. **Calendários**: os blocos anteriores de 335h, 85 leituras separadas e 34 retestes não são sobrepostos à agenda de 300h. O histórico é mantido, mas a V2.3 tem seus próprios passos de correção e revisão.
2. **Nota**: resultados de provas com ID repetido `SIM-01...` entre versões não contam para o novo calendário. As notas novas recebem o campo `plan_schema=2.3-105`. A exposição declarada a um simulado também usa identificador por temporada.
3. **Gabaritos**: atividades com enunciado pendente são bloqueadas; correção e reteste só abrem depois de registrados os passos anteriores. A primeira atividade conserva o diagnóstico de seis casos **sem solução antecipada**, em um rascunho separado daquele de 26/10.
4. **PDFs**: a biblioteca privada abre materiais do plano ativo e não injeta nos dias de 105 datas as leituras `LEIT-` do calendário anterior. Em 09/11, os links teóricos são ocultados até a tentativa diagnóstica.
5. **Contadores**: temporada vigente exibe metas 30 oficinas/40 peças com simulados, 85+40=125 discursivas, 10 provas e 276 missões-base, sem contabilizar estudos antigos como realizados agora.
6. **Roteiro diário**: a aba "O que fazer hoje" utiliza as 276 missões da nova agenda, não duplica atividades nem acrescenta minutos aos 300h.

## Limite de testes

Os arquivos de código passaram em validação de sintaxe; o plano foi verificado por auditoria de dados, e o carregamento dos 14 scripts com um plano sintético de 105 dias (276 missões) passou sem erro em simulação DOM. **É necessário confirmar a importação e a interface visual em Chrome ou Edge no computador do aluno**, além dos links locais aos PDFs.

## Confirmações antes da preparação

Depois de importar o JSON no ASCEND, confirmar que aparece `Dia 1 / 105`, `300h`, e na data 09/11 as atividades: **diagnóstico A–F 45min → estrutura de Apelação 90min → Q003 A/B 45min**. Não liberar nenhuma resposta antes da tentativa. Registrar logo em seguida a execução real com o botão de copiar para o ChatGPT, para iniciar a correção e as revisões.
