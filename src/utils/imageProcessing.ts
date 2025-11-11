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
  const windowSize = 12;

  // Analyze each pixel by comparing local area vs surrounding context
  for (let y = windowSize; y < height - windowSize; y++) {
    for (let x = windowSize; x < width - windowSize; x++) {
      const idx = (y * width + x) * 4;
      
      // Calculate average of immediate local area (potential camouflage object)
      let localR = 0, localG = 0, localB = 0, localCount = 0;
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const i = ((y + dy) * width + (x + dx)) * 4;
          localR += data[i];
          localG += data[i + 1];
          localB += data[i + 2];
          localCount++;
        }
      }
      localR /= localCount;
      localG /= localCount;
      localB /= localCount;
      
      // Calculate average of surrounding ring (background context)
      let surroundR = 0, surroundG = 0, surroundB = 0, surroundCount = 0;
      for (let dy = -windowSize; dy <= windowSize; dy++) {
        for (let dx = -windowSize; dx <= windowSize; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= 8 && dist <= windowSize) {
            const i = ((y + dy) * width + (x + dx)) * 4;
            surroundR += data[i];
            surroundG += data[i + 1];
            surroundB += data[i + 2];
            surroundCount++;
          }
        }
      }
      surroundR /= surroundCount;
      surroundG /= surroundCount;
      surroundB /= surroundCount;
      
      // Calculate how different the local area is from its surroundings
      const colorAnomaly = Math.abs(localR - surroundR) + 
                          Math.abs(localG - surroundG) + 
                          Math.abs(localB - surroundB);
      
      // Check for repetitive patterns (military camo signature)
      let patternScore = 0;
      for (let dx = 1; dx <= 5; dx++) {
        const i1 = (y * width + (x - dx)) * 4;
        const i2 = (y * width + (x + dx)) * 4;
        if (i1 >= 0 && i2 < data.length) {
          const diff = Math.abs(data[i1] - data[i2]);
          if (diff > 10 && diff < 40) patternScore++;
        }
      }
      
      // Camouflage detection: SUBTLE anomaly (not too different, not too similar) + patterns
      const isSubtleAnomaly = colorAnomaly > 20 && colorAnomaly < 90;
      const hasPattern = patternScore >= 2;
      
      if (isSubtleAnomaly && hasPattern) {
        // Apply red overlay
        const intensity = Math.min(colorAnomaly / 100, 0.7);
        data[idx] = 255;
        data[idx + 1] = data[idx + 1] * (1 - intensity);
        data[idx + 2] = data[idx + 2] * (1 - intensity);
      }
    }
  }

  return new ImageData(data, width, height);
}

function createSpectralMap(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const windowSize = 12;

  for (let y = windowSize; y < height - windowSize; y++) {
    for (let x = windowSize; x < width - windowSize; x++) {
      const idx = (y * width + x) * 4;
      
      // Local area average
      let localR = 0, localG = 0, localB = 0, localCount = 0;
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const i = ((y + dy) * width + (x + dx)) * 4;
          localR += data[i];
          localG += data[i + 1];
          localB += data[i + 2];
          localCount++;
        }
      }
      localR /= localCount;
      localG /= localCount;
      localB /= localCount;
      
      // Surrounding context average
      let surroundR = 0, surroundG = 0, surroundB = 0, surroundCount = 0;
      for (let dy = -windowSize; dy <= windowSize; dy++) {
        for (let dx = -windowSize; dx <= windowSize; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= 8 && dist <= windowSize) {
            const i = ((y + dy) * width + (x + dx)) * 4;
            surroundR += data[i];
            surroundG += data[i + 1];
            surroundB += data[i + 2];
            surroundCount++;
          }
        }
      }
      surroundR /= surroundCount;
      surroundG /= surroundCount;
      surroundB /= surroundCount;
      
      const colorAnomaly = Math.abs(localR - surroundR) + 
                          Math.abs(localG - surroundG) + 
                          Math.abs(localB - surroundB);
      
      let patternScore = 0;
      for (let dx = 1; dx <= 5; dx++) {
        const i1 = (y * width + (x - dx)) * 4;
        const i2 = (y * width + (x + dx)) * 4;
        if (i1 >= 0 && i2 < data.length) {
          const diff = Math.abs(data[i1] - data[i2]);
          if (diff > 10 && diff < 40) patternScore++;
        }
      }
      
      const isSubtleAnomaly = colorAnomaly > 20 && colorAnomaly < 90;
      const hasPattern = patternScore >= 2;
      
      if (isSubtleAnomaly && hasPattern) {
        // Thermal gradient based on anomaly intensity
        const intensity = Math.min(colorAnomaly / 90, 1.0);
        
        if (intensity < 0.25) {
          // Blue
          data[idx] = 0;
          data[idx + 1] = intensity * 4 * 200;
          data[idx + 2] = 255;
        } else if (intensity < 0.5) {
          // Cyan to green
          const t = (intensity - 0.25) * 4;
          data[idx] = 0;
          data[idx + 1] = 200 + (t * 55);
          data[idx + 2] = 255 - (t * 255);
        } else if (intensity < 0.75) {
          // Yellow to orange
          const t = (intensity - 0.5) * 4;
          data[idx] = t * 255;
          data[idx + 1] = 255;
          data[idx + 2] = 0;
        } else {
          // Red
          const t = (intensity - 0.75) * 4;
          data[idx] = 255;
          data[idx + 1] = 255 - (t * 255);
          data[idx + 2] = 0;
        }
      } else {
        // Very dark for non-camouflage
        data[idx] = data[idx] * 0.08;
        data[idx + 1] = data[idx + 1] * 0.08;
        data[idx + 2] = data[idx + 2] * 0.08;
      }
    }
  }

  return new ImageData(data, width, height);
}

function createBinaryMask(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const windowSize = 12;

  for (let y = windowSize; y < height - windowSize; y++) {
    for (let x = windowSize; x < width - windowSize; x++) {
      const idx = (y * width + x) * 4;
      
      // Local area average
      let localR = 0, localG = 0, localB = 0, localCount = 0;
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const i = ((y + dy) * width + (x + dx)) * 4;
          localR += data[i];
          localG += data[i + 1];
          localB += data[i + 2];
          localCount++;
        }
      }
      localR /= localCount;
      localG /= localCount;
      localB /= localCount;
      
      // Surrounding context average
      let surroundR = 0, surroundG = 0, surroundB = 0, surroundCount = 0;
      for (let dy = -windowSize; dy <= windowSize; dy++) {
        for (let dx = -windowSize; dx <= windowSize; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist >= 8 && dist <= windowSize) {
            const i = ((y + dy) * width + (x + dx)) * 4;
            surroundR += data[i];
            surroundG += data[i + 1];
            surroundB += data[i + 2];
            surroundCount++;
          }
        }
      }
      surroundR /= surroundCount;
      surroundG /= surroundCount;
      surroundB /= surroundCount;
      
      const colorAnomaly = Math.abs(localR - surroundR) + 
                          Math.abs(localG - surroundG) + 
                          Math.abs(localB - surroundB);
      
      let patternScore = 0;
      for (let dx = 1; dx <= 5; dx++) {
        const i1 = (y * width + (x - dx)) * 4;
        const i2 = (y * width + (x + dx)) * 4;
        if (i1 >= 0 && i2 < data.length) {
          const diff = Math.abs(data[i1] - data[i2]);
          if (diff > 10 && diff < 40) patternScore++;
        }
      }
      
      const isSubtleAnomaly = colorAnomaly > 20 && colorAnomaly < 90;
      const hasPattern = patternScore >= 2;
      
      // Binary: white for camouflage, black for background
      const color = (isSubtleAnomaly && hasPattern) ? 255 : 0;
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
