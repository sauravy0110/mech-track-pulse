
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

const DEMO_STORAGE_KEY = 'mtp-demo-role';

export const useDemoAccess = () => {
  const [demoRole, setDemoRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if there's a stored demo role on component mount
    const storedRole = localStorage.getItem(DEMO_STORAGE_KEY);
    if (storedRole) {
      setDemoRole(storedRole as UserRole);
    }
  }, []);
  
  const enterDemoMode = (role: UserRole) => {
    localStorage.setItem(DEMO_STORAGE_KEY, role);
    setDemoRole(role);
    
    // Display a toast to inform the user
    toast({
      title: "Demo Mode Activated",
      description: `Using the application in ${role} demo mode.`,
    });
    
    // Navigate to dashboard
    navigate('/dashboard');
  };
  
  const exitDemoMode = () => {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setDemoRole(null);
    navigate('/');
  };
  
  return { demoRole, enterDemoMode, exitDemoMode };
};
