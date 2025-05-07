
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
        // First check if first_login_completed column exists
        const { data: columnsData, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_name', 'profiles')
          .eq('table_schema', 'public')
          .eq('column_name', 'first_login_completed');

        const columnExists = columnsData && columnsData.length > 0;

        if (columnExists) {
          // If column exists, check if first login is completed
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
        } else {
          console.log("first_login_completed column doesn't exist in profiles table yet");
          // Column doesn't exist, we'll assume no first login required
          // You might want to run the migration at this point
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
