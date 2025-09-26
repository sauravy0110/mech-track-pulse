import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AutoAssignmentSystem from "@/components/operators/AutoAssignmentSystem";
import { mockTasks } from "@/utils/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

const Operators = () => {
  const [showAIAssignment, setShowAIAssignment] = useState(false);
  
  // Get an unassigned task for demo
  const unassignedTask = mockTasks.find(task => !task.assignedTo) || mockTasks[0];

  const handleAssign = (taskId: string, operatorId: string) => {
    console.log(`Task ${taskId} assigned to operator ${operatorId}`);
    setShowAIAssignment(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Operator Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage operators and use AI-powered assignment recommendations.
        </p>
      </div>

      {!showAIAssignment ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-blue-500" />
              AI-Powered Operator Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Use our advanced AI system to automatically recommend the best operators for tasks
              based on skills, availability, performance history, and task complexity.
            </p>
            <Button onClick={() => setShowAIAssignment(true)}>
              Demo AI Assignment System
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AutoAssignmentSystem
          task={unassignedTask}
          onAssign={handleAssign}
          onCancel={() => setShowAIAssignment(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default Operators;