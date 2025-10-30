import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download } from "lucide-react";
import type { DetectionResult } from "@/pages/Detect";

interface ResultsDisplayProps {
  result: DetectionResult;
  onReset: () => void;
}

export const ResultsDisplay = ({ result, onReset }: ResultsDisplayProps) => {
  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = filename;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button onClick={onReset} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Analyze Another
            </Button>
            <Badge variant="outline" className="text-sm">
              Processed in {result.processingTime.toFixed(2)}s
            </Badge>
          </div>

          {/* Metrics Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="text-4xl font-bold text-primary">
                {result.accuracy.toFixed(1)}%
              </p>
            </Card>
            <Card className="p-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Camouflage Coverage</p>
              <p className="text-4xl font-bold text-accent">
                {result.camouflagePercentage.toFixed(1)}%
              </p>
            </Card>
            <Card className="p-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Identified As</p>
              <p className="text-2xl font-semibold text-foreground">
                {result.identifiedAs}
              </p>
            </Card>
          </div>

          {/* Image Comparison Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Original Image */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Original Image
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(result.originalImage, "original.png")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <img
                src={result.originalImage}
                alt="Original"
                className="w-full rounded-lg border border-border"
              />
            </Card>

            {/* Processed with Overlay */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Detection Overlay
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(result.processedImage, "detection.png")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <img
                src={result.processedImage}
                alt="Detection"
                className="w-full rounded-lg border border-border"
              />
            </Card>

            {/* Spectral Difference Map */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Spectral Difference Map
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(result.spectralMap, "spectral-map.png")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <img
                src={result.spectralMap}
                alt="Spectral Map"
                className="w-full rounded-lg border border-border"
              />
              <p className="text-sm text-muted-foreground">
                Enhanced spectral differences highlighting camouflage patterns
              </p>
            </Card>

            {/* Camouflage Mask */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Camouflage Mask
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(result.maskImage, "mask.png")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <img
                src={result.maskImage}
                alt="Mask"
                className="w-full rounded-lg border border-border"
              />
              <p className="text-sm text-muted-foreground">
                Binary mask showing detected camouflaged regions
              </p>
            </Card>
          </div>

          {/* Analysis Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Analysis Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Detection Method</span>
                <span className="font-medium text-foreground">
                  Spectral Difference Enhancement + Pixel-Pair Analysis
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Confidence Score</span>
                <span className="font-medium text-foreground">
                  {result.accuracy.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Processing Time</span>
                <span className="font-medium text-foreground">
                  {result.processingTime.toFixed(2)} seconds
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Detected Object Type</span>
                <span className="font-medium text-foreground">
                  {result.identifiedAs}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
