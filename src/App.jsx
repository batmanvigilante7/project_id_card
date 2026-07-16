import { useState, useEffect, useRef, useMemo } from 'react';
import Lanyard from './components/Lanyard/Lanyard';
import CropModal from './components/CropModal/CropModal';
import { drawCardFront, drawCardBack, drawLanyardBand, INSTITUTION_PRESETS, DEFAULT_COMPONENTS } from './utils/cardDesigner';
import './App.css';

// Default assets
import frontDefault from './components/Lanyard/front.png';
import backDefault from './components/Lanyard/back.png';

export default function App() {
  // Navigation & Progressive Workspace control
  const [workspaceActive, setWorkspaceActive] = useState(false);
  const [activeTab, setActiveTab] = useState('Details'); // Details | Style | Lanyard | Export
  const [exportFilename, setExportFilename] = useState('gitam-id-card');
  const [presentationMode, setPresentationMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState('');
  const [viewportMode, setViewportMode] = useState('3d'); // 3d | 2d

  // Core Identity Studio Config State
  const [config, setConfig] = useState({
    preset: 'gitam',
    themeStyle: 'Classic Gradient', 
    schoolName: 'GITAM University',
    department: 'School of Technology',
    campus: 'Visakhapatnam',
    accreditation: 'NAAC A++',
    academicYear: '2025–2029',
    themeColor: '#007a87',
    secondaryColor: '#f59e0b',
    fontHeading: 'Outfit',
    fontBody: 'Outfit',
    
    // Student detail fields
    name: 'Aravind Swamy',
    role: 'Student',
    rollNumber: '2212345678',
    regNumber: 'REG987654321',
    programme: 'B.Tech CSE (AI & ML)',
    bloodGroup: 'O+ Positive',
    dob: '12-08-2004',
    semester: 'Semester V',
    section: 'Section B',
    emergencyContact: '+91 98765 43210',
    email: 'hganded@student.gitam.edu',
    
    // Toggles for fields visibility
    fieldRoll: true,
    fieldReg: false,
    fieldProg: true,
    fieldYear: true,
    fieldBlood: true,
    fieldDob: false,
    fieldSem: false,
    fieldSec: false,
    fieldContact: true,

    // Layout configuration
    layersOrder: ['background', 'watermark', 'branding', 'photo', 'microchip', 'fields', 'barcode', 'qr', 'hologram'],
    visibleLayers: {
      background: true,
      watermark: true,
      branding: true,
      photo: true,
      microchip: true,
      fields: true,
      barcode: true,
      qr: false,
      hologram: true
    },

    logoImage: null,
    logoName: '',
    avatarImage: null,
    avatarName: '',

    // Dynamic codes options
    barcodeType: 'Code128', 
    qrDestinationVal: 'https://www.gitam.edu/',
    hologramStyle: 'Foil', 
    verificationBadge: true,
    components: DEFAULT_COMPONENTS
  });

  // Department Presets
  const [deptTheme, setDeptTheme] = useState('Engineering'); // Engineering | Medical | Business | Law | Arts

  // Simplified Physics Preset
  const [physicsPreset, setPhysicsPreset] = useState('Natural'); // Calm | Natural | Dynamic | Floating | Heavy

  // 3D Scene Physics & Camera controls
  const [lanyardWidth, setLanyardWidth] = useState(1.0);
  const [strapText, setStrapText] = useState('GITAM UNIVERSITY');
  const [strapColor, setStrapColor] = useState('#007a87');
  const [strapStyle, setStrapStyle] = useState('Nylon'); 
  const [strapFontSize, setStrapFontSize] = useState(34); 

  const [physics, setPhysics] = useState({
    damping: 4,
    mass: 1,
    elasticity: 0.2,
    wind: 0,
    ropeLength: 1
  });

  const [camera, setCamera] = useState({
    orthographic: false,
    autoRotate: false,
    idleSwing: false,
    zoom: 20
  });

  const [holderType, setHolderType] = useState('None'); 
  const [holderColor, setHolderColor] = useState('#007a87');
  const [lightingPreset, setLightingPreset] = useState('Studio'); 
  const [backgroundStyle, setBackgroundStyle] = useState('Glass Studio'); 

  // Dynamic canvas buffers for 3D mapping
  const [frontBufferUrl, setFrontBufferUrl] = useState(null);
  const [backBufferUrl, setBackBufferUrl] = useState(null);
  const [lanyardStrapUrl, setLanyardStrapUrl] = useState(null);

  // Custom face overlays state
  const [customFrontImage, setCustomFrontImage] = useState(null);
  const [customBackImage, setCustomBackImage] = useState(null);

  // File loading CropModal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState(null); 
  const [cropImageSrc, setCropImageSrc] = useState(null);

  // AI assistant banner notification
  const [notification, setNotification] = useState(null);


  // Handle department updates
  const handleDepartmentChange = (dept) => {
    setDeptTheme(dept);
    const presets = {
      Engineering: { color: '#007a87', secondary: '#f59e0b', dept: 'School of Technology' },
      Medical: { color: '#059669', secondary: '#ef4444', dept: 'School of Medicine' },
      Business: { color: '#1e3a8a', secondary: '#d97706', dept: 'School of Business' },
      Law: { color: '#b91c1c', secondary: '#e2e8f0', dept: 'Faculty of Law' },
      Arts: { color: '#7c3aed', secondary: '#ec4899', dept: 'School of Liberal Arts' }
    };
    const s = presets[dept];
    if (s) {
      setConfig(prev => ({
        ...prev,
        themeColor: s.color,
        secondaryColor: s.secondary,
        department: s.dept
      }));
      setStrapColor(s.color);
      setHolderColor(s.color);
      showNotification(`Department theme set to ${dept}. Loaded palette.`);
    }
  };

  // Simplified Physics presets mapping
  useEffect(() => {
    const physicsPresets = {
      Calm: { damping: 6, mass: 1.0, elasticity: 0.1, wind: 0, ropeLength: 0.9 },
      Natural: { damping: 4, mass: 1.0, elasticity: 0.2, wind: 0, ropeLength: 1.0 },
      Dynamic: { damping: 2, mass: 0.8, elasticity: 0.5, wind: 2, ropeLength: 1.1 },
      Floating: { damping: 5, mass: 0.5, elasticity: 0.1, wind: 0, ropeLength: 1.2 },
      Heavy: { damping: 8, mass: 2.0, elasticity: 0.05, wind: 0, ropeLength: 0.8 }
    };
    const p = physicsPresets[physicsPreset];
    if (p) {
      setPhysics(p);
    }
  }, [physicsPreset]);

  // Preset loading trigger
  const loadPreset = (presetId) => {
    const p = INSTITUTION_PRESETS[presetId];
    if (!p) return;

    setConfig(prev => ({
      ...prev,
      preset: presetId,
      schoolName: p.name,
      department: p.schoolName,
      campus: p.campus,
      accreditation: p.accreditation,
      academicYear: p.academicYear,
      themeColor: p.themeColor,
      secondaryColor: p.secondaryColor,
      fontHeading: p.fontHeading,
      fontBody: p.fontBody,
      logoImage: null,
      logoName: '',
      components: DEFAULT_COMPONENTS
    }));

    setStrapColor(p.themeColor);
    setStrapText(p.name);
    setHolderColor(p.themeColor);
    
    showNotification(`Loaded ${p.name} preset variables successfully.`);
    setWorkspaceActive(true);
  };

  // Custom notification toaster
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Reorder canvas elements layer
  const shiftLayer = (index, direction) => {
    if (!config.components) return;
    const list = [...config.components];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;

    setConfig(prev => ({ ...prev, components: list }));
    showNotification(`Re-ordered component layers. Arrangement updated.`);
  };

  // Real-time canvas texturing effect loops
  useEffect(() => {
    const canvasFront = document.createElement('canvas');
    canvasFront.width = 600;
    canvasFront.height = 950;

    const canvasBack = document.createElement('canvas');
    canvasBack.width = 600;
    canvasBack.height = 950;

    drawCardFront(canvasFront, config, 0);
    setFrontBufferUrl(canvasFront.toDataURL('image/png'));

    drawCardBack(canvasBack, config);
    setBackBufferUrl(canvasBack.toDataURL('image/png'));
  }, [config]);

  useEffect(() => {
    const canvasLanyard = document.createElement('canvas');
    canvasLanyard.width = 1024;
    canvasLanyard.height = 128;

    drawLanyardBand(canvasLanyard, strapColor, strapText, strapStyle, strapFontSize);
    setLanyardStrapUrl(canvasLanyard.toDataURL('image/png'));
  }, [strapColor, strapText, strapStyle, strapFontSize]);

  // GLB Export handler and event listeners
  const handleExportGLB = () => {
    showNotification('Preparing 3D model for export...');
    const filename = `${exportFilename.replace(/\s+/g, '-').toLowerCase() || 'custom-id-card'}.glb`;
    window.dispatchEvent(new CustomEvent('export-card-glb', {
      detail: { filename }
    }));
  };

  useEffect(() => {
    const handleSuccess = (e) => {
      showNotification(e.detail?.message || '3D Model exported successfully!');
    };
    const handleError = (e) => {
      showNotification(e.detail?.message || 'Error exporting 3D Model.');
    };

    window.addEventListener('export-gltf-success', handleSuccess);
    window.addEventListener('export-gltf-error', handleError);
    return () => {
      window.removeEventListener('export-gltf-success', handleSuccess);
      window.removeEventListener('export-gltf-error', handleError);
    };
  }, []);

  // Logo color extraction tool helper
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropImageSrc(url);
    setCropTarget('logo');
    setCropModalOpen(true);
  };

  // Profile Avatar Upload trigger
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropImageSrc(url);
    setCropTarget('avatar');
    setCropModalOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  // Crop outcome handler
  const handleApplyCrop = (warpedDataUrl) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = warpedDataUrl;
    img.onload = () => {
      if (cropTarget === 'logo') {
        setConfig(prev => ({ ...prev, logoImage: img, logoName: 'cropped_logo.png' }));
        
        // Smart Color Extractor
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 10;
        tempCanvas.height = 10;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(img, 0, 0, 10, 10);
        const pixelData = tempCtx.getImageData(0, 0, 10, 10).data;
        
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < pixelData.length; i += 4) {
          if (pixelData[i+3] > 150) {
            r += pixelData[i];
            g += pixelData[i+1];
            b += pixelData[i+2];
            count++;
          }
        }
        if (count > 0) {
          const hex = '#' + [r/count, g/count, b/count].map(c => {
            const h = Math.round(c).toString(16);
            return h.length === 1 ? '0' + h : h;
          }).join('');
          
          setConfig(prev => ({ ...prev, themeColor: hex }));
          setStrapColor(hex);
          setHolderColor(hex);
          showNotification(`AI Brand Kit Assistant: Extracted primary color ${hex} from logo.`);
        }
      } else if (cropTarget === 'avatar') {
        setConfig(prev => ({ ...prev, avatarImage: img, avatarName: 'cropped_avatar.png' }));
        showNotification('Avatar cropped and loaded successfully.');
      }
      setCropModalOpen(false);
    };
  };

  // Trigger snapshot download
  const handleDownloadSnapshot = () => {
    const canvas = document.querySelector('.canvas-container canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `3d-lanyard-credential-${config.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = url;
    link.click();
    showNotification('3D Identity Snapshot downloaded.');
  };


  return (
    <div className={`app-container ${presentationMode ? 'presentation-active' : ''}`}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '24px',
          fontSize: '0.85rem',
          fontWeight: '600',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: '#10b981' }}>✦</span>
          {notification}
        </div>
      )}

      {/* ==========================================================================
         B. LANDING PAGE EXPERIENCE
         ========================================================================== */}
      {!workspaceActive && (
        <div className="landing-overlay">
          <div className="landing-card">
            <div className="landing-logo">G</div>
            <h1>GITAM Digital ID Studio</h1>
            <p>Design, customize, and interact with your academic credential in a real-time 3D physics environment. Create your high-fidelity GITAM digital lanyard badge.</p>
            
            <div className="landing-actions">
              <button className="btn-primary-large" onClick={() => loadPreset('gitam')}>
                Create GITAM ID Card
              </button>
              <button className="btn-secondary-large" onClick={() => loadPreset('custom')}>
                Custom Canvas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
         C. HEADER (Top Header)
         ========================================================================== */}
      {workspaceActive && (
        <header className="wizard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setWorkspaceActive(false)}>
              ← Exit
            </button>
            <strong style={{ fontSize: '1rem', fontWeight: '800' }}>GITAM ID Studio</strong>
          </div>
          
          <button 
            className="toolbar-btn mobile-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '⚙ Edit Details' : 'Close Panel'}
          </button>
        </header>
      )}

      {/* ==========================================================================
         D. WORKSPACE LAYOUT
         ========================================================================== */}
      {workspaceActive && (
        <main className={`main-workspace ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ paddingTop: '65px' }}>
          
          {/* Main Visualizer Stage */}
          <section className="canvas-container">
            <div className={`canvas-viewports-wrapper viewport-active-${viewportMode}`}>
              
              {/* 3D Showcase Viewport */}
              <div className="viewport-3d-box">
                <Lanyard
                  position={[0, 0, 20]}
                  gravity={[0, -physics.ropeLength * 40, 0]}
                  fov={20}
                  transparent
                  frontImage={frontBufferUrl}
                  backImage={backBufferUrl}
                  imageFit={config.barcodeType === 'QR' ? 'contain' : 'cover'}
                  lanyardImage={lanyardStrapUrl}
                  lanyardWidth={lanyardWidth}
                  linkUrl={config.qrDestinationVal}
                  physicsSettings={physics}
                  cameraSettings={camera}
                  holderType={holderType}
                  holderColor={holderColor}
                  lightingPreset={lightingPreset}
                  backgroundStyle={backgroundStyle}
                />
              </div>

              {/* 2D Canva-style Editor Viewport */}
              <div className="viewport-2d-editor-box">
                <div className="id-card-2d-canvas" style={{
                  position: 'relative',
                  width: '320px',
                  height: '480px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px',
                  boxSizing: 'border-box'
                }}>
                  {/* Stylized Sidebar Blue Gradients */}
                  <div className="side-wave-left" style={{
                    position: 'absolute',
                    left: 0,
                    top: '110px',
                    height: '190px',
                    width: '30px',
                    background: 'linear-gradient(to bottom, #0282c3, #00519c)',
                    clipPath: 'ellipse(30px 95px at 0% 50%)',
                    opacity: 0.85,
                    zIndex: 1
                  }}></div>
                  <div className="side-wave-right" style={{
                    position: 'absolute',
                    right: 0,
                    top: '135px',
                    height: '190px',
                    width: '40px',
                    background: 'linear-gradient(to bottom, #0282c3, #00519c)',
                    clipPath: 'ellipse(40px 85px at 100% 50%)',
                    opacity: 0.85,
                    zIndex: 1
                  }}></div>

                  {/* Header (GITAM Brand Identity Block) */}
                  <div className="header-section" style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '15px',
                    marginBottom: '10px',
                    gap: '8px',
                    zIndex: 5
                  }}>
                    {/* GITAM Pinwheel SVG Graphic */}
                    <svg className="gitam-logo-graphic" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
                      width: '34px',
                      height: '34px',
                      objectFit: 'contain'
                    }}>
                      <path d="M50 0C60 15 65 30 50 50C35 30 40 15 50 0Z" fill="#00519c"/>
                      <path d="M100 50C85 60 70 65 50 50C70 35 85 40 100 50Z" fill="#00519c"/>
                      <path d="M50 100C40 85 35 70 50 50C65 70 60 85 50 100Z" fill="#00519c"/>
                      <path d="M0 50C15 40 30 35 50 50C30 65 15 60 0 50Z" fill="#00519c"/>
                      <circle cx="50" cy="50" r="10" fill="#ffffff"/>
                    </svg>
                    <div className="gitam-logo-text" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                      <h1 className="brand-title canva-editable" contentEditable suppressContentEditableWarning onBlur={(e) => setConfig(prev => ({ ...prev, schoolName: e.target.innerText }))} onKeyDown={handleKeyDown} style={{
                        fontSize: '18px',
                        fontWeight: 900,
                        color: '#00519c',
                        lineHeight: 1,
                        letterSpacing: '0.8px',
                        margin: 0
                      }}>
                        {config.schoolName || 'GITAM'}
                      </h1>
                      <span className="brand-subtitle canva-editable" contentEditable suppressContentEditableWarning onBlur={(e) => showNotification('Subtitle updated.')} onKeyDown={handleKeyDown} style={{
                        fontSize: '6.5px',
                        fontWeight: 800,
                        color: '#002d58',
                        letterSpacing: '0.6px',
                        margin: '2px 0 0 0'
                      }}>
                        DEEMED TO BE UNIVERSITY
                      </span>
                    </div>
                  </div>

                  {/* Profile Avatar Portrait */}
                  <div className="profile-frame" style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '3px solid white',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                    marginBottom: '15px',
                    zIndex: 10,
                    position: 'relative',
                    background: '#f1f5f9',
                    cursor: 'pointer'
                  }}>
                    <img 
                      src={customFrontImage || (config.avatarImage ? (config.avatarImage.src || config.avatarImage) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256')} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <label style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                    </label>
                  </div>

                  {/* Blue Curved Bottom Shape */}
                  <div className="blue-footer" style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '55%',
                    background: config.themeColor || '#00519c',
                    borderTopLeftRadius: '50px',
                    borderTopRightRadius: '50px',
                    padding: '24px 20px 15px 20px',
                    color: 'white',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    zIndex: 1
                  }}>
                    <div>
                      {/* Student Name */}
                      <h2 
                        className="student-name canva-editable" 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => setConfig(prev => ({ ...prev, name: e.target.innerText }))}
                        onKeyDown={handleKeyDown}
                        style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', margin: 0, color: 'white' }}
                      >
                        {config.name}
                      </h2>

                      {/* Roll Number */}
                      <p 
                        className="student-id canva-editable" 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => setConfig(prev => ({ ...prev, rollNumber: e.target.innerText }))}
                        onKeyDown={handleKeyDown}
                        style={{ fontSize: '12px', fontWeight: 600, opacity: 0.95, margin: '4px 0 0 0', color: 'white' }}
                      >
                        {config.rollNumber}
                      </p>

                      {/* Programme */}
                      <p 
                        className="student-dept canva-editable" 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => setConfig(prev => ({ ...prev, programme: e.target.innerText }))}
                        onKeyDown={handleKeyDown}
                        style={{ fontSize: '9.5px', opacity: 0.85, margin: '6px 0 0 0', color: 'white' }}
                      >
                        {config.programme}
                      </p>

                      {/* Department */}
                      <p 
                        className="student-dept canva-editable" 
                        contentEditable 
                        suppressContentEditableWarning
                        onBlur={(e) => setConfig(prev => ({ ...prev, department: e.target.innerText }))}
                        onKeyDown={handleKeyDown}
                        style={{ fontSize: '9.5px', opacity: 0.85, margin: '3px 0 0 0', color: 'white' }}
                      >
                        {config.department}
                      </p>
                    </div>

                    {/* Footer Contact Details */}
                    <div className="footer-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left', fontSize: '9px' }}>
                      <div>
                        <span style={{ opacity: 0.7, display: 'block', marginBottom: '2px', fontSize: '7px' }}>EMAIL ID</span>
                        <span 
                          className="canva-editable" 
                          contentEditable 
                          suppressContentEditableWarning
                          onBlur={(e) => setConfig(prev => ({ ...prev, email: e.target.innerText }))}
                          onKeyDown={handleKeyDown}
                          style={{ fontFamily: 'monospace', color: 'white', fontSize: '9px' }}
                        >
                          {config.email || 'hganded@student.gitam.edu'}
                        </span>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <span 
                          className="canva-editable" 
                          contentEditable 
                          suppressContentEditableWarning
                          onBlur={(e) => showNotification('Registrar signature updated.')}
                          onKeyDown={handleKeyDown}
                          style={{ display: 'block', fontFamily: 'cursive', fontSize: '11px', color: '#38bdf8' }}
                        >
                          B.riz.
                        </span>
                        <span style={{ display: 'block', opacity: 0.7, fontSize: '7px', marginTop: '2px' }}>Registrar</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Viewport Floating Toolbar */}
            <div className="interactive-toolbar">
              <button className={`toolbar-btn viewport-toggle-btn ${viewportMode === '3d' ? 'active' : ''}`} onClick={() => setViewportMode('3d')}>
                3D View
              </button>
              <button className={`toolbar-btn viewport-toggle-btn ${viewportMode === '2d' ? 'active' : ''}`} onClick={() => setViewportMode('2d')}>
                Visual Editor
              </button>
              <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.2)', margin: '0 8px' }}></div>

              <button className={`toolbar-btn ${camera.autoRotate ? 'active' : ''}`} onClick={() => setCamera(prev => ({ ...prev, autoRotate: !prev.autoRotate }))}>
                🔄 Auto Rotate
              </button>
              <button className="toolbar-btn" onClick={handleDownloadSnapshot}>
                📸 Snapshot
              </button>
            </div>
          </section>

          {/* Properties Inspector Sidebar */}
          <aside className={`properties-panel ${sidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="panel-header">
              <h2>Card Inspector</h2>
              <button className="panel-close-btn" onClick={() => setSidebarCollapsed(true)}>✕</button>
            </div>

            {/* Properties Menu Tabs */}
            <div className="panel-tabs">
              {['Details', 'Style', 'Layout', 'Lanyard', 'Export'].map(t => (
                <button key={t} className={`panel-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                  {t}
                </button>
              ))}
            </div>

            <div className="panel-scroll-content">
              
              {/* TAB 1: DETAILS */}
              {activeTab === 'Details' && (
                <div>
                  <h3 className="pane-section-title">Card Source Mode</h3>
                  <div className="control-group">
                    <label className="checkbox-label" style={{ fontWeight: 'bold' }}>
                      <input 
                        type="checkbox" 
                        className="checkbox-input" 
                        checked={config.useUploadedOnly || false} 
                        onChange={(e) => setConfig(prev => ({ ...prev, useUploadedOnly: e.target.checked }))} 
                      />
                      Use Uploaded Front/Back Images Only
                    </label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Show ONLY your custom uploaded front/back images on the 3D card (bypasses template text/logos).
                    </span>
                  </div>

                  <div className="control-group-row" style={{ gap: '8px', marginBottom: '16px' }}>
                    <div className="control-group flex-1">
                      <span className="control-label">Card Front Image</span>
                      {customFrontImage ? (
                        <div className="custom-image-preview-box" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '6px' }}>
                          <img src={customFrontImage} alt="Custom Front" className="custom-image-preview-thumbnail" style={{ height: '50px', width: 'auto', alignSelf: 'center', marginBottom: '4px' }} />
                          <button className="btn-secondary" style={{ padding: '4px', fontSize: '0.7rem' }} onClick={() => {
                            setCustomFrontImage(null);
                            setConfig(prev => ({ ...prev, customFrontImageObj: null, customFrontImageName: '' }));
                          }}>
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer', padding: '8px 0', fontSize: '0.8rem' }}>
                          Upload Front
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setCustomFrontImage(url);
                              const img = new Image();
                              img.crossOrigin = 'anonymous';
                              img.src = url;
                              img.onload = () => {
                                setConfig(prev => ({ ...prev, customFrontImageObj: img, customFrontImageName: file.name, useUploadedOnly: true }));
                                showNotification('Custom front image loaded. Bypassing templates.');
                              };
                            }
                          }} />
                        </label>
                      )}
                    </div>

                    <div className="control-group flex-1">
                      <span className="control-label">Card Back Image</span>
                      {customBackImage ? (
                        <div className="custom-image-preview-box" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '6px' }}>
                          <img src={customBackImage} alt="Custom Back" className="custom-image-preview-thumbnail" style={{ height: '50px', width: 'auto', alignSelf: 'center', marginBottom: '4px' }} />
                          <button className="btn-secondary" style={{ padding: '4px', fontSize: '0.7rem' }} onClick={() => {
                            setCustomBackImage(null);
                            setConfig(prev => ({ ...prev, customBackImageObj: null, customBackImageName: '' }));
                          }}>
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer', padding: '8px 0', fontSize: '0.8rem' }}>
                          Upload Back
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setCustomBackImage(url);
                              const img = new Image();
                              img.crossOrigin = 'anonymous';
                              img.src = url;
                              img.onload = () => {
                                setConfig(prev => ({ ...prev, customBackImageObj: img, customBackImageName: file.name, useUploadedOnly: true }));
                                showNotification('Custom back image loaded. Bypassing templates.');
                              };
                            }
                          }} />
                        </label>
                      )}
                    </div>
                  </div>

                  <h3 className="pane-section-title">Student Profile</h3>
                  <div className="control-group">
                    <span className="control-label">Full Name</span>
                    <input type="text" className="text-input" value={config.name} onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  
                  <div className="control-group">
                    <span className="control-label">Role Designation</span>
                    <input type="text" className="text-input" value={config.role} onChange={(e) => setConfig(prev => ({ ...prev, role: e.target.value }))} />
                  </div>

                  <div className="control-group">
                    <span className="control-label">Email Address</span>
                    <input type="email" className="text-input" value={config.email || ''} onChange={(e) => setConfig(prev => ({ ...prev, email: e.target.value }))} />
                  </div>

                  <div className="control-group">
                    <span className="control-label">Profile Avatar Portrait</span>
                    <label className="btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer', padding: '10px 0' }}>
                      {config.avatarName ? `Change Photo (${config.avatarName})` : 'Upload Portrait Photo'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                    </label>
                  </div>

                  <div className="control-group-row">
                    <div className="control-group flex-1">
                      <span className="control-label">Roll Number</span>
                      <input type="text" className="text-input" value={config.rollNumber} onChange={(e) => setConfig(prev => ({ ...prev, rollNumber: e.target.value }))} />
                    </div>
                    <div className="control-group flex-1">
                      <span className="control-label">Registration No</span>
                      <input type="text" className="text-input" value={config.regNumber} onChange={(e) => setConfig(prev => ({ ...prev, regNumber: e.target.value }))} />
                    </div>
                  </div>

                  <div className="control-group-row">
                    <div className="control-group flex-1">
                      <span className="control-label">Programme</span>
                      <input type="text" className="text-input" value={config.programme} onChange={(e) => setConfig(prev => ({ ...prev, programme: e.target.value }))} />
                    </div>
                    <div className="control-group flex-1">
                      <span className="control-label">Blood Group</span>
                      <input type="text" className="text-input" value={config.bloodGroup} onChange={(e) => setConfig(prev => ({ ...prev, bloodGroup: e.target.value }))} />
                    </div>
                  </div>

                  <h3 className="pane-section-title">Academic Info</h3>
                  <div className="control-group">
                    <span className="control-label">Institution Title</span>
                    <input type="text" className="text-input" value={config.schoolName} onChange={(e) => setConfig(prev => ({ ...prev, schoolName: e.target.value }))} />
                  </div>

                  <div className="control-group">
                    <span className="control-label">Department / School</span>
                    <input type="text" className="text-input" value={config.department} onChange={(e) => setConfig(prev => ({ ...prev, department: e.target.value }))} />
                  </div>

                  <div className="control-group-row">
                    <div className="control-group flex-1">
                      <span className="control-label">Campus Site</span>
                      <input type="text" className="text-input" value={config.campus} onChange={(e) => setConfig(prev => ({ ...prev, campus: e.target.value }))} />
                    </div>
                    <div className="control-group flex-1">
                      <span className="control-label">Academic Year</span>
                      <input type="text" className="text-input" value={config.academicYear} onChange={(e) => setConfig(prev => ({ ...prev, academicYear: e.target.value }))} />
                    </div>
                  </div>

                  <h3 className="pane-section-title">Card Tap Action</h3>
                  <div className="control-group">
                    <span className="control-label">Card Click Destination URL</span>
                    <input 
                      type="text" 
                      className="text-input" 
                      placeholder="e.g. https://gitam.edu or custom portfolio link" 
                      value={config.qrDestinationVal || ''} 
                      onChange={(e) => setConfig(prev => ({ ...prev, qrDestinationVal: e.target.value }))} 
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Clicking or tapping on the 3D ID card will open this specific URL in a new tab.
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: STYLE */}
              {activeTab === 'Style' && (
                <div>
                  <h3 className="pane-section-title">Theme & Branding</h3>
                  <div className="control-group">
                    <span className="control-label">Department Presets</span>
                    <select className="text-input" value={deptTheme} onChange={(e) => handleDepartmentChange(e.target.value)}>
                      <option value="Engineering">Engineering (Teal & Gold)</option>
                      <option value="Medical">Medical (Emerald & Red)</option>
                      <option value="Business">Business (Navy & Orange)</option>
                      <option value="Law">Law (Crimson & White)</option>
                      <option value="Arts">Arts (Purple & Pink)</option>
                    </select>
                  </div>

                  <div className="control-group">
                    <span className="control-label">Card Style Theme</span>
                    <select className="text-input" value={config.themeStyle} onChange={(e) => setConfig(prev => ({ ...prev, themeStyle: e.target.value }))}>
                      <option value="Classic Gradient">Classic Slate</option>
                      <option value="Minimal White">Minimalist White</option>
                      <option value="Corporate Black">Sleek Obsidian</option>
                      <option value="Sunset">Soft Sunset</option>
                    </select>
                  </div>

                  <div className="control-group">
                    <span className="control-label">Primary Theme Color</span>
                    <div className="color-picker-row">
                      <input type="color" className="color-circle-picker" value={config.themeColor} onChange={(e) => {
                        setConfig(prev => ({ ...prev, themeColor: e.target.value }));
                        setStrapColor(e.target.value);
                        setHolderColor(e.target.value);
                      }} />
                      {['#007a87', '#005ea6', '#1e3a8a', '#7c3aed', '#8c1515', '#002147'].map(c => (
                        <button key={c} className="color-preset-dot" style={{ background: c }} onClick={() => {
                          setConfig(prev => ({ ...prev, themeColor: c }));
                          setStrapColor(c);
                          setHolderColor(c);
                        }} />
                      ))}
                    </div>
                  </div>

                  <div className="control-group">
                    <span className="control-label">Secondary Accent Color</span>
                    <div className="color-picker-row">
                      <input type="color" className="color-circle-picker" value={config.secondaryColor} onChange={(e) => setConfig(prev => ({ ...prev, secondaryColor: e.target.value }))} />
                      {['#f59e0b', '#ef4444', '#10b981', '#64748b', '#d4af37'].map(c => (
                        <button key={c} className="color-preset-dot" style={{ background: c }} onClick={() => setConfig(prev => ({ ...prev, secondaryColor: c }))} />
                      ))}
                    </div>
                  </div>

                  <div className="control-group">
                    <span className="control-label">Upload Custom Logo</span>
                    <label className="btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer', padding: '10px 0' }}>
                      {config.logoName ? `Replace Logo (${config.logoName})` : 'Upload Brand Logo'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                    </label>
                  </div>

                  <h3 className="pane-section-title">Fields & Codes</h3>
                  <div className="control-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span className="control-label">Active Field Visibilities</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" checked={config.fieldRoll} onChange={(e) => setConfig(prev => ({ ...prev, fieldRoll: e.target.checked }))} />
                        Roll Number
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" checked={config.fieldReg} onChange={(e) => setConfig(prev => ({ ...prev, fieldReg: e.target.checked }))} />
                        Registration
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" checked={config.fieldProg} onChange={(e) => setConfig(prev => ({ ...prev, fieldProg: e.target.checked }))} />
                        Programme
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" checked={config.fieldYear} onChange={(e) => setConfig(prev => ({ ...prev, fieldYear: e.target.checked }))} />
                        Year Text
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" checked={config.fieldBlood} onChange={(e) => setConfig(prev => ({ ...prev, fieldBlood: e.target.checked }))} />
                        Blood Group
                      </label>
                      <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" checked={config.fieldDob} onChange={(e) => setConfig(prev => ({ ...prev, fieldDob: e.target.checked }))} />
                        DOB Field
                      </label>
                    </div>
                  </div>

                  <div className="control-group">
                    <span className="control-label">Barcode / QR format</span>
                    <select className="text-input" value={config.barcodeType} onChange={(e) => setConfig(prev => ({ ...prev, barcodeType: e.target.value }))}>
                      <option value="Code128">Code128 Standard</option>
                      <option value="EAN13">EAN13 simulated</option>
                      <option value="QR">Smart QR Code</option>
                      <option value="None">No Barcode</option>
                    </select>
                  </div>

                  {config.barcodeType === 'QR' && (
                    <div className="control-group">
                      <span className="control-label">Smart QR Scan Target</span>
                      <select className="text-input" value={config.qrDestinationVal} onChange={(e) => setConfig(prev => ({ ...prev, qrDestinationVal: e.target.value }))}>
                        <option value="https://gitam.edu/">Student Portal URL</option>
                        <option value="https://gitam.edu/attendance">Attendance Tracking</option>
                        <option value="https://gitam.edu/library">Library Index System</option>
                        <option value="https://linkedin.com">LinkedIn Portfolio Link</option>
                      </select>
                    </div>
                  )}

                  <h3 className="pane-section-title">Security & Materials</h3>
                  <div className="control-group">
                    <span className="control-label">Holographic Foil style</span>
                    <select className="text-input" value={config.hologramStyle} onChange={(e) => setConfig(prev => ({ ...prev, hologramStyle: e.target.value }))}>
                      <option value="Foil">Reflective Silver Foil</option>
                      <option value="Rainbow">Chameleon Rainbow</option>
                      <option value="UV Pattern">Security UV Watermark</option>
                      <option value="Security Strip">Metal Security Strip</option>
                      <option value="None">No Hologram</option>
                    </select>
                  </div>

                  <div className="control-group">
                    <span className="control-label">Microchip Metal Style</span>
                    <select className="text-input" value={config.microchipStyle || 'Gold'} onChange={(e) => setConfig(prev => ({ ...prev, microchipStyle: e.target.value }))}>
                      <option value="Gold">Gold Plate (Classic)</option>
                      <option value="Silver">Silver Plate (Modern Tech)</option>
                      <option value="Copper">Copper Plate (Retro Tech)</option>
                      <option value="Neon">Neon Gradient (Accent Colored)</option>
                    </select>
                  </div>

                  <div className="control-group">
                    <label className="checkbox-label">
                      <input type="checkbox" className="checkbox-input" checked={config.cardBorder || false} onChange={(e) => setConfig(prev => ({ ...prev, cardBorder: e.target.checked }))} />
                      Enable Accent Card Border
                    </label>
                  </div>

                  {config.cardBorder && (
                    <div className="control-group-row">
                      <div className="control-group flex-1">
                        <span className="control-label">Border Color</span>
                        <input type="color" className="text-input" style={{ height: '38px', padding: '4px' }} value={config.cardBorderColor || config.themeColor} onChange={(e) => setConfig(prev => ({ ...prev, cardBorderColor: e.target.value }))} />
                      </div>
                      <div className="control-group flex-1">
                        <span className="control-label">Thickness ({config.cardBorderWidth || 4}px)</span>
                        <input type="range" className="slider" min="1" max="10" step="1" value={config.cardBorderWidth || 4} onChange={(e) => setConfig(prev => ({ ...prev, cardBorderWidth: parseInt(e.target.value) }))} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: LAYOUT (COMPONENTS EDITOR) */}
              {activeTab === 'Layout' && (
                <div>
                  <h3 className="pane-section-title">Component Layout Editor</h3>
                  
                  <div className="control-group">
                    <span className="control-label">Select ID Component</span>
                    <select className="text-input" value={selectedComponentId} onChange={(e) => setSelectedComponentId(e.target.value)}>
                      <option value="">-- Choose Element --</option>
                      {config.components.map(comp => (
                        <option key={comp.id} value={comp.id}>
                          {comp.label || comp.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedComponentId ? (() => {
                    const comp = config.components.find(c => c.id === selectedComponentId);
                    if (!comp) return null;

                    const handleCompChange = (key, val) => {
                      setConfig(prev => ({
                        ...prev,
                        components: prev.components.map(c => c.id === comp.id ? { ...c, [key]: val } : c)
                      }));
                    };

                    const isVisible = comp.visible !== false;
                    const isLocked = comp.locked === true;

                    return (
                      <div style={{ marginTop: '16px', padding: '14px', background: 'var(--border-light)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                          Adjusting: {comp.label}
                        </h4>

                        <div className="control-group-row" style={{ gap: '12px', marginBottom: '14px' }}>
                          <label className="checkbox-label" style={{ margin: 0 }}>
                            <input 
                              type="checkbox" 
                              className="checkbox-input" 
                              checked={isVisible} 
                              onChange={(e) => handleCompChange('visible', e.target.checked)} 
                            />
                            Layer Visible
                          </label>
                          
                          <label className="checkbox-label" style={{ margin: 0 }}>
                            <input 
                              type="checkbox" 
                              className="checkbox-input" 
                              checked={isLocked} 
                              onChange={(e) => handleCompChange('locked', e.target.checked)} 
                            />
                            Lock Position
                          </label>
                        </div>

                        {comp.x !== undefined && (
                          <div className="control-group">
                            <span className="control-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>X Position (Horizontal)</span>
                              <strong>{comp.x}px</strong>
                            </span>
                            <input 
                              type="range" 
                              className="slider" 
                              min="0" 
                              max="600" 
                              step="5" 
                              value={comp.x} 
                              onChange={(e) => handleCompChange('x', parseInt(e.target.value))} 
                              disabled={isLocked}
                            />
                          </div>
                        )}

                        {comp.y !== undefined && (
                          <div className="control-group">
                            <span className="control-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Y Position (Vertical)</span>
                              <strong>{comp.y}px</strong>
                            </span>
                            <input 
                              type="range" 
                              className="slider" 
                              min="0" 
                              max="950" 
                              step="5" 
                              value={comp.y} 
                              onChange={(e) => handleCompChange('y', parseInt(e.target.value))} 
                              disabled={isLocked}
                            />
                          </div>
                        )}

                        {comp.width !== undefined && (
                          <div className="control-group">
                            <span className="control-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Width Size</span>
                              <strong>{comp.width}px</strong>
                            </span>
                            <input 
                              type="range" 
                              className="slider" 
                              min="10" 
                              max="600" 
                              step="5" 
                              value={comp.width} 
                              onChange={(e) => handleCompChange('width', parseInt(e.target.value))} 
                            />
                          </div>
                        )}

                        {comp.height !== undefined && (
                          <div className="control-group">
                            <span className="control-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Height Size</span>
                              <strong>{comp.height}px</strong>
                            </span>
                            <input 
                              type="range" 
                              className="slider" 
                              min="10" 
                              max="950" 
                              step="5" 
                              value={comp.height} 
                              onChange={(e) => handleCompChange('height', parseInt(e.target.value))} 
                            />
                          </div>
                        )}

                        {comp.size !== undefined && (
                          <div className="control-group">
                            <span className="control-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Element Box Size</span>
                              <strong>{comp.size}px</strong>
                            </span>
                            <input 
                              type="range" 
                              className="slider" 
                              min="10" 
                              max="300" 
                              step="2" 
                              value={comp.size} 
                              onChange={(e) => handleCompChange('size', parseInt(e.target.value))} 
                            />
                          </div>
                        )}

                        {comp.fontSize !== undefined && (
                          <div className="control-group">
                            <span className="control-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Text Font Size</span>
                              <strong>{comp.fontSize}px</strong>
                            </span>
                            <input 
                              type="range" 
                              className="slider" 
                              min="6" 
                              max="72" 
                              step="1" 
                              value={comp.fontSize} 
                              onChange={(e) => handleCompChange('fontSize', parseInt(e.target.value))} 
                            />
                          </div>
                        )}

                        {comp.opacity !== undefined && (
                          <div className="control-group">
                            <span className="control-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Opacity Layer</span>
                              <strong>{Math.round(comp.opacity * 100)}%</strong>
                            </span>
                            <input 
                              type="range" 
                              className="slider" 
                              min="0" 
                              max="1" 
                              step="0.05" 
                              value={comp.opacity} 
                              onChange={(e) => handleCompChange('opacity', parseFloat(e.target.value))} 
                            />
                          </div>
                        )}

                        {comp.color !== undefined && (
                          <div className="control-group">
                            <span className="control-label">Accent Theme Color</span>
                            <input 
                              type="color" 
                              className="text-input" 
                              style={{ height: '36px', padding: '4px' }} 
                              value={comp.color} 
                              onChange={(e) => handleCompChange('color', e.target.value)} 
                            />
                          </div>
                        )}
                      </div>
                    );
                  })() : (
                    <div style={{ padding: '24px 12px', textAlign: 'center', background: 'rgba(0,0,0,0.02)', border: '1px dashed var(--border-color)', borderRadius: '8px', marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Select a component layer above to access position coordinates, font sizes, opacity, and color controls.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: LANYARD */}
              {activeTab === 'Lanyard' && (
                <div>
                  <h3 className="pane-section-title">Strap Settings</h3>
                  <div className="control-group">
                    <span className="control-label">Strap Text</span>
                    <input type="text" className="text-input" value={strapText} onChange={(e) => setStrapText(e.target.value)} />
                  </div>

                  <div className="control-group-row">
                    <div className="control-group flex-1">
                      <span className="control-label">Fabric weave</span>
                      <select className="text-input" value={strapStyle} onChange={(e) => setStrapStyle(e.target.value)}>
                        <option value="Nylon">Standard Nylon</option>
                        <option value="Woven">Traditional Woven</option>
                        <option value="Polyester">Mesh Polyester</option>
                        <option value="Reflective">Metallic Reflective</option>
                      </select>
                    </div>
                    <div className="control-group flex-1">
                      <span className="control-label">Strap Width</span>
                      <input type="range" className="slider" min="0.5" max="2.0" step="0.1" value={lanyardWidth} onChange={(e) => setLanyardWidth(parseFloat(e.target.value))} />
                    </div>
                  </div>

                  <div className="control-group-row" style={{ gap: '8px' }}>
                    <div className="control-group flex-1">
                      <span className="control-label">Strap Base Color</span>
                      <input type="color" className="text-input" style={{ height: '38px', padding: '4px' }} value={strapColor} onChange={(e) => setStrapColor(e.target.value)} />
                    </div>
                    <div className="control-group flex-1">
                      <span className="control-label">Strap Text Font Size ({strapFontSize}px)</span>
                      <input type="range" className="slider" min="14" max="48" step="1" value={strapFontSize} onChange={(e) => setStrapFontSize(parseInt(e.target.value))} />
                    </div>
                  </div>

                  <h3 className="pane-section-title">Card Holder sleeve</h3>
                  <div className="control-group-row">
                    <div className="control-group flex-1">
                      <span className="control-label">Sleeve Frame</span>
                      <select className="text-input" value={holderType} onChange={(e) => setHolderType(e.target.value)}>
                        <option value="None">Bare Card (No Holder)</option>
                        <option value="Transparent">Transparent Case</option>
                        <option value="Matte">Matte Acrylic Holder</option>
                        <option value="Hard Plastic">Hard Molded Plastic</option>
                        <option value="Leather">Premium Leather Frame</option>
                        <option value="Metal Frame">Polished Aluminum Frame</option>
                      </select>
                    </div>
                    <div className="control-group flex-1">
                      <span className="control-label">Frame Color</span>
                      <input type="color" className="text-input" style={{ height: '38px', padding: '4px' }} value={holderColor} onChange={(e) => setHolderColor(e.target.value)} />
                    </div>
                  </div>

                  <h3 className="pane-section-title">Scene & Physics</h3>
                  <div className="control-group">
                    <span className="control-label">Interaction Style</span>
                    <select className="text-input" value={physicsPreset} onChange={(e) => setPhysicsPreset(e.target.value)}>
                      <option value="Calm">Calm (Steady & Slow)</option>
                      <option value="Natural">Natural (Earth Physics)</option>
                      <option value="Dynamic">Dynamic (Bouncy & Reactive)</option>
                      <option value="Floating">Floating (Weightless Space)</option>
                      <option value="Heavy">Heavy (Rapid Fall)</option>
                    </select>
                  </div>

                  <div className="control-group">
                    <span className="control-label">Lighting Environment</span>
                    <select className="text-input" value={lightingPreset} onChange={(e) => setLightingPreset(e.target.value)}>
                      <option value="Studio">Studio Softbox</option>
                      <option value="Golden Hour">Golden Hour Sun</option>
                      <option value="Natural">Direct Sunlight</option>
                      <option value="Office">Florescent Ceiling</option>
                      <option value="Night">Moody Lowlight</option>
                    </select>
                  </div>

                  <div className="control-group">
                    <span className="control-label">Studio Background Environment</span>
                    <select className="text-input" value={backgroundStyle} onChange={(e) => setBackgroundStyle(e.target.value)}>
                      <option value="Glass Studio">Glass Studio (Light Slate)</option>
                      <option value="University Lobby">University Lobby (Warm Amber)</option>
                      <option value="Auditorium">Auditorium Backdrop (Indigo)</option>
                      <option value="Library">Library Study Room (Warm White)</option>
                      <option value="Innovation Lab">Tech Innovation Lab (Obsidian)</option>
                      <option value="Minimal White">Minimalist Photographic (White)</option>
                      <option value="Gradient Studio">Gradient Studio (Sky Blue)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 4: EXPORT */}
              {activeTab === 'Export' && (
                <div>
                  <h3 className="pane-section-title">Download Options</h3>
                  <div className="control-group">
                    <span className="control-label">Export Filename</span>
                    <input 
                      type="text" 
                      className="text-input" 
                      value={exportFilename} 
                      onChange={(e) => setExportFilename(e.target.value)} 
                    />
                  </div>

                  <div className="control-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="btn-primary" style={{ width: '100%', padding: '12px 0', fontWeight: 'bold' }} onClick={handleExportGLB}>
                      ✦ Export 3D Card (GLB)
                    </button>
                    <button className="btn-secondary" style={{ width: '100%', padding: '12px 0', fontWeight: 'bold' }} onClick={handleDownloadSnapshot}>
                      📸 Download Snapshot Image
                    </button>
                  </div>

                  <h3 className="pane-section-title">Face Overlays (Overrides Design)</h3>
                  <div className="control-group">
                    <span className="control-label">Card Front Face Image</span>
                    {customFrontImage ? (
                      <div className="custom-image-preview-box">
                        <img src={customFrontImage} alt="Custom Front Preview" className="custom-image-preview-thumbnail" />
                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', width: 'auto' }} onClick={() => {
                          setCustomFrontImage(null);
                          setConfig(prev => ({ ...prev, customFrontImageObj: null, customFrontImageName: '' }));
                        }}>
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer', padding: '10px 0' }}>
                        Upload Front Face Image
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setCustomFrontImage(url);
                            const img = new Image();
                            img.crossOrigin = 'anonymous';
                            img.src = url;
                            img.onload = () => {
                              setConfig(prev => ({ ...prev, customFrontImageObj: img, customFrontImageName: file.name, useUploadedOnly: true }));
                              showNotification('Custom front background loaded. Bypassing templates.');
                            };
                          }
                        }} />
                      </label>
                    )}
                  </div>

                  <div className="control-group">
                    <span className="control-label">Card Back Face Image</span>
                    {customBackImage ? (
                      <div className="custom-image-preview-box">
                        <img src={customBackImage} alt="Custom Back Preview" className="custom-image-preview-thumbnail" />
                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', width: 'auto' }} onClick={() => {
                          setCustomBackImage(null);
                          setConfig(prev => ({ ...prev, customBackImageObj: null, customBackImageName: '' }));
                        }}>
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer', padding: '10px 0' }}>
                        Upload Back Face Image
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setCustomBackImage(url);
                            const img = new Image();
                            img.crossOrigin = 'anonymous';
                            img.src = url;
                            img.onload = () => {
                              setConfig(prev => ({ ...prev, customBackImageObj: img, customBackImageName: file.name, useUploadedOnly: true }));
                              showNotification('Custom back background loaded. Bypassing templates.');
                            };
                          }
                        }} />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </main>
      )}

      <CropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        onApply={handleApplyCrop}
        onClose={() => setCropModalOpen(false)}
        title={cropTarget === 'logo' ? 'Warp Brand Logo Bounds' : 'Crop Portrait Avatar'}
      />
    </div>
  );
}
