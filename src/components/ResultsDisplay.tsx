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
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button onClick={onReset} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Analyze Another
            </Button>
            <Badge variant="outline" className="text-sm">
              Detected in {result.processingTime.toFixed(2)}s
            </Badge>
          </div>

          {/* Original Image */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Analyzed Image
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDownload(result.originalImage, "analyzed-image.png")}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <img
              src={result.originalImage}
              alt="Analyzed"
              className="w-full rounded-lg border border-border"
            />
          </Card>

          {/* AI Analysis */}
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="text-primary">🎯</span>
              Detection Results
            </h3>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Detected</p>
                  <p className="text-2xl font-bold text-foreground">
                    {result.aiAnalysis.objectType}
                  </p>
                  {result.aiAnalysis.species && (
                    <p className="text-lg text-primary font-semibold">
                      {result.aiAnalysis.species}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="text-4xl font-bold text-primary">
                    {result.aiAnalysis.confidence}%
                  </p>
                </div>
              </div>
              
              {result.aiAnalysis.location && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Location in Image</p>
                  <p className="text-base text-foreground leading-relaxed">
                    {result.aiAnalysis.location}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Physical Description</p>
                <p className="text-base text-foreground leading-relaxed">
                  {result.aiAnalysis.description}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Camouflage & Visibility Analysis</p>
                <p className="text-base text-foreground leading-relaxed">
                  {result.aiAnalysis.camouflageAnalysis}
                </p>
              </div>
            </div>
          </Card>

          {/* Technical Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Technical Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Detection Method</span>
                <span className="font-medium text-foreground">
                  AI Vision Analysis (Gemini 2.5 Flash)
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Processing Time</span>
                <span className="font-medium text-foreground">
                  {result.processingTime.toFixed(2)} seconds
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Confidence Level</span>
                <span className="font-medium text-foreground">
                  {result.aiAnalysis.confidence}%
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};