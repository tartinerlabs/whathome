---
name: deploy
description: Run checks, build, and deploy to Vercel production
user_invocable: true
---

# /deploy

Deploy the WhatHome project to Vercel production.

## Steps

1. **Lint & format check**
   ```bash
   pnpm check
   ```
   If issues found, run `pnpm format` and report what was fixed. Abort if lint errors remain.

2. **Production build**
   ```bash
   pnpm build
   ```
   Abort if build fails. Report any warnings.

3. **Deploy to production**
   ```bash
   vercel deploy --prod
   ```

4. **Verify deployment**
   Report the production URL and confirm it's accessible.

## On Failure
- If lint fails: show the issues and suggest fixes
- If build fails: show the error and investigate the cause
- If deploy fails: check `vercel logs` for details
