# Five More Minutes

A standalone interactive web toy about a desktop computer that would rather stay asleep.

Press its power button, click the keyboard, or press <kbd>W</kbd>. The computer chooses a sleepy reaction for each of the first seven attempts. On attempt eight, it finally gives in:

> Fine. I’m awake.

## Run it

No build step or dependencies are required. Open `index.html` directly in a modern browser.

For local HTTP serving, either of these commands works if the tool is already installed:

```sh
python3 -m http.server 8000
```

```sh
npx serve .
```

Then open the local address shown in the terminal.

## Verify it

Run the dependency-free production check from the repository root:

```sh
node scripts/verify.js
```

The verifier checks JavaScript syntax, document IDs and ARIA references, local asset links, CSS structure, all ten reaction mappings, non-repeating random reactions, the eighth-attempt wake state, reset behavior, keyboard input, and the sound control.

## Features

- Ten randomized sleepy reactions, drawn without repeats until the reaction pool is exhausted
- Eight-attempt wake-up sequence and visible progress tracking
- Animated monitor, power button, keyboard, blanket, sleep bubbles, and facial expressions
- Sound effects synthesized at runtime with the Web Audio API—no audio files required
- Mouse, touch, and keyboard interaction
- Sound and reset controls
- Responsive layout for desktop and mobile screens
- Native controls, accessible names, live status announcements, visible focus, and meaningful screen descriptions
- `prefers-reduced-motion` support

## Project files

- `index.html` — semantic structure, inline SVG face and blanket artwork
- `style.css` — scene composition, responsive styling, and reaction animations
- `script.js` — attempt state, randomized reactions, controls, and generated audio

## Notes

Browsers require a user gesture before audio can start. The first press or keyboard interaction creates the audio context. If Web Audio is unavailable, the interaction continues silently.

## Production deployment

This project has no build step. Deploy `index.html`, `style.css`, and `script.js` as static files over HTTPS.

Before making a deployment public:

1. Run `node scripts/verify.js`.
2. Check the interaction manually in current desktop and mobile browsers, including keyboard-only use and reduced-motion mode.
3. Configure the host to send `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and clickjacking protection headers. Header syntax depends on the chosen host.
4. Confirm that sound starts only after user interaction and that the page remains usable with sound disabled.

There are no environment variables, API keys, remote requests, analytics scripts, user data stores, or runtime dependencies.

## License

Use and adapt freely for personal projects.
