/**
 * Solves a system of linear equations Ax = B using Gaussian elimination.
 * @param {number[][]} A - An N x N matrix.
 * @param {number[]} B - An array of length N.
 * @returns {number[]} The solution vector x.
 */
function solveGaussian(A, B) {
  const n = B.length;
  // Clone A and B to avoid modifying the inputs
  const a = A.map(row => [...row]);
  const b = [...B];

  for (let i = 0; i < n; i++) {
    // Find pivot row
    let maxEl = Math.abs(a[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(a[k][i]) > maxEl) {
        maxEl = Math.abs(a[k][i]);
        maxRow = k;
      }
    }

    // Swap maximum row with current row
    if (maxRow !== i) {
      const tmpRow = a[maxRow];
      a[maxRow] = a[i];
      a[i] = tmpRow;

      const tmpVal = b[maxRow];
      b[maxRow] = b[i];
      b[i] = tmpVal;
    }

    // Check for singular matrix
    if (Math.abs(a[i][i]) < 1e-10) {
      // Matrix is singular or nearly singular
      return null;
    }

    // Make all rows below this one 0 in the current column
    for (let k = i + 1; k < n; k++) {
      const c = -a[k][i] / a[i][i];
      for (let j = i; j < n; j++) {
        if (i === j) {
          a[k][j] = 0;
        } else {
          a[k][j] += c * a[i][j];
        }
      }
      b[k] += c * b[i];
    }
  }

  // Solve equation Ax=B for an upper triangular matrix
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = b[i] / a[i][i];
    for (let k = i - 1; k >= 0; k--) {
      b[k] -= a[k][i] * x[i];
    }
  }
  return x;
}

/**
 * Computes the homography matrix H mapping destination coordinates to source coordinates.
 * This maps each point (u_i, v_i) in the destination image to (x_i, y_i) in the source image.
 * 
 * Src points: [(x0,y0), (x1,y1), (x2,y2), (x3,y3)] - corners in original photo
 * Dst points: [(u0,v0), (u1,v1), (u2,v2), (u3,v3)] - corners in output cropped image
 * 
 * @param {Array<{x: number, y: number}>} src - 4 source points.
 * @param {Array<{x: number, y: number}>} dst - 4 destination points.
 * @returns {number[]|null} Coefficients [b0, b1, b2, b3, b4, b5, b6, b7] or null.
 */
export function computeInverseHomography(src, dst) {
  const A = [];
  const B = [];

  for (let i = 0; i < 4; i++) {
    const u = dst[i].x;
    const v = dst[i].y;
    const x = src[i].x;
    const y = src[i].y;

    // x_i = (b0 * u_i + b1 * v_i + b2) / (b6 * u_i + b7 * v_i + 1)
    // => b0 * u_i + b1 * v_i + b2 - b6 * u_i * x_i - b7 * v_i * x_i = x_i
    A.push([u, v, 1, 0, 0, 0, -u * x, -v * x]);
    B.push(x);

    // y_i = (b3 * u_i + b4 * v_i + b5) / (b6 * u_i + b7 * v_i + 1)
    // => b3 * u_i + b4 * v_i + b5 - b6 * u_i * y_i - b7 * v_i * y_i = y_i
    A.push([0, 0, 0, u, v, 1, -u * y, -v * y]);
    B.push(y);
  }

  return solveGaussian(A, B);
}

/**
 * Warps a source image using perspective projection.
 * @param {HTMLCanvasElement} srcCanvas - The canvas containing the original photo.
 * @param {HTMLCanvasElement} dstCanvas - The destination canvas to render the warped image.
 * @param {Array<{x: number, y: number}>} srcCorners - 4 corners in the source canvas.
 */
export function perspectiveWarp(srcCanvas, dstCanvas, srcCorners) {
  const srcCtx = srcCanvas.getContext('2d');
  const dstCtx = dstCanvas.getContext('2d');
  if (!srcCtx || !dstCtx) return;

  const dw = dstCanvas.width;
  const dh = dstCanvas.height;

  const dstCorners = [
    { x: 0, y: 0 },
    { x: dw, y: 0 },
    { x: dw, y: dh },
    { x: 0, y: dh }
  ];

  const coeffs = computeInverseHomography(srcCorners, dstCorners);
  if (!coeffs) {
    // Fallback: draw directly if math fails
    dstCtx.drawImage(srcCanvas, 0, 0, dw, dh);
    return;
  }

  const [b0, b1, b2, b3, b4, b5, b6, b7] = coeffs;

  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const dstData = dstCtx.createImageData(dw, dh);

  const srcPixels = srcData.data;
  const dstPixels = dstData.data;
  const sw = srcCanvas.width;
  const sh = srcCanvas.height;

  for (let v = 0; v < dh; v++) {
    for (let u = 0; u < dw; u++) {
      const denom = b6 * u + b7 * v + 1;
      const x = (b0 * u + b1 * v + b2) / denom;
      const y = (b3 * u + b4 * v + b5) / denom;

      const dstIdx = (v * dw + u) * 4;

      if (x >= 0 && x < sw && y >= 0 && y < sh) {
        // Bilinear interpolation
        const x0 = Math.floor(x);
        const x1 = Math.min(x0 + 1, sw - 1);
        const y0 = Math.floor(y);
        const y1 = Math.min(y0 + 1, sh - 1);

        const dx = x - x0;
        const dy = y - y0;

        const idx00 = (y0 * sw + x0) * 4;
        const idx10 = (y0 * sw + x1) * 4;
        const idx01 = (y1 * sw + x0) * 4;
        const idx11 = (y1 * sw + x1) * 4;

        for (let c = 0; c < 4; c++) {
          const val = (1 - dx) * (1 - dy) * srcPixels[idx00 + c] +
                      dx * (1 - dy) * srcPixels[idx10 + c] +
                      (1 - dx) * dy * srcPixels[idx01 + c] +
                      dx * dy * srcPixels[idx11 + c];
          dstPixels[dstIdx + c] = val;
        }
      } else {
        // Transparent pixel if out of bounds
        dstPixels[dstIdx] = 0;
        dstPixels[dstIdx + 1] = 0;
        dstPixels[dstIdx + 2] = 0;
        dstPixels[dstIdx + 3] = 0;
      }
    }
  }

  dstCtx.putImageData(dstData, 0, 0);
}
