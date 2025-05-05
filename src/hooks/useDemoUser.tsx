
import { useState, useCallback } from 'react';
import { UserRole, User } from '@/context/AuthContext';
import { Session } from '@supabase/supabase-js';

type SetUserFunction = React.Dispatch<React.SetStateAction<User | null>>;
type SetSessionFunction = React.Dispatch<React.SetStateAction<Session | null>>;

export const useDemoUser = (
  setUser: SetUserFunction,
  setSession: SetSessionFunction,
  initializeAuth: () => Promise<void>
) => {
  const [isDemo, setIsDemo] = useState(false);
  
  // Create a demo user without authentication
  const setDemoUser = useCallback((role: UserRole) => {
    // Clear any previous auth state
    setSession(null);
    
    const demoUser: User = {
      id: `demo-${role}-${Date.now()}`,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `demo-${role}@mechtrackpulse.com`,
      role: role,
      isDemo: true
    };
    
    setUser(demoUser);
    setIsDemo(true);
    localStorage.setItem('mtp-demo-role', role);
  }, [setUser, setSession]);
  
  // Clear the demo user
  const clearDemoUser = useCallback(() => {
    setUser(null);
    setIsDemo(false);
    localStorage.removeItem('mtp-demo-role');
    initializeAuth();
  }, [setUser, initializeAuth]);

  return {
    isDemo,
    setDemoUser,
    clearDemoUser
  };
};
