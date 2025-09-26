import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  TrendingUp,
  HelpCircle 
} from 'lucide-react';

interface ErrorPrediction {
  stepId: string;
  errorProbability: number;
  riskFactors: string[];
  preventiveMeasures: string[];
  recommendedActions: string[];
  requiresSupervisorApproval: boolean;
}

interface ErrorPreventionSystemProps {
  stepId: string;
  stepTitle: string;
  operatorSkillScore: number;
  onProceed: () => void;
  onRequestHelp: () => void;
}

const ErrorPreventionSystem: React.FC<ErrorPreventionSystemProps> = ({
  stepId,
  stepTitle,
  operatorSkillScore,
  onProceed,
  onRequestHelp
}) => {
  const [prediction, setPrediction] = useState<ErrorPrediction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    generateErrorPrediction();
  }, [stepId, operatorSkillScore]);

  const generateErrorPrediction = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis - In real implementation, this would call Gemini API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock prediction based on step complexity and operator skill
    const baseErrorRate = 0.15; // 15% base error rate
    const skillAdjustment = (100 - operatorSkillScore) / 100 * 0.3; // Higher skill = lower risk
    const stepComplexityFactor = stepId.includes('gear') ? 0.2 : 0.1; // Gears are more complex
    
    const errorProbability = Math.min(baseErrorRate + skillAdjustment + stepComplexityFactor, 0.8);
    
    const mockPrediction: ErrorPrediction = {
      stepId,
      errorProbability,
      riskFactors: [
        'Complex alignment requirements',
        'Precision torque specifications',
        'Multiple measurement points',
        'Time pressure on deadline'
      ],
      preventiveMeasures: [
        'Double-check all measurements before proceeding',
        'Use calibrated torque wrench',
        'Follow step-by-step checklist',
        'Take progress photos at each stage'
      ],
      recommendedActions: [
        errorProbability > 0.5 ? 'Consider supervisor oversight' : 'Proceed with standard caution',
        'Verify tool calibration before starting',
        'Review safety protocols',
        'Document all measurements'
      ],
      requiresSupervisorApproval: errorProbability >= 0.7
    };
    
    setPrediction(mockPrediction);
    setIsAnalyzing(false);
  };

  const getRiskLevel = (probability: number) => {
    if (probability >= 0.7) return { level: 'High Risk', color: 'text-red-600 bg-red-50', borderColor: 'border-red-200' };
    if (probability >= 0.4) return { level: 'Medium Risk', color: 'text-orange-600 bg-orange-50', borderColor: 'border-orange-200' };
    return { level: 'Low Risk', color: 'text-green-600 bg-green-50', borderColor: 'border-green-200' };
  };

  const handleProceed = () => {
    if (prediction?.requiresSupervisorApproval && !acknowledged) {
      alert('This high-risk step requires supervisor approval. Please request help first.');
      return;
    }
    onProceed();
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">AI analyzing step for potential risks...</p>
        </CardContent>
      </Card>
    );
  }

  if (!prediction) return null;

  const riskInfo = getRiskLevel(prediction.errorProbability);

  return (
    <div className="space-y-4">
      {/* Risk Assessment Header */}
      <Alert className={`${riskInfo.borderColor}`}>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong>AI Risk Assessment for: {stepTitle}</strong>
              <p className="text-sm mt-1">
                Analysis complete based on historical data and operator performance
              </p>
            </div>
            <Badge className={riskInfo.color}>
              {Math.round(prediction.errorProbability * 100)}% Error Risk
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center p-4">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <h4 className="font-semibold">Error Probability</h4>
            <p className="text-2xl font-bold text-primary">
              {Math.round(prediction.errorProbability * 100)}%
            </p>
            <p className="text-sm text-muted-foreground">{riskInfo.level}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center p-4">
            <Shield className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <h4 className="font-semibold">Operator Skill</h4>
            <p className="text-2xl font-bold text-primary">{operatorSkillScore}/100</p>
            <p className="text-sm text-muted-foreground">Skill Rating</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="text-center p-4">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <h4 className="font-semibold">Risk Factors</h4>
            <p className="text-2xl font-bold text-primary">{prediction.riskFactors.length}</p>
            <p className="text-sm text-muted-foreground">Identified</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Key Risk Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {prediction.riskFactors.map((factor, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-red-500 font-bold">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Preventive Measures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            AI Recommended Preventive Measures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {prediction.preventiveMeasures.map((measure, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{measure}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {prediction.requiresSupervisorApproval && (
              <Alert className="border-red-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>High Risk Step Detected!</strong> This step requires supervisor approval due to high error probability (≥70%).
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col gap-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm">
                  I have read and understood the AI risk assessment and preventive measures. 
                  I am prepared to execute this step with proper attention to identified risks.
                </span>
              </label>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onRequestHelp}
                  className="flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Request Supervisor Help
                </Button>
                
                <Button
                  onClick={handleProceed}
                  disabled={!acknowledged}
                  className="flex items-center gap-2 flex-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  I Understand & Proceed
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPreventionSystem;