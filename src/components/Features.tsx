import { Card } from "./ui/card";
import { 
  FileSearch, 
  Shield, 
  Users, 
  AlertTriangle, 
  BookOpen, 
  MessageSquare,
  CheckCircle,
  Gavel
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Lease Analysis",
    description: "Upload your rental agreement and get an instant analysis of potential issues, unfair clauses, and your rights.",
    benefits: ["AI-powered analysis", "Instant results", "Plain English explanations"]
  },
  {
    icon: AlertTriangle,
    title: "Red Flag Detection",
    description: "Automatically identify problematic clauses, illegal terms, and landlord overreach in your lease agreement.",
    benefits: ["Real-time warnings", "Legal compliance check", "Risk assessment"]
  },
  {
    icon: Shield,
    title: "Know Your Rights",
    description: "Access comprehensive guides about tenant rights specific to your location and situation.",
    benefits: ["Location-specific laws", "Interactive guides", "Regular updates"]
  },
  {
    icon: Gavel,
    title: "Legal Resources",
    description: "Connect with qualified tenant rights attorneys and legal aid organizations in your area.",
    benefits: ["Vetted professionals", "Free consultations", "Affordable options"]
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Join a supportive community of tenants sharing experiences, advice, and resources.",
    benefits: ["Peer support", "Local groups", "Success stories"]
  },
  {
    icon: BookOpen,
    title: "Educational Resources",
    description: "Learn about rental laws, negotiation tactics, and how to protect yourself as a tenant.",
    benefits: ["Video tutorials", "Downloadable guides", "Expert tips"]
  },
  {
    icon: MessageSquare,
    title: "Expert Guidance",
    description: "Get personalized advice from housing experts and experienced tenant advocates.",
    benefits: ["One-on-one support", "Custom solutions", "Follow-up assistance"]
  },
  {
    icon: CheckCircle,
    title: "Action Plans",
    description: "Receive step-by-step action plans tailored to your specific rental situation and concerns.",
    benefits: ["Personalized steps", "Timeline guidance", "Progress tracking"]
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl mb-4">
            Everything You Need to <span className="text-primary">Protect Your Rights</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and resources you need to understand, 
            analyze, and act on your rental agreements with confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow h-full">
              <div className="space-y-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                
                <div>
                  <h3 className="text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {feature.description}
                  </p>
                </div>

                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}