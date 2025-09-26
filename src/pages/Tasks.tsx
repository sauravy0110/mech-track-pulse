
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TaskList from "@/components/tasks/TaskList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { mockTasks, Task, TaskStatus, TaskPriority, mockUsers } from "@/utils/mockData";
import { FilePlus, Search, Cpu } from "lucide-react";
import AITaskAssignment from "@/components/tasks/AITaskAssignment";
import { useToast } from "@/components/ui/use-toast";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import CreateTaskWithComponents from "@/components/tasks/CreateTaskWithComponents";

const Tasks = () => {
  const { user, isRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");
  const [isAIAssignmentOpen, setIsAIAssignmentOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(mockTasks);
  const { toast } = useToast();
  
  // Filter tasks based on search, status, priority, and tab
  const filteredTasks = localTasks.filter(task => {
    // Apply search filter
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    
    // Apply priority filter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    // Apply tab filter
    let matchesTab = true;
    if (activeTab === "assigned" && user) {
      matchesTab = task.assignedTo?.id === user.id;
    } else if (activeTab === "unassigned") {
      matchesTab = !task.assignedTo;
    } else if (activeTab === "delayed") {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      matchesTab = dueDate < today && task.status !== "completed";
    } else if (activeTab === "completed") {
      matchesTab = task.status === "completed";
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTab;
  });

  const handleOpenAIAssignment = (task: Task) => {
    setSelectedTask(task);
    setIsAIAssignmentOpen(true);
  };

  const handleAssignTask = (taskId: string, operatorId: string) => {
    // In a real app, this would call an API to update the task
    const updatedTasks = localTasks.map(task => {
      if (task.id === taskId) {
        const assignedOperator = mockUsers.operators.find(op => op.id === operatorId);
        return {
          ...task,
          assignedTo: assignedOperator ? 
            { 
              id: assignedOperator.id, 
              name: assignedOperator.name,
              role: assignedOperator.role
            } : null
        };
      }
      return task;
    });
    
    setLocalTasks(updatedTasks);
    toast({
      title: "Task Assigned",
      description: "The task has been successfully assigned using AI recommendations",
    });
  };

  const handleCreateTask = (newTask: Task) => {
    setLocalTasks([...localTasks, newTask]);
  };

  const canManageTasks = isRole(["supervisor", "owner"]);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all tasks in your workspace.
        </p>
      </div>
      
      <div className="flex flex-col gap-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="task-search" className="sr-only">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="task-search"
                    placeholder="Search tasks..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status-filter" className="sr-only">
                  Filter by Status
                </Label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority-filter" className="sr-only">
                  Filter by Priority
                </Label>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger id="priority-filter">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {canManageTasks && (
                <div className="col-span-1 md:col-span-4 flex flex-wrap justify-end gap-3">
                  <Button variant="outline" className="flex items-center" onClick={() => {
                    // Find first unassigned task
                    const unassignedTask = localTasks.find(task => !task.assignedTo);
                    if (unassignedTask) {
                      handleOpenAIAssignment(unassignedTask);
                    } else {
                      toast({
                        title: "No unassigned tasks",
                        description: "All tasks are currently assigned.",
                        variant: "default"
                      });
                    }
                  }}>
                    <Cpu className="mr-2 h-4 w-4" />
                    AI Assign
                  </Button>
                  <Button 
                    className="flex items-center"
                    onClick={() => setIsComponentModalOpen(true)}
                  >
                    <FilePlus className="mr-2 h-4 w-4" />
                    Create MSME Task
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex items-center"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <FilePlus className="mr-2 h-4 w-4" />
                    Create Custom Task
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Task Categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
            <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
            <TabsTrigger value="delayed">Delayed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {filteredTasks.length > 0 ? (
              <TaskList tasks={filteredTasks} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-lg font-medium mb-2">No tasks found</p>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery 
                      ? "Try adjusting your search or filters"
                      : "There are no tasks in this category yet"}
                  </p>
                  {canManageTasks && (
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <FilePlus className="mr-2 h-4 w-4" />
                      Create New Task
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Task Assignment Modal */}
      {selectedTask && (
        <AITaskAssignment
          task={selectedTask}
          isOpen={isAIAssignmentOpen}
          onClose={() => setIsAIAssignmentOpen(false)}
          onAssign={handleAssignTask}
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
      />

      {/* Create MSME Task Modal */}
      <CreateTaskWithComponents
        isOpen={isComponentModalOpen}
        onClose={() => setIsComponentModalOpen(false)}
        onTaskCreate={(taskData) => {
          console.log('New MSME task created:', taskData);
          handleCreateTask(taskData);
        }}
      />
    </DashboardLayout>
  );
};

export default Tasks;
