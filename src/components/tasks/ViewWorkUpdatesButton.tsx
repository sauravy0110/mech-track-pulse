
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2 } from "lucide-react";
import WorkUpdatesDrawer from "./WorkUpdatesDrawer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface ViewWorkUpdatesButtonProps {
  taskId: string;
  taskTitle: string;
}

const ViewWorkUpdatesButton = ({ taskId, taskTitle }: ViewWorkUpdatesButtonProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isRole, user } = useAuth();
  const { toast } = useToast();
  
  // Only supervisors and owners can view the work updates
  const canViewWorkUpdates = isRole(["supervisor", "owner"]);
  
  if (!canViewWorkUpdates) return null;

  const handleOpenDrawer = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to view work updates",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      // You could pre-fetch data here if needed
      setIsDrawerOpen(true);
    } catch (error) {
      console.error("Error opening updates drawer:", error);
      toast({
        title: "Error",
        description: "Failed to load work updates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2"
        onClick={handleOpenDrawer}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <ImageIcon className="h-4 w-4 mr-1" />
        )}
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
