
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

type ResetStep = "email" | "otp" | "password";

const passwordSchema = z.object({
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ForgotPasswordDialog = ({ open, onClose }: ForgotPasswordDialogProps) => {
  const { resetPassword, verifyOTP, updatePassword, isLoading } = useAuth();
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Handle countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }
    
    try {
      await resetPassword(email);
      setCountdown(60); // Set 60 seconds countdown for resend
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    try {
      setError(null);
      await resetPassword(email);
      setCountdown(60); // Reset countdown
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleSubmitOTP = async () => {
    setError(null);
    
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    
    try {
      const verified = await verifyOTP(email, otp);
      if (verified) {
        setStep("password");
      } else {
        setError("The verification code is incorrect");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const handleSubmitPassword = async (values: z.infer<typeof passwordSchema>) => {
    setError(null);
    
    try {
      await updatePassword(email, values.password);
      onClose();
      toast({
        title: "Password updated",
        description: "You can now sign in with your new password",
      });
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const resetDialog = () => {
    setStep("email");
    setEmail("");
    setOtp("");
    setError(null);
    form.reset();
    setCountdown(0);
  };
  
  const handleClose = () => {
    resetDialog();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === "email" && "Reset your password"}
            {step === "otp" && "Verify your identity"}
            {step === "password" && "Create new password"}
          </DialogTitle>
          <DialogDescription>
            {step === "email" && "Enter your email address and we'll send you a verification code"}
            {step === "otp" && "Enter the 6-digit code sent to your email"}
            {step === "password" && "Enter your new password"}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {step === "email" && (
          <form onSubmit={handleSubmitEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button onClick={handleClose} variant="outline" type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send code"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
        
        {step === "otp" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="flex justify-center my-4">
                <InputOTP 
                  maxLength={6} 
                  value={otp} 
                  onChange={setOtp}
                  render={({ slots }) => (
                    <InputOTPGroup>
                      {slots && slots.map((slot, index) => (
                        <InputOTPSlot key={index} {...slot} index={index} />
                      ))}
                    </InputOTPGroup>
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code we sent to {email}
              </p>
              
              <div className="flex justify-center mt-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || isLoading}
                  className="text-xs"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                </Button>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => setStep("email")} variant="outline" type="button" className="w-full sm:w-auto">
                Back
              </Button>
              <Button 
                onClick={handleSubmitOTP} 
                disabled={isLoading || otp.length !== 6}
                type="button"
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify code"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
        
        {step === "password" && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitPassword)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>
                      At least 6 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button onClick={() => setStep("otp")} variant="outline" type="button">
                  Back
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update password"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
