
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Camera, Mic, MicOff, Phone, AlertOctagon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import VoiceRecorder from "@/components/common/VoiceRecorder";

interface TaskUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskId: string;
}

const TaskUpdateModal = ({
  isOpen,
  onClose,
  onSuccess,
  taskId,
}: TaskUpdateModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [emergencyMode, setEmergencyMode] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    
    try {
      setUploading(true);
      let imageUrl = null;
      
      // Upload image if one was captured or selected
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        const filePath = `task-updates/${taskId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('work-updates')
          .upload(filePath, imageFile);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('work-updates')
          .getPublicUrl(filePath);
          
        imageUrl = data.publicUrl;
      }

      // Add update to database
      const { error } = await supabase
        .from('work_updates')
        .insert({
          task_id: taskId,
          operator_id: user.id,
          comment: comment || transcribedText || "Work update submitted",
          image_url: imageUrl,
          status: emergencyMode ? "emergency" : "pending",
        });

      if (error) throw error;
      
      // Show notification for emergency mode
      if (emergencyMode) {
        // Alert supervisors (in a real app, this would trigger notifications)
        toast({
          title: "EMERGENCY ALERT SENT",
          description: "Supervisors have been notified of your emergency situation",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Update Submitted",
          description: "Your task update has been submitted successfully",
        });
      }
      
      onSuccess();
      onClose();
      
    } catch (error: any) {
      console.error("Error submitting update:", error.message);
      toast({
        title: "Error",
        description: "Failed to submit task update",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImageCapture = async (file: File) => {
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setShowCamera(false);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEmergencyHelp = () => {
    setEmergencyMode(true);
    toast({
      title: "Emergency Mode Activated",
      description: "Submit this form to alert supervisors immediately",
      variant: "destructive",
    });
  };
  
  const handleVoiceTranscription = (text: string) => {
    setTranscribedText(text);
    setComment(text);
    setShowVoiceRecorder(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {emergencyMode && (
              <AlertOctagon className="h-5 w-5 text-red-500 mr-2" />
            )}
            {emergencyMode ? "EMERGENCY HELP REQUEST" : "Update Task Status"}
          </DialogTitle>
          <DialogDescription>
            {emergencyMode 
              ? "Your emergency help request will be sent to all supervisors immediately."
              : "Share your progress or any issues you're facing with this task."}
          </DialogDescription>
        </DialogHeader>

        {emergencyMode && (
          <Alert variant="destructive" className="bg-red-50">
            <AlertDescription className="font-semibold">
              Emergency mode activated! Supervisors will be alerted immediately upon submission.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4 py-4">
          {!showCamera && !showVoiceRecorder && (
            <>
              <div className="space-y-2">
                <Textarea
                  placeholder="Enter update details or use voice input..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowCamera(true)}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowVoiceRecorder(true)}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Voice Input
                    </Button>
                  </div>
                  
                  <Button
                    type="button" 
                    variant="destructive" 
                    size="sm"
                    onClick={handleEmergencyHelp}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Emergency Help
                  </Button>
                </div>
              </div>
              
              {capturedImage && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Attached Photo:</p>
                  <div className="relative border rounded-md overflow-hidden">
                    <img 
                      src={capturedImage} 
                      alt="Captured" 
                      className="w-full h-auto max-h-48 object-contain" 
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setCapturedImage(null);
                        setImageFile(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
              
              {!capturedImage && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Or upload a photo:</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </div>
              )}
            </>
          )}
          
          {showCamera && (
            <div className="space-y-4">
              <p className="text-sm font-medium">Take a photo:</p>
              <div className="relative aspect-video bg-black rounded-md overflow-hidden">
                {/* In a real app, this would be a proper camera component */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white">Camera preview would appear here</p>
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      // Simulate capturing an image
                      fetch('/placeholder.svg')
                        .then(res => res.blob())
                        .then(blob => {
                          const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                          handleImageCapture(file);
                        });
                    }}
                  >
                    Capture
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setShowCamera(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {showVoiceRecorder && (
            <div className="space-y-4">
              <p className="text-sm font-medium">Voice Input:</p>
              <VoiceRecorder
                onTranscriptionComplete={handleVoiceTranscription}
                onCancel={() => setShowVoiceRecorder(false)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={uploading || (showCamera || showVoiceRecorder)}
            className={emergencyMode ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {uploading ? "Submitting..." : (emergencyMode ? "Send Emergency Alert" : "Submit Update")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskUpdateModal;
