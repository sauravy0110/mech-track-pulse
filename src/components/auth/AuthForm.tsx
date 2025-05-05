
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/context/AuthContext";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ForgotPasswordDialog from "./ForgotPasswordDialog";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("operator");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(true);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const { login, register } = useAuth();

  // Check if email already exists with a different role
  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (!isLogin && email && email.includes('@')) {
        setCheckingEmail(true);
        setEmailAvailable(true);

        try {
          // Check if email exists in the profiles table
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('email', email)
            .maybeSingle();
            
          if (error) throw error;
          
          // If data exists, check if the role matches
          if (data) {
            setEmailAvailable(data.role === role);
            if (data.role !== role) {
              setError(`This email is already registered as a ${data.role}`);
            } else {
              setError(null);
            }
          } else {
            setError(null);
          }
        } catch (err) {
          console.error("Error checking email:", err);
        } finally {
          setCheckingEmail(false);
        }
      }
    };

    const debounceTimer = setTimeout(checkEmailAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [email, role, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password, role);
      } else {
        if (!name.trim()) {
          setError("Name is required");
          setIsSubmitting(false);
          return;
        }
        
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setIsSubmitting(false);
          return;
        }
        
        if (!emailAvailable) {
          setError(`This email is already registered with a different role`);
          setIsSubmitting(false);
          return;
        }
        
        await register(name, email, password, role);
        toast({
          title: "Registration successful",
          description: "Please check your email for verification instructions before logging in.",
        });
        // Switch to login tab after registration
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("Authentication error", error);
      setError(error.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    // Re-check email availability with the new role
    if (!isLogin && email) {
      setCheckingEmail(true);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? "Login" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin
              ? "Enter your credentials to access your account"
              : "Fill in the form below to create your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="login" onValueChange={(value) => {
              setIsLogin(value === "login");
              setError(null);
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4 pt-4">
                {/* Login Form Fields */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal text-xs"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setForgotPasswordOpen(true);
                      }}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>User Role</Label>
                  <RadioGroup 
                    value={role} 
                    onValueChange={(value) => handleRoleChange(value as UserRole)}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="operator" id="operator" />
                      <Label htmlFor="operator">Operator</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="supervisor" id="supervisor" />
                      <Label htmlFor="supervisor">Supervisor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="client" id="client" />
                      <Label htmlFor="client">Client</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="owner" id="owner" />
                      <Label htmlFor="owner">Owner</Label>
                    </div>
                  </RadioGroup>
                </div>
              </TabsContent>
              <TabsContent value="register" className="space-y-4 pt-4">
                {/* Register Form Fields */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <div className="relative">
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={!emailAvailable ? "border-red-500" : ""}
                    />
                    {checkingEmail && (
                      <div className="absolute right-2 top-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {!emailAvailable && !checkingEmail && (
                    <p className="text-xs text-red-500">
                      This email is already registered with a different role.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>User Role</Label>
                  <RadioGroup 
                    value={role} 
                    onValueChange={(value) => handleRoleChange(value as UserRole)}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="operator" id="reg-operator" />
                      <Label htmlFor="reg-operator">Operator</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="supervisor" id="reg-supervisor" />
                      <Label htmlFor="reg-supervisor">Supervisor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="client" id="reg-client" />
                      <Label htmlFor="reg-client">Client</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="owner" id="reg-owner" />
                      <Label htmlFor="reg-owner">Owner</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Alert variant="info" className="bg-blue-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Email verification is required to activate your account
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || (!isLogin && !emailAvailable)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Logging in..." : "Registering..."}
                </>
              ) : (
                isLogin ? "Login" : "Register"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-primary hover:underline"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </CardFooter>
      </Card>
      
      <ForgotPasswordDialog 
        open={forgotPasswordOpen} 
        onClose={() => setForgotPasswordOpen(false)} 
      />
    </>
  );
};

export default AuthForm;
