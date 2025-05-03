
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Task } from "@/utils/mockData";
import { Calendar, Clock } from "lucide-react";
import TaskUpdateButton from "./TaskUpdateButton";

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "in-progress":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "delayed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-orange-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{task.title}</h3>
          <div className="flex gap-2">
            <Badge variant="outline" className={getStatusColor(task.status)}>
              {task.status}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            <span>Due: {formatDate(task.dueDate)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            <span>Est: {task.estimatedHours}h</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t flex justify-between">
        <div className="text-sm">
          {task.assignedTo ? (
            <span>Assigned to: {task.assignedTo.name}</span>
          ) : (
            <span className="text-muted-foreground italic">Unassigned</span>
          )}
        </div>
        <TaskUpdateButton taskId={task.id} taskTitle={task.title} />
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
