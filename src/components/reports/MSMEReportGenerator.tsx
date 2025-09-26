import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users,
  CheckCircle,
  AlertTriangle,
  Camera
} from 'lucide-react';
import { mockTasks, mockUsers } from '@/utils/mockData';

interface ReportData {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  delayedTasks: number;
  averageCompletionTime: number;
  operatorEfficiency: { name: string; efficiency: number; tasksCompleted: number }[];
  errorRate: number;
  aiPredictionsAccuracy: number;
  proofDocuments: number;
}

interface MSMEReportGeneratorProps {
  userRole: 'owner' | 'supervisor' | 'client' | 'operator';
}

const MSMEReportGenerator: React.FC<MSMEReportGeneratorProps> = ({ userRole }) => {
  const [reportType, setReportType] = useState('comprehensive');
  const [dateRange, setDateRange] = useState('this_month');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate mock report data
  const generateReportData = (): ReportData => {
    const tasks = mockTasks;
    const operators = mockUsers.operators;

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
      delayedTasks: tasks.filter(t => t.status === 'delayed').length,
      averageCompletionTime: 4.2,
      operatorEfficiency: operators.map(op => ({
        name: op.name,
        efficiency: op.performanceScore || 75,
        tasksCompleted: Math.floor(Math.random() * 20) + 5
      })),
      errorRate: 8.5,
      aiPredictionsAccuracy: 87.3,
      proofDocuments: tasks.length * 3 // Assume 3 proof docs per task
    };
  };

  const reportData = generateReportData();

  const handleGenerateReport = async (format: 'pdf' | 'excel') => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would generate and download the actual report
    const reportName = `MSME_Production_Report_${dateRange}_${Date.now()}.${format}`;
    console.log(`Generating ${format.toUpperCase()} report:`, reportName);
    
    // Simulate download
    alert(`${format.toUpperCase()} report "${reportName}" generated successfully! 
    
Report includes:
- Task completion analytics
- Operator performance metrics  
- AI prediction accuracy
- Quality proof documentation
- Error rate analysis
- Efficiency trends`);
    
    setIsGenerating(false);
  };

  const getReportPermissions = () => {
    switch (userRole) {
      case 'owner':
      case 'supervisor':
        return {
          canViewAll: true,
          canViewOperatorDetails: true,
          canViewFinancials: userRole === 'owner',
          canExport: true
        };
      case 'client':
        return {
          canViewAll: false,
          canViewOperatorDetails: false,
          canViewFinancials: false,
          canExport: true
        };
      default:
        return {
          canViewAll: false,
          canViewOperatorDetails: false,
          canViewFinancials: false,
          canExport: false
        };
    }
  };

  const permissions = getReportPermissions();

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            MSME Production Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                  <SelectItem value="operator_performance">Operator Performance</SelectItem>
                  <SelectItem value="ai_insights">AI Insights & Accuracy</SelectItem>
                  <SelectItem value="quality_proof">Quality & Proof Documentation</SelectItem>
                  {userRole === 'client' && (
                    <SelectItem value="client_summary">Client Summary (Images Only)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Export Format</label>
              <div className="flex gap-2 mt-2">
                <Button 
                  onClick={() => handleGenerateReport('pdf')}
                  disabled={isGenerating || !permissions.canExport}
                  className="flex-1"
                  variant="outline"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button 
                  onClick={() => handleGenerateReport('excel')}
                  disabled={isGenerating || !permissions.canExport}
                  className="flex-1"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {permissions.canViewAll ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="text-center p-6">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold">Completed Tasks</h3>
              <p className="text-2xl font-bold text-primary">{reportData.completedTasks}</p>
              <p className="text-sm text-muted-foreground">of {reportData.totalTasks} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center p-6">
              <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold">Avg. Completion</h3>
              <p className="text-2xl font-bold text-primary">{reportData.averageCompletionTime}h</p>
              <p className="text-sm text-muted-foreground">per task</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center p-6">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-semibold">AI Accuracy</h3>
              <p className="text-2xl font-bold text-primary">{reportData.aiPredictionsAccuracy}%</p>
              <p className="text-sm text-muted-foreground">prediction accuracy</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center p-6">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <h3 className="font-semibold">Error Rate</h3>
              <p className="text-2xl font-bold text-primary">{reportData.errorRate}%</p>
              <p className="text-sm text-muted-foreground">average error rate</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center p-8">
            <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Client Summary Report</h3>
            <p className="text-muted-foreground mb-4">
              Your report will include filtered task summaries and proof images only.
            </p>
            <div className="space-y-2 text-left max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Task completion status</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Quality proof images</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Delivery timeline</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operator Performance (if allowed) */}
      {permissions.canViewOperatorDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Operator Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.operatorEfficiency.map((op, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{op.name}</h4>
                    <p className="text-sm text-muted-foreground">{op.tasksCompleted} tasks completed</p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      op.efficiency >= 85 ? 'border-green-500 text-green-500' :
                      op.efficiency >= 70 ? 'border-orange-500 text-orange-500' :
                      'border-red-500 text-red-500'
                    }
                  >
                    {op.efficiency}% Efficiency
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Status */}
      {isGenerating && (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Generating Report</h3>
            <p className="text-muted-foreground">
              Compiling data, AI insights, and proof documentation...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MSMEReportGenerator;