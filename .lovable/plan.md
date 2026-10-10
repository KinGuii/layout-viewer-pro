# Etapa 1: Navegação (plano revisado)

Este plano não muda o banco de dados, não migra dados, não instala nada e não exclui nenhum arquivo. O acervo continua guardado no navegador, como fonte única.

## O que a verificação mostrou

Conferi o código do app original. Só o **Diário** tem conteúdo real: cadastro, edição, reviews, busca no iTunes, importação e exportação em JSON, "Lançamentos" e "Recomendações".

As abas **Workstation, Setlab e Studio** do original mostram apenas um título centralizado ("DJ Workstation", "Setlab Builder", "Content Studio"). Não há funções nem dados nelas. Por isso:
- Nenhuma funcionalidade ou dado se perde ao concentrar o DJ no DJ Desk novo.
- Os dados de DJ que já existem no acervo (BPM, tom, energia, elementos, dica de mixagem e papel no set: Opener, Peak ou Closer) continuam sendo lidos pelo DJ Desk.
- O Content Studio sai do menu, mas nada é apagado. A tela continua dentro do app original e pode voltar ao menu depois.

## Como as rotas vão funcionar

```text
Página-base (sempre montada)
 ├─ App original (Diário) .......... fica carregado o tempo todo, nunca recarrega
 ├─ Menu único (novo)
 ├─ Mini player e avisos
 └─ Área da página atual
     /           -> mostra o app original (Diário)
     /dj         -> DJ Desk (Biblioteca · Radar · Sets)
     /descobrir  -> Descobrir
     /perfil     -> Perfil
```

- **Endereços reais:** cada área tem um endereço próprio. Funcionam recarregar a página, abrir um link direto (ex.: `/perfil`) e o botão Voltar do navegador.
- **Telas novas são independentes:** DJ Desk, Descobrir e Perfil são telas do próprio projeto e não dependem do app original para aparecer.
- **O app original não troca mais de aba:** ele fica sempre no Diário e só é escondido ou mostrado. Isso elimina a parte mais frágil de hoje, que interceptava o 4º botão e clicava nos botões originais por fora.
- **Única dependência que sobra:** esconder o menu original com uma regra visual. Se um dia ela falhar, o pior caso é aparecer um menu a mais. Nenhum dado ou função é afetado.

## Comportamento esperado

**Celular (até 1023 px)**
- Uma única barra flutuante na parte de baixo, no mesmo estilo de vidro do original, com 4 itens: Diário · DJ Desk · Descobrir · Perfil.
- O item ativo fica destacado.
- O mini player fica logo acima da barra.
- O botão "+" de adicionar faixa continua visível no Diário.

**Desktop (a partir de 1024 px)**
- Mesmo menu, mostrado como barra fixa no topo, junto com o logo e a ofensiva.
- O conteúdo fica centralizado.
- No DJ Desk, Biblioteca e Radar aparecem lado a lado, como hoje.

**Regras gerais**
- O logo "Music Desk" sempre leva ao Diário.
- No DJ Desk, a cor escura do modo DJ se aplica à tela inteira. Nas outras áreas, vale o visual da Curadoria.
- O cartão "Alternar para DJ Desk" do Perfil passa a ser um atalho para a área DJ Desk.

## Organização das áreas

**Diário:** o app original, sem nenhuma mudança. Cadastro, reviews, busca no iTunes, importação e exportação seguem como estão.

**DJ Desk:** a tela atual dividida em 3 abas, reaproveitando o que já existe.
- **Biblioteca:** a tabela atual, com busca, ordenação, capas, BPM, Camelot, energia, elementos e dicas.
- **Radar:** o painel de transição atual, com o controle de tolerância. No celular vira uma aba própria. No desktop continua ao lado da tabela.
- **Sets:** uma visão somente de leitura das faixas agrupadas pelo papel já cadastrado (Opener, Peak, Closer, sem papel), em ordem de BPM. Não cria dados novos. O montador completo de sets fica para a Etapa 4.

**Descobrir:** uma área nova e honesta, sem conteúdo falso. Ela mostra o que está por vir (pesquisa de artistas e álbuns, Blind Spot, cápsula mensal) e um atalho "Adicionar faixa" que leva ao cadastro do Diário. Se você preferir, ela pode ficar escondida até a Etapa 3.

**Perfil:** a tela atual, sem mudança de conteúdo. Sai apenas o menu duplicado que hoje é desenhado dentro dela.

## Arquivos e motivos

| Arquivo | Mudança |
|---|---|
| `src/routes/__root.tsx` | Passa a abrigar a página-base, para que o app original e o mini player continuem montados entre áreas |
| `src/components/music-workspace.tsx` | Vira a página-base. Sai a interceptação do 4º botão e o clique por fora. Ficam: leitura do acervo, ofensiva e símbolo, missões, registro de atividade e mini player |
| `src/components/app-nav.tsx` (novo) | Menu único responsivo, com links de verdade |
| `src/routes/index.tsx` | Diário (mantém título e descrição da página) |
| `src/routes/dj.tsx`, `perfil.tsx`, `descobrir.tsx` (novos) | Uma página por área, com título e descrição próprios |
| `src/components/dj-desk.tsx` | Adiciona as abas Biblioteca, Radar e Sets, reaproveitando a tabela e o radar |
| `src/lib/dj-library.ts` | Pequena regra de agrupamento por papel no set, com teste |
| `src/components/music-profile.tsx` | O botão do DJ vira atalho para `/dj` |
| `src/styles.css` | Estilos do menu único e das abas, com regra para esconder o menu original |
| `src/test/app-routing.test.tsx`, `src/test/dj-library.test.ts` | Testes das 4 rotas e do agrupamento |
| `AGENTS.md` | Substitui a regra do 4º botão pela nova regra de navegação |

## O que precisa continuar funcionando
- O acervo e sua chave no navegador, sem nenhuma escrita vinda das telas novas.
- Importar e exportar em JSON, cadastro e edição de faixas, busca no iTunes.
- Login com Google, a tabela de perfis e suas permissões.
- Avatares, símbolo, missões e XP, cartão de Stories, eventos e calendário.
- O radar de transição, o mini player e os testes que já existem.

## Riscos e como evitar
1. **Recarregar o app original ao trocar de área:** ele fica na página-base, nunca dentro de uma página específica.
2. **Erros ao carregar a página pela primeira vez:** manter a checagem de "app original pronto" que já existe hoje.
3. **Menu original continuar aparecendo:** a regra visual é aplicada e conferida em teste no navegador. Se falhar, o efeito é só visual.
4. **Missões e ofensiva pararem de contar:** a leitura do acervo continua igual. Só sai o código ligado ao menu original.
5. **Perfil ou DJ abrirem sem dados num link direto:** essas telas leem o acervo direto do navegador, mesmo com o app original ainda escondido.
6. **Content Studio inacessível:** é intencional e reversível. Nada é apagado.

## Como validar
- Testes automáticos: as 4 rotas existentes, o agrupamento de sets e todos os testes atuais.
- Teste no navegador, no celular (390 px) e no desktop (1280 px):
  - abrir cada área pelo menu, por link direto e pelo botão Voltar;
  - o logo leva ao Diário;
  - existe um único menu visível;
  - o Diário continua no mesmo lugar ao ir e voltar do DJ;
  - as abas Biblioteca, Radar e Sets funcionam;
  - o mini player continua entre as áreas.
- Comparar o acervo guardado antes e depois de navegar por todas as áreas: precisa ser idêntico.
- Abrir as janelas de importar e exportar em JSON e cadastrar uma faixa de teste no Diário.
- Conferir os registros de erros e o resultado da compilação.
