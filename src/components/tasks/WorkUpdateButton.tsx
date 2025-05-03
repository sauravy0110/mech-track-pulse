
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CameraIcon } from "lucide-react";
import WorkUpdateModal from "./WorkUpdateModal";

interface WorkUpdateButtonProps {
  taskId: string;
  taskTitle: string;
}

const WorkUpdateButton = ({ taskId, taskTitle }: WorkUpdateButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2"
        onClick={() => setIsModalOpen(true)}
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
