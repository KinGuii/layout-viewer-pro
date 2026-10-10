# Auditoria Music Desk x DJ Desk

Nenhuma alteração foi feita. O plano abaixo só será executado depois que você aprovar.

## 1. Diagnóstico resumido

O app é feito de duas camadas:

- **Camada original (compilada):** o Music Desk que você enviou roda inteiro dentro de uma moldura embutida na página. Ele tem 4 abas próprias: Diário, Workstation, Setlab e Studio (Content Studio). O acervo fica guardado só neste navegador (chave `music-desk-pro:v1`).
- **Camada nova (código-fonte editável):** Perfil, DJ Desk, mini player, cartão de Stories, missões e XP. Ela fica por cima da moldura e "conversa" com ela mexendo na página por fora: troca rótulos, intercepta cliques e lê o acervo.

Não dá para editar o código da camada original, só contornar. Esse é o principal limite técnico do projeto.

### Funcionando
- Diário, cadastro, edição e exclusão de faixas, micro-reviews, status (repeat/radar/club), mood, setRole, filtros, busca, importação e exportação em JSON (tudo na camada original).
- Pesquisa de faixas e capas pelo iTunes, passando por um proxy público (allorigins), já integrada no cadastro original.
- Seções "Lançamentos" e "Recomendações" na home. São listas simples por status ou data, não recomendações de verdade.
- Perfil: 9 avatares abstratos, nome e bio, ofensiva, semana, badges, curiosidade diária, símbolo da frequência, missões e XP, cartão de Stories, eventos conceituais e exportação para calendário (.ics).
- DJ Desk: tabela escura, Camelot, energia, tags, dicas e radar de transição por BPM e tom. Só lê os dados, não grava nada.
- Login com Google, tabela de perfis com acesso restrito ao próprio dono e testes automáticos das regras.

### Parcial
- **Workstation e Setlab (originais):** as telas existem dentro da camada original, mas não foram auditadas a fundo nem integradas ao DJ Desk. Ainda não há confirmação de que o Setlab monta e salva sets de verdade.
- **Mini player:** só toca quando a faixa tem prévia de áudio real. A maioria das faixas não tem.
- **Missões:** dependem de comparar o acervo a cada 1,5 s e de cliques capturados. É frágil.
- **Ofensiva no topo:** o número é sobrescrito por fora a cada atualização.
- **Avatar e símbolo:** ficam salvos no navegador. Nome, bio, atividade e eventos ficam na Cloud.

### Não existe
- Cápsula mensal, Blind Spot e Setlab Builder integrado ao DJ Desk.
- Pesquisa de artistas e álbuns: hoje só existe busca por faixa no cadastro.
- Acervo na Cloud: ele existe só no navegador, sem sincronização entre aparelhos.
- Rotas próprias: tudo vive em uma única página `/`.

## 2. O que preservar
- Os dados atuais do acervo (formato e chave) e a função de importar e exportar JSON.
- Os módulos de regras já testados: dj-library, music-profile e profile-engagement.
- Os componentes DJDesk, MusicProfile, ProfileArt, ProfileStory e MiniPlayer.
- A tabela de perfis com acesso restrito, além do login com Google.
- A identidade visual: preto, vidro translúcido, bordas finas, Inter e JetBrains Mono, além do tema escuro do DJ.

## 3. Problemas e riscos
1. **Acoplamento frágil com a camada original:** depende de seletores (aria-labels, ordem dos botões, textos como "Music Desk"). Qualquer mudança no HTML original quebra a navegação, o logo, a ofensiva e as missões.
2. **Navegação duplicada:** existem dois menus inferiores (o original e um recriado no Perfil). Também há duas noções de DJ: a aba "Workstation" original e o "DJ Desk" novo. E o Content Studio continua lá, só escondido.
3. **Duas ofensivas:** o app original calcula uma e o Perfil soma a atividade da Cloud, o que pode dar números diferentes.
4. **Proxy público allorigins:** é instável e de terceiros. Ele pode falhar e quebrar a busca de capas.
5. **Acervo só no navegador:** limpar os dados do navegador apaga tudo. Missões e cápsula mensal ficam limitadas a um único aparelho.
6. **Polling de 1,5 s e observação da página inteira:** gastam processamento e causam re-renderizações.
7. **Página única:** sem links compartilháveis para Perfil, DJ ou cápsula.
8. **Eventos:** a seção de shows, com cadastro manual, convive com os eventos conceituais fixos. É uma redundância visual.

