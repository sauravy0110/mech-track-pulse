
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/context/AuthContext";

const Index = () => {
  const { isAuthenticated, isLoading, setDemoUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard");
    }
    
    // Check for authentication error in URL
    const errorDescription = searchParams.get('error_description');
    if (errorDescription) {
      toast({
        title: "Authentication Error",
        description: decodeURIComponent(errorDescription),
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isLoading, navigate, searchParams]);

  const handleDemoAccess = (role: UserRole) => {
    // Set demo user and redirect to dashboard
    setDemoUser(role);
    
    // Display a toast to inform the user
    toast({
      title: "Demo Mode Activated",
      description: `Using the application in ${role} demo mode.`,
    });
    
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-mechanical-800 to-mechanical-600">
      <header className="p-4">
        <div className="container mx-auto">
          <div className="flex items-center">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/652b5d11-8b9e-4675-b76c-5f552280f24f.png" 
                alt="MechTrackPulse Logo" 
                className="h-16 w-auto"
              />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-6">
        <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Real-Time Work Progress Tracking for Mechanical Companies
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-8">
            Streamline operations, boost productivity, and enhance client satisfaction with our comprehensive tracking system.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => handleDemoAccess("operator")}
              className="bg-white text-mechanical-800 hover:bg-white/90"
            >
              Operator Demo
            </Button>
            <Button 
              onClick={() => handleDemoAccess("supervisor")}
              className="bg-white text-mechanical-800 hover:bg-white/90"
            >
              Supervisor Demo
            </Button>
            <Button 
              onClick={() => handleDemoAccess("client")}
              className="bg-white text-mechanical-800 hover:bg-white/90"
            >
              Client Demo
            </Button>
            <Button 
              onClick={() => handleDemoAccess("owner")}
              className="bg-white text-mechanical-800 hover:bg-white/90"
            >
              Owner Demo
            </Button>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 max-w-md">
          <AuthForm />
        </div>
      </main>
      
      <footer className="p-6 text-center text-white/70">
        <p>&copy; 2025 MechTrackPulse. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
