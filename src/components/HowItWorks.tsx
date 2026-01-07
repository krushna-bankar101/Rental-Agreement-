import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./backupimg/ImageWithFallback";
import { AuthModal } from "./AuthModal";
import { Upload, Search, FileText, Users } from "lucide-react";

interface HowItWorksProps {
  onAuthSuccess?: (user: any) => void;
}

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Lease",
    description: "Simply upload a photo or PDF of your rental agreement. Our secure platform protects your privacy.",
    details: ["Supports all file formats", "Bank-level security", "Instant processing"]
  },
  {
    number: "02",
    icon: Search,
    title: "AI Analysis",
    description: "Our advanced AI analyzes your lease for unfair terms, missing protections, and legal compliance issues.",
    details: ["Comprehensive review", "Legal database cross-check", "Real-time results"]
  },
  {
    number: "03",
    icon: FileText,
    title: "Get Your Report",
    description: "Receive a detailed, easy-to-understand report highlighting issues and your rights as a tenant.",
    details: ["Plain English explanations", "Priority issue ranking", "Action recommendations"]
  },
  {
    number: "04",
    icon: Users,
    title: "Take Action",
    description: "Access resources, connect with experts, and join our community to address any issues found.",
    details: ["Expert consultations", "Legal resources", "Community support"]
  }
];

export function HowItWorks({ onAuthSuccess }: HowItWorksProps = {}) {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl mb-4">
            How It Works: <span className="text-primary">Simple, Fast, Effective</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get peace of mind about your rental agreement in just minutes. 
            Our streamlined process makes tenant protection accessible to everyone.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    {step.number}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <step.icon className="h-5 w-5 text-primary" />
                    <h3 className="text-xl">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                  <div className="space-y-1">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1 w-1 bg-primary rounded-full"></div>
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1666018215790-867b14fe4822?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWdhbCUyMGRvY3VtZW50cyUyMGNvbnRyYWN0JTIwc2lnbmluZ3xlbnwxfHx8fDE3NTcyNDQ3NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Legal documents and contract analysis"
              className="rounded-2xl shadow-xl w-full h-[500px] object-cover"
            />

            {/* Progress indicator */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 border">
              <div className="text-sm font-medium mb-2">Analysis Progress</div>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '75%' }}></div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Reviewing clauses...</div>
            </div>
          </div>
        </div>

        <Card className="p-8 text-center bg-primary/5 border-primary/20">
          <h3 className="text-2xl mb-4">Ready to Analyze Your Lease?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of tenants who have gained clarity and confidence about their rental agreements. 
            Start your analysis today - it's free for your first lease review.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <AuthModal onAuthSuccess={onAuthSuccess}>
              <Button size="lg" className="text-lg px-8">
                Start Free Analysis
              </Button>
            </AuthModal>
            <Button variant="outline" size="lg" className="text-lg px-8">
              View Sample Report
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}