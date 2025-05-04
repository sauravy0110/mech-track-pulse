
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Card,
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Search, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { recommendOperatorForTask, generatePerformanceInsights } from "@/utils/aiTaskPrediction";

interface AITaskAssignmentProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (taskId: string, operatorId: string) => void;
}

interface Operator {
  id: string;
  name: string;
  email: string;
  profile_image: string | null;
  status: string;
  department?: string | null;
  skills?: string | null;
  score?: number;
  taskCount?: number;
}

const AITaskAssignment = ({ 
  task, 
  isOpen, 
  onClose, 
  onAssign 
}: AITaskAssignmentProps) => {
  const [loading, setLoading] = useState(true);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [insight, setInsight] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchOperators();
      generateInsight();
    }
  }, [isOpen, task]);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      
      // Fetch operators from Supabase
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "operator");

      if (error) throw error;
      
      const operatorsWithTaskCount = await Promise.all(
        (data || []).map(async (operator) => {
          // Get current task count for each operator
          const { data: tasks, error: tasksError } = await supabase
            .from("tasks")
            .select("id")
            .eq("assigned_to", operator.id)
            .eq("status", "in_progress");
            
          return {
            ...operator,
            taskCount: tasksError ? 0 : (tasks?.length || 0)
          };
        })
      );
      
      setOperators(operatorsWithTaskCount);
      
      // Get AI recommendations
      const recommendations = await recommendOperatorForTask(task);
      
      // Match recommendations with full operator data
      const operatorsWithScores = operatorsWithTaskCount.map(op => {
        const recommendation = recommendations.find(rec => rec.operatorId === op.id);
        return {
          ...op,
          score: recommendation?.score || 0
        };
      }).sort((a, b) => (b.score || 0) - (a.score || 0));
      
      setAIRecommendations(operatorsWithScores);
      
    } catch (error) {
      console.error("Error fetching operators:", error);
      toast({
        title: "Error",
        description: "Failed to load operators",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInsight = () => {
    const insight = generatePerformanceInsights();
    setInsight(insight);
  };

  const handleAssign = async () => {
    if (!selectedOperator) {
      toast({
        title: "No operator selected",
        description: "Please select an operator to assign this task",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update task in database
      const { error } = await supabase
        .from("tasks")
        .update({
          assigned_to: selectedOperator,
          status: "assigned"
        })
        .eq("id", task.id);

      if (error) throw error;

      toast({
        title: "Task assigned",
        description: "Task has been successfully assigned",
      });
      
      onAssign(task.id, selectedOperator);
      onClose();
    } catch (error: any) {
      console.error("Error assigning task:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign task",
        variant: "destructive",
      });
    }
  };

  const filteredOperators = operators.filter(operator =>
    operator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (operator.skills && operator.skills.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  const getSkillMatchScore = (operatorSkills: string | null, requiredSkills: string | null) => {
    if (!operatorSkills || !requiredSkills) return 0;
    
    const opSkills = operatorSkills.toLowerCase().split(',').map(s => s.trim());
    const reqSkills = requiredSkills.toLowerCase().split(',').map(s => s.trim());
    
    if (reqSkills.length === 0) return 100;
    
    let matches = 0;
    reqSkills.forEach(req => {
      if (opSkills.some(op => op.includes(req) || req.includes(op))) {
        matches++;
      }
    });
    
    return Math.round((matches / reqSkills.length) * 100);
  };
  
  const renderOperatorCard = (operator: Operator) => {
    const skillMatchScore = getSkillMatchScore(operator.skills, task.required_skills);
    
    return (
      <Card 
        key={operator.id} 
        className={`cursor-pointer overflow-hidden hover:border-primary hover:shadow-md transition ${
          selectedOperator === operator.id ? 'border-2 border-primary' : ''
        }`}
        onClick={() => setSelectedOperator(operator.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={operator.profile_image || ""} />
              <AvatarFallback className="bg-primary">
                {getInitials(operator.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{operator.name}</h4>
              <p className="text-xs text-muted-foreground">{operator.email}</p>
            </div>
            <Badge
              className={`ml-auto ${
                operator.status === "online" ? "bg-green-100 text-green-800" :
                operator.status === "away" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}
            >
              {operator.status}
            </Badge>
          </div>
          
          {operator.skills && (
            <div className="mt-3">
              <div className="flex text-xs justify-between mb-1">
                <span>Skill match</span>
                <span className="font-medium">{skillMatchScore}%</span>
              </div>
              <Progress value={skillMatchScore} className="h-1" />
              <div className="mt-2 flex flex-wrap gap-1">
                {operator.skills.split(',').slice(0, 3).map((skill, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {skill.trim()}
                  </Badge>
                ))}
                {operator.skills.split(',').length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{operator.skills.split(',').length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 p-2 flex justify-between items-center">
          <span className="text-xs">
            Current tasks: <strong>{operator.taskCount || 0}</strong>
          </span>
          {operator.score !== undefined && (
            <Badge variant="secondary" className="text-xs">
              AI score: {operator.score}
            </Badge>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-5 w-5 text-primary mr-2" />
            AI Task Assignment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Alert variant="info" className="bg-blue-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {insight}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Task Details</h3>
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Title</p>
                  <p className="font-medium">{task.title}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <Badge className={`
                    ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'}
                  `}>
                    {task.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Hours</p>
                  <p>{task.estimated_hours || "Not specified"}</p>
                </div>
              </div>
              {task.required_skills && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">Required Skills</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {task.required_skills.split(',').map((skill: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {task.description && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm mt-1">{task.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search operators by name or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs defaultValue="ai_recommended">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="ai_recommended" className="flex-1">
                <Sparkles className="h-4 w-4 mr-1" /> AI Recommended
              </TabsTrigger>
              <TabsTrigger value="all_operators" className="flex-1">
                All Operators
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ai_recommended">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiRecommendations
                    .filter(op => op.score > 0)
                    .filter(op => 
                      op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (op.skills && op.skills.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .slice(0, 6)
                    .map(renderOperatorCard)
                  }
                  
                  {aiRecommendations.filter(op => op.score > 0).length === 0 && (
                    <div className="col-span-full py-8 text-center text-muted-foreground">
                      No recommended operators found.
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all_operators">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOperators.map(renderOperatorCard)}
                  
                  {filteredOperators.length === 0 && (
                    <div className="col-span-full py-8 text-center text-muted-foreground">
                      No operators match your search.
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedOperator || loading}
          >
            Assign Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AITaskAssignment;