## 4. Proposta por etapas

**Etapa 1: Navegação (começar aqui)**
- Um único menu inferior, controlado pela camada nova: Diário · DJ Desk · Descobrir · Perfil.
- Workstation e Setlab originais unificados dentro do DJ Desk: em vez de duas entradas, as abas viram "Biblioteca / Radar / Sets".
- O Studio sai do menu.
- Rotas reais (`/`, `/perfil`, `/dj`) mantendo a moldura original montada.
- Logo leva sempre ao Diário.
- Remover a duplicação do menu do Perfil.

**Etapa 2: Ponte de dados estável**
- Um único módulo para ler o acervo, com evento de mudança no lugar do polling.
- Uma só regra de ofensiva.
- Decisão a tomar: manter o acervo no navegador ou espelhá-lo na Cloud (uma tabela de faixas) para ter vários aparelhos e a cápsula. Recomendo espelhar, sem duplicar a fonte original.

**Etapa 3: Pesquisa de artistas, álbuns, faixas e capas**
- Busca server-side direto no iTunes (entidades song, album e musicArtist), sem proxy público.
- Reutilizada pelo Diário (via ponte), pelo DJ Desk e pelo Blind Spot.

**Etapa 4: Setlab Builder**
- Dentro do DJ Desk, reaproveitando o radar de transição: montar uma sequência, ver as compatibilidades entre faixas vizinhas e a curva de energia, salvar sets e exportar.
- Os sets guardam só referências às faixas do acervo.

**Etapa 5: Cápsula mensal**
- Resumo do mês (faixas, moods e texturas, top artistas, ofensiva), reaproveitando o render em canvas do ProfileStory em uma arte autoral nova.

**Etapa 6: Blind Spot**
- Descoberta pelo que falta no acervo (BPM, tons, moods e artistas pouco explorados), mais a busca da Etapa 3.
- Os resultados vão para o "radar" do Diário.

## 5. Arquivos por etapa

| Etapa | Arquivos prováveis |
|---|---|
| 1 Navegação | music-workspace.tsx, novo app-nav.tsx, routes (`index`, novos `perfil`, `dj`), music-profile.tsx (remover o menu duplicado), dj-desk.tsx (abas), styles.css |
| 2 Dados | novo `lib/library-bridge.ts`, music-workspace.tsx, music-profile.ts (ofensiva única), migração opcional da tabela de faixas, testes |
| 3 Pesquisa | novo `lib/catalog-search.functions.ts`, novo componente de busca, dj-desk.tsx |
| 4 Setlab | novo setlab-builder.tsx, dj-library.ts (regras de sequência e testes), tabela de sets (Cloud) |
| 5 Cápsula | novo `lib/monthly-capsule.ts` e testes, novo capsule-card.tsx (base: profile-story.tsx), rota `/capsula` |
| 6 Blind Spot | novo `lib/blind-spot.ts` e testes, nova tela, reutiliza a Etapa 3 |

## 6. Ordem recomendada
1 → 2 → 3 → 4 → 5 → 6.

A navegação define onde tudo mora. A ponte de dados evita refazer a leitura do acervo em cada recurso. A pesquisa é base do Blind Spot. O Setlab reaproveita o radar existente. A cápsula e o Blind Spot dependem do histórico e da busca.

## Decisões a confirmar antes de executar
- Workstation e Setlab originais podem ser absorvidos pelo DJ Desk novo?
- O Content Studio pode sair do menu?
- O acervo deve ser espelhado na Cloud (vários aparelhos) ou continuar só no navegador?
