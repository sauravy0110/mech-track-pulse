import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  User, 
  TrendingUp, 
  Clock, 
  Award,
  CheckCircle,
  Cpu
} from 'lucide-react';
import { mockUsers, Task } from '@/utils/mockData';

interface OperatorRecommendation {
  operatorId: string;
  operatorName: string;
  matchScore: number;
  skillScore: number;
  availabilityScore: number;
  efficiencyScore: number;
  reasonsForRecommendation: string[];
  estimatedCompletionTime: number; // hours
}

interface AutoAssignmentSystemProps {
  task: Task;
  onAssign: (taskId: string, operatorId: string) => void;
  onCancel: () => void;
}

const AutoAssignmentSystem: React.FC<AutoAssignmentSystemProps> = ({
  task,
  onAssign,
  onCancel
}) => {
  const [recommendations, setRecommendations] = useState<OperatorRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<string>('');

  useEffect(() => {
    generateRecommendations();
  }, [task]);

  const generateRecommendations = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const operators = mockUsers.operators;
    const operatorRecommendations: OperatorRecommendation[] = [];

    // AI algorithm to score each operator
    operators.forEach(operator => {
      // Skill matching (40% weight)
      const skillMatch = operator.skillScore || 70;
      
      // Availability (30% weight) 
      const isAvailable = !operator.currentTask;
      const availabilityScore = isAvailable ? 100 : 30;
      
      // Performance history (20% weight)
      const performanceScore = operator.performanceScore || 75;
      
      // Task complexity matching (10% weight)
      const taskComplexityScore = task.priority === 'high' ? 90 : 
                                 task.priority === 'medium' ? 75 : 60;
      const complexityMatch = Math.abs(skillMatch - taskComplexityScore) < 20 ? 90 : 70;
      
      // Calculate weighted match score
      const matchScore = Math.round(
        (skillMatch * 0.4) + 
        (availabilityScore * 0.3) + 
        (performanceScore * 0.2) + 
        (complexityMatch * 0.1)
      );
      
      // Estimate completion time based on skills and task complexity
      const baseTime = task.estimatedHours || 4;
      const efficiencyFactor = skillMatch / 100;
      const estimatedTime = baseTime / efficiencyFactor;
      
      const reasons: string[] = [];
      if (skillMatch >= 85) reasons.push('High skill rating matches task requirements');
      if (isAvailable) reasons.push('Currently available with no active tasks');
      if (performanceScore >= 85) reasons.push('Excellent track record on similar tasks');
      if (operator.status === 'online') reasons.push('Currently online and ready to start');
      if (!reasons.length) reasons.push('Solid general capabilities for this task type');
      
      operatorRecommendations.push({
        operatorId: operator.id,
        operatorName: operator.name,
        matchScore,
        skillScore: skillMatch,
        availabilityScore,
        efficiencyScore: performanceScore,
        reasonsForRecommendation: reasons,
        estimatedCompletionTime: Math.round(estimatedTime * 10) / 10
      });
    });

    // Sort by match score (highest first)
    operatorRecommendations.sort((a, b) => b.matchScore - a.matchScore);
    
    setRecommendations(operatorRecommendations);
    setIsAnalyzing(false);
  };

  const handleAssign = () => {
    if (selectedOperator) {
      onAssign(task.id, selectedOperator);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">AI Analyzing Operators</h3>
          <p className="text-muted-foreground">
            Evaluating operator skills, availability, and performance history...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-blue-500" />
            AI Operator Assignment Recommendations
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            <p><strong>Task:</strong> {task.title}</p>
            <p><strong>Priority:</strong> {task.priority} | <strong>Due:</strong> {task.dueDate}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Algorithm Insights */}
      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>AI Assignment Algorithm:</strong> Recommendations based on skill matching (40%), 
          current availability (30%), performance history (20%), and task complexity alignment (10%).
        </AlertDescription>
      </Alert>

      {/* Operator Recommendations */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <Card 
            key={rec.operatorId} 
            className={`cursor-pointer transition-all ${
              selectedOperator === rec.operatorId ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedOperator(rec.operatorId)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {index === 0 && <Award className="w-5 h-5 text-yellow-500" />}
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {rec.operatorName}
                      {index === 0 && <Badge className="bg-yellow-500">Best Match</Badge>}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Estimated completion: {rec.estimatedCompletionTime} hours
                    </p>
                  </div>
                </div>
                
                <Badge className={`${getScoreBadgeColor(rec.matchScore)} text-white`}>
                  {rec.matchScore}% Match
                </Badge>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center">
                  <div className={`text-sm font-medium p-2 rounded ${getScoreColor(rec.skillScore)}`}>
                    Skill: {rec.skillScore}%
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium p-2 rounded ${getScoreColor(rec.availabilityScore)}`}>
                    Available: {rec.availabilityScore}%
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium p-2 rounded ${getScoreColor(rec.efficiencyScore)}`}>
                    Performance: {rec.efficiencyScore}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium p-2 rounded bg-blue-50 text-blue-600">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {rec.estimatedCompletionTime}h
                  </div>
                </div>
              </div>

              {/* AI Reasoning */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-blue-600">AI Reasoning:</h4>
                <ul className="space-y-1">
                  {rec.reasonsForRecommendation.map((reason, idx) => (
                    <li key={idx} className="text-xs flex items-start gap-2">
                      <TrendingUp className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Selection Indicator */}
              {selectedOperator === rec.operatorId && (
                <div className="mt-3 flex items-center gap-2 text-primary font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Selected for assignment</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          onClick={handleAssign}
          disabled={!selectedOperator}
          className="flex-1"
        >
          Assign Selected Operator
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AutoAssignmentSystem;