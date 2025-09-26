import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, Play } from 'lucide-react';

interface SimpleStep {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface SimpleStepWorkflowProps {
  taskId: string;
  taskTitle: string;
  steps: SimpleStep[];
  onComplete: () => void;
}

const SimpleStepWorkflow: React.FC<SimpleStepWorkflowProps> = ({
  taskId,
  taskTitle,
  steps,
  onComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const currentStep = steps[currentStepIndex];
  const progressPercentage = (completedSteps.size / steps.length) * 100;

  const handleCompleteStep = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStepIndex);
    setCompletedSteps(newCompleted);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (!currentStep) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Workflow Complete!</h3>
          <p className="text-muted-foreground">All steps completed successfully.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{taskTitle} - Step {currentStepIndex + 1} of {steps.length}</span>
            <Badge variant="outline">
              {completedSteps.size} / {steps.length} Complete
            </Badge>
          </CardTitle>
          <Progress value={progressPercentage} className="mt-2" />
        </CardHeader>
      </Card>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-500" />
            <span>Step {currentStep?.id}: {currentStep?.title}</span>
            <Badge className={getRiskColor(currentStep?.riskLevel)}>
              {currentStep?.riskLevel} risk
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">{currentStep?.description}</p>
          <p className="text-sm text-muted-foreground">
            Estimated time: {currentStep?.estimatedMinutes} minutes
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={handleCompleteStep} className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Complete Step
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Steps Overview */}
      <Card>
        <CardHeader>
          <CardTitle>All Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  index === currentStepIndex ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
              >
                {completedSteps.has(index) ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
                
                <div className="flex-1">
                  <p className="font-medium">Step {step.id}: {step.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {step.estimatedMinutes} min
                  </p>
                </div>
                
                <Badge className={getRiskColor(step.riskLevel)}>
                  {step.riskLevel}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleStepWorkflow;