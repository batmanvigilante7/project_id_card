# 🪪 Identity Studio: Interactive 3D ID Card Customizer

Identity Studio is a web-based, state-of-the-art interactive **3D ID Card Customizer & Designer**. Built with React, Vite, and Three.js, it simulates real-time physics of a lanyard and card, allowing users to customize details, styles, backgrounds, and export the generated card.

---

## ✨ Key Features

- **Interactive 3D Simulation**: Real-time 3D lanyard physics powered by `@react-three/fiber` and `@react-three/rapier`.
- **Dynamic Canva SVG Backgrounds**: Import, crop, and display custom card background designs dynamically.
- **Real-Time Data Overlay**: Editable HTML/Canvas overlay elements for student details, photos, and branding text.
- **Smart Image Processing**: Integrated crop modal for user avatar and institutional logo uploads.
- **Dynamic Identifiers**: Custom generation of Code128 barcodes and dynamic QR codes.
- **Presets & Themes**: Customizable department presets (Engineering, Medical, Business, Law, Arts) and camera/physics presets (Calm, Natural, Dynamic, Floating, Heavy).
- **High-Quality Export**: Export options to download the ID card as a PNG or print-ready PDF.

---

## 🛠️ Tech Stack

- **Frontend Core**: React 19 (Hooks, Context, State Management)
- **Styling**: Modern, responsive Vanilla CSS
- **3D Graphics & Physics**: Three.js, React Three Fiber (R3F), `@react-three/drei`, and Rapier physics
- **Build System**: Vite (Ultra-fast Hot Module Replacement)
- **Linter**: Oxlint (High-performance code analysis)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js installed on your machine.

### Installation

1. Clone the repository and navigate to the directory:
   ```bash
   cd project_id_card
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

### Running Locally

To spin up the local development server:
```bash
npm run dev
```
Open your browser and navigate to the local URL (usually `http://localhost:5173`).

### Production Build

To compile the application for production:
```bash
npm run build
```
The optimized bundle will be generated under the `dist/` directory.

---

## 📅 Roadmap & Milestones

1. **Project Infrastructure Setup** (Complete)
2. **Canva SVG Background Integration** (In progress)
3. **Interactive Overlays & Field Customization**
4. **Photo Upload & QR/Barcode Generation**
5. **PDF & PNG Export Functionality**
6. **Polishing 3D Lanyard Simulation & Visual Styles**
