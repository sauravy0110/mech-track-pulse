
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "operator" | "supervisor" | "client" | "owner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  isRole: (role: UserRole | UserRole[]) => boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  isRole: () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set up auth state listener and check for existing session
  useEffect(() => {
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

    initializeAuth();
  }, []);
  
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
      
      // Check if this email exists and if it has the correct role
      // In a real application, this should be validated server-side
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Check if the user role is correct
      // In a real application, the role would be stored in the database
      const userRole = data.user?.user_metadata?.role || '';
      
      if (userRole && userRole !== role) {
        // Role mismatch, sign out and notify
        await supabase.auth.signOut();
        toast({
          title: "Access denied",
          description: `This email is registered as a ${userRole}, not as a ${role}.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
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
      
      // Check for existing account with this email
      const { data: existingUsers, error: searchError } = await supabase.auth
        .signInWithPassword({
          email,
          password: "dummy-check-password",
        });
        
      if (!searchError) {
        // Email already exists
        toast({
          title: "Email already in use",
          description: "There is already an account with this email address.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create new account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });
      
      if (error) throw error;
      
      // Success is handled by onAuthStateChange listener and DB trigger
      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`,
      });
      
      return;
    } catch (error: any) {
      console.error("Registration failed", error);
      
      // Detect if the error is because email is already in use
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
  
  const isRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        isRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
