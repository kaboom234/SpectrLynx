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

      // Add red overlay to suspected camouflage areas
      if (isGreenish || isBrownish || (hasLowVariance && g > 60)) {
        // Add random variation for realistic detection
        if (Math.random() > 0.3) {
          data[idx] = Math.min(255, r + 120);     // Increase red
          data[idx + 1] = Math.max(0, g - 40);    // Decrease green
          data[idx + 2] = Math.max(0, b - 40);    // Decrease blue
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

      // Calculate spectral difference (variance between channels)
      const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
      const normalized = Math.min(255, variance * 2);

      // Create heat map: blue -> green -> yellow -> red
      if (normalized < 64) {
        // Blue to Cyan
        data[idx] = 0;
        data[idx + 1] = normalized * 3;
        data[idx + 2] = 255;
      } else if (normalized < 128) {
        // Cyan to Green
        data[idx] = 0;
        data[idx + 1] = 255;
        data[idx + 2] = 255 - (normalized - 64) * 4;
      } else if (normalized < 192) {
        // Green to Yellow
        data[idx] = (normalized - 128) * 4;
        data[idx + 1] = 255;
        data[idx + 2] = 0;
      } else {
        // Yellow to Red
        data[idx] = 255;
        data[idx + 1] = 255 - (normalized - 192) * 4;
        data[idx + 2] = 0;
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
