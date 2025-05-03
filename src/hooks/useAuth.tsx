
import { useContext } from "react";
import { AuthContext, UserRole, User } from "@/context/AuthContext";
import { Session } from "@supabase/supabase-js";

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemo: boolean; // Added for demo mode
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  isRole: (role: UserRole | UserRole[]) => boolean;
  setDemoUser: (role: UserRole) => void; // Added for demo mode
  clearDemoUser: () => void; // Added for demo mode
}

export const useAuth = (): UseAuthReturn => {
  const auth = useContext(AuthContext);

  const isRole = (role: UserRole | UserRole[]): boolean => {
    if (!auth.user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(auth.user.role);
    }
    
    return auth.user.role === role;
  };

  return {
    ...auth,
    isRole,
  };
};
