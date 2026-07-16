import { useEffect, useRef, useState } from 'react';
import { perspectiveWarp } from '../../utils/homography';
import './CropModal.css';

export default function CropModal({ isOpen, imageSrc, onApply, onClose, title = 'Crop Card Face' }) {
  const containerRef = useRef(null);
  const imageCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [pins, setPins] = useState([
    { x: 0.1, y: 0.1 }, // Top-Left
    { x: 0.9, y: 0.1 }, // Top-Right
    { x: 0.9, y: 0.9 }, // Bottom-Right
    { x: 0.1, y: 0.9 }  // Bottom-Left
  ]);
  const [draggingPin, setDraggingPin] = useState(null);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0
  });

  const imageRef = useRef(null);

  // Load image
  useEffect(() => {
    if (!imageSrc || !isOpen) {
      setImageLoaded(false);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      setImageSize({ w: img.width, h: img.height });
      setImageLoaded(true);
      // Reset pins to default relative positions
      setPins([
        { x: 0.15, y: 0.15 },
        { x: 0.85, y: 0.15 },
        { x: 0.85, y: 0.85 },
        { x: 0.15, y: 0.85 }
      ]);
      setFilters({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        grayscale: 0
      });
    };
  }, [imageSrc, isOpen]);

  // Adjust display canvas size on container layout
  useEffect(() => {
    if (!imageLoaded || !imageCanvasRef.current) return;
    const canvas = imageCanvasRef.current;
    
    // Fit canvas in modal view
    const maxWidth = Math.min(window.innerWidth * 0.5, 600);
    const maxHeight = Math.min(window.innerHeight * 0.6, 450);
    
    let w = imageSize.w;
    let h = imageSize.h;
    
    const scale = Math.min(maxWidth / w, maxHeight / h);
    w = w * scale;
    h = h * scale;
    
    canvas.width = w;
    canvas.height = h;
    setDisplaySize({ w, h });
  }, [imageLoaded, imageSize]);

  // Redraw original canvas & pins + Live Warp Preview
  useEffect(() => {
    if (!imageLoaded || !displaySize.w || !imageCanvasRef.current || !previewCanvasRef.current) return;
    
    const canvas = imageCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    // 1. Draw original image on main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // 2. Draw crop polygon lines
    const getPixelCoords = (relPin) => ({
      x: relPin.x * canvas.width,
      y: relPin.y * canvas.height
    });
    
    const pCoords = pins.map(getPixelCoords);
    
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(0, 229, 255, 0.4)';
    ctx.shadowBlur = 8;
    
    ctx.beginPath();
    ctx.moveTo(pCoords[0].x, pCoords[0].y);
    for (let i = 1; i < 4; i++) {
      ctx.lineTo(pCoords[i].x, pCoords[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Fill slightly transparent overlay outside crop area (visual focus)
    // We can do this by using destination-out/xor or drawing a simple path
    
    // 3. Draw pins
    pins.forEach((pin, index) => {
      const coord = pCoords[index];
      const isHovered = draggingPin === index;
      
      // Pin Outer Glow
      ctx.fillStyle = isHovered ? 'rgba(0, 229, 255, 0.4)' : 'rgba(0, 229, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, isHovered ? 14 : 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Pin Core
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#007a87';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Draw number labels for clarity
      ctx.fillStyle = '#00e5ff';
      ctx.font = '9px monospace';
      ctx.fillText((index + 1).toString(), coord.x - 3, coord.y - 12);
    });

    // 4. Update the live preview warped canvas
    const pCanvas = previewCanvasRef.current;
    
    // Source coordinates in the original image coordinates
    const srcCorners = pins.map(p => ({
      x: p.x * img.width,
      y: p.y * img.height
    }));
    
    // Apply filters to original image on a hidden temp canvas before warping
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) grayscale(${filters.grayscale}%)`;
    tempCtx.drawImage(img, 0, 0);
    
    // Warped preview
    perspectiveWarp(tempCanvas, pCanvas, srcCorners);

  }, [imageLoaded, displaySize, pins, draggingPin, filters]);

  // Handlers for mouse/touch events to drag pins
  const getMousePos = (e) => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Support touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: (clientX - rect.left) / rect.width, // Relative 0 to 1
      y: (clientY - rect.top) / rect.height
    };
  };

  const handleStart = (e) => {
    if (!imageLoaded) return;
    const pos = getMousePos(e);
    
    // Find closest pin within tolerance (distance in 0..1 scale)
    let closestIdx = -1;
    let minDistance = 0.05; // ~5% canvas size tolerance
    
    pins.forEach((pin, idx) => {
      const dist = Math.hypot(pin.x - pos.x, pin.y - pos.y);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });
    
    if (closestIdx !== -1) {
      setDraggingPin(closestIdx);
      if (e.cancelable) e.preventDefault();
    }
  };

  const handleMove = (e) => {
    if (draggingPin === null) return;
    const pos = getMousePos(e);
    
    // Clamp to 0..1 boundary
    const clampedPos = {
      x: Math.max(0, Math.min(1, pos.x)),
      y: Math.max(0, Math.min(1, pos.y))
    };
    
    setPins(prev => {
      const copy = [...prev];
      copy[draggingPin] = clampedPos;
      return copy;
    });
  };

  const handleEnd = () => {
    setDraggingPin(null);
  };

  const handleResetWarp = () => {
    setPins([
      { x: 0.15, y: 0.15 },
      { x: 0.85, y: 0.15 },
      { x: 0.85, y: 0.85 },
      { x: 0.15, y: 0.85 }
    ]);
  };

  const handleAutoFit = () => {
    // Detect standard bounding box inside image for quick auto fit
    setPins([
      { x: 0.08, y: 0.08 },
      { x: 0.92, y: 0.08 },
      { x: 0.92, y: 0.92 },
      { x: 0.08, y: 0.92 }
    ]);
  };

  const handleApply = () => {
    if (!previewCanvasRef.current) return;
    const dataUrl = previewCanvasRef.current.toDataURL('image/png');
    onApply(dataUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-container">
        <div className="crop-modal-header">
          <h2>{title}</h2>
          <button className="close-x" onClick={onClose}>&times;</button>
        </div>

        <div className="crop-modal-body">
          {/* Main Edit Column */}
          <div className="edit-pane">
            <p className="crop-instruction">
              Drag the 4 turquoise corner pins to align with the corners of your ID card.
            </p>
            
            <div 
              className="canvas-viewport"
              ref={containerRef}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
            >
              {!imageLoaded && <div className="loader">Loading image...</div>}
              <canvas 
                ref={imageCanvasRef} 
                className="cropping-canvas"
                style={{ display: imageLoaded ? 'block' : 'none' }}
              />
            </div>
            
            <div className="edit-controls-row">
              <button className="btn-secondary" onClick={handleResetWarp}>
                Reset to Square
              </button>
              <button className="btn-secondary" onClick={handleAutoFit}>
                Full Frame
              </button>
            </div>
          </div>

          {/* Sidebar Filters & Preview */}
          <div className="preview-pane">
            <h3 className="pane-section-title">Warp Preview</h3>
            
            <div className="warped-preview-container">
              {/* Output size of ID Card layout: 600 width x 950 height (standard ID aspect ratio) */}
              <canvas 
                ref={previewCanvasRef} 
                width={600} 
                height={950}
                className="warped-preview-canvas"
              />
            </div>

            <h3 className="pane-section-title">Image Enhancement</h3>
            
            <div className="filter-sliders">
              <div className="filter-group">
                <div className="filter-info">
                  <span>Brightness</span>
                  <span>{filters.brightness}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="200" 
                  value={filters.brightness} 
                  onChange={e => setFilters(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                  className="slider"
                />
              </div>

              <div className="filter-group">
                <div className="filter-info">
                  <span>Contrast</span>
                  <span>{filters.contrast}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="200" 
                  value={filters.contrast} 
                  onChange={e => setFilters(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                  className="slider"
                />
              </div>

              <div className="filter-group">
                <div className="filter-info">
                  <span>Saturation</span>
                  <span>{filters.saturation}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  value={filters.saturation} 
                  onChange={e => setFilters(prev => ({ ...prev, saturation: parseInt(e.target.value) }))}
                  className="slider"
                />
              </div>

              <div className="filter-group">
                <div className="filter-info">
                  <span>Grayscale</span>
                  <span>{filters.grayscale}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={filters.grayscale} 
                  onChange={e => setFilters(prev => ({ ...prev, grayscale: parseInt(e.target.value) }))}
                  className="slider"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="crop-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleApply} disabled={!imageLoaded}>
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
