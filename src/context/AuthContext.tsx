import React, { createContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import { useDemoUser } from "@/hooks/useDemoUser";

export type UserRole = "operator" | "supervisor" | "client" | "owner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  isDemo?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemo: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  setDemoUser: (role: UserRole) => void;
  clearDemoUser: () => void;
  resetPassword: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  updatePassword: (email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  isDemo: false,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  setDemoUser: () => {},
  clearDemoUser: () => {},
  resetPassword: async () => {},
  verifyOTP: async () => false,
  updatePassword: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use our extracted hooks
  const { isDemo, setDemoUser, clearDemoUser } = useDemoUser(setUser, setSession, initializeAuth);
  const { resetPassword, verifyOTP, updatePassword } = usePasswordReset(setIsLoading);

  // Check for demo mode on component mount
  useEffect(() => {
    const demoRole = localStorage.getItem('mtp-demo-role');
    if (demoRole) {
      // If we have a demo role stored, set up a demo user
      setDemoUser(demoRole as UserRole);
    } else {
      // Otherwise, initialize regular auth
      initializeAuth();
    }
  }, []);

  // Set up auth state listener and check for existing session
  const initializeAuth = async () => {
    try {
      // Set up auth state listener first
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, currentSession) => {
          setSession(currentSession);
          
          if (currentSession?.user) {
            // Don't fetch user profile here, just update basic user info
            const supaUser = currentSession.user;
            
            // Check for metadata with name and role
            const metadata = supaUser.user_metadata || {};
            
            setUser({
              id: supaUser.id,
              name: metadata.name || supaUser.email?.split('@')[0] || 'User',
              email: supaUser.email || '',
              role: (metadata.role as UserRole) || 'operator',
              profileImage: metadata.profile_image,
            });
            
            // Defer additional data fetching
            setTimeout(() => {
              fetchUserProfile(supaUser);
            }, 0);
          } else {
            setUser(null);
          }
        }
      );

      // Check for existing session
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      setSession(existingSession);

      if (existingSession?.user) {
        // Update user state with basic info from session
        const supaUser = existingSession.user;
        const metadata = supaUser.user_metadata || {};
        
        setUser({
          id: supaUser.id,
          name: metadata.name || supaUser.email?.split('@')[0] || 'User',
          email: supaUser.email || '',
          role: (metadata.role as UserRole) || 'operator',
          profileImage: metadata.profile_image,
        });
        
        // Fetch complete user profile
        await fetchUserProfile(supaUser);
      }

      setIsLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Error initializing auth:", error);
      setIsLoading(false);
    }
  };
  
  // Separate function to fetch user profile data
  const fetchUserProfile = async (supaUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supaUser.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (profile) {
        setUser({
          id: supaUser.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as UserRole,
          profileImage: profile.profile_image,
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      setIsLoading(true);
      
      // Clear any demo mode
      localStorage.removeItem('mtp-demo-role');
      
      // First, check if this email exists in the profiles table with the correct role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, id')
        .eq('email', email)
        .maybeSingle();
      
      if (profileError) {
        console.error("Error checking profile:", profileError);
      } else if (profileData && profileData.role !== role) {
        // Role mismatch
        toast({
          title: "Access denied",
          description: `This email is registered as a ${profileData.role}, not as a ${role}.`,
          variant: "destructive",
        });
        setIsLoading(false);
        throw new Error(`This email is registered as a ${profileData.role}, not as a ${role}.`);
      }
      
      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Check if email is confirmed
      if (!data.user?.email_confirmed_at) {
        // Email not confirmed
        toast({
          title: "Email not verified",
          description: "Please verify your email before logging in. Check your inbox for a verification link.",
          variant: "destructive",
        });
        
        // Sign out since email is not confirmed
        await supabase.auth.signOut();
        throw new Error("Email not verified. Please check your inbox for a verification link.");
      }
      
      // Success is handled by onAuthStateChange listener
      toast({
        title: "Login successful",
        description: `Welcome back!`,
      });
      
      return;
    } catch (error: any) {
      console.error("Login failed", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      setIsLoading(true);
      
      // Clear any demo mode
      localStorage.removeItem('mtp-demo-role');
      
      // Check if there's already an account with this email and role
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', email)
        .maybeSingle();
        
      if (profileError) {
        console.error("Error checking existing profile:", profileError);
      } else if (existingProfile) {
        // Profile exists with this email
        const message = existingProfile.role === role
          ? "There is already an account with this email address."
          : `This email is already registered as a ${existingProfile.role}.`;
        
        toast({
          title: "Email already in use",
          description: message,
          variant: "destructive",
        });
        throw new Error(message);
      }

      // Create new account with email confirmation required
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
          emailRedirectTo: window.location.origin,
        },
      });
      
      if (error) throw error;
      
      // Check if the user is created but needs email confirmation
      if (data?.user && !data.user.email_confirmed_at) {
        toast({
          title: "Registration successful",
          description: "Please check your email to verify your account before logging in.",
        });
      } else {
        toast({
          title: "Registration successful",
          description: `Welcome, ${name}!`,
        });
      }
      
      return;
    } catch (error: any) {
      console.error("Registration failed", error);
      
      if (error.message.includes("already registered")) {
        toast({
          title: "Email already in use",
          description: "There is already an account with this email address.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // First check if we're in demo mode
      if (isDemo) {
        clearDemoUser();
        toast({
          title: "Demo mode exited",
          description: "You have been logged out of demo mode.",
        });
        return;
      }
      
      // Otherwise, perform a regular logout
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      console.error("Logout failed", error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        isDemo,
        login,
        logout,
        register,
        setDemoUser,
        clearDemoUser,
        resetPassword,
        verifyOTP,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
