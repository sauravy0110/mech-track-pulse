
import { useContext } from "react";
import { AuthContext, UserRole, User } from "@/context/AuthContext";
import { Session } from "@supabase/supabase-js";
import { CompanyDetailsFormValues } from "@/components/auth/CompanyDetailsForm";

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemo: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, companyDetails?: CompanyDetailsFormValues) => Promise<void>;
  isRole: (role: UserRole | UserRole[]) => boolean;
  setDemoUser: (role: UserRole) => void;
  clearDemoUser: () => void;
  resetPassword: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  updatePassword: (email: string, password: string) => Promise<void>;
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
