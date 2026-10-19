# SYSTEM // ASCEND — OAB 48 · V3

Aplicativo de treinamento gamificado da 2ª fase da OAB em Direito Penal, com tela de despertar, níveis, missões, matriz de peças, discursivas, simulados e revisões.

## Acesso

- Aplicativo V3: https://sidokaws.github.io/Ascend/
- V2 preservada: https://sidokaws.github.io/Ascend/oab48-v2.html
- V1 original: https://sidokaws.github.io/Ascend/legacy.html

Publicação pelo GitHub Pages a partir da branch main e pasta raiz.

## Arquivos recebidos em 19/10/2026

| Original | Repositório | Papel |
| --- | --- | --- |
| OAB48_ASCEND_Plano_119_Dias_v1_1(2).json | data/plano-oab48-119-dias-v1.1.json | **Fonte de verdade** |
| OAB48_ASCEND_Missoes_119_Dias_v1_1(1).csv | data/missoes-oab48-v1.1.csv | Referência tabular |
| OAB48_Guia_ASCEND_Progressao_v1_1(1).md | docs/protocolo-progressivo-v1.1.md | Protocolo pedagógico |

Plano: **119 dias, 274 missões com IDs únicos, 15 janelas condicionais de simulado e 334 horas previstas**. O CSV traz os mesmos IDs; não se duplica atividade.

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
