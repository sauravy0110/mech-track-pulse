import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Camera, 
  FileText, 
  Play,
  Pause,
  SkipForward
} from 'lucide-react';
import { ComponentStep } from '@/utils/msmeComponents';
import AIPreStepModal from './AIPreStepModal';

interface StepByStepWorkflowProps {
  taskId: string;
  taskTitle: string;
  steps: ComponentStep[];
  onStepComplete: (stepId: string, proof: { type: 'image' | 'text' | 'video'; content: string }) => void;
  onWorkflowComplete: () => void;
}

interface StepStatus {
  id: string;
  status: 'pending' | 'in-progress' | 'completed';
  startTime?: Date;
  endTime?: Date;
  proof?: { type: 'image' | 'text' | 'video'; content: string };
}

const StepByStepWorkflow: React.FC<StepByStepWorkflowProps> = ({
  taskId,
  taskTitle,
  steps,
  onStepComplete,
  onWorkflowComplete
}) => {
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    steps.map(step => ({ id: step.id, status: 'pending' }))
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showAIModal, setShowAIModal] = useState(false);
  const [proofText, setProofText] = useState('');
  const [isCapturingProof, setIsCapturingProof] = useState(false);

  const currentStep = steps[currentStepIndex];
  const currentStatus = stepStatuses.find(s => s.id === currentStep?.id);
  const completedSteps = stepStatuses.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleStartStep = () => {
    if (currentStep.riskLevel === 'high' || currentStep.riskLevel === 'medium') {
      setShowAIModal(true);
    } else {
      startStep();
    }
  };

  const startStep = () => {
    setStepStatuses(prev => prev.map(s => 
      s.id === currentStep.id 
        ? { ...s, status: 'in-progress', startTime: new Date() }
        : s
    ));
    setShowAIModal(false);
  };

  const handleCompleteStep = (proof: { type: 'image' | 'text' | 'video'; content: string }) => {
    const updatedStatuses = stepStatuses.map(s =>
      s.id === currentStep.id
        ? { ...s, status: 'completed' as const, endTime: new Date(), proof }
        : s
    );
    
    setStepStatuses(updatedStatuses);
    onStepComplete(currentStep.id, proof);

    // Move to next step or complete workflow
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onWorkflowComplete();
    }
    
    setProofText('');
    setIsCapturingProof(false);
  };

  const handleProofSubmit = () => {
    if (proofText.trim()) {
      handleCompleteStep({ type: 'text', content: proofText });
    }
  };

  if (!currentStep) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Workflow Complete!</h3>
          <p className="text-muted-foreground">All steps have been completed successfully.</p>
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
            <span>{taskTitle} - Step-by-Step Workflow</span>
            <Badge variant="outline">
              Step {currentStepIndex + 1} of {steps.length}
            </Badge>
          </CardTitle>
          <Progress value={progressPercentage} className="mt-2" />
        </CardHeader>
      </Card>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {currentStatus?.status === 'completed' && <CheckCircle className="w-6 h-6 text-green-500" />}
            {currentStatus?.status === 'in-progress' && <Clock className="w-6 h-6 text-blue-500" />}
            {currentStatus?.status === 'pending' && <Circle className="w-6 h-6 text-gray-400" />}
            
            <span>Step {currentStep.stepNumber}: {currentStep.title}</span>
            
            <Badge className={getRiskBadgeColor(currentStep.riskLevel)}>
              {currentStep.riskLevel} risk
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">{currentStep.description}</p>
          <p className="text-sm text-muted-foreground">Estimated time: {currentStep.estimatedMinutes} minutes</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Instructions */}
          <div>
            <h4 className="font-semibold mb-3">Instructions:</h4>
            <ul className="space-y-2">
              {currentStep.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary font-medium">{index + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety Notes */}
          {currentStep.safetyNotes.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Safety Notes:</strong>
                <ul className="mt-2 space-y-1">
                  {currentStep.safetyNotes.map((note, index) => (
                    <li key={index} className="text-sm">• {note}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Required Tools */}
          <div>
            <h4 className="font-semibold mb-2">Required Tools:</h4>
            <div className="flex flex-wrap gap-2">
              {currentStep.requiredTools.map((tool, index) => (
                <Badge key={index} variant="outline">{tool}</Badge>
              ))}
            </div>
          </div>

          {/* Quality Checks */}
          <div>
            <h4 className="font-semibold mb-2">Quality Checks:</h4>
            <ul className="space-y-1">
              {currentStep.qualityChecks.map((check, index) => (
                <li key={index} className="text-sm">✓ {check}</li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {currentStatus?.status === 'pending' && (
              <Button onClick={handleStartStep} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Start Step
              </Button>
            )}

            {currentStatus?.status === 'in-progress' && !isCapturingProof && (
              <Button 
                onClick={() => setIsCapturingProof(true)}
                className="flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Complete Step (Add Proof)
              </Button>
            )}

            {currentStatus?.status === 'in-progress' && isCapturingProof && (
              <div className="w-full space-y-3">
                <textarea
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Describe the work completed, measurements taken, or quality checks performed..."
                  className="w-full p-3 border rounded-md min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button onClick={handleProofSubmit} disabled={!proofText.trim()}>
                    <FileText className="w-4 h-4 mr-2" />
                    Submit Proof
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCapturingProof(false);
                      setProofText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Steps Overview */}
      <Card>
        <CardHeader>
          <CardTitle>All Steps Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {steps.map((step, index) => {
              const status = stepStatuses.find(s => s.id === step.id);
              return (
                <div
                  key={step.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    index === currentStepIndex ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {status?.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {status?.status === 'in-progress' && <Clock className="w-5 h-5 text-blue-500" />}
                    {status?.status === 'pending' && <Circle className="w-5 h-5 text-gray-400" />}
                    
                    <div>
                      <p className="font-medium">Step {step.stepNumber}: {step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.estimatedMinutes} min</p>
                    </div>
                  </div>
                  
                  <Badge className={getRiskBadgeColor(step.riskLevel)}>
                    {step.riskLevel}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Pre-Step Modal */}
      <AIPreStepModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        step={currentStep}
        onProceed={startStep}
      />
    </div>
  );
};

export default StepByStepWorkflow;