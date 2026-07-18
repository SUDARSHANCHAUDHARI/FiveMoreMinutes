# Five More Minutes

A playful, dependency-free web experience about a sleepy desktop computer that refuses to wake up.

Press the computer’s power button, click its keyboard, or press <kbd>W</kbd>. It responds with randomized sleepy excuses for the first seven attempts. On attempt eight, it finally gives in:

> Fine. I’m awake.

**Project status:** Production-ready source · Private repository · Public deployment pending

## Highlights

- A complete illustrated desktop scene built from semantic HTML, CSS, and inline SVG
- Ten randomized reactions drawn without repeats during a normal seven-reaction run
- A guaranteed full wake-up state on the eighth attempt
- Synthesized sound effects using the Web Audio API—no audio files required
- Mouse, touch, physical keyboard, sound-toggle, and reset interaction
- Responsive layouts for desktop, tablet, and mobile viewports
- Native controls, visible focus states, live announcements, and meaningful accessible names
- Full `prefers-reduced-motion` support
- No frameworks, packages, analytics, remote assets, or runtime network requests

## Sleepy reactions

The computer can:

1. Wake its screen briefly and fall asleep again
2. Let out a digital yawn
3. Ask for “Five more minutes”
4. Move its power button out of reach
5. Pull its blanket over the monitor
6. Start a suspicious nap update
7. Disconnect its own keyboard
8. Display a sleepy face
9. Set an alarm for two minutes later
10. Turn up its screen and immediately lower the brightness again

Reactions are shuffled into a bag so the computer does not repeat one before the current bag is exhausted. The eighth wake attempt bypasses the random pool and always produces the final awake state.

## Controls

| Control | Action |
| --- | --- |
| Monitor power button | Attempts to wake the computer |
| Illustrated keyboard | Attempts to wake the computer |
| <kbd>W</kbd> | Keyboard shortcut for a wake attempt |
| Sound control | Enables or disables generated sound effects |
| Reset control | Returns the experience to zero attempts and the sleeping state |

## Technology

- **Document:** Semantic HTML5
- **Visuals:** CSS custom properties, responsive layout, transitions, and keyframe animations
- **Artwork:** Inline SVG for the sleepy face, blanket, and control icons
- **Interaction:** Vanilla JavaScript
- **Audio:** Web Audio API oscillators, gain envelopes, filters, and generated noise
- **Verification:** Dependency-free Node.js script using syntax, document-contract, CSS-state, and mocked-DOM checks

## Getting started

### Requirements

- A current desktop or mobile web browser
- Node.js 18 or newer only when running the production verifier
- Python 3 only when using the optional local HTTP server command

### Clone the repository

The repository is private, so the GitHub account cloning it must have access.

```sh
git clone https://github.com/SUDARSHANCHAUDHARI/FiveMoreMinutes.git
cd FiveMoreMinutes
```

### Run locally

There is no installation or build step. You can open `index.html` directly in a modern browser.

For local HTTP serving:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Verification

Run the complete dependency-free production check from the repository root:

```sh
node scripts/verify.js
```

The verifier checks:

- Required project files and JavaScript syntax
- Unique HTML IDs and valid ARIA references
- Local CSS and JavaScript entry-point links
- Balanced CSS blocks and reduced-motion support
- Ten unique JavaScript reactions with matching CSS visual states
- Seven non-repeating randomized reactions
- Power-button, illustrated-keyboard, and <kbd>W</kbd> input paths
- The guaranteed eighth-attempt wake state
- Reset behavior and sound-control state

Visual changes should also receive a manual review in current desktop and mobile browsers, including keyboard-only navigation and reduced-motion mode.

## Accessibility

- Native `<button>` elements provide mouse, touch, and keyboard semantics
- Visible `:focus-visible` indicators identify the active control
- Screen-reader status announcements describe every reaction and attempt
- Dynamic screen labels reflect the computer’s current visual state
- Decorative SVG and scene details are hidden from assistive technology
- The attempt counter and interaction instructions use meaningful text
- Reduced-motion preferences disable or shorten nonessential motion
- The experience remains functional when Web Audio is unavailable or muted

## Privacy and security

Five More Minutes:

- Collects and stores no user data
- Uses no cookies, analytics, advertising, accounts, or tracking
- Makes no runtime network requests
- Requires no environment variables or API keys
- Loads no third-party fonts, scripts, images, or audio
- Keeps generated sounds behind an explicit user interaction

The `.gitignore` excludes local configuration, environment files, private keys, dependency folders, caches, and generated build output.

## Project structure

```text
FiveMoreMinutes/
├── index.html          # Semantic scene and inline SVG artwork
├── style.css           # Visual system, responsive layout, and reaction animations
├── script.js           # State, reactions, input handling, and generated audio
├── scripts/
│   └── verify.js       # Dependency-free production verification
├── AGENTS.md           # Repository-specific development guidance
├── README.md           # Project documentation
└── .gitignore          # Local, secret, cache, and generated-file exclusions
```

## Production deployment

The deployable artifact is the committed static source—there is no compilation or packaging step. Publish `index.html`, `style.css`, and `script.js` together on a static HTTPS host.

Before making a deployment public:

1. Run `node scripts/verify.js`.
2. Review the interaction manually in current desktop and mobile browsers.
3. Test keyboard-only navigation, sound-off behavior, and reduced-motion mode.
4. Configure the host to send a suitable `Content-Security-Policy`.
5. Enable `X-Content-Type-Options: nosniff`, a strict `Referrer-Policy`, and clickjacking protection.
6. Confirm that HTML, CSS, and JavaScript are served with their correct content types.

Hosting-specific configuration should be added only after selecting the deployment provider.

## Author

**Sudarshan Chaudhari**

Solo indie developer at **SudarshanTechLabs**

Bangkok, Thailand

- GitHub: [@SUDARSHANCHAUDHARI](https://github.com/SUDARSHANCHAUDHARI)
- Email: [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
- Repository: [SUDARSHANCHAUDHARI/FiveMoreMinutes](https://github.com/SUDARSHANCHAUDHARI/FiveMoreMinutes)

## License

Available for personal use and adaptation. No separate license file is currently included.

Copyright © 2026 Sudarshan Chaudhari / SudarshanTechLabs.
