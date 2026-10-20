# ASCEND OAB 48 — Instruções de integração V1.2

## O que mudou
O sistema anterior mostrava somente títulos e fontes agrupadas; a versão 1.2 é EXECUTÁVEL. Cada missão traz `step_by_step` com `minutos`, `instrução` e `fontes` (arquivo exato e páginas), `deliverable`, `success_condition`, `teacher_note`, `requires_teacher_release`.

## Importação sem apagar progresso
- Preserve `mission.id`, `day_id` e datas; sobrescreva somente título, texto instrutivo, fontes, passos e critérios. Em registros locais já realizados, mantenha estado/evidência e busque confirmação antes de reclassificar.
- NUNCA reinicialize o histórico do usuário, notas, textos, XP, revisões, simulado ou cronômetro durante importação. Use migração/merge por `id`, com backup prévio e opção de desfazer.
- A base importada inicia `status=Pendente` e `validated=false` porque ainda não houve execução; não aplique isso sobre tarefas realmente validadas no site.
- Tela Dia: objetivo → tempo previsto → material com nome/páginas → passos 1..N com tempo → campo de produção → botão Enviar p/ correção → conclusão mediante evidência.
- Link para PDF: apontar ao arquivo original no acervo do usuário ou URL segura; não confundir nome local com URL pública. PDF sem hospedagem não pode ser aberto automaticamente pelo site.
- Questões: `question_catalog` contém Q001–Q100 e páginas de enunciados; `piece_case_catalog` contém P001–P027 e páginas do caso / padrão. Nunca pré-exibir `padrao_resposta`.
- Diagnóstico: `study_pack.diagnostico_seis_situacoes` contém 6 situações REAIS do plano (originais do mentor, não FGV); mostre cartões A–F antes de permitir “Registrar produção”.
- Enunciados autorais em `study_pack.casos_autorais_identificados`, usados em AUTO-W07-1 etc. Exiba o enunciado quando a missão abrir. Não atribuir nota FGV oficial.
- Simulados: `simulation_packages` contém 15 pacotes de casos/questões existentes; o app revela o pacote SOMENTE após iniciar. São SIMULADOS DE REVISÃO, NÃO ineditismo. Para prova inédita, cadastrar novo pacote futuro com marcador específico. Se não houver prontidão, adaptar e NÃO contar como simulado integral.
- O timer marca tempo bruto, pausa, efetivo, vincula missão, e não muda domínio automaticamente.
- XP só após evidência; classificação de domínio apenas após correção e reteste.

## Auditoria
- 119 dias, 274 missões, 100 questões catalogadas, 27 peças do banco, 15 janelas de simulado.
- Tempo planejado: 334 horas; 17 sábados de descanso. As metas continuam condicionais.
- Fontes sem apostila teórica própria neste acervo: Q094 (crimes contra administração pública por particular), Q095 (trânsito), Q096–Q100 (organização criminosa); usar Vade e planejar complementação externa, sem inventar páginas.
- Arquivo JSON: `OAB48_ASCEND_Plano_119_Dias_v1_2_EXECUTAVEL.json`
- Missões CSV: `OAB48_ASCEND_Missoes_119_Dias_v1_2_DETALHADAS.csv`
- Calendário CSV: `OAB48_Cronograma_119_Dias_v1_2_EXECUTAVEL.csv`
- Roteiro integral: `OAB48_Roteiro_Diario_COMPLETO_119_Dias_v1_2.md`