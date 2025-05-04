
import { useState } from "react";
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
import VoiceRecorder from "@/components/common/VoiceRecorder";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TaskUpdateModalProps {
  taskId: string;
  taskTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskId: string, updateText: string) => Promise<void>;
}

const TaskUpdateModal = ({
  taskId,
  taskTitle,
  isOpen,
  onClose,
  onSubmit,
}: TaskUpdateModalProps) => {
  const [updateText, setUpdateText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!updateText.trim()) {
      toast({
        title: "Empty update",
        description: "Please provide an update message",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit updates",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(`Submitting task update for task ${taskId}...`);
      await onSubmit(taskId, updateText);
      setUpdateText("");
      onClose();
      toast({
        title: "Update added",
        description: "Your progress update has been saved",
      });
    } catch (error) {
      console.error("Error submitting task update:", error);
      toast({
        title: "Update failed",
        description: "Failed to save your progress update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoiceInput = (text: string) => {
    setUpdateText((prev) => prev ? `${prev} ${text}` : text);
  };

  // Reset form when modal closes
  const handleClose = () => {
    if (!isSubmitting) {
      setUpdateText("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Task Progress</DialogTitle>
          <DialogDescription>
            Add a progress update for: {taskTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Textarea
              id="update"
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              placeholder="Enter your progress update..."
              className="resize-none"
              rows={5}
              disabled={isSubmitting}
            />
            <div className="self-start">
              <VoiceRecorder onTranscriptionComplete={handleVoiceInput} disabled={isSubmitting} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !updateText.trim()}
            className="relative"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskUpdateModal;
