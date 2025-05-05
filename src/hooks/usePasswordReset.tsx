
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type SetLoadingFunction = React.Dispatch<React.SetStateAction<boolean>>;

export const usePasswordReset = (setIsLoading: SetLoadingFunction) => {
  // Reset password by sending reset email with OTP
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      // Check if the email exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      if (profileError) {
        console.error("Error checking email:", profileError);
      }
      
      if (!profile) {
        toast({
          title: "Email not found",
          description: "There is no account registered with this email address.",
          variant: "destructive",
        });
        throw new Error("Email not found");
      }
      
      // Call our edge function to generate and send OTP
      const { data, error } = await supabase.functions.invoke('password-reset', {
        body: {
          email,
          action: "send-otp"
        }
      });
      
      if (error) {
        throw new Error(error.message || "Failed to send verification code");
      }
      
      if (data && data.otp) {
        // In a real implementation, the OTP would be sent via email and not returned
        // For demonstration, we show the OTP in the toast
        console.log(`OTP for ${email}: ${data.otp}`);
        
        toast({
          title: "Verification code sent",
          description: `A verification code has been sent to ${email}. For this demo, use code: ${data.otp}`,
        });
      }
      
      return;
    } catch (error: any) {
      console.error("Password reset failed", error);
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify the OTP code
  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Verify OTP with edge function
      const { data, error } = await supabase.functions.invoke('password-reset', {
        body: {
          email,
          otp,
          action: "verify-otp"
        }
      });
      
      if (error) {
        toast({
          title: "Verification failed",
          description: error.message || "Could not verify code",
          variant: "destructive",
        });
        return false;
      }
      
      if (data && data.success) {
        toast({
          title: "Code verified",
          description: "You can now set a new password.",
        });
        return true;
      } else {
        const errorMessage = data?.error || "The verification code is incorrect.";
        toast({
          title: "Invalid code",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error("OTP verification failed", error);
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update the user's password after OTP verification
  const updatePassword = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Update password with edge function
      const { data, error } = await supabase.functions.invoke('password-reset', {
        body: {
          email,
          password,
          action: "update-password"
        }
      });
      
      if (error) {
        throw new Error(error.message || "Failed to update password");
      }
      
      if (!data || !data.success) {
        throw new Error(data?.error || "Password update failed");
      }
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated. You can now log in with your new password.",
      });
    } catch (error: any) {
      console.error("Password update failed", error);
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    resetPassword,
    verifyOTP,
    updatePassword
  };
};
