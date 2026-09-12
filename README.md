# Keyfaces

A Next.js landing page: click a rounded profile picture to hear that
person's full sound and see their keyboard shortcut ("code"). Then type
the code key by key — each letter plays just its own slice of that
person's sound, and typing the whole code plays it complete.

## Using your own voice clips

1. Put each downloaded audio file in `public/sounds/`, named to match
   the `id` in the `PROFILES` array — e.g. `public/sounds/mara.mp3`.
   MP3, WAV, and OGG all work (whatever the browser supports).
2. In `app/page.tsx`, point each profile's `audioSrc` at that file:
   ```ts
   { id: "mara", name: "Mara", avatar: 5, code: "mrq", audioSrc: "/sounds/mara.mp3" }
   ```
3. That's it. On load, the app decodes each clip and automatically
   slices it into as many equal-length pieces as the code has letters
   (a 3-letter code like `"mrq"` = clip cut into thirds). Typing `m`
   plays the first third, `r` the second, `q` the last third — type all
   three and you've played the whole clip.

### Picking your own cut points instead of equal thirds
If the automatic even split doesn't land on natural breaks in the
recording (e.g. you want it to cut right where a word ends), set
`customSegments` — an array of `[start, end]` times in seconds, one
pair per letter of `code`:
```ts
{
  id: "mara",
  name: "Mara",
  avatar: 5,
  code: "mrq",
  audioSrc: "/sounds/mara.mp3",
  customSegments: [
    [0, 0.6],   // "m" plays 0.0s–0.6s
    [0.6, 1.4], // "r" plays 0.6s–1.4s
    [1.4, 2.1], // "q" plays 1.4s–2.1s
  ],
}
```
Open the file in any audio editor (Audacity is free) to read off the
timestamps you want.

### Notes
- A profile whose clip fails to load shows "clip missing" and its
  button is disabled — check the filename and path if that happens.
- Every code's first letter must be unique across profiles, and no
  code may be a prefix of another one, so a single keystroke always
  identifies at most one profile.

## Run it
```bash
npm install
npm run dev
```
Then open http://localhost:3000.

## Build for production
```bash
npm run build
npm start
```
