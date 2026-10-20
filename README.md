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
