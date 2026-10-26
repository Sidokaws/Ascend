# ASCEND — Biblioteca privada de PDFs (26/10/2026)

## Situação

O site SYSTEM // ASCEND usa **GitHub Pages público**. Não enviar PDFs do CEISC para a pasta pública, nem considerar uma senha escrita em JavaScript como proteção. Arquivos carregados para a Biblioteca do ChatGPT **não** viram URLs autenticadas que um site externo pode usar.

A solução implementada usa o **File System Access API** e **IndexedDB**, que mantêm os PDFs no PC do aluno. A página faz a leitura local **apenas após permissão explícita**; nenhum endpoint de upload é utilizado pelo código desta integração.

## Início em três passos

1. No computador pessoal, organize os originais já baixados numa pasta, por exemplo `Documentos/OAB 48 — PDFs`. Pode ter subpastas. Não inclua pastas pessoais não relacionadas, arquivos protegidos por senha ou dados sigilosos.
2. Abra `https://sidokaws.github.io/Ascend/` em navegador Chromium atualizado (preferencialmente **Chrome ou Edge**), acesse **Teoria: e-books e slides**, clique **Conectar pasta de PDFs** e selecione a pasta inteira. O navegador pedirá permissão de leitura, que pode necessitar reautorização em visitas futuras.
3. Em qualquer atividade, clique no botão **Abrir PDF — p. N**. O navegador abre o **arquivo correspondente, naquela página**. A pasta não precisa ser selecionada arquivo por arquivo. Nomes diferentes ou duplicados podem ser vinculados individualmente pelo botão **Associar um PDF específico**; esse arquivo é guardado no navegador localmente em IndexedDB quando houver espaço.

## Dia 1 e gabaritos

**26/10/2026:** os botões das referências teóricas aparecem somente depois de registrada a tentativa dos seis casos DIA1-A–F (sem gabaritos antes). Em seguida, os recursos previstos incluem:
- `Slides _ Apelação .pdf`, páginas **19–22**.
- `estrutura de peça.pdf`, páginas **57–61**.
- `E-book- Aulas _ Ação Penal Pública. Ação Penal Privada.pdf`, páginas **5–12**.

O botão abre a **primeira página indicada** pela fonte; o intervalo aparece na descrição do roteiro. A área inicial nunca revela automaticamente espelhos ou padrões de resposta. Na missão corrigida, padrões só podem ser abertos depois da tentativa e da liberação pertinente.

## Segurança e limitações

- **Nenhuma senha é necessária:** a proteção é o acesso local controlado pelo navegador. Senha embutida no GitHub Pages seria visível no próprio código e não protegeria conteúdo publicado.
- Arquivos do CEISC **não são enviados ao GitHub**. O repositório mantém apenas nomes de referência, números de página e o leitor de arquivos.
- A conexão fica restrita ao mesmo navegador/PC e origem do site. Outro navegador ou dispositivo exige nova autorização e acesso à pasta.
- Se o navegador negar IndexedDB ou o File System Access API, a seleção persistente de pasta pode falhar; nesse caso, use Chrome/Edge atualizado ou a associação local de arquivos individuais. A opção de arquivo individual depende da cota de armazenamento do navegador; não garante espaço ilimitado.
- O material original deve estar no computador, não apenas na Biblioteca do ChatGPT. A extração em massa dos arquivos originais para um ZIP foi tentada, mas o acesso à Biblioteca neste contexto **não autorizou a cópia binária**, portanto **nenhum ZIP privado foi criado**.
- Não há integração com Google Drive, senha de usuário, conta privada, servidor de arquivos ou autenticação externa nesta versão.
- O plano V2.1 continua com 119 dias/335h/10 simulados; esta implementação altera a navegação de fontes, não os tempos, as missões nem os resultados.

## Implementação e teste

Arquivos novos `ascend-biblioteca.js` e `ascend-biblioteca.css`; pequenas âncoras `#pdfLibraryHub` em Teoria e `#dayPdfLinks` no painel, adicionadas em `index.html`. O botão legado de seleção PDF é interceptado no evento de captura, **sem modificar o JavaScript original de missões**.

Teste de lógica feito com pasta simulada: PDF de Ação Penal e slides de Apelação reconhecidos, abertura orientada para página 5 e 19, e bloqueio de botões do Dia 1 até a produção do diagnóstico. Sintaxe JavaScript validada. Ainda precisa de teste manual em navegador real, com arquivos locais e janela PDF.

**Próxima verificação:** abrir o site num PC com arquivos originais, conectar pasta, confirmar reabertura após fechar/reabrir navegador e verificar um material do Dia 1 e um padrão de correção depois do desbloqueio.

## Outras alterações

As legendas antigas que incorretamente indicavam 45 minutos de leitura *extra* foram corrigidas no HTML da seção Teoria para refletir **335h com teoria integrada**. Nenhuma peça/questão foi considerada concluída.
