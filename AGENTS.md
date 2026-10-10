<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the original Curadoria iframe mounted across workspace switches; this preserves its live state and existing storage behavior.
- DJ Desk reads the existing library storage without writing to it; missing technical metadata stays unknown rather than being fabricated.
- Keep Camelot normalization and transition filtering in the browser-safe dj-library module so matching rules are independently testable.
- The root route renders the workspace shell (single app nav, preserved iframe, mini player) around <Outlet />; the iframe stays on its Diário tab with its own nav hidden, and every other area is a real route with native components, so navigation never depends on clicking compiled buttons.
- Keep Lançamentos/Recomendações criteria in browser-safe discovery mirroring the compiled Diário, since its code cannot be imported.
- Persist personal identity, exploration activity and event radar in owner-scoped Cloud profiles; additionally persist avatar and engagement preferences in owner-namespaced localStorage separate from library storage so offline preferences never overwrite the acervo.
- Keep habit, badge, daily editorial rotation and calendar export rules in the browser-safe music-profile module so behavior is independently testable.
- Keep deduplicated mission rewards, level calculation, symbol validation and conceptual event data in browser-safe profile-engagement so exact XP rules can be tested without UI.
- Mini player uses actual selected-track preview URLs only and reports unavailable audio instead of simulating playback; Story export renders artwork to canvas for dependency-free PNG copying and download.
