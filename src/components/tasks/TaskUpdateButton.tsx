
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import TaskUpdateModal from "./TaskUpdateModal";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TaskUpdateButtonProps {
  taskId: string;
  taskTitle: string;
}

const TaskUpdateButton = ({ taskId, taskTitle }: TaskUpdateButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmitUpdate = async (taskId: string, updateText: string) => {
    try {
      if (!user) {
        throw new Error("You must be logged in to submit updates");
      }

      setIsSubmitting(true);
      console.log("Submitting task update:", { taskId, updateText });
      
      // Create a record in the work_updates table in Supabase
      // This table already exists in the database schema
      const { data, error } = await supabase
        .from("work_updates")
        .insert({
          task_id: taskId,
          operator_id: user.id,
          comment: updateText,         // Using 'comment' field which exists in work_updates
          image_url: "",               // This field is required but we'll use an empty string
          submitted_at: new Date().toISOString()
        })
        .select();
        
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Task update saved:", data);
      
      toast({
        title: "Update added",
        description: "Your task update has been saved successfully",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error submitting task update:", error);
      
      toast({
        title: "Update failed",
        description: "Failed to save your task update. Please try again.",
        variant: "destructive",
      });
      
      return Promise.reject(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2"
        onClick={() => setIsModalOpen(true)}
      >
        <MessageSquarePlus className="h-4 w-4 mr-1" />
        Update
      </Button>
      
      <TaskUpdateModal
        taskId={taskId}
        taskTitle={taskTitle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitUpdate}
      />
    </>
  );
};

export default TaskUpdateButton;
