
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  password?: string;
  action: "send-otp" | "verify-otp" | "update-password";
  otp?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: { persistSession: false }
      }
    );

    const { email, password, action, otp } = await req.json() as PasswordResetRequest;

    if (action === "send-otp") {
      // For a real implementation, you would send an email with the OTP here
      // For now, just return the OTP for demonstration
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Check if user exists
      const { data: user, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
        
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
        
      // In a real implementation, store OTP in database with expiry
      // Here just returning it for demo purposes
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "OTP sent successfully",
          otp: generatedOtp, // In production, remove this and actually send via email
          expires: new Date(Date.now() + 15 * 60 * 1000).toISOString() 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    else if (action === "update-password") {
      if (!password) {
        return new Response(
          JSON.stringify({ error: "Password is required" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      // Find user by email
      const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (usersError) {
        return new Response(
          JSON.stringify({ error: "Failed to find user" }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      const user = users.find(u => u.email === email);
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      // Update user password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password }
      );
      
      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to update password" }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Password updated successfully" 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Invalid action
    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
