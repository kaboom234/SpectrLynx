import { Card } from "@/components/ui/card";

export const ProcessingAnimation = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-12 max-w-md w-full text-center space-y-8">
        <h2 className="text-2xl font-bold text-foreground">
          Analyzing Image
        </h2>
        
        {/* Radar Animation */}
        <div className="relative w-64 h-64 mx-auto">
          {/* Radar circles */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-4 rounded-full border-2 border-primary/30" />
          <div className="absolute inset-8 rounded-full border-2 border-primary/40" />
          <div className="absolute inset-12 rounded-full border-2 border-primary/50" />
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary" />
          
          {/* Rotating sweep */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
            <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left bg-gradient-to-r from-primary to-transparent" />
          </div>
          
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-75" style={{ animationDuration: "2s" }} />
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground">
            Processing spectral data...
          </p>
          <p className="text-sm text-muted-foreground">
            Computing pixel-pair features
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-accent animate-pulse" style={{ width: "70%" }} />
        </div>
      </Card>
    </div>
  );
};
