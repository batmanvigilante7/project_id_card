/**
 * Campus Identity Studio v2.0 - Card Designer Utility
 * Renders high-fidelity, customized canvas textures for 3D card faces.
 */

export const DEFAULT_COMPONENTS = [
  { id: 'background', type: 'background', label: 'Card Background', visible: true, locked: true },
  { id: 'watermark', type: 'watermark', label: 'Security Watermark', x: 300, y: 475, visible: true, locked: true },
  { id: 'logo', type: 'logo', label: 'Institution Logo', x: 255, y: 40, width: 90, height: 50, visible: true, locked: true },
  { id: 'schoolName', type: 'text', label: 'Institution Title', x: 300, y: 130, textKey: 'schoolName', fontType: 'heading', fontSize: 24, fontWeight: 'bold', color: '#0f172a', align: 'center', visible: true, locked: true },
  { id: 'department', type: 'text', label: 'Department & Campus', x: 300, y: 152, textKey: 'department', fontType: 'body', fontSize: 13, color: '#64748b', align: 'center', visible: true, locked: true },
  { id: 'accreditation', type: 'accreditation', label: 'Accreditation Badge', x: 300, y: 176, width: 120, height: 16, visible: true, locked: true },
  { id: 'avatar', type: 'avatar', label: 'Profile Photo', x: 205, y: 230, width: 190, height: 215, visible: true, locked: false },
  { id: 'microchip', type: 'microchip', label: 'Microchip Contact', x: 510, y: 190, size: 36, visible: true, locked: true },
  { id: 'studentName', type: 'text', label: 'Student Full Name', x: 300, y: 475, textKey: 'name', fontType: 'heading', fontSize: 28, fontWeight: 'bold', color: '#0f172a', align: 'center', visible: true, locked: false },
  { id: 'role', type: 'role', label: 'Role Pill', x: 300, y: 487, width: 140, height: 26, visible: true, locked: false },
  { id: 'rollNumber', type: 'metadata', label: 'Roll Number Field', x: 40, y: 554, labelText: 'ROLL NO', textKey: 'rollNumber', visible: true, locked: false },
  { id: 'programme', type: 'metadata', label: 'Programme Field', x: 40, y: 588, labelText: 'PROGRAMME', textKey: 'programme', visible: true, locked: false },
  { id: 'bloodGroup', type: 'metadata', label: 'Blood Group Field', x: 40, y: 622, labelText: 'BLOOD GR', textKey: 'bloodGroup', visible: true, locked: false },
  { id: 'barcode', type: 'barcode', label: '1D Barcode', x: 40, y: 860, width: 520, height: 36, visible: true, locked: false },
  { id: 'qr', type: 'qr', label: 'Smart QR Code', x: 255, y: 830, size: 90, visible: false, locked: false },
  { id: 'hologram', type: 'hologram', label: 'Hologram Overlay', visible: true, locked: true }
];

// Preset definitions for various institutions
export const INSTITUTION_PRESETS = {
  gitam: {
    id: 'gitam',
    name: 'GITAM University',
    schoolName: 'School of Technology',
    campus: 'Visakhapatnam',
    accreditation: 'NAAC A++',
    academicYear: '2025–2029',
    themeColor: '#007a87',
    secondaryColor: '#f59e0b',
    fontHeading: 'Outfit',
    fontBody: 'Outfit',
    logoText: 'GITAM',
    website: 'https://www.gitam.edu/'
  },
  custom: {
    id: 'custom',
    name: 'Custom Institution',
    schoolName: 'Custom Department',
    campus: 'Main Campus',
    accreditation: 'Official Pass',
    academicYear: '2026–2027',
    themeColor: '#2563eb',
    secondaryColor: '#f43f5e',
    fontHeading: 'Inter',
    fontBody: 'Inter',
    logoText: 'LOGO',
    website: 'https://yoursite.com/'
  }
};


/**
 * Draws a professional 1D barcode on a canvas context.
 */
