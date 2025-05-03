
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import TaskUpdateModal from "./TaskUpdateModal";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TaskUpdateButtonProps {
  taskId: string;
  taskTitle: string;
}

const TaskUpdateButton = ({ taskId, taskTitle }: TaskUpdateButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmitUpdate = async (taskId: string, updateText: string) => {
    try {
      // In a real app, this would call an API to update the task
      // For now, we'll just simulate the update with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // You would typically update a task_updates table in Supabase here
      console.log("Task update submitted:", { taskId, updateText });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error submitting task update:", error);
      return Promise.reject(error);
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
