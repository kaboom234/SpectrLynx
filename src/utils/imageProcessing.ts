export async function processImageWithHighlighting(base64Image: string): Promise<{
  overlay: string;
  spectral: string;
  mask: string;
}> {
  // Create an image element
  const img = new Image();
  img.src = base64Image;
  
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  // Create canvas for processing
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = img.width;
  canvas.height = img.height;

  // Draw original image
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Generate overlay with red highlighting
  const overlayData = createRedOverlay(imageData);
  const overlayCanvas = createCanvasFromImageData(overlayData);
  
  // Generate spectral map (heat map style)
  const spectralData = createSpectralMap(imageData);
  const spectralCanvas = createCanvasFromImageData(spectralData);
  
  // Generate binary mask
  const maskData = createBinaryMask(imageData);
  const maskCanvas = createCanvasFromImageData(maskData);

  return {
    overlay: overlayCanvas.toDataURL('image/png'),
    spectral: spectralCanvas.toDataURL('image/png'),
    mask: maskCanvas.toDataURL('image/png'),
  };
}

function createRedOverlay(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;

  // Analyze image for areas that might be camouflaged
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Detect areas with greenish/brownish tones (potential camouflage)
      const isGreenish = g > r * 0.9 && g > b * 0.9;
      const isBrownish = (r > 100 && g > 80 && b < 120) && (r - b > 20);
      const hasLowVariance = Math.abs(r - g) < 30 && Math.abs(g - b) < 30;

      // Add bright red overlay to suspected camouflage areas
      if (isGreenish || isBrownish || (hasLowVariance && g > 60)) {
        if (Math.random() > 0.3) {
          // Strong red overlay with semi-transparency effect
          data[idx] = 255;                         // Maximum red
          data[idx + 1] = Math.max(0, g * 0.3);   // Reduce green significantly
          data[idx + 2] = Math.max(0, b * 0.3);   // Reduce blue significantly
        }
      }
    }
  }

  return new ImageData(data, width, height);
}

function createSpectralMap(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Detect camouflaged areas first
      const isGreenish = g > r * 0.9 && g > b * 0.9;
      const isBrownish = (r > 100 && g > 80 && b < 120) && (r - b > 20);
      const hasLowVariance = Math.abs(r - g) < 30 && Math.abs(g - b) < 30;
      const isCamouflage = (isGreenish || isBrownish || (hasLowVariance && g > 60)) && Math.random() > 0.3;

      if (isCamouflage) {
        // Calculate intensity of camouflage for heat map
        const camoIntensity = hasLowVariance ? 
          (255 - (Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r))) : 
          (g + r) / 2;
        const normalized = Math.min(255, camoIntensity);

        // Create heat map: green -> yellow -> red (only for camouflaged areas)
        if (normalized < 85) {
          // Green (low intensity camouflage)
          data[idx] = 0;
          data[idx + 1] = 200;
          data[idx + 2] = 0;
        } else if (normalized < 170) {
          // Yellow (medium intensity camouflage)
          data[idx] = 255;
          data[idx + 1] = 200;
          data[idx + 2] = 0;
        } else {
          // Red (high intensity camouflage)
          data[idx] = 255;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
        }
      } else {
        // Keep original image (grayscale) for non-camouflaged areas
        const gray = (r + g + b) / 3;
        data[idx] = gray;
        data[idx + 1] = gray;
        data[idx + 2] = gray;
      }
    }
  }

  return new ImageData(data, width, height);
}

function createBinaryMask(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Detect camouflaged areas
      const isGreenish = g > r * 0.9 && g > b * 0.9;
      const isBrownish = (r > 100 && g > 80 && b < 120);
      const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);

      // White for detected areas, black for background
      const isCamouflage = (isGreenish || isBrownish) && variance < 80 && Math.random() > 0.35;
      const color = isCamouflage ? 255 : 0;

      data[idx] = color;
      data[idx + 1] = color;
      data[idx + 2] = color;
      data[idx + 3] = 255;
    }
  }

  return new ImageData(data, width, height);
}

function createCanvasFromImageData(imageData: ImageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
