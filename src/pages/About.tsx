import { Card } from "@/components/ui/card";
import { BookOpen, Users, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">About SpectrLynx</h1>
            <p className="text-lg text-muted-foreground">
              Advanced Camouflage Detection Technology
            </p>
          </div>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Overview</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              SpectrLynx is a cutting-edge camouflage detection system that leverages
              advanced spectral analysis and machine learning algorithms to identify
              hidden targets in images. Built on research by Zhao et al. (2025), our
              system employs Spectral Difference Enhancement (SDE) and Pixel-Pair
              Feature Analysis (PPFA) to achieve superior detection accuracy.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center space-y-2">
                <BookOpen className="h-12 w-12 mx-auto text-primary" />
                <h3 className="font-semibold text-foreground">Research-Based</h3>
                <p className="text-sm text-muted-foreground">
                  Grounded in IEEE published research
                </p>
              </div>
              <div className="text-center space-y-2">
                <Users className="h-12 w-12 mx-auto text-primary" />
                <h3 className="font-semibold text-foreground">User-Friendly</h3>
                <p className="text-sm text-muted-foreground">
                  Intuitive interface for easy analysis
                </p>
              </div>
              <div className="text-center space-y-2">
                <Award className="h-12 w-12 mx-auto text-primary" />
                <h3 className="font-semibold text-foreground">Accurate</h3>
                <p className="text-sm text-muted-foreground">
                  High-precision detection algorithms
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Technology
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Spectral Difference Enhancement (SDE)
                </h3>
                <p>
                  Our system analyzes the spectral signatures across different color
                  channels to identify subtle differences that indicate camouflaged
                  objects. By computing the difference between spectral bands, we can
                  enhance features that are typically invisible to the human eye.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Pixel-Pair Feature Analysis (PPFA)
                </h3>
                <p>
                  This technique performs pairwise comparison of spectral vectors
                  between adjacent pixels to detect boundary discontinuities and
                  texture inconsistencies that characterize camouflage patterns.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Detection Pipeline
                </h3>
                <p>
                  The system processes images through multiple stages: preprocessing,
                  spectral analysis, feature extraction, classification, and
                  visualization. Each stage is optimized for speed and accuracy.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Academic Reference
            </h2>
            <p className="text-muted-foreground italic">
              This project is based on research in hyperspectral imaging and camouflage
              detection, utilizing datasets such as BihoT (2024) and methodologies
              described in recent IEEE publications on spectral analysis and target
              detection.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