function drawBarcode(ctx, text, x, y, width, height, type = 'Code128', color = '#000000') {
  ctx.save();
  ctx.fillStyle = color;
  
  const hashString = text + type;
  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    hash = hashString.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const seed = Math.abs(hash);
  let currentX = x;
  const padding = 10;
  const barcodeW = width - (padding * 2);
  
  if (type === 'EAN13') {
    // Draw EAN13 specific look (longer guard bars on left, center, right)
    let i = 0;
    while (currentX < x + padding + barcodeW) {
      const isGuard = (i === 0 || i === 1 || i === 20 || i === 21 || i === 40 || i === 41);
      const barH = isGuard ? height + 6 : height;
      const barWidth = ((seed >> (i % 24)) & 2) + 1; // 1 to 3px
      const gapWidth = ((seed >> ((i + 5) % 24)) & 2) + 2; // 2 to 4px
      
      ctx.fillRect(currentX, y, barWidth, barH);
      currentX += barWidth + gapWidth;
      i++;
    }
  } else {
    // Standard Code128 simulated look
    let i = 0;
    while (currentX < x + padding + barcodeW) {
      const barWidth = ((seed >> (i % 24)) & 3) + 1; // 1 to 4 pixels
      const gapWidth = ((seed >> ((i + 3) % 24)) & 3) + 2; // 2 to 5 pixels
      
      ctx.fillRect(currentX, y, barWidth, height);
      currentX += barWidth + gapWidth;
      i++;
    }
  }
  
  // Text below
  ctx.fillStyle = color;
  ctx.font = '600 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, x + width / 2, y + height + 14);
  ctx.restore();
}

/**
 * Draws a metallic microchip contact plate.
 */
function drawMicrochip(ctx, x, y, size = 60, style = 'Gold', themeColor = '#007a87') {
  ctx.save();
  const grad = ctx.createLinearGradient(x, y, x + size, y + size);
  
  if (style === 'Silver') {
    grad.addColorStop(0, '#f1f5f9');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(1, '#64748b');
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.8)';
  } else if (style === 'Copper') {
    grad.addColorStop(0, '#ffedd5');
    grad.addColorStop(0.5, '#ea580c');
    grad.addColorStop(1, '#7c2d12');
    ctx.strokeStyle = 'rgba(124, 45, 18, 0.8)';
  } else if (style === 'Neon') {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, themeColor);
    grad.addColorStop(1, '#0f172a');
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
  } else {
    // Gold (default)
    grad.addColorStop(0, '#fde047');
    grad.addColorStop(0.5, '#eab308');
    grad.addColorStop(1, '#a16207');
    ctx.strokeStyle = 'rgba(161, 98, 7, 0.8)';
  }
  
  ctx.fillStyle = grad;
  ctx.lineWidth = 1.5;
  
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 6);
  ctx.fill();
  ctx.stroke();
  
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.3, y);
  ctx.lineTo(x + size * 0.3, y + size);
  ctx.moveTo(x + size * 0.7, y);
  ctx.lineTo(x + size * 0.7, y + size);
  ctx.moveTo(x, y + size * 0.5);
  ctx.lineTo(x + size, y + size * 0.5);
  
  ctx.moveTo(x + size * 0.3, y + size * 0.25);
  ctx.lineTo(x + size * 0.7, y + size * 0.25);
  ctx.moveTo(x + size * 0.3, y + size * 0.75);
  ctx.lineTo(x + size * 0.7, y + size * 0.75);
  ctx.stroke();
  
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.roundRect(x + size * 0.36, y + size * 0.32, size * 0.28, size * 0.36, 3);
  ctx.fill();
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Draws a dynamic simulated QR code grid based on text hash.
 */
function drawQRCode(ctx, text, qx, qy, size, darkColor = '#000000', lightColor = '#ffffff') {
  ctx.save();
  ctx.fillStyle = lightColor;
  ctx.beginPath();
  ctx.roundRect(qx, qy, size, size, 8);
  ctx.fill();
  
  ctx.fillStyle = darkColor;
  
  // 3 locator squares
  const drawLoc = (lx, ly) => {
    ctx.fillRect(lx, ly, 28, 28);
    ctx.fillStyle = lightColor;
    ctx.fillRect(lx + 4, ly + 4, 20, 20);
    ctx.fillStyle = darkColor;
    ctx.fillRect(lx + 8, ly + 8, 12, 12);
  };
  
  drawLoc(qx + 5, qy + 5);
  drawLoc(qx + size - 33, qy + 5);
  drawLoc(qx + 5, qy + size - 33);
  
  // Draw randomized grid blocks based on content hash
  const hashVal = text.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const blockS = 5;
  const offset = 5;
  const blocks = Math.floor((size - (offset * 2)) / blockS);
  
  for (let r = 0; r < blocks; r++) {
    for (let c = 0; c < blocks; c++) {
      // Skip locator square zones (approx 6x6 blocks at corners)
      if ((r < 7 && c < 7) || (r < 7 && c >= blocks - 7) || (r >= blocks - 7 && c < 7)) {
        continue;
      }
      const val = (r * 11 + c * 17 + hashVal) % 6;
      if (val === 0 || val === 2 || val === 3) {
        ctx.fillRect(qx + offset + c * blockS, qy + offset + r * blockS, blockS, blockS);
      }
    }
  }
  
  ctx.restore();
}

/**
 * Draws a subtle dynamic hologram/foil pattern.
 */
function drawHologramFoil(ctx, W, H, hoverOffset = 0, style = 'Foil') {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  
  const angle = (45 + hoverOffset * 60) * Math.PI / 180;
  const x0 = W / 2 - Math.cos(angle) * (W / 2);
  const y0 = H / 2 - Math.sin(angle) * (H / 2);
  const x1 = W / 2 + Math.cos(angle) * (W / 2);
  const y1 = H / 2 + Math.sin(angle) * (H / 2);
  
  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  
  if (style === 'Rainbow') {
    ctx.globalAlpha = 0.22;
    grad.addColorStop(0, 'rgba(255, 0, 0, 0.4)');
    grad.addColorStop(0.2, 'rgba(255, 165, 0, 0.4)');
    grad.addColorStop(0.4, 'rgba(255, 255, 0, 0.4)');
    grad.addColorStop(0.6, 'rgba(0, 128, 0, 0.4)');
    grad.addColorStop(0.8, 'rgba(0, 0, 255, 0.4)');
    grad.addColorStop(1, 'rgba(128, 0, 128, 0.4)');
  } else if (style === 'UV Pattern') {
    ctx.globalAlpha = 0.15;
    grad.addColorStop(0, 'rgba(224, 231, 255, 0)');
    grad.addColorStop(0.5, 'rgba(165, 180, 252, 0.8)');
    grad.addColorStop(1, 'rgba(224, 231, 255, 0)');
    
    // Draw repeating UV badge seal
    ctx.fillStyle = grad;
    ctx.font = '900 12px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    for (let y = 100; y < H; y += 150) {
      for (let x = 50; x < W; x += 150) {
        ctx.fillText('SECURE ACCESS', x, y);
      }
    }
  } else if (style === 'Security Strip') {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(W - 80, 0, 30, H);
    
    // Holographic metal vertical strip
    const stripG = ctx.createLinearGradient(W - 80, 0, W - 50, 0);
    stripG.addColorStop(0, 'rgba(200, 200, 200, 0.4)');
    stripG.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    stripG.addColorStop(1, 'rgba(150, 150, 150, 0.4)');
    ctx.fillStyle = stripG;
    ctx.fillRect(W - 80, 0, 30, H);
    
    ctx.restore();
    return;
  } else {
    // Foil (Default) - subtle silvery rainbow shift
    ctx.globalAlpha = 0.18;
    grad.addColorStop(0, 'rgba(255,255,255,0.15)');
    grad.addColorStop(0.25, 'rgba(0,229,255,0.25)');
    grad.addColorStop(0.5, 'rgba(235,0,255,0.25)');
    grad.addColorStop(0.75, 'rgba(255,229,0,0.25)');
  }
  
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}


/**
 * Main draw function for ID Card Front face.
 * Iterates through customizable component layers and renders layout dynamically.
 */
