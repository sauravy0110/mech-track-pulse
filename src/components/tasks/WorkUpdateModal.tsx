
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface WorkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
}

const WorkUpdateModal = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
}: WorkUpdateModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageCapture, setImageCapture] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Start camera when modal is opened
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setImageCapture(null);
      setPreviewUrl(null);
      setComment("");
      setCameraError(null);
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }
      });
      
      mediaStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Unable to access camera. Please check permissions.");
      toast({
        title: "Camera Error",
        description: "Unable to access your camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0);
        
        // Add timestamp overlay
        const now = new Date();
        const timestamp = now.toLocaleString();
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
        
        ctx.font = "14px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "right";
        ctx.fillText(timestamp, canvas.width - 10, canvas.height - 10);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            setImageCapture(blob);
            setPreviewUrl(URL.createObjectURL(blob));
            stopCamera();
          } else {
            toast({
              title: "Image Capture Failed",
              description: "Failed to capture image. Please try again.",
              variant: "destructive",
            });
          }
        }, "image/jpeg", 0.9);
      }
    }
  };

  const handleSubmit = async () => {
    if (!imageCapture || !user) {
      toast({
        title: "Missing Information",
        description: !imageCapture 
          ? "Please capture an image before submitting." 
          : "You must be logged in to submit updates.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload image to Supabase Storage
      const file = new File([imageCapture], `work_update_${Date.now()}.jpg`, { 
        type: "image/jpeg" 
      });
      
      console.log("Uploading image to storage...");
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("work_updates")
        .upload(`${user.id}/${taskId}/${file.name}`, file);
      
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      const imageUrl = `${uploadData.path}`;
      console.log("Image uploaded successfully:", imageUrl);
      
      // 2. Create work update record
      console.log("Creating work update record...");
      const { data: insertData, error: insertError } = await supabase
        .from("work_updates")
        .insert({
          task_id: taskId,
          operator_id: user.id,
          image_url: imageUrl,
          comment: comment.trim() || null,
          submitted_at: new Date().toISOString(),
          status: "pending"
        })
        .select();
      
      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }
      
      console.log("Work update submitted successfully:", insertData);
      
      toast({
        title: "Update Submitted",
        description: "Your work progress update has been submitted successfully.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error submitting work update:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const retakePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setImageCapture(null);
    setPreviewUrl(null);
    startCamera();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Work Progress</DialogTitle>
          <DialogDescription>
            Capture a photo of your work progress for: {taskTitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-3">
            {!previewUrl ? (
              <>
                <div className="relative w-full h-64 bg-gray-100 border border-gray-300 rounded-md overflow-hidden">
                  {cameraError ? (
                    <div className="h-full flex items-center justify-center p-4 text-center text-muted-foreground">
                      {cameraError}
                    </div>
                  ) : (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <Button 
                  onClick={captureImage} 
                  className="flex items-center"
                  disabled={!!cameraError}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Photo
                </Button>
              </>
            ) : (
              <>
                <div className="relative w-full h-64 bg-gray-100 border border-gray-300 rounded-md overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Captured image" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={retakePhoto}
                >
                  Retake Photo
                </Button>
              </>
            )}
          </div>
          
          <div>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment about your progress (optional)"
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !previewUrl}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkUpdateModal;
