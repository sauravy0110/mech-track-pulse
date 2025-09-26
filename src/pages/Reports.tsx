
import DashboardLayout from "@/components/layout/DashboardLayout";
import MSMEReportGenerator from "@/components/reports/MSMEReportGenerator";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPerformanceMetrics, mockUsers } from "@/utils/mockData";
import { useState } from "react";
import { Download } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart, 
  Bar, 
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Reports = () => {
  const { user } = useAuth();
  
  const [timeRange, setTimeRange] = useState("month");
  
  // Mock time series data for charts
  const mockTimeSeriesData = [
    { name: "Week 1", operators: 4, tasks: 23, completion: 85 },
    { name: "Week 2", operators: 4, tasks: 29, completion: 82 },
    { name: "Week 3", operators: 4, tasks: 25, completion: 90 },
    { name: "Week 4", operators: 4, tasks: 31, completion: 87 },
    { name: "Week 5", operators: 4, tasks: 27, completion: 92 },
  ];

  // Operator performance comparison data
  const operatorPerformanceData = mockUsers.operators.map(operator => {
    const metrics = mockPerformanceMetrics.operators.find(m => m.userId === operator.id)?.metrics;
    
    return {
      name: operator.name.split(' ')[0], // Just use first name for graph
      onTime: metrics?.onTimeCompletion || 0,
      feedback: metrics ? (metrics.clientFeedback * 20) : 0, // Convert to percentage
      offApp: metrics?.offAppTime || 0,
    };
  });
  
  // Task status distribution data
  const taskStatusData = [
    { name: "Completed", value: 24, color: "#10B981" },  // success green
    { name: "In Progress", value: 13, color: "#3B82F6" }, // info blue
    { name: "Pending", value: 9, color: "#F59E0B" }, // warning amber
    { name: "Delayed", value: 4, color: "#EF4444" }, // error red
  ];
  
  // Client satisfaction data
  const clientSatisfactionData = [
    { name: "Acme Mfg", satisfaction: 92 },
    { name: "Globex", satisfaction: 88 },
    { name: "Stark", satisfaction: 95 },
    { name: "Wayne Ind", satisfaction: 84 },
    { name: "Oscorp", satisfaction: 79 },
    { name: "LexCorp", satisfaction: 91 },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Generate comprehensive production reports with AI insights and proof documentation.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="operators">Operator Performance</TabsTrigger>
          <TabsTrigger value="tasks">Task Analytics</TabsTrigger>
          <TabsTrigger value="clients">Client Satisfaction</TabsTrigger>
          <TabsTrigger value="msme">MSME Reports</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Task Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockPerformanceMetrics.overall.taskCompletionRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  ↑ 5% from previous {timeRange}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Client Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockPerformanceMetrics.overall.clientSatisfaction}/5
                </div>
                <p className="text-xs text-muted-foreground">
                  ↑ 0.2 from previous {timeRange}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Resource Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockPerformanceMetrics.overall.resourceUtilization}%
                </div>
                <p className="text-xs text-muted-foreground">
                  ↑ 3% from previous {timeRange}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Project Delay
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockPerformanceMetrics.overall.averageProjectDelay} days
                </div>
                <p className="text-xs text-muted-foreground">
                  ↓ 0.3 days from previous {timeRange}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Task completion rate and operator activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={mockTimeSeriesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="tasks"
                      name="Tasks"
                      stroke="#3B82F6"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="completion"
                      name="Completion %"
                      stroke="#10B981"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Operator Performance Tab */}
        <TabsContent value="operators" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Operator Performance Comparison</CardTitle>
                <CardDescription>On-time task completion and client feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={operatorPerformanceData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="onTime" name="On-time Completion %" fill="#3B82F6" />
                      <Bar dataKey="feedback" name="Client Feedback %" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Off-App Time</CardTitle>
                <CardDescription>Average minutes per day operators spend off the app</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={operatorPerformanceData}
                      margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="offApp" name="Off-App Time (min)" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Skill Distribution</CardTitle>
                <CardDescription>Operator skill levels across different areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground">Detailed skill analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Task Analytics Tab */}
        <TabsContent value="tasks" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
                <CardDescription>Current status of all tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {taskStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Task Completion Time</CardTitle>
                <CardDescription>Average time to complete tasks by priority</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { priority: "High", hours: 5.8 },
                        { priority: "Medium", hours: 8.2 },
                        { priority: "Low", hours: 12.5 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="priority" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="hours" name="Average Hours" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Task Timeline</CardTitle>
                <CardDescription>Task start and completion over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <p className="text-muted-foreground">Timeline visualization coming soon</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Client Satisfaction Tab */}
        <TabsContent value="clients" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Client Satisfaction Ratings</CardTitle>
                <CardDescription>Overall satisfaction percentage by client</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={clientSatisfactionData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="satisfaction" name="Satisfaction %" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Project Delivery</CardTitle>
                <CardDescription>On-time vs delayed project completion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "On Time", value: 18, color: "#10B981" },
                          { name: "Delayed", value: 5, color: "#EF4444" },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#EF4444" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Feedback Categories</CardTitle>
                <CardDescription>Distribution of client feedback by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { category: "Quality", score: 4.8 },
                        { category: "Timeliness", score: 4.5 },
                        { category: "Communication", score: 4.7 },
                        { category: "Problem Solving", score: 4.6 },
                        { category: "Value", score: 4.3 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" name="Average Score (0-5)" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* MSME Reports Tab */}
        <TabsContent value="msme" className="space-y-8">
          <MSMEReportGenerator userRole={user?.role as any || 'operator'} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Reports;
