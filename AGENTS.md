# FiveMoreMinutes Repository Guidance

## Project shape

FiveMoreMinutes is a dependency-free static web experience built with semantic HTML, CSS, inline SVG, and vanilla JavaScript.

- `index.html` owns document structure and accessible control semantics.
- `style.css` owns the scene, responsive layout, reaction states, and reduced-motion behavior.
- `script.js` owns attempt tracking, randomized reactions, generated Web Audio, and reset/input behavior.
- `scripts/verify.js` is the main production verification command.

## Working rules

- Preserve the zero-build, zero-runtime-dependency architecture unless a requirement genuinely needs more.
- Prefer native HTML controls and visible focus states over custom ARIA widgets.
- Every new reaction must have a unique JavaScript ID, a matching CSS `[data-reaction]` state, and an assistive-technology announcement.
- Keep generated sound behind a user gesture and keep the experience functional when audio is unavailable.
- Preserve `prefers-reduced-motion` behavior for every new animation.
- Do not add external tracking, fonts, media, or network requests without documenting the privacy and availability tradeoff.
- Do not add GitHub Actions or expand workflows without Sudarshan's explicit approval.
- Never commit `.env` files, credentials, private keys, local configuration, or generated output.

## Verification

Run before committing or releasing:

```sh
node scripts/verify.js
```

Visual changes also require a manual browser review at desktop and mobile widths. Do not create screenshots, recordings, browser traces, or other session captures.

## Release

Deploy the three runtime files (`index.html`, `style.css`, and `script.js`) to a static HTTPS host. Keep the GitHub repository private unless Sudarshan explicitly approves making it public.
