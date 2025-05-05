
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

export const useDemoAccess = () => {
  const [demoRole, setDemoRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();
  const { setDemoUser, clearDemoUser } = useAuth();
  
  useEffect(() => {
    // Check if there's a stored demo role on component mount
    const storedRole = localStorage.getItem('mtp-demo-role');
    if (storedRole) {
      setDemoRole(storedRole as UserRole);
    }
  }, []);
  
  const enterDemoMode = (role: UserRole) => {
    setDemoUser(role);
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
    clearDemoUser();
    setDemoRole(null);
    navigate('/');
  };
  
  return { demoRole, enterDemoMode, exitDemoMode };
};
