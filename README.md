# SYSTEM // ASCEND — V1

Protótipo estático de um sistema pessoal de progressão inspirado em interfaces de RPG, com identidade visual original.

## O que já funciona
- XP total e progressão de nível
- Ranks E → D → C → B → A → S
- Missões diárias por área da vida
- Atributos: Conhecimento, Físico, Disciplina, Competência e Gestão
- Streak por dias ativos
- Gold/créditos
- Histórico das missões concluídas
- Missões personalizadas
- Gerador de missão de emergência
- Animação de LEVEL UP
- Salvamento automático no navegador via localStorage
- Layout responsivo para celular e desktop

## Como testar
Abra `index.html` no navegador. Para evitar limitações locais de alguns navegadores, você também pode servir a pasta com um servidor local simples.

## Publicar no GitHub Pages
1. Abra **Settings → Pages**.
2. Em **Build and deployment**, escolha **Deploy from a branch**.
3. Selecione a branch `main` e a pasta `/ (root)`.
4. Salve e aguarde a publicação indicada pelo GitHub.

## Próximos upgrades sugeridos
- Tela de configuração do jogador
- Calendário e gráficos semanais/mensais
- Sistema de bosses e conquistas
- Penalidades opcionais e recompensas
- Loja/recompensas pessoais
- Metas de longo prazo
- Exportar/importar backup JSON
- PWA instalável no celular
- Login e sincronização em nuvem
- Integração segura com IA via backend/serverless (nunca expondo chave no JavaScript do navegador)

## Nota importante sobre IA
Não coloque chaves de API diretamente em `app.js`. Em uma futura versão com IA, use uma função serverless/backend para guardar a chave e chamar o provedor de IA com segurança.
