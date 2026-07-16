# Running the Lanyard as a minimal React island

You don't need your whole site to be React — this spins up the smallest possible
Vite+React app whose only job is to render the Lanyard. You can point an `<iframe>`
at it, embed the built output as a widget, or just run it as its own page.

## 1. Scaffold the project

```bash
npm create vite@latest gitam-lanyard -- --template react
cd gitam-lanyard
```

## 2. Install dependencies

```bash
npm install three meshline @react-three/fiber @react-three/drei @react-three/rapier
```

## 3. Add the component files

Copy these six files (from the `lanyard-gitam` package I already gave you) into
`src/components/Lanyard/`:

```
src/components/Lanyard/
├── Lanyard.jsx
├── Lanyard.css
├── card.glb
├── front.png
├── back.png
└── lanyard-band.png
```

## 4. Vite config

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'], // <-- required for the card model
})
```

## 5. Wire it into App.jsx

```jsx
// src/App.jsx
import Lanyard from './components/Lanyard/Lanyard'

export default function App() {
  return <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />
}
```

Delete the default `App.css` styling that Vite scaffolds (or just leave it — the
Lanyard's own CSS handles its full-viewport canvas).

## 6. Run it

```bash
npm run dev
```

Open the printed `localhost` URL — you'll see your card on the lanyard, draggable,
with a tap opening gitam.edu.

## Deploying / embedding on a non-React site

```bash
npm run build
```

This outputs a static `dist/` folder (plain HTML/JS/CSS — no server needed). You can:
- Host `dist/` anywhere (Netlify, Vercel, GitHub Pages, your own server) and link to it, or
- Embed that hosted page in an `<iframe>` inside your existing non-React site.

Either way, the only React-aware part of your project is this one small app —
the rest of your site stays whatever it already is.
