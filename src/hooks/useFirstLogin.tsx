
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import FirstLoginPrompt from "@/components/auth/FirstLoginPrompt";
import { User } from "@/context/AuthContext";

export const useFirstLogin = (user: User | null) => {
  const [showFirstLoginPrompt, setShowFirstLoginPrompt] = useState(false);
  const [isCheckingFirstLogin, setIsCheckingFirstLogin] = useState(true);

  useEffect(() => {
    const checkFirstLogin = async () => {
      if (!user) {
        setIsCheckingFirstLogin(false);
        return;
      }

      try {
        // Skip column existence check and directly try to access the profile
        const { data, error } = await supabase
          .from("profiles")
          .select("first_login_completed")
          .eq("id", user.id)
          .single();
          
        if (error) {
          console.error("Error checking first login status:", error);
        } else {
          // If first_login_completed is null or false, show prompt
          if (data && data.first_login_completed !== true) {
            setShowFirstLoginPrompt(true);
          }
        }
      } catch (err) {
        console.error("Error in first login check:", err);
      } finally {
        setIsCheckingFirstLogin(false);
      }
    };

    checkFirstLogin();
  }, [user?.id]);

  const handlePasswordUpdated = () => {
    setShowFirstLoginPrompt(false);
  };

  const firstLoginComponent = user && showFirstLoginPrompt ? (
    <FirstLoginPrompt 
      userId={user.id}
      userName={user.name}
      userEmail={user.email}
      onPasswordUpdated={handlePasswordUpdated} 
    />
  ) : null;

  return {
    isCheckingFirstLogin,
    showFirstLoginPrompt,
    firstLoginComponent
  };
};
