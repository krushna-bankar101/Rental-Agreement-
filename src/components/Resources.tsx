import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  BookOpen, 
  Play, 
  Download, 
  ExternalLink,
  Clock,
  Users,
  Star
} from "lucide-react";

const resources = [
  {
    type: "Guide",
    title: "Tenant Rights 101: Everything You Need to Know",
    description: "A comprehensive guide covering basic tenant rights, common issues, and how to protect yourself.",
    category: "Legal",
    readTime: "15 min read",
    rating: 4.9,
    downloads: 12500,
    icon: BookOpen
  },
  {
    type: "Video",
    title: "How to Negotiate Your Rent Like a Pro", 
    description: "Expert tips and strategies for successful rent negotiations with your landlord.",
    category: "Negotiation",
    readTime: "8 min watch",
    rating: 4.8,
    downloads: 8300,
    icon: Play
  },
  {
    type: "Template",
    title: "Lease Review Checklist",
    description: "A printable checklist to help you review any rental agreement before signing.",
    category: "Tools",
    readTime: "Quick reference",
    rating: 4.7,
    downloads: 15200,
    icon: Download
  },
  {
    type: "Guide",
    title: "Security Deposit Recovery Guide",
    description: "Step-by-step instructions for getting your full security deposit back when you move out.",
    category: "Legal",
    readTime: "12 min read",
    rating: 4.9,
    downloads: 9800,
    icon: BookOpen
  },
  {
    type: "Video",
    title: "Understanding Your Lease Agreement",
    description: "Break down complex lease terms and clauses in simple, understandable language.",
    category: "Education",
    readTime: "12 min watch",
    rating: 4.6,
    downloads: 6700,
    icon: Play
  },
  {
    type: "Template",
    title: "Maintenance Request Form",
    description: "Professional template for requesting repairs and maintenance from your landlord.",
    category: "Tools",
    readTime: "Quick use",
    rating: 4.8,
    downloads: 11400,
    icon: Download
  }
];

const categories = ["All", "Legal", "Negotiation", "Tools", "Education"];

export function Resources() {
  return (
    <section id="resources" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl mb-4">
            Free Resources to <span className="text-primary">Empower You</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Access our library of guides, templates, and educational materials created by tenant rights experts. 
            All resources are free and regularly updated with the latest legal information.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === "All" ? "default" : "secondary"}
              className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {resources.map((resource, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <resource.icon className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline">{resource.type}</Badge>
              </div>

              <div className="flex-grow space-y-3">
                <h3 className="text-lg leading-tight">{resource.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {resource.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {resource.readTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {resource.rating}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {resource.downloads.toLocaleString()} downloads
                </div>
              </div>

              <div className="pt-4 mt-auto">
                <Button className="w-full" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Access Resource
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="p-8 text-center bg-primary/5 border-primary/20">
          <h3 className="text-2xl mb-4">Want More Resources?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter and get access to exclusive guides, legal updates, 
            and expert tips delivered to your inbox every month.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              Subscribe Now
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Browse All Resources
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}