import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { LeaseAnalyzer } from "./LeaseAnalyzer";
import { 
  FileText, 
  Users, 
  BookOpen, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  LogOut
} from "lucide-react";
import { supabase } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface DashboardProps {
  user: any;
  accessToken: string;
  onLogout: () => void;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  analysisCount: number;
  subscription: string;
}

interface AnalysisSummary {
  id: string;
  fileName: string;
  location: string;
  analysisDate: string;
  overallScore: number;
  issueCount: number;
}

export function Dashboard({ user, accessToken, onLogout }: DashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load user profile
      const profileResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bda67e5/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData.profile);
      }

      // Load analyses history
      const analysesResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bda67e5/analyses`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (analysesResponse.ok) {
        const analysesData = await analysesResponse.json();
        setAnalyses(analysesData.analyses);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout(); // Still logout on error
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">CT</span>
            </div>
            <div>
              <h1 className="font-semibold">Welcome back, {profile?.name || 'User'}!</h1>
              <p className="text-sm text-muted-foreground">Tenant Dashboard</p>
            </div>
          </div>

          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{profile?.analysisCount || 0}</div>
                <div className="text-sm text-muted-foreground">Analyses Done</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {analyses.length > 0 ? Math.round(analyses.reduce((acc, a) => acc + a.overallScore, 0) / analyses.length) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {analyses.reduce((acc, a) => acc + a.issueCount, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Issues</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold capitalize">{profile?.subscription || 'Free'}</div>
                <div className="text-sm text-muted-foreground">Plan</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="analyze" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analyze">Analyze Lease</TabsTrigger>
            <TabsTrigger value="history">My Analyses</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            <LeaseAnalyzer user={user} accessToken={accessToken} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl mb-4">Analysis History</h3>
              
              {analyses.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg mb-2">No analyses yet</h4>
                  <p className="text-muted-foreground mb-4">
                    Start by analyzing your first lease agreement
                  </p>
                  <Button onClick={() => document.querySelector('[value="analyze"]')?.click()}>
                    Analyze Your First Lease
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {analyses.map((analysis) => (
                    <div key={analysis.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{analysis.fileName}</h4>
                        <div className={`text-xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                          {analysis.overallScore}%
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>{analysis.location || 'Unknown Location'}</span>
                        <span>•</span>
                        <span>{new Date(analysis.analysisDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{analysis.issueCount} issues found</span>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Download Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <BookOpen className="h-8 w-8 text-primary mb-4" />
                <h4 className="text-lg mb-2">Tenant Rights Guide</h4>
                <p className="text-muted-foreground text-sm mb-4">
                  Comprehensive guide to understanding your rights as a tenant
                </p>
                <Button variant="outline" size="sm">Read Guide</Button>
              </Card>

              <Card className="p-6">
                <Users className="h-8 w-8 text-primary mb-4" />
                <h4 className="text-lg mb-2">Community Forum</h4>
                <p className="text-muted-foreground text-sm mb-4">
                  Connect with other tenants and share experiences
                </p>
                <Button variant="outline" size="sm">Join Forum</Button>
              </Card>

              <Card className="p-6">
                <Clock className="h-8 w-8 text-primary mb-4" />
                <h4 className="text-lg mb-2">Legal Consultations</h4>
                <p className="text-muted-foreground text-sm mb-4">
                  Book a consultation with tenant rights attorneys
                </p>
                <Button variant="outline" size="sm">Book Now</Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {profile?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl">{profile?.name}</h3>
                  <p className="text-muted-foreground">{profile?.email}</p>
                  <Badge className="mt-1">{profile?.subscription} Plan</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Member Since</label>
                    <p className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Analysis</label>
                    <p className="text-muted-foreground">
                      {analyses.length > 0 
                        ? new Date(analyses[0].analysisDate).toLocaleDateString()
                        : 'None yet'
                      }
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" className="mr-2">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline">Upgrade Plan</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}