import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";
import { Resources } from "./components/Resources";
import { Footer } from "./components/Footer";
import { Dashboard } from "./components/Dashboard";
import { AuthModal } from "./components/AuthModal";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { supabase } from "./utils/supabase/client";

import type { User } from "@supabase/supabase-js";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && session?.access_token) {
          setUser(session.user);
          setAccessToken(session.access_token);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user && session?.access_token) {
        setUser(session.user);
        setAccessToken(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAccessToken('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    // Access token will be set by the auth state change listener
  };

  const handleLogout = () => {
    setUser(null);
    setAccessToken('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-11 w-11 border-b-5 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show dashboard if user is signed in
  if (user && accessToken) {
    return (
      <>
        <Dashboard user={user} accessToken={accessToken} onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  // Show landing page with enhanced header
  return (
    <>
      <div className="min-h-screen bg-background">
        <Header 
          renderAuthButtons={() => (
            <div className="hidden md:flex items-center space-x-4">
              <AuthModal onAuthSuccess={handleAuthSuccess}>
                <Button variant="ghost">Log In</Button>
              </AuthModal>
              <AuthModal onAuthSuccess={handleAuthSuccess}>
                <Button>Get Started</Button>
              </AuthModal>
            </div>
          )}
          renderMobileAuthButtons={() => (
            <div className="flex flex-col space-y-2 pt-4 border-t">
              <AuthModal onAuthSuccess={handleAuthSuccess}>
                <Button variant="ghost" className="justify-start">Log In</Button>
              </AuthModal>
              <AuthModal onAuthSuccess={handleAuthSuccess}>
                <Button className="justify-start">Get Started</Button>
              </AuthModal>
            </div>
          )}
        />
        <main>
          <Hero onAuthSuccess={handleAuthSuccess} />
          <Features />
          <HowItWorks onAuthSuccess={handleAuthSuccess} />
          <Resources />
        </main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
}