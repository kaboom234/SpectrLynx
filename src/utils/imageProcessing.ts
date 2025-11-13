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

  // Downsample for faster processing (max 800px on longest side)
  const maxDimension = 800;
  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  const processWidth = Math.floor(img.width * scale);
  const processHeight = Math.floor(img.height * scale);

  // Create canvas for processing at lower resolution
  const processCanvas = document.createElement('canvas');
  const processCtx = processCanvas.getContext('2d')!;
  processCanvas.width = processWidth;
  processCanvas.height = processHeight;
  processCtx.drawImage(img, 0, 0, processWidth, processHeight);
  const imageData = processCtx.getImageData(0, 0, processWidth, processHeight);
  
  // Single detection pass - reuse for all visualizations
  const detectionMap = detectCamouflage(imageData);
  
  // Generate all three visualizations from the same detection
  const overlayData = createRedOverlay(imageData, detectionMap);
  const spectralData = createSpectralMap(imageData, detectionMap);
  const maskData = createBinaryMask(detectionMap, processWidth, processHeight);
  
  // Upscale back to original size
  const overlayCanvas = upscaleCanvas(overlayData, img.width, img.height);
  const spectralCanvas = upscaleCanvas(spectralData, img.width, img.height);
  const maskCanvas = upscaleCanvas(maskData, img.width, img.height);

  return {
    overlay: overlayCanvas.toDataURL('image/png'),
    spectral: spectralCanvas.toDataURL('image/png'),
    mask: maskCanvas.toDataURL('image/png'),
  };
}

function detectCamouflage(imageData: ImageData): Uint8ClampedArray {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const windowSize = 12;
  const detectionMap = new Uint8ClampedArray(width * height);

  for (let y = windowSize; y < height - windowSize; y++) {
    for (let x = windowSize; x < width - windowSize; x++) {
      const mapIdx = y * width + x;
      
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
      
      const isSubtleAnomaly = colorAnomaly > 18 && colorAnomaly < 95;
      const hasPattern = patternScore >= 2;
      
      detectionMap[mapIdx] = (isSubtleAnomaly && hasPattern) ? Math.min(colorAnomaly, 255) : 0;
    }
  }
  
  return detectionMap;
}

function createRedOverlay(imageData: ImageData, detectionMap: Uint8ClampedArray): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const mapIdx = y * width + x;
      const anomaly = detectionMap[mapIdx];
      
      if (anomaly > 0) {
        const intensity = Math.min(anomaly / 100, 0.7);
        data[idx] = 255;
        data[idx + 1] = data[idx + 1] * (1 - intensity);
        data[idx + 2] = data[idx + 2] * (1 - intensity);
      }
    }
  }

  return new ImageData(data, width, height);
}

function createSpectralMap(imageData: ImageData, detectionMap: Uint8ClampedArray): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  
  // Dilate to fill the entire camouflaged region
  const dilatedMap = new Uint8ClampedArray(detectionMap);
  const dilationRadius = 8;
  
  for (let y = dilationRadius; y < height - dilationRadius; y++) {
    for (let x = dilationRadius; x < width - dilationRadius; x++) {
      const mapIdx = y * width + x;
      if (detectionMap[mapIdx] > 0) {
        for (let dy = -dilationRadius; dy <= dilationRadius; dy++) {
          for (let dx = -dilationRadius; dx <= dilationRadius; dx++) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= dilationRadius) {
              const neighborIdx = (y + dy) * width + (x + dx);
              const falloff = 1 - (dist / dilationRadius);
              dilatedMap[neighborIdx] = Math.max(dilatedMap[neighborIdx], detectionMap[mapIdx] * falloff);
            }
          }
        }
      }
    }
  }
  
  // Apply thermal gradient
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const mapIdx = y * width + x;
      const intensity = Math.min(dilatedMap[mapIdx] / 100, 1.0);
      
      if (intensity > 0.1) {
        if (intensity < 0.3) {
          data[idx] = 0;
          data[idx + 1] = intensity * 3.3 * 200;
          data[idx + 2] = 255;
        } else if (intensity < 0.5) {
          const t = (intensity - 0.3) * 5;
          data[idx] = 0;
          data[idx + 1] = 200 + (t * 55);
          data[idx + 2] = 255 - (t * 255);
        } else if (intensity < 0.75) {
          data[idx] = 255;
          data[idx + 1] = 255;
          data[idx + 2] = 0;
        } else {
          const t = (intensity - 0.75) * 4;
          data[idx] = 255;
          data[idx + 1] = 255 - (t * 255);
          data[idx + 2] = 0;
        }
      } else {
        data[idx] = data[idx] * 0.05;
        data[idx + 1] = data[idx + 1] * 0.05;
        data[idx + 2] = data[idx + 2] * 0.05;
      }
    }
  }

  return new ImageData(data, width, height);
}

function createBinaryMask(detectionMap: Uint8ClampedArray, width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  
  // Morphological closing to fill holes
  const dilatedMap = new Uint8ClampedArray(width * height);
  for (let i = 0; i < detectionMap.length; i++) {
    dilatedMap[i] = detectionMap[i] > 0 ? 1 : 0;
  }
  
  const morphRadius = 6;
  const tempMap = new Uint8ClampedArray(dilatedMap);
  
  // Dilation
  for (let y = morphRadius; y < height - morphRadius; y++) {
    for (let x = morphRadius; x < width - morphRadius; x++) {
      const mapIdx = y * width + x;
      if (dilatedMap[mapIdx] === 1) {
        for (let dy = -morphRadius; dy <= morphRadius; dy++) {
          for (let dx = -morphRadius; dx <= morphRadius; dx++) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= morphRadius) {
              tempMap[(y + dy) * width + (x + dx)] = 1;
            }
          }
        }
      }
    }
  }
  
  // Erosion
  const finalMap = new Uint8ClampedArray(tempMap);
  const erosionRadius = 3;
  
  for (let y = erosionRadius; y < height - erosionRadius; y++) {
    for (let x = erosionRadius; x < width - erosionRadius; x++) {
      const mapIdx = y * width + x;
      let allOnes = true;
      
      for (let dy = -erosionRadius; dy <= erosionRadius && allOnes; dy++) {
        for (let dx = -erosionRadius; dx <= erosionRadius && allOnes; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= erosionRadius && tempMap[(y + dy) * width + (x + dx)] === 0) {
            allOnes = false;
          }
        }
      }
      
      finalMap[mapIdx] = allOnes ? 1 : 0;
    }
  }
  
  // Apply binary colors
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const mapIdx = y * width + x;
      const color = finalMap[mapIdx] === 1 ? 255 : 0;
      
      data[idx] = color;
      data[idx + 1] = color;
      data[idx + 2] = color;
      data[idx + 3] = 255;
    }
  }

  return new ImageData(data, width, height);
}

function upscaleCanvas(imageData: ImageData, targetWidth: number, targetHeight: number): HTMLCanvasElement {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.putImageData(imageData, 0, 0);
  
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);
  
  return canvas;
}
