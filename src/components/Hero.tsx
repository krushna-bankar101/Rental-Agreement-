import { Button } from "./ui/button";
import { ImageWithFallback } from "./backupimg/ImageWithFallback";
import { AuthModal } from "./AuthModal";
import { Shield, FileText, Users } from "lucide-react";

interface HeroProps {
  onAuthSuccess?: (user: any) => void;
}

export function Hero({ onAuthSuccess }: HeroProps) {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Shield className="h-4 w-4 mr-2" />
                A Crystal-Clear Goal
              </div>
              <h1 className="text-4xl lg:text-6xl leading-tight">
                Empowering Tenants Through{" "}
                <span className="text-primary">Transparent</span> Rental Agreements
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Making rental agreements fair and understandable for everyone. Get the tools, knowledge, and support you need to protect your rights as a tenant.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <AuthModal onAuthSuccess={onAuthSuccess}>
                <Button size="lg" className="text-lg px-8">
                  Analyze My Lease
                </Button>
              </AuthModal>
              <Button variant="outline" size="lg" className="text-lg px-8">
                Learn More
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10,000+</div>
                <div className="text-sm text-muted-foreground">Tenants Helped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Cities Covered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1730656447409-eacbfc60dd47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWdhbCUyMGRvY3VtZW50cyUyMGNvbnRyYWN0JTIwc2lnbmluZ3xlbnwxfHx8fDE3NTcyNDQ3NDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Modern apartment building representing fair housing"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">Lease Analyzed</div>
                  <div className="text-sm text-muted-foreground">3 issues found</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">Community Support</div>
                  <div className="text-sm text-muted-foreground">24/7 available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}