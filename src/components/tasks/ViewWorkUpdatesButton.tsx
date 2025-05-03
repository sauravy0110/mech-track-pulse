
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import WorkUpdatesDrawer from "./WorkUpdatesDrawer";
import { useAuth } from "@/hooks/useAuth";

interface ViewWorkUpdatesButtonProps {
  taskId: string;
  taskTitle: string;
}

const ViewWorkUpdatesButton = ({ taskId, taskTitle }: ViewWorkUpdatesButtonProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isRole } = useAuth();
  
  // Only supervisors and owners can view the work updates
  const canViewWorkUpdates = isRole(["supervisor", "owner"]);
  
  if (!canViewWorkUpdates) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2"
        onClick={() => setIsDrawerOpen(true)}
      >
        <ImageIcon className="h-4 w-4 mr-1" />
        View Updates
      </Button>
      
      <WorkUpdatesDrawer
        taskId={taskId}
        taskTitle={taskTitle}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};

export default ViewWorkUpdatesButton;
