
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/context/AuthContext";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
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

  const handleDemoLogin = async (role: UserRole) => {
    // Create a demo email based on role
    const demoEmail = `demo-${role}@mechtrackpulse.com`;
    const demoPassword = "demo12345";
    
    try {
      // Try to sign in with the demo credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      });
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          // If the user doesn't exist, create a new one
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: demoEmail,
            password: demoPassword,
            options: {
              data: {
                name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
                role: role,
              }
            }
          });
          
          if (signUpError) throw signUpError;
          
          // Display a toast to inform the user about email verification
          toast({
            title: "Email Verification Required",
            description: "Please check your email for verification before logging in.",
          });
          
          return;
        }
        
        throw error;
      }
      
      // Display a toast to inform the user
      toast({
        title: "Demo Mode",
        description: `Using the application in ${role} demo mode.`,
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Demo login error:", error);
      toast({
        title: "Demo Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-mechanical-800 to-mechanical-600">
      <header className="p-6">
        <div className="container mx-auto">
          <div className="flex flex-col items-center">
            <div className="w-64 h-64 flex items-center justify-center mb-4">
              <img 
                src="/lovable-uploads/6d28bdaa-dc4e-49fd-abe0-0cab55db6c87.png" 
                alt="MechTrackPulse Logo" 
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="text-center text-white">
              <p className="text-xl">Precision. Progress. Performance.</p>
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
              onClick={() => handleDemoLogin("operator")}
              className="bg-white text-mechanical-800 hover:bg-white/90"
            >
              Operator Demo
            </Button>
            <Button 
              onClick={() => handleDemoLogin("supervisor")}
              className="bg-white text-mechanical-800 hover:bg-white/90"
            >
              Supervisor Demo
            </Button>
            <Button 
              onClick={() => handleDemoLogin("client")}
              className="bg-white text-mechanical-800 hover:bg-white/90"
            >
              Client Demo
            </Button>
            <Button 
              onClick={() => handleDemoLogin("owner")}
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
