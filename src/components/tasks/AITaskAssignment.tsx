
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Award, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Task } from "@/utils/mockData";
import { recommendOperatorForTask } from "@/utils/aiTaskPrediction";

interface AITaskAssignmentProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (taskId: string, operatorId: string) => void;
}

const AITaskAssignment = ({
  task,
  isOpen,
  onClose,
  onAssign,
}: AITaskAssignmentProps) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Array<{operatorId: string, name: string, score: number}>>([]);
  const { toast } = useToast();

  // Generate recommendations when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open && recommendations.length === 0) {
      setLoading(true);
      
      // Simulate AI processing time
      setTimeout(() => {
        const recs = recommendOperatorForTask(task);
        setRecommendations(recs);
        setLoading(false);
      }, 1500);
    }
    
    if (!open) {
      onClose();
    }
  };

  const handleAssign = (operatorId: string, name: string) => {
    setLoading(true);
    
    // Simulate processing time
    setTimeout(() => {
      onAssign(task.id, operatorId);
      toast({
        title: "Task assigned",
        description: `Task assigned to ${name} based on AI recommendation.`,
      });
      setLoading(false);
      onClose();
    }, 800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Task Assignment Recommendations</DialogTitle>
          <DialogDescription>
            Based on operator skills, availability, and past performance
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <h3 className="font-medium">Task Details</h3>
            <p className="text-sm text-muted-foreground">{task.title}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant={task.priority === "high" ? "destructive" : (task.priority === "medium" ? "default" : "outline")}>
                {task.priority} priority
              </Badge>
              <Badge variant="secondary">
                Est. {task.estimatedHours} hours
              </Badge>
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                Analyzing operator data and generating recommendations...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-medium">Recommended Operators</h3>
              {recommendations.map((rec, index) => (
                <div key={rec.operatorId} className={`flex items-center justify-between p-3 rounded-lg border ${index === 0 ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    {index === 0 && <Award className="h-5 w-5 text-primary" />}
                    <Avatar>
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{rec.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Match score: {rec.score}
                        {index === 0 && " (Best match)"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleAssign(rec.operatorId, rec.name)}
                    variant={index === 0 ? "default" : "outline"}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Assign
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AITaskAssignment;
