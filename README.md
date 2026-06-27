# vid-gen

A SRLINES web app for generating Pollinations.ai videos with Bring Your Own Pollen (BYOP) login.

## What the app does

- Users authenticate through Pollinations/GitHub using the configured publishable app key: `pk_KjV32GDuJNWrvF3k`.
- Pollinations redirects back to `https://vid-gen.srlines.net/callback` with a temporary user `sk_...` key in the URL fragment.
- The app stores that user key in the visitor's browser local storage only.
- The home page asks for exactly two inputs:
  1. Video scene
  2. Urdu voiceover
- All generation options are fixed in code:
  - `model=wan`
  - `width=1080`
  - `height=1920`
  - `duration=15`
  - `aspectRatio=9:16`
  - `audio=true`

## Domain / GitHub Pages setup

Point `https://vid-gen.srlines.net` to this repository with GitHub Pages:

1. In the repository, go to **Settings → Pages**.
2. Set the build/deploy source to GitHub Actions or the static build output from `npm run build` (`dist/`).
3. Set **Custom domain** to `vid-gen.srlines.net`.
4. In DNS for `srlines.net`, create a `CNAME` record:
   - Name/Host: `vid-gen`
   - Value/Target: `<your-github-username>.github.io`
5. Keep the Pollinations app key redirect URL exactly as configured: `https://vid-gen.srlines.net/callback`.
6. Enable **Enforce HTTPS** after GitHub verifies the DNS record.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```
