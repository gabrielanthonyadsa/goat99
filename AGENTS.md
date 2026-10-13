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

## Application architecture
- Keep shared customer navigation and account state in the root shell; leaf routes own their unique metadata.
- Centralize editorial French content in the content module so copy can evolve without duplicating route templates.
- Use managed Cloud authentication for email, social and custom OIDC; do not hand-roll ADDS token exchange.
- Public catalog reads use a server publishable client; private operations validate authentication and roles independently of UI.
- Store staff roles separately from profiles and never auto-assign administrator privileges.
- Keep catalog and commercial data empty until approved; generated editorial imagery is not merchandise.
