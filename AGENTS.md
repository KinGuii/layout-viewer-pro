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
- Render the personal profile as a sibling of the preserved iframe when its fourth tab is selected; bridge navigation through the existing tab buttons to avoid modifying the compiled library app.
- Persist personal identity, exploration activity and event radar in owner-scoped Cloud profiles; guest edits are session-only previews and never alter the existing library storage.
- Keep habit, badge, daily editorial rotation and calendar export rules in the browser-safe music-profile module so behavior is independently testable.
