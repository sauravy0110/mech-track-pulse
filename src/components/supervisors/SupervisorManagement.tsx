
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Phone, MessageSquare, Mail, FileText, UserPlus } from "lucide-react";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import AITaskAssignment from "@/components/tasks/AITaskAssignment";
import { useAuth } from "@/hooks/useAuth";

interface Supervisor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profile_image: string | null;
  status: string;
  operatorsCount?: number;
  tasksCount?: number;
}

const SupervisorManagement = () => {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isAIAssignmentOpen, setIsAIAssignmentOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
  const [newTask, setNewTask] = useState<any | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isRole } = useAuth();

  // Only supervisors and owners can assign tasks
  const canCreateTasks = isRole(["supervisor", "owner"]);

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "supervisor");

      if (error) throw error;

      // Get counts of operators and tasks for each supervisor (mocked for now)
      const supervisorsWithCounts = data.map(supervisor => ({
        ...supervisor,
        operatorsCount: Math.floor(Math.random() * 10) + 1,
        tasksCount: Math.floor(Math.random() * 20) + 5
      }));

      setSupervisors(supervisorsWithCounts);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
      toast({
        title: "Error",
        description: "Failed to load supervisors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string | null, name: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
      toast({
        title: "Calling supervisor",
        description: `Initiating call to ${name}`,
      });
    } else {
      toast({
        title: "No Phone Number",
        description: "This supervisor has no phone number recorded",
        variant: "destructive",
      });
    }
  };

  const handleMessage = (id: string, name: string) => {
    // Navigate to chat with the supervisor
    navigate(`/chat?userId=${id}&name=${encodeURIComponent(name)}`);
    toast({
      title: "Opening chat",
      description: `Opening chat with ${name}`,
    });
  };

  const handleEmail = (email: string, name: string) => {
    window.location.href = `mailto:${email}`;
    toast({
      title: "Send Email",
      description: `Composing email to ${name}`,
    });
  };

  const handleCreateTask = (supervisor: Supervisor) => {
    setSelectedSupervisor(supervisor);
    setIsCreateTaskOpen(true);
  };

  const handleTaskCreated = (taskData: any) => {
    setNewTask(taskData);
    setIsCreateTaskOpen(false);
    
    // Ask if they want to use AI to assign the task
    toast({
      title: "Task created",
      description: "Would you like to use AI to assign this task to an operator?",
      action: (
        <Button variant="outline" onClick={() => setIsAIAssignmentOpen(true)}>
          Use AI
        </Button>
      ),
    });
  };

  const handleAssignTask = (taskId: string, operatorId: string) => {
    // In a real app, this would update the task in the database
    console.log("Assigning task", taskId, "to operator", operatorId);
    
    toast({
      title: "Task assigned",
      description: "The task has been successfully assigned",
    });
    
    setIsAIAssignmentOpen(false);
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Supervisors ({supervisors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {supervisors.map((supervisor) => (
                <Card key={supervisor.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={supervisor.profile_image || ""} />
                        <AvatarFallback className="bg-secondary">
                          {supervisor.name
                            .split(" ")
                            .map(part => part.charAt(0))
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{supervisor.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{supervisor.email}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex justify-between mb-4">
                      <Badge variant="outline" className="bg-blue-50">
                        {supervisor.operatorsCount} Operators
                      </Badge>
                      <Badge variant="outline" className="bg-green-50">
                        {supervisor.tasksCount} Tasks
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCall(supervisor.phone, supervisor.name)}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMessage(supervisor.id, supervisor.name)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEmail(supervisor.email, supervisor.name)}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                      
                      {canCreateTasks && (
                        <Button 
                          size="sm" 
                          onClick={() => handleCreateTask(supervisor)}
                          className="ml-auto"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Create Task
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {supervisors.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No supervisors found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onCreateTask={handleTaskCreated}
      />
      
      {/* AI Task Assignment Modal */}
      {newTask && (
        <AITaskAssignment
          task={newTask}
          isOpen={isAIAssignmentOpen}
          onClose={() => setIsAIAssignmentOpen(false)}
          onAssign={handleAssignTask}
        />
      )}
    </div>
  );
};

export default SupervisorManagement;
