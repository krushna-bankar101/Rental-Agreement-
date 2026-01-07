import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "../assets/6cdd00d4343edbe920fff98e48b1d290e1988e7e.png";



interface HeaderProps {
  renderAuthButtons?: () => React.ReactNode;
  renderMobileAuthButtons?: () => React.ReactNode;
}

export function Header({ renderAuthButtons, renderMobileAuthButtons }: HeaderProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <img src={logo} alt="ClearTenant Logo" className="h-6 w-6 rounded-[9px] px-[1px] py-[2px] mx-[0.1px] my-[0px]" />
          </div>
          <span className="text-xl font-semibold">ClearTenant</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#resources" className="text-muted-foreground hover:text-foreground transition-colors">
            Resources
          </a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
        </nav>

        {renderAuthButtons ? renderAuthButtons() : (
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost">Log In</Button>
            <Button>Get Started</Button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#resources" className="text-muted-foreground hover:text-foreground transition-colors">
              Resources
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            {renderMobileAuthButtons ? renderMobileAuthButtons() : (
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="ghost" className="justify-start">Log In</Button>
                <Button className="justify-start">Get Started</Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}