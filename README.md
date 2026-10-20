# SYSTEM // ASCEND — OAB 48 · V3 + roteiro executável V1.2

Aplicativo de treinamento gamificado da 2ª fase da OAB em Direito Penal, com tela de despertar, níveis, missões, matriz de peças, discursivas, simulados e revisões.

## Acesso

- Aplicativo V3: https://sidokaws.github.io/Ascend/
- V2 preservada: https://sidokaws.github.io/Ascend/oab48-v2.html
- V1 original: https://sidokaws.github.io/Ascend/legacy.html

Publicação pelo GitHub Pages a partir da branch main e pasta raiz.

## Arquivos recebidos em 19/10/2026

| Original | Repositório | Papel |
| --- | --- | --- |
| OAB48_ASCEND_Plano_119_Dias_v1_2_EXECUTAVEL(2).json | data/plano-oab48-119-dias-v1.2.json | **Fonte de verdade** |
| OAB48_ASCEND_Missoes_119_Dias_v1_1(1).csv | data/missoes-oab48-v1.1.csv | Referência tabular |
| OAB48_Guia_ASCEND_Progressao_v1_1(1).md | docs/protocolo-progressivo-v1.1.md | Protocolo pedagógico |

Plano: **119 dias, 274 missões com IDs únicos, 15 janelas condicionais de simulado, 334 horas previstas, 100 questões Q001–Q100 e 27 peças P001–P027**. O CSV traz os mesmos IDs; não se duplica atividade.

## Atualização executável V1.2 (19/10/2026)

Arquivo principal: data/plano-oab48-119-dias-v1.2.json. Os dados incluem passo a passo de **todas as 274 missões**, tempo individual, materiais e páginas, entrega, critério de sucesso e notas pedagógicas. Módulo adicional: ascend-v12.js e ascend-v12.css.

Arquivos originais preservados:
- docs/guia-migracao-v1.2.md
- docs/roteiro-diario-119-dias-v1.2.md
- data/plano-oab48-119-dias-v1.1.json (versão anterior)

Funcionalidades novas: missões com roteiro detalhado; diagnóstico com enunciados completos A–F; seis casos autorais (não FGV); busca de 100 questões e 27 casos; seleção manual de PDFs originais (sem publicar material protegido); autorização manual de início e revelação de pacotes de simulado; distinção entre treino guiado e integral; backup automático local pré-migração e opção para desfazer.

### Limites

- Os enunciados de Q001–Q100 e P001–P027 dependem dos PDFs originais, que não são hospedados pelo aplicativo. O site mostra ID, nome e página do material, e permite selecionar o PDF local. Não inventa transcrições.
- O JSON é público no GitHub Pages, portanto o bloqueio dos simulados evita a revelação na interface normal, mas **não é sigilo criptográfico**. São pacotes de revisão já existentes, não inéditos.
- Liberações, revisões e correções são registradas manualmente; não há validação automática pelo ChatGPT.
- Atualização mantém ID, data, evidências, textos, notas, tempo, erros, XP já ganho e outros registros compatíveis. Uma cópia do estado anterior é guardada na chave local ascendOab48V3_PreMigration_v12, com opção de restauração na interface. O usuário deve exportar seu próprio backup JSON antes de reverter.
- A data-alvo, regras de consulta e corte legislativo devem ser confirmados em fonte oficial.

## Regras de execução

- Treinamento previsto de 26/10/2026 a 21/02/2027. Revisão Turbo reservada 22–27/02/2027 e prova-alvo 28/02/2027, data ainda sujeita à confirmação oficial.
- Sábados: descanso, sem penalidade.
- Semana 1 e 2: reconhecimento, identificação de base e prazo no Vade, estruturas, teses TBFP e oficinas guiadas. Não exigir peça integral de memória no primeiro contato.
- Antes de peça autônoma/simulado, comprovar prontidão; sem prontidão, transformar a janela em oficina orientada sem pontuar como integral/simulado.
- Status: pendente → produção enviada com evidência → correção documentada → validação **manual**. XP apenas com validação. XP não equivale a domínio.
- O aplicativo não verifica a qualidade das respostas nem conversa automaticamente com o mentor.
- Notas de correção: usar espelho oficial somente se identificado; demais notas são pedagógicas.
- Revisões D+1, D+7, D+15 e D+30 após correção efetivamente realizada.
- Tempo efetivo = tempo bruto menos pausas marcadas.
- As referências a PDFs/páginas vêm do plano enviado e estão sujeitas à auditoria após a mensagem “finalizei os envios”.

## Dados e backup

App estático, dados no localStorage do próprio navegador. Não há sincronização com GitHub, ChatGPT ou Notion. Fazer exportação periódica em Dados e backup → Exportar backup JSON.

Chave V3: ascendOab48V3. Dados da V2 (ascendOab48V2) são preservados; atividades personalizadas ou já executadas são trazidas como legado sem inventar validação. As notas importadas são sinalizadas como não homologadas. A V1 (systemAscendV1) continua separada.

Uma importação de backup pede confirmação antes de substituir registros locais. A atualização do plano utiliza os IDs originais (upsert) sem duplicações, preservando a evidência.

## Arquivos da interface

- index.html — introdução cinematográfica e oito áreas.
- ascend-v3.css — visual RPG, animações e versão móvel.
- ascend-v3.js — cronograma, missões, validação, timer e exportação/importação.
- data/plano-oab48-119-dias-v1.1.json — plano canônico.
- data/missoes-oab48-v1.1.csv — arquivo auxiliar.
- docs/protocolo-progressivo-v1.1.md — diretrizes.
- legacy.html e oab48-v2.html — versões anteriores.

## Pendências futuras

Espelhos com pontuação por item A/B e relatórios detalhados; confirmação oficial do edital/corte legislativo; auditoria das referências aos PDFs; testes adicionais em navegador e aparelho móvel. Sem integração com serviços externos ou chaves expostas.

*Identidade gráfica original de fantasia sombria, sem reproduzir assets de terceiros.*

## Dia 1 — diagnóstico orientado (ajuste de experiência)

A primeira missão, `ASC-20261026-01`, apresenta agora o próprio **Caderno de Diagnóstico dentro da tela** (não é arquivo separado). Os seis casos do plano original A–F foram mantidos como versões curtas para conferência e receberam narrativas autorais contextualizadas na interface, sem divulgar respostas.

Cada situação contém campos independentes para último ato/fase, peça/medida, fundamento opcional, confiança 0/1/2 e dúvida. É legítimo escrever **“não sei”**. Um exemplo neutro mostra como preencher, sem responder às seis situações. As tentativas são **rascunhos salvos no navegador** (`state.diagnosticoDia1Draft`), incluídos no backup V3; o usuário pode copiar seu texto para a conversa com o mentor.

**Importante:** salvar a tentativa no painel não a envia automaticamente ao ChatGPT e não concede XP até registro de correção. Os arquivos `ascend-dia1.js` e `ascend-dia1.css` adicionam a experiência sem alterar o plano JSON original V1.2.


## Trilha complementar de teoria — outubro de 2026 (provisória)

**Motivo:** a V1.2 reserva 334h e mistura, em diversas tarefas, leitura breve e resposta de questão no mesmo tempo. Em geral, essa distribuição não garante compreensão suficientemente profunda de e-books extensos.

Auditoria da base V1.2: 44 e-books e 7 conjuntos de slides aparecem nominalmente nas fontes dos passos, somando 51 arquivos distintos (não representa inventário de todos os PDFs enviados). Foram identificados 78 blocos únicos de até dez páginas citadas, após união de intervalos sobrepostos.

A interface ganhou uma aba **Teoria: e-books e slides**, com:
- 85 sessões adicionais de 45 minutos (dias úteis de segunda a sexta), IDs \`LEIT-YYYYMMDD\` sem substituir as 274 missões originais;
- leitura dos trechos explicitamente referenciados, anotações, localização de artigos no Vade e uma aplicação TBFP;
- sete janelas de revisitação/recuperação ativa, quando não há novo trecho programado;
- fontes/páginas exatas do plano original (não inventar o restante dos PDFs);
- produção com evidência, correção e XP somente após validação.

**Nova previsão:** 334h roteiro-base + 63h45 leitura aprofundada = **397h45**, se as 85 sessões complementares forem feitas. Isso não altera a carga original das peças, discursivas e simulados. Horário é estimativa, não meta rígida; tarefas podem ser redistribuídas diante de fadiga ou de leitura extensa.

**Importante:** ler as *páginas citadas* não equivale a ler integralmente 51 PDFs; a auditoria definitiva de todo o material ainda aguarda a mensagem "finalizei os envios". Nesse momento deveremos catalogar páginas efetivas, complementar lacunas e ajustar volume real de teoria, e não alegar que o acervo inteiro já foi coberto.

Arquivos implementados: \`ascend-teoria.js\`, \`ascend-teoria.css\`. A migração preserva dados existentes por ID estável e não hospeda os PDFs.

## Sequência pedagógica auditada — versão 2.0 (19/10/2026)

**Motivo da correção:** a primeira trilha teórica (v1.0) distribuía blocos de páginas por data de citação, o que podia colocar a teoria **depois** de uma questão que a pressupunha. Essa seleção automática foi substituída pela curadoria explícita em ascend-curriculo.js.

Princípios implementados:
1. **Pré-requisito antes da aplicação:** reconhecer os conceitos necessários e estudá-los antes das questões ou da peça, sem exigir conhecimento de estágio futuro. O 1º dia é especial: fazer o diagnóstico A–F primeiro, **sem pistas**; depois estudar ação penal/identificação e só então realizar as tarefas escritas do dia.
2. **17 semanas progressivas:** blocos de Processo Penal e peças-base → recursos e execução → tipicidade/pena, teses e provas → Júri/JECRIM/legislação especial → prisão e remédios → consolidação.
3. **Fontes verificadas:** 85 blocos de 45 min em dias úteis, cobrindo os 51 e-books/slides nominalmente citados na versão 1.2. Cada intervalo de páginas foi conferido contra fontes efetivamente indicadas no JSON fornecido. Isso **não** equivale à leitura integral dos 51 PDFs.
4. **Uma tarefa legível:** aula/tema, por que vem agora, o que é pré-requisito, arquivo, páginas, minutos para leitura e produção esperada. O app realça primeiro a leitura teórica antes das questões relacionadas, exceto o diagnóstico inicial.
5. **Três etapas no bloco de 45 min:** recuperação da base (5), estudo da fonte (27, dividido proporcionalmente entre leituras) e aplicação escrita (13). Ajustar se o material exigir mais tempo; não marcar leitura não realizada. As atividades práticas originais não foram excluídas.
6. **Sem páginas inventadas para lacunas:** itens Q094 (administração pública), Q095 (trânsito) e Q096–Q100 (organização criminosa) exigem consulta ao Vade e complementação posterior. Onde não há e-book citado, **não simular um PDF**.
7. **Respeito ao progresso:** IDs LEIT-YYYYMMDD permanecem, mas uma leitura antiga **com evidência ou validação**, substituída por outra fonte, é arquivada com seus dados e XP preservados sob LEITHIST-YYYYMMDD. A atividade da nova sequência surge pendente. Não conceder XP por mero clique/leitura passiva.
8. **Carga:** 334 horas do plano original + 85 × 45 minutos = 397h45 previstas, sujeitas a ajuste. Sábados seguem sem tarefas. Domingos seguem o cronograma-base (recuperação/simulados) e não recebem carga teórica adicional.

**Ressalva:** as 274 missões práticas do plano 1.2 continuam com as referências e durações originais. Em uma questão cujo tema ainda não foi aprofundado, a missão agora mostra o PDF de apoio e recomenda ler a base **antes** de escrever A/B, com tempo extra conforme o domínio. O inventário final dos mais de 50 PDFs completos continua condicionado a “finalizei os envios”.

### Mapa das 17 semanas

| Semana | Progressão | Exemplos de estudos |
| --- | --- | --- |
| 01 | Reconhecer a fase antes de escolher a peça | Processo, ação penal e diagnóstico; Sentença e recurso: interposição x razões |
| 02 | Memoriais e RESE: decisão anterior ao recurso | Encerramento da instrução, Memoriais e ANPP; O que cabe nos Memoriais |
| 03 | Execução, contraditório recursal e cautelares | Execução: fase, juízo e decisões; Agravo em execução e a decisão do juízo |
| 04 | Da tipicidade à pena aplicada no recurso | Nexo causal e estrutura inicial da dosimetria; Dosimetria na Apelação |
| 05 | Extinção da punibilidade e defesas pré-instrução | Rejeição da denúncia e desistência voluntária; Legitimidade e modalidades de ação penal |
| 06 | Recursos e execução com teses aplicadas | Execução: progressão, remição e decisão; Contrarrazões aprofundadas |
| 07 | Provas e Apelação — fundamentar o inconformismo | Teoria geral da prova; Razões de Apelação |
| 08 | Nulidades e recursos integrativos | Nulidades: pressupostos e prejuízo; Provas ilícitas e contraditório |
| 09 | JECRIM, ação privada e Queixa-Crime | Procedimento do JECRIM; JECRIM e ação penal |
| 10 | Tribunal do Júri — primeira fase | Júri: procedimentos e filtros; Crimes contra a vida: classificação |
| 11 | Tribunal do Júri — segunda fase e contrarrazões | Júri: resultado do plenário e recursos; Apelação do Júri: limites recursais |
| 12 | Execução penal avançada e legislação especial | Execução: institutos e pressupostos; Execução: condições e cálculos |
| 13 | Prisões, culpabilidade e Lei de Drogas | Prisão preventiva e cautelares; Culpabilidade e excludentes |
| 14 | Assistente, funcionário público e concurso de pessoas | Concurso de pessoas; Defesa preliminar de funcionário público |
| 15 | Medidas de liberdade e teoria penal complementar | Liberdade e prisão processual; Concurso de crimes |
| 16 | Remédios e impugnações excepcionais | Revisão criminal e habeas corpus; Recurso Ordinário Constitucional |
| 17 | Consolidação, correção de lacunas e prova | Apelação integral: fundamentos e pedidos; Memoriais: teses, pedidos e fecho |

### Avisos de prova

Calendário oficial da OAB, consultado em 19/10/2026: prova prático-profissional do 48º EOU prevista para **28/02/2027**, sujeita a alterações. Edital complementar para reaproveitamento da 1ª fase do 47º EOU previsto para 13/11/2026 e inscrição de 23 a 30/11/2026, sempre conferir o edital complementar e o site da FGV. Fonte: https://examedeordem.oab.org.br/Calendario

### Auditoria técnica

Foram validados contra o JSON V1.2: **119 dias**, **274 missões-base**, **85 blocos extras (5 por semana)**, **51 arquivos de leitura distintos**, **nenhuma referência de páginas faltante no roteiro curado**, **15 janelas de simulado de revisão**; todos os contadores de execução começam sem evidências presumidas. Fluxo de cópias de progresso testado para não reclassificar aulas anteriores.

