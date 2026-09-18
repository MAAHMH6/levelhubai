import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useParentChildren } from "@/hooks/useParentChildren";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, ChevronRight, User, TrendingUp, TrendingDown, BookOpen, LogOut } from "lucide-react";
import { AddChildModal } from "@/components/parent/AddChildModal";

const ParentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: children, isLoading } = useParentChildren();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { loading: authLoading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl hidden sm:block">LevelHubAI <span className="text-primary font-normal text-sm ml-2">Parent</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Child
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Good evening, {user?.user_metadata?.first_name || "Parent"} 👋</h1>
          <p className="text-muted-foreground">Here is an overview of your children's progress.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-48"></CardContent>
              </Card>
            ))}
          </div>
        ) : children && children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <Card key={child.id} className="overflow-hidden hover:shadow-lg transition-all border-border/50 group cursor-pointer" onClick={() => navigate(`/parent/child/${child.id}`)}>
                <div className="h-2 bg-gradient-to-r from-primary to-primary/80" />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{child.name}</h3>
                        <p className="text-sm text-muted-foreground">{child.grade}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Overall Performance</span>
                        <span className="font-bold">{child.overall_score}%</span>
                      </div>
                      <Progress value={child.overall_score} className="h-2" />
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      {child.improvement >= 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-success" />
                          <span className="text-success font-medium">+{child.improvement}%</span>
                          <span className="text-muted-foreground">improvement</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-destructive" />
                          <span className="text-destructive font-medium">{child.improvement}%</span>
                          <span className="text-muted-foreground">decline</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t flex justify-between items-center text-sm group-hover:text-primary transition-colors">
                    <span className="font-medium">View Full Dashboard</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add another child card */}
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer bg-transparent" onClick={() => setIsAddModalOpen(true)}>
              <CardContent className="h-full min-h-[250px] flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Add Another Child</h3>
                <p className="text-sm text-center mt-2 max-w-[200px]">Connect another student account to track their progress</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Welcome to the Parent Dashboard</h2>
            <p className="text-muted-foreground mb-8">
              Connect your child's LevelHubAI account to monitor their academic progress, see AI-driven insights, and help them improve.
            </p>
            <Button size="lg" onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
              <Plus className="w-5 h-5 mr-2" />
              Link Child Account
            </Button>
          </div>
        )}
      </main>

      <AddChildModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
};

export default ParentDashboard;
