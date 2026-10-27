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

- Keep the roster in `src/lib/data.ts` as the shared source for squad cards, launch summaries and activity feeds; scene station IDs must match that roster to prevent stale agent references.
- Reuse existing character assets through roster-named imports in the agency scene; artwork filenames are not minion identities.