export function drawCardFront(canvas, config, hoverOffset = 0) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Use custom uploaded front face image only if specified
  if (config.useUploadedOnly && config.customFrontImageObj) {
    ctx.drawImage(config.customFrontImageObj, 0, 0, W, H);
    if (config.cardBorder) {
      ctx.save();
      ctx.strokeStyle = config.cardBorderColor || config.themeColor || '#007a87';
      ctx.lineWidth = config.cardBorderWidth || 4;
      ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
      ctx.restore();
    }
    return;
  }

  const preset = INSTITUTION_PRESETS[config.preset || 'gitam'];
  
  if (config.preset === 'gitam') {
    // 1. Draw solid white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // 2. Draw Left and Right Side Wave Ellipses (Gradually fade from Light Blue to Deep Blue)
    const waveGrad = ctx.createLinearGradient(0, 150, 0, 400);
    waveGrad.addColorStop(0, '#0282c3');
    waveGrad.addColorStop(1, '#00519c');
    
    // Left side wave
    ctx.save();
    ctx.fillStyle = waveGrad;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.ellipse(0, 275, 60, 180, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right side wave
    ctx.save();
    ctx.fillStyle = waveGrad;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.ellipse(W, 310, 75, 165, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Draw Header Section (GITAM Pinwheel logo + Text)
    // Draw Pinwheel Logo
    ctx.save();
    const logoX = 135;
    const logoY = 60;
    const logoSize = 65;
    
    ctx.fillStyle = '#00519c';
    
    // Leaf 1 (Top)
    ctx.beginPath();
    ctx.moveTo(logoX + logoSize/2, logoY);
    ctx.bezierCurveTo(logoX + logoSize*0.6, logoY + logoSize*0.15, logoX + logoSize*0.65, logoY + logoSize*0.3, logoX + logoSize/2, logoY + logoSize/2);
    ctx.bezierCurveTo(logoX + logoSize*0.35, logoY + logoSize*0.3, logoX + logoSize*0.4, logoY + logoSize*0.15, logoX + logoSize/2, logoY);
    ctx.closePath();
    ctx.fill();

    // Leaf 2 (Right)
    ctx.beginPath();
    ctx.moveTo(logoX + logoSize, logoY + logoSize/2);
    ctx.bezierCurveTo(logoX + logoSize*0.85, logoY + logoSize*0.6, logoX + logoSize*0.7, logoY + logoSize*0.65, logoX + logoSize/2, logoY + logoSize/2);
    ctx.bezierCurveTo(logoX + logoSize*0.7, logoY + logoSize*0.35, logoX + logoSize*0.85, logoY + logoSize*0.4, logoX + logoSize, logoY + logoSize/2);
    ctx.closePath();
    ctx.fill();

    // Leaf 3 (Bottom)
    ctx.beginPath();
    ctx.moveTo(logoX + logoSize/2, logoY + logoSize);
    ctx.bezierCurveTo(logoX + logoSize*0.4, logoY + logoSize*0.85, logoX + logoSize*0.35, logoY + logoSize*0.7, logoX + logoSize/2, logoY + logoSize/2);
    ctx.bezierCurveTo(logoX + logoSize*0.65, logoY + logoSize*0.7, logoX + logoSize*0.6, logoY + logoSize*0.85, logoX + logoSize/2, logoY + logoSize);
    ctx.closePath();
    ctx.fill();

    // Leaf 4 (Left)
    ctx.beginPath();
    ctx.moveTo(logoX, logoY + logoSize/2);
    ctx.bezierCurveTo(logoX + logoSize*0.15, logoY + logoSize*0.4, logoX + logoSize*0.3, logoY + logoSize*0.35, logoX + logoSize/2, logoY + logoSize/2);
    ctx.bezierCurveTo(logoX + logoSize*0.3, logoY + logoSize*0.65, logoX + logoSize*0.15, logoY + logoSize*0.6, logoX, logoY + logoSize/2);
    ctx.closePath();
    ctx.fill();

    // Center white dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(logoX + logoSize/2, logoY + logoSize/2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Brand Text
    ctx.save();
    ctx.fillStyle = '#00519c';
    ctx.font = 'bold 36px "Montserrat", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('GITAM', logoX + logoSize + 15, logoY + 22);

    ctx.fillStyle = '#002d58';
    ctx.font = '800 10px "Montserrat", sans-serif';
    ctx.fillText('DEEMED TO BE UNIVERSITY', logoX + logoSize + 17, logoY + 47);
    ctx.restore();

    // 4. Draw Avatar Slot (Center, y=270, radius=115)
    ctx.save();
    const cx = W / 2;
    const cy = 270;
    const r = 115;
    
    // Outer white frame
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.stroke();

    // Clip to circle
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    if (config.avatarImage) {
      const img = config.avatarImage;
      const scale = Math.max((r*2) / img.width, (r*2) / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, cx - dw/2, cy - dh/2, dw, dh);
    } else {
      // Placeholder silhouette
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(cx - r, cy - r, r*2, r*2);
      
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(cx, cy - r * 0.1, r * 0.46, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.45, r * 0.8, Math.PI, 0);
      ctx.fill();
    }
    ctx.restore();

    // 5. Solid Brand Blue Wave Base Container
    ctx.save();
    ctx.fillStyle = config.themeColor || '#00519c';
    ctx.beginPath();
    ctx.roundRect(0, 480, W, H - 480 + 100, [120, 120, 0, 0]);
    ctx.fill();
    ctx.restore();

    // 6. Student Profile Details inside Blue Area (centered)
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    // Student Name
    ctx.font = 'bold 28px "Montserrat", sans-serif';
    ctx.fillText((config.name || 'GANDREDDY HEMANTH SAI').toUpperCase(), W / 2, 570);

    // Roll Number
    ctx.font = '700 21px "Montserrat", sans-serif';
    ctx.fillText(config.rollNumber || '2025422614', W / 2, 615);

    // Programme
    ctx.font = '600 16px "Montserrat", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText((config.programme || 'B.TECH. CSE (2025-2029)').toUpperCase(), W / 2, 660);

    // School/College (Department)
    ctx.font = '500 16px "Montserrat", sans-serif';
    ctx.fillText(config.department || 'School of Technology', W / 2, 695);

    // Campus
    ctx.font = '500 16px "Montserrat", sans-serif';
    ctx.fillText(config.campus || 'Visakhapatnam', W / 2, 725);
    ctx.restore();

    // 7. Footer Contact Details & Signature
    ctx.save();
    
    // Email Address
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = 'bold 11px "Montserrat", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('EMAIL ID:', 50, H - 150);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 15px "Courier New", Courier, monospace';
    ctx.fillText(config.email || 'hganded@student.gitam.edu', 50, H - 125);

    // Registrar Signature
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 12px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Registrar', W - 120, H - 125);

    // Signature cursive text
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'italic 32px "Brush Script MT", cursive, sans-serif';
    ctx.fillText('B.riz.', W - 120, H - 155);
    ctx.restore();

    // 8. Draw Border if configured
    if (config.cardBorder) {
      ctx.save();
      ctx.strokeStyle = config.cardBorderColor || '#00519c';
      ctx.lineWidth = config.cardBorderWidth || 4;
      ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
      ctx.restore();
    }

    return;
  }

  const themeColor = config.themeColor || preset.themeColor;
  const schoolName = config.schoolName || preset.name;
  const deptName = config.department || preset.schoolName;
  const campusName = config.campus || preset.campus;
  const accreditationText = config.accreditation || preset.accreditation;
  
  const fontHead = config.fontHeading || preset.fontHeading;
  const fontB = config.fontBody || preset.fontBody;

  const isDark = config.themeStyle === 'Corporate Black';
  const textCol = isDark ? '#ffffff' : '#1e293b';

  // Check if schema components are present
  const components = config.components || DEFAULT_COMPONENTS;

  components.forEach(comp => {
    // If visibility toggle in legacy config exists, respect it, otherwise respect comp.visible
    let isVisible = comp.visible !== undefined ? comp.visible : true;
    if (config.visibleLayers && config.visibleLayers[comp.id] !== undefined) {
      isVisible = config.visibleLayers[comp.id];
    }
    
    // Additional visibility overrides for specific config toggles
    if (comp.id === 'rollNumber' && !config.fieldRoll) isVisible = false;
    if (comp.id === 'programme' && !config.fieldProg) isVisible = false;
    if (comp.id === 'bloodGroup' && !config.fieldBlood) isVisible = false;
    if (comp.id === 'accreditation' && !accreditationText) isVisible = false;
    
    // Respect active barcode type selection
    if (comp.id === 'barcode' && (config.barcodeType === 'None' || config.barcodeType === 'QR' || !config.barcodeType)) isVisible = false;
    if (comp.id === 'qr' && config.barcodeType !== 'QR') isVisible = false;
    if (comp.id === 'hologram' && (config.hologramStyle === 'None' || !config.hologramStyle)) isVisible = false;

    if (!isVisible) return;

    // Retrieve drawing dimensions and options
    const x = comp.x !== undefined ? comp.x : 0;
    const y = comp.y !== undefined ? comp.y : 0;
    const w = comp.width || 0;
    const h = comp.height || 0;
    const opacity = comp.opacity !== undefined ? comp.opacity : 1;

    switch (comp.type) {
      case 'background':
        if (config.customFrontImageObj) {
          ctx.drawImage(config.customFrontImageObj, 0, 0, W, H);
        } else if (config.themeStyle === 'Minimal White') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = 'rgba(226, 232, 240, 0.3)';
          ctx.fillRect(0, 0, 18, H); // side accent bar
          
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
          ctx.lineWidth = 2;
          ctx.strokeRect(1, 1, W - 2, H - 2);
        } else if (config.themeStyle === 'Corporate Black') {
          ctx.fillStyle = '#090b11';
          ctx.fillRect(0, 0, W, H);
          
          // Accent colored top bar
          ctx.fillStyle = themeColor;
          ctx.fillRect(0, 0, W, 14);
        } else if (config.themeStyle === 'Sunset') {
          const grad = ctx.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0, '#fffbeb');
          grad.addColorStop(0.5, '#fef3c7');
          grad.addColorStop(1, '#ffedd5');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
        } else {
          // Classic / default gradients
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, W, H);
          
          if (config.preset === 'gitam') {
            // Draw curved wave section at the bottom (GITAM Deep Blue)
            ctx.save();
            ctx.fillStyle = themeColor || '#00519c';
            ctx.beginPath();
            ctx.moveTo(0, H * 0.52);
            ctx.bezierCurveTo(W * 0.25, H * 0.46, W * 0.75, H * 0.46, W, H * 0.52);
            ctx.lineTo(W, H);
            ctx.lineTo(0, H);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          } else {
            // Draw gradient background
            const grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.65, '#f8fafc');
            grad.addColorStop(1, '#f1f5f9');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
            
            // Draw subtle corporate banner at top
            ctx.fillStyle = themeColor;
            ctx.fillRect(0, 0, W, 12);
          }
        }
        break;

      case 'watermark':
        ctx.save();
        ctx.globalAlpha = config.watermarkOpacity !== undefined ? config.watermarkOpacity : 0.035;
        ctx.fillStyle = themeColor;
        ctx.font = `bold 120px "${fontHead}", sans-serif`;
        ctx.textAlign = 'center';
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(config.watermarkText || preset.logoText, 0, 0);
        ctx.restore();
        break;

      case 'logo':
        ctx.save();
        ctx.globalAlpha = opacity;
        if (config.logoImage) {
          ctx.drawImage(config.logoImage, x, y, w, h);
        } else {
          // Draw simulated emblem/logo
          ctx.fillStyle = themeColor;
          ctx.beginPath();
          ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.round(Math.min(w, h) * 0.4)}px "${fontHead}", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(preset.logoText.charAt(0), x + w / 2, y + h / 2 + 1);
        }
        ctx.restore();
        break;

      case 'text':
        ctx.save();
        ctx.globalAlpha = opacity;
        
        let textVal = comp.text || '';
        if (comp.textKey) {
          if (comp.textKey === 'schoolName') textVal = schoolName.toUpperCase();
          else if (comp.textKey === 'department') textVal = `${deptName}  •  ${campusName}`;
          else if (comp.textKey === 'name') textVal = config.name || 'John Doe';
        }

        const fontType = comp.fontType === 'heading' ? fontHead : fontB;
        ctx.font = `${comp.fontWeight || 'normal'} ${comp.fontSize || 14}px "${fontType}", sans-serif`;
        
        let finalColor = comp.color || textCol || '#0f172a';
        if (config.preset === 'gitam' && y > H * 0.45 && !comp.color) {
          finalColor = '#ffffff';
        }
        ctx.fillStyle = finalColor;
        
        ctx.textAlign = comp.align || 'left';
        ctx.fillText(textVal, x, y);
        ctx.restore();
        break;

      case 'accreditation':
        if (accreditationText) {
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.font = `bold 9px "${fontB}", sans-serif`;
          const badgeWidth = ctx.measureText(accreditationText).width + 12;
          const bx = x - badgeWidth / 2; // Center alignment helper
          ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(bx, y, badgeWidth, h || 16, 4);
          ctx.fill();
          ctx.stroke();
          
          ctx.fillStyle = '#d97706';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(accreditationText, x, y + 8);
          ctx.restore();
        }
        break;

      case 'avatar':
        ctx.save();
        ctx.globalAlpha = opacity;
        
        if (config.preset === 'gitam') {
          const cx = x + w / 2;
          const cy = y + h / 2;
          const r = Math.min(w, h) / 2;

          // Outer frame/border
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
          ctx.stroke();

          // Clip to circle
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.clip();

          if (config.avatarImage) {
            const img = config.avatarImage;
            const scale = Math.max(w / img.width, h / img.height);
            const dw = img.width * scale;
            const dh = img.height * scale;
            const dx = x + (w - dw) / 2;
            const dy = y + (h - dh) / 2;
            ctx.drawImage(img, dx, dy, dw, dh);
          } else {
            // Placeholder silhouette
            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(x, y, w, h);
            
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.arc(cx, cy - h * 0.1, r * 0.46, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(cx, cy + h * 0.45, r * 0.8, Math.PI, 0);
            ctx.fill();
          }
        } else {
          // Standard rectangular rounded clip
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.roundRect(x - 2, y - 2, w + 4, h + 4, comp.borderRadius || 10);
          ctx.fill();
          
          ctx.shadowBlur = 0; // reset
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, comp.borderRadius || 10);
          ctx.clip();
          
          if (config.avatarImage) {
            const img = config.avatarImage;
            const scale = Math.max(w / img.width, h / img.height);
            const dw = img.width * scale;
            const dh = img.height * scale;
            const dx = x + (w - dw) / 2;
            const dy = y + (h - dh) / 2;
            ctx.drawImage(img, dx, dy, dw, dh);
          } else {
            // Placeholder silhouette
            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(x, y, w, h);
            
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.arc(x + w / 2, y + h * 0.4, w * 0.23, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x + w / 2, y + h * 0.95, w * 0.4, Math.PI, 0);
            ctx.fill();
          }
        }
        
        // Dynamic verification stamp overlay
        if (config.verificationBadge) {
          ctx.restore();
          ctx.save();
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(x + w - 10, y + h - 10, 14, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 15px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✓', x + w - 10, y + h - 10);
        }
        ctx.restore();
        break;

      case 'microchip':
        drawMicrochip(ctx, x, y, comp.size || 36, config.microchipStyle || 'Gold', themeColor);
        break;

      case 'role':
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.font = `bold 12px "${fontHead}", sans-serif`;
        const role = (config.role || 'Student').toUpperCase();
        const roleW = ctx.measureText(role).width + 24;
        const rx = x - roleW / 2;
        
        if (config.preset === 'gitam') {
          ctx.fillStyle = config.secondaryColor || '#f59e0b';
          ctx.beginPath();
          ctx.roundRect(rx, y, roleW, h || 26, (h || 26) / 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = themeColor;
          ctx.beginPath();
          ctx.roundRect(rx, y, roleW, h || 26, (h || 26) / 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(role, x, y + (h || 26) / 2);
        ctx.restore();
        break;

      case 'metadata':
        ctx.save();
        ctx.globalAlpha = opacity;
        
        let valText = '';
        if (comp.textKey) {
          valText = config[comp.textKey] || '';
        }
        if (comp.id === 'rollNumber' && config.fieldRoll) {
          valText = config.rollNumber;
        } else if (comp.id === 'programme' && config.fieldProg) {
          valText = config.programme;
        } else if (comp.id === 'bloodGroup' && config.fieldBlood) {
          valText = config.bloodGroup;
        }
        
        // Label
        let lColor = comp.labelColor || '#64748b';
        if (config.preset === 'gitam' && y > H * 0.45 && !comp.labelColor) {
          lColor = 'rgba(255, 255, 255, 0.7)';
        }
        ctx.fillStyle = lColor;
        ctx.font = `bold 10px "${fontB}", sans-serif`;
        ctx.fillText(comp.labelText || comp.id.toUpperCase(), x, y);
        
        // Value
        let vColor = comp.color || '#1e293b';
        if (config.preset === 'gitam' && y > H * 0.45 && !comp.color) {
          vColor = '#ffffff';
        }
        ctx.fillStyle = vColor;
        ctx.font = `600 13px "${fontB}", sans-serif`;
        ctx.fillText(valText, x, y + 14);
        ctx.restore();
        break;

      case 'barcode':
        if (config.barcodeType && config.barcodeType !== 'QR' && config.barcodeType !== 'None') {
          const codeVal = config.rollNumber || '2212345678';
          drawBarcode(ctx, codeVal, x, y, w, h, config.barcodeType, '#0f172a');
        }
        break;

      case 'qr':
        if (config.barcodeType === 'QR') {
          const qrVal = config.qrDestinationVal || preset.website;
          drawQRCode(ctx, qrVal, x, y, comp.size || 90, '#0f172a', '#ffffff');
        }
        break;

      case 'hologram':
        if (config.hologramStyle && config.hologramStyle !== 'None') {
          drawHologramFoil(ctx, W, H, hoverOffset, config.hologramStyle);
        }
        break;
    }
  });

  // Draw simulated signature and Registrar text for gitam preset at bottom
  if (config.preset === 'gitam' && !config.useUploadedOnly) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = `bold 10px "${fontB}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Registrar', W - 110, H - 210);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(W - 170, H - 240);
    ctx.bezierCurveTo(W - 150, H - 255, W - 140, H - 225, W - 120, H - 245);
    ctx.bezierCurveTo(W - 100, H - 260, W - 90, H - 220, W - 70, H - 235);
    ctx.stroke();
    ctx.restore();
  }

  // Card Border outline frame (drawn on top of all layers)
  if (config.cardBorder) {
    ctx.save();
    ctx.strokeStyle = config.cardBorderColor || themeColor;
    ctx.lineWidth = config.cardBorderWidth || 4;
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
    ctx.restore();
  }
}

/**
 * Main draw function for ID Card Back face.
 */
export function drawCardBack(canvas, config) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Use custom uploaded back face image only if specified
  if (config.useUploadedOnly && config.customBackImageObj) {
    ctx.drawImage(config.customBackImageObj, 0, 0, W, H);
    return;
  }

  const preset = INSTITUTION_PRESETS[config.preset || 'gitam'];
  const themeColor = config.themeColor || preset.themeColor;

  if (config.customBackImageObj) {
    ctx.drawImage(config.customBackImageObj, 0, 0, W, H);
    
    // Draw dynamic verification QR code
    const qrTarget = config.qrDestinationVal || preset.website;
    drawQRCode(ctx, qrTarget, (W - 120) / 2, H - 165, 120, '#0f172a', '#ffffff');
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN TO VALIDATE CREDENTIAL', W / 2, H - 28);
  } else {
    // Base card surface matches selected style
    if (config.themeStyle === 'Corporate Black') {
      ctx.fillStyle = '#090b11';
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, W - 2, H - 2);
    }

    const isDark = config.themeStyle === 'Corporate Black';
    const textCol = isDark ? '#ffffff' : '#1e293b';
    const mutedCol = isDark ? 'rgba(255, 255, 255, 0.45)' : '#64748b';

    // 1. Magnetic Stripe
    ctx.fillStyle = '#1e1e24';
    ctx.fillRect(0, 45, W, 65);

    // 2. Microchip
    drawMicrochip(ctx, 40, 130, 45, config.microchipStyle, themeColor);

    // 3. Terms & Guidelines
    ctx.save();
    ctx.fillStyle = themeColor;
    ctx.font = 'bold 14px "Outfit", sans-serif';
    ctx.fillText('OFFICIAL INSTRUCTIONS', 40, 215);

    ctx.fillStyle = textCol;
    ctx.font = '500 11px "Outfit", sans-serif';
    const guidelines = [
      '1. This card remains the official property of the issuer.',
      '2. It must be presented upon request to campus authorities.',
      '3. Transfer or unauthorized copy constitutes fraud.',
      '4. Report loss immediately to security department.',
      '5. Entitles cardholder to designated campus facilities.'
    ];
    guidelines.forEach((line, i) => {
      ctx.fillText(line, 40, 245 + i * 20);
    });
    ctx.restore();

    // 4. Signature Panel
    ctx.save();
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
    ctx.strokeStyle = mutedCol;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(40, 360, W - 80, 54, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = mutedCol;
    ctx.font = 'italic 10px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AUTHORIZED SIGNATURE', W / 2, 432);

    // Blue simulated ink signature
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(70, 395);
    ctx.bezierCurveTo(100, 365, 120, 405, 150, 375);
    ctx.bezierCurveTo(180, 355, 200, 415, 230, 380);
    ctx.bezierCurveTo(250, 370, 280, 390, 300, 375);
    ctx.stroke();
    ctx.restore();

    // 5. Smart QR verification code
    const qrTarget = config.qrDestinationVal || preset.website;
    drawQRCode(ctx, qrTarget, (W - 120) / 2, H - 165, 120, '#0f172a', '#ffffff');

    ctx.fillStyle = mutedCol;
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN TO VALIDATE CREDENTIAL', W / 2, H - 28);
  }
}

/**
 * Draws repeating lanyard band pattern texture.
 */
export function drawLanyardBand(canvas, color, text, style = 'Nylon', fontSize = 34) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Background strap color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);

  if (style === 'Reflective') {
    // Silver reflective center line
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, H / 2 - 6, W, 12);
  } else if (style === 'Polyester') {
    // Subtle cross-weave mesh lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 10, H);
      ctx.stroke();
    }
  } else if (style === 'Woven') {
    // Dense zig-zag lines
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < W; x += 8) {
      ctx.lineTo(x, 4);
      ctx.lineTo(x + 4, H - 4);
    }
    ctx.stroke();
  }

  // Dashed stitching lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(W, 8);
  ctx.moveTo(0, H - 8);
  ctx.lineTo(W, H - 8);
  ctx.stroke();
  ctx.setLineDash([]); // reset

  // Loop text
  ctx.fillStyle = '#ffffff';
  let adjustedFontSize = fontSize;
  ctx.font = `900 ${adjustedFontSize}px "Outfit", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const singleText = text.toUpperCase() + '   ✦   ';
  let textWidth = ctx.measureText(singleText).width || 200;

  // Scale down font size dynamically if a single segment is wider than the strap canvas itself
  if (textWidth > W - 40) {
    adjustedFontSize = Math.max(14, Math.floor(fontSize * ((W - 40) / textWidth)));
    ctx.font = `900 ${adjustedFontSize}px "Outfit", sans-serif`;
    textWidth = ctx.measureText(singleText).width || 200;
  }

  // Calculate dynamic repeats to fill the full strap canvas
  const repeatsNeeded = Math.ceil(W / textWidth) + 1;
  let repeatPattern = '';
  for (let i = 0; i < repeatsNeeded; i++) {
    repeatPattern += singleText;
  }
  ctx.fillText(repeatPattern, 20, H / 2 + 1);
}
