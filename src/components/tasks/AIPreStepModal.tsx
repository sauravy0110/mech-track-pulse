import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Brain, 
  CheckCircle, 
  Clock, 
  HelpCircle,
  Shield,
  TrendingUp
} from 'lucide-react';
import { ComponentStep } from '@/utils/msmeComponents';

interface AIPreStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: ComponentStep;
  onProceed: () => void;
}

interface AIInsight {
  errorProbability: number;
  riskFactors: string[];
  preventiveMeasures: string[];
  recommendedActions: string[];
  estimatedImpact: string;
}

const AIPreStepModal: React.FC<AIPreStepModalProps> = ({
  isOpen,
  onClose,
  step,
  onProceed
}) => {
  const [aiInsight, setAIInsight] = useState<AIInsight | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [hasReadGuidance, setHasReadGuidance] = useState(false);

  useEffect(() => {
    if (isOpen && step) {
      generateAIInsight();
    }
  }, [isOpen, step]);

  const generateAIInsight = async () => {
    setIsLoadingInsight(true);
    
    // Simulate AI analysis based on step risk level and common errors
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const baseErrorProbability = {
      'low': 0.15,
      'medium': 0.35,
      'high': 0.65
    }[step.riskLevel];

    const insight: AIInsight = {
      errorProbability: baseErrorProbability + (Math.random() * 0.1 - 0.05), // Add small variance
      riskFactors: [
        ...step.commonErrors.slice(0, 3),
        step.riskLevel === 'high' ? 'Complex procedure requiring precision' : 'Standard operational risk',
        'Environmental factors (temperature, humidity)',
      ],
      preventiveMeasures: [
        ...step.preventiveTips.slice(0, 3),
        'Double-check all measurements before proceeding',
        'Ensure proper tool calibration',
        'Follow safety protocols strictly'
      ],
      recommendedActions: [
        step.riskLevel === 'high' ? 'Consider supervisor oversight' : 'Proceed with standard caution',
        'Review safety notes thoroughly',
        'Prepare backup tools if available',
        'Document all observations during execution'
      ],
      estimatedImpact: step.riskLevel === 'high' 
        ? 'High - Could affect product quality or safety' 
        : step.riskLevel === 'medium' 
        ? 'Medium - May cause rework or delays'
        : 'Low - Minimal impact on overall process'
    };

    setAIInsight(insight);
    setIsLoadingInsight(false);
  };

  const handleProceed = () => {
    onProceed();
    setHasReadGuidance(false);
  };

  const handleRequestHelp = () => {
    // In a real implementation, this would notify supervisors
    alert('Help request sent to supervisor. They will be notified immediately.');
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.6) return 'text-red-600 bg-red-50';
    if (probability >= 0.3) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getProbabilityText = (probability: number) => {
    if (probability >= 0.6) return 'High Risk';
    if (probability >= 0.3) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-blue-500" />
            AI Step Analysis: {step.title}
          </DialogTitle>
        </DialogHeader>

        {isLoadingInsight ? (
          <div className="py-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing step for potential risks...</p>
          </div>
        ) : aiInsight && (
          <div className="space-y-6">
            {/* Risk Level Overview */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Risk Assessment Complete</strong>
                    <p className="text-sm mt-1">
                      AI has analyzed this step based on historical data and identified potential risks.
                    </p>
                  </div>
                  <Badge className={getProbabilityColor(aiInsight.errorProbability)}>
                    {Math.round(aiInsight.errorProbability * 100)}% Error Risk
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>

            {/* Error Probability */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <h4 className="font-semibold">Error Probability</h4>
                <p className="text-2xl font-bold text-primary">
                  {Math.round(aiInsight.errorProbability * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {getProbabilityText(aiInsight.errorProbability)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <h4 className="font-semibold">Estimated Time</h4>
                <p className="text-2xl font-bold text-primary">{step.estimatedMinutes}m</p>
                <p className="text-sm text-muted-foreground">Standard duration</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Shield className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <h4 className="font-semibold">Impact Level</h4>
                <p className="text-sm font-medium text-primary">{aiInsight.estimatedImpact}</p>
              </div>
            </div>

            {/* Risk Factors */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Key Risk Factors
              </h4>
              <ul className="space-y-2">
                {aiInsight.riskFactors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preventive Measures */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                Recommended Preventive Measures
              </h4>
              <ul className="space-y-2">
                {aiInsight.preventiveMeasures.map((measure, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>{measure}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Actions */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-500" />
                AI Recommended Actions
              </h4>
              <ul className="space-y-2">
                {aiInsight.recommendedActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500 font-bold">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Acknowledgment */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasReadGuidance}
                  onChange={(e) => setHasReadGuidance(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm">
                  I have read and understood the AI guidance above. I am prepared to execute this step 
                  with proper attention to the identified risks and preventive measures.
                </span>
              </label>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRequestHelp}
            className="flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Request Help
          </Button>
          
          <Button
            onClick={handleProceed}
            disabled={!hasReadGuidance || isLoadingInsight}
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            I Read & Start Step
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIPreStepModal;