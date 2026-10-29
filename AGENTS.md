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
- Launches reach the coins table only through `saveLaunchCoin` in `src/lib/coins.functions.ts`, which verifies the mint exists and the transaction confirmed on Solana before writing; the table has no public INSERT policy. Display market cap as "—" and a "NEW" tag until real on-chain pricing is wired — never show invented numbers there.
- Treasury fee sharing uses Pump.fun's official sharing-config transaction builder in server-only helpers; inspect the transaction before requesting the creator signature, then verify the finalized sharing-config account before reporting a connection. This avoids trusting builder metadata or submission alone.
- Resolve Solana's rpc-websockets dependency to its browser implementation during bundling because its package has no Worker export.
