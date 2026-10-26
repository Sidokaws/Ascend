# Auditoria de clareza de execução — 119 dias (26/10/2026)

## Problema corrigido

A seção "Fixação após feedback" mostrava "Reescrita de alta precisão — Apelação", mas incluía a frase genérica "se for peça secundária, use 15 minutos para outra das seis principais". Essa instrução não se aplicava à atividade e permitia que o sistema escolhesse a peça por **rodízio arbitrário**, não pelo caso realmente marcado naquela data.

**Solução implementada**:
- Os **34 retestes de 15 minutos** estão ligados à **produção da mesma data**, identificada por `piece_case_id` e título da oficina; sem qualquer rodízio. Dia 27/10: Apelação P018; dia 29/10: Resposta à acusação P016; dia 03/11: Memoriais P017; modalidades específicas preservadas (Júri, JECRIM, contrarrazões especiais, defesas preliminares etc.).
- Passo 1, **3 min:** recuperar a estrutura *dessa mesma peça* de memória, sem modelo.
- Passo 2, **9 min:** após a correção anterior de 45min, **sem copiá-la**, reescrever um trecho que perdeu pontos, com sua base legal e pedido quando aplicável. Sem erro indicado, testar de memória um trecho correto, sem inventar falha.
- Passo 3, **3 min:** comparar, consultar o Vade Mecum, registrar correção/erro e próxima revisão.
- **Condição de execução:** tentativa da peça e correção de 45min da mesma peça precisam constar no painel antes de liberar o registro do reteste.
- **Carga horária:** os 15min já fazem parte de terça/quinta com 3h15; não somar tempo extra às 335h. Os 45min de pós-simulado já fazem parte das segundas pós-prova com 3h45.

## Guia inequívoco em todos os 119 dias

O painel agora inclui **"O que fazer hoje, na ordem"**, que lê as atividades originais **sem duplicá-las**. Para cada missão exibe:
- Título da atividade e o **tempo exato**;
- instruções numeradas e referências de material com **páginas** conforme fonte do plano;
- produção exigida e **critério de conclusão**;
- botão para abrir a atividade correspondente do sistema;
- próximas atividades recolhidas para executar uma de cada vez.

Os correções de 45min são nomeadas com a peça e caso específicos do mesmo dia. Nas atividades cujo padrão de resposta depende de uma tentativa, o guia não disponibiliza a correção antecipadamente. Simulados permanecem sem spoilers antes de liberação.

## Checagem estrutural do plano V1.2 + orçamento V2.1

Arquivo de referência: `data/plano-oab48-119-dias-v1.2.json`. Auditoria programática independente, usando arquivo executável fornecido pelo estudante:
- **119 dias**; **274 missões** em 102 dias ativos;
- os passos de **todas as 274 missões** possuem tempos que somam exatamente a duração da missão, além de entregável e critério de sucesso;
- **34 dias de peça com correção**, cada um com uma única peça pareada corretamente ao bloco de correção;
- **10 simulados integrais**, **7 domingos de revisão** e **17 sábados de descanso**;
- **335h**, sem horários diários divergentes. As cinco janelas de simulado convertidas não contam como provas completas;
- **zero inconsistências estruturais** de duração, pareamento ou ausência de entregável encontradas.

A auditoria estrutural NÃO substitui a correção jurídica dos itens nem afirma que todas as teses dos 50+ PDFs foram auditadas; o inventário completo permanece sujeito ao encerramento de envios e à conferência das fontes/espelhos oficiais.

## Preservação

As alterações ocorreram somente em `ascend-qualidade.js`, `ascend-roteiro.js`, `ascend-roteiro.css` e no carregamento do novo guia em `index.html`. O plano JSON original, 335h, os identificadores de missões, os registros de desempenho, a biblioteca de PDFs e a função de copiar relatório para ChatGPT foram mantidos.

**Teste funcional isolado:** casos Apelação P018 e outras modalidades, condição de bloqueio até haver peça e correção, durações dos 119 dias em calendário de teste e ausência de spoilers de enunciados de simulado no guia. É recomendável teste visual no Chrome/Edge do usuário após Ctrl+F5.
