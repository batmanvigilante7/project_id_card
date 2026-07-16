# Your personalized GITAM Lanyard

This is the React Bits `Lanyard` component, restyled to carry your own ID card look
(teal diagonal bands, your photo, name, program, and campus) instead of the generic
demo art, with a QR/link back to gitam.edu.

## Files in this package

| File | What it is |
|---|---|
| `Lanyard.jsx` | The component, wired to your assets by default and with tap-to-open-link behavior added |
| `Lanyard.css` | Unchanged component styles |
| `card.glb` | The original React Bits 3D card mesh (physics/lanyard shape) |
| `front.png` | Your card's **front face** — your photo + name + ID details, styled like your GITAM card |
| `back.png` | Your card's **back face** — GITAM monogram + a QR code that opens gitam.edu |
| `lanyard-band.png` | A repeating "GITAM" band texture for the strap itself |

## 1. Install dependencies (if you haven't already)

```bash
npm install three meshline @react-three/fiber @react-three/drei @react-three/rapier
```

## 2. Drop the files in

Copy all six files above into one folder in your project, e.g. `src/components/Lanyard/`.

## 3. Vite config

Add this so Vite knows how to bundle the `.glb` file:

```js
// vite.config.js
export default defineConfig({
  // ...
  assetsInclude: ['**/*.glb']
})
```

## 4. Use it

```jsx
import Lanyard from './components/Lanyard/Lanyard';

<Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />
```

That's it — the front, back, band texture, and the `gitam.edu` link are already the
defaults inside `Lanyard.jsx`. Dragging the card still works exactly like the original;
a quick tap/click (no drag) opens `https://www.gitam.edu/` in a new tab.

### Swapping anything later

All of it is still override-able via props if you want to iterate on the design:

```jsx
<Lanyard
  frontImage="/my-new-front.png"
  backImage="/my-new-back.png"
  lanyardImage="/my-new-band.png"
  linkUrl="https://www.gitam.edu/"
  imageFit="cover" // or "contain" to letterbox instead of crop
/>
```

### Notes on the artwork

- `front.png` / `back.png` were composited from your uploaded photo and the layout of
  your real GITAM ID card (teal diagonal bands, gold trim, program/campus fields).
- The QR on the back points to `https://www.gitam.edu/`.
- If you'd like a different crop of your photo, a different name format, or your
  actual GITAM logo mark swapped in instead of the recreated wordmark, send an updated
  photo/logo file and I can regenerate `front.png`/`back.png`.
