import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Scan, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const features = [
    {
      icon: Scan,
      title: "Spectral Analysis",
      description: "Advanced spectral difference enhancement to detect hidden patterns in images",
    },
    {
      icon: Zap,
      title: "Real-Time Processing",
      description: "Fast pixel-pair feature analysis for instant camouflage detection",
    },
    {
      icon: Shield,
      title: "Accurate Detection",
      description: "Precise identification with detailed accuracy metrics and visual overlays",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Advanced Camouflage
              <span className="block text-primary">Detection System</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Powered by Spectral Difference Enhancement and Pixel-Pair Feature Analysis.
              Uncover hidden targets with cutting-edge detection technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/detect">
                <Button size="lg" className="group">
                  Start Detection
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Key Features
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              SpectrLynx combines advanced algorithms with intuitive visualization
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8 md:p-12 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Detect Camouflage?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload your images and let our advanced algorithms identify hidden targets
              with precision and accuracy.
            </p>
            <Link to="/detect">
              <Button size="lg" className="group">
                Try It Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
