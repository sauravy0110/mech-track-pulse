
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CameraIcon } from "lucide-react";
import WorkUpdateModal from "./WorkUpdateModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface WorkUpdateButtonProps {
  taskId: string;
  taskTitle: string;
}

const WorkUpdateButton = ({ taskId, taskTitle }: WorkUpdateButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleButtonClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to submit work updates",
        variant: "destructive",
      });
      return;
    }
    
    setIsModalOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2"
        onClick={handleButtonClick}
      >
        <CameraIcon className="h-4 w-4 mr-1" />
        Update Progress
      </Button>
      
      <WorkUpdateModal
        taskId={taskId}
        taskTitle={taskTitle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default WorkUpdateButton;
