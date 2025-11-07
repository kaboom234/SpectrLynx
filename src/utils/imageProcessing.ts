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

  // First pass: detect edges and pattern anomalies
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // Get current pixel
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Analyze neighboring pixels for edge detection and pattern analysis
      let edgeStrength = 0;
      let patternComplexity = 0;
      
      // Check 3x3 neighborhood
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          const nr = data[nIdx];
          const ng = data[nIdx + 1];
          const nb = data[nIdx + 2];
          
          // Calculate color difference for edge detection
          const colorDiff = Math.abs(r - nr) + Math.abs(g - ng) + Math.abs(b - nb);
          edgeStrength += colorDiff;
          
          // Pattern complexity (high-frequency changes indicate camouflage patterns)
          if (colorDiff > 20 && colorDiff < 100) {
            patternComplexity++;
          }
        }
      }
      
      // Detect camouflaged objects:
      // 1. Has defined edges (not blurry natural background)
      // 2. Has pattern complexity (artificial camouflage patterns)
      // 3. Colors blend with environment but have structure
      const hasDefinedEdges = edgeStrength > 200 && edgeStrength < 800;
      const hasCamoPattern = patternComplexity >= 3;
      const hasNaturalColors = (g > 40 && g < 180) || (r > 60 && r < 150 && g > 50 && g < 140);
      
      // Detect camouflaged areas
      if ((hasDefinedEdges && hasCamoPattern && hasNaturalColors) || 
          (patternComplexity >= 5 && hasNaturalColors)) {
        // Add bright red overlay
        data[idx] = 255;
        data[idx + 1] = Math.max(0, g * 0.2);
        data[idx + 2] = Math.max(0, b * 0.2);
      }
    }
  }

  return new ImageData(data, width, height);
}

function createSpectralMap(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;

  // Analyze texture patterns across the image
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Analyze neighborhood for camouflage detection
      let edgeStrength = 0;
      let patternComplexity = 0;
      let colorVariation = 0;
      
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          const colorDiff = Math.abs(r - data[nIdx]) + Math.abs(g - data[nIdx + 1]) + Math.abs(b - data[nIdx + 2]);
          edgeStrength += colorDiff;
          
          if (colorDiff > 20 && colorDiff < 100) patternComplexity++;
          colorVariation += colorDiff;
        }
      }
      
      // Detect camouflage: structured edges + patterns + natural colors
      const hasDefinedEdges = edgeStrength > 200 && edgeStrength < 800;
      const hasCamoPattern = patternComplexity >= 3;
      const hasNaturalColors = (g > 40 && g < 180) || (r > 60 && r < 150 && g > 50 && g < 140);
      
      const isCamouflage = (hasDefinedEdges && hasCamoPattern && hasNaturalColors) || 
                           (patternComplexity >= 5 && hasNaturalColors);
      
      if (isCamouflage) {
        // Calculate camouflage intensity based on pattern complexity and edge definition
        const camoIntensity = Math.min(255, (patternComplexity * 40) + (edgeStrength / 4));
        
        // Thermal heat map: blue (weak) -> cyan -> green -> yellow -> orange -> red (strong)
        if (camoIntensity < 50) {
          data[idx] = 0;
          data[idx + 1] = 100 + camoIntensity;
          data[idx + 2] = 255;
        } else if (camoIntensity < 100) {
          const t = (camoIntensity - 50) / 50;
          data[idx] = 0;
          data[idx + 1] = 150 + (t * 105);
          data[idx + 2] = 255 - (t * 150);
        } else if (camoIntensity < 150) {
          const t = (camoIntensity - 100) / 50;
          data[idx] = t * 255;
          data[idx + 1] = 255;
          data[idx + 2] = 105 - (t * 105);
        } else if (camoIntensity < 200) {
          const t = (camoIntensity - 150) / 50;
          data[idx] = 255;
          data[idx + 1] = 255 - (t * 100);
          data[idx + 2] = 0;
        } else {
          const t = (camoIntensity - 200) / 55;
          data[idx] = 255;
          data[idx + 1] = 155 - (t * 155);
          data[idx + 2] = 0;
        }
      } else {
        // Very dark for non-camouflage areas
        data[idx] = r * 0.15;
        data[idx + 1] = g * 0.15;
        data[idx + 2] = b * 0.15;
      }
    }
  }

  return new ImageData(data, width, height);
}

function createBinaryMask(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Edge and pattern detection
      let edgeStrength = 0;
      let patternComplexity = 0;
      
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          const colorDiff = Math.abs(r - data[nIdx]) + Math.abs(g - data[nIdx + 1]) + Math.abs(b - data[nIdx + 2]);
          edgeStrength += colorDiff;
          if (colorDiff > 20 && colorDiff < 100) patternComplexity++;
        }
      }
      
      const hasDefinedEdges = edgeStrength > 200 && edgeStrength < 800;
      const hasCamoPattern = patternComplexity >= 3;
      const hasNaturalColors = (g > 40 && g < 180) || (r > 60 && r < 150 && g > 50 && g < 140);
      
      // White for camouflaged areas, black for background
      const isCamouflage = (hasDefinedEdges && hasCamoPattern && hasNaturalColors) || 
                           (patternComplexity >= 5 && hasNaturalColors);
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
