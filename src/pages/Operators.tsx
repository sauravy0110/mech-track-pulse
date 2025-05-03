
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockUsers, mockAttendance, mockPerformanceMetrics, UserStatus } from "@/utils/mockData";
import { ChevronDown, Search, UserPlus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";

const Operators = () => {
  const { isRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const operators = mockUsers.operators;
  
  const filteredOperators = operators.filter(operator => {
    // Apply search filter
    const matchesSearch = operator.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         operator.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === "all" || operator.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Get attendance data for an operator
  const getAttendanceData = (operatorId: string) => {
    return mockAttendance.find(record => record.userId === operatorId);
  };
  
  // Get performance data for an operator
  const getPerformanceData = (operatorId: string) => {
    return mockPerformanceMetrics.operators.find(record => record.userId === operatorId);
  };
  
  // Format time from Date object
  const formatTime = (date: Date | null) => {
    if (!date) return "N/A";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Only owners can add operators
  const canAddOperators = isRole(["owner"]);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Operators</h1>
        <p className="text-muted-foreground mt-1">
          Manage and monitor all operators in your company.
        </p>
      </div>
      
      <div className="flex flex-col gap-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="search" className="sr-only">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name or ID..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status-filter" className="sr-only">
                  Filter by Status
                </Label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {canAddOperators && (
                <Button className="flex items-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Operator
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Operators Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Operators ({filteredOperators.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-3 pl-0">Operator</th>
                    <th className="text-left font-medium p-3">Status</th>
                    <th className="text-left font-medium p-3">Today's Attendance</th>
                    <th className="text-left font-medium p-3">Performance</th>
                    <th className="text-left font-medium p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOperators.map((operator, index) => {
                    const attendance = getAttendanceData(operator.id);
                    const performance = getPerformanceData(operator.id);
                    
                    return (
                      <tr key={operator.id} className={index < filteredOperators.length - 1 ? "border-b" : ""}>
                        <td className="py-4 pl-0">
                          <div className="flex items-center">
                            <Avatar className="h-9 w-9 mr-3">
                              <AvatarImage src={operator.profileImage} />
                              <AvatarFallback className="bg-primary">
                                {getInitials(operator.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{operator.name}</p>
                              <p className="text-xs text-muted-foreground">{operator.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <StatusBadge 
                            status={operator.status as any} 
                            pulse={operator.status === "online"} 
                          />
                        </td>
                        <td className="py-4">
                          {attendance ? (
                            <div>
                              <div className="flex items-center space-x-1">
                                <span className="text-sm">Check in:</span>
                                <span className="text-sm font-medium">{formatTime(attendance.checkIn)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-sm">Check out:</span>
                                <span className="text-sm font-medium">
                                  {formatTime(attendance.checkOut)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No attendance today</span>
                          )}
                        </td>
                        <td className="py-4">
                          {performance ? (
                            <div className="space-y-2 w-48">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs">Tasks: {performance.metrics.tasksCompleted}</span>
                                  <span className="text-xs">On-time: {performance.metrics.onTimeCompletion}%</span>
                                </div>
                                <Progress value={performance.metrics.onTimeCompletion} className="h-1" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs">Feedback</span>
                                  <span className="text-xs">{performance.metrics.clientFeedback}/5</span>
                                </div>
                                <Progress 
                                  value={(performance.metrics.clientFeedback / 5) * 100}
                                  className="h-1" 
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No data available</span>
                          )}
                        </td>
                        <td className="py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions <ChevronDown className="ml-2 h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Message</DropdownMenuItem>
                              <DropdownMenuItem>View Timesheet</DropdownMenuItem>
                              <DropdownMenuItem>View Tasks</DropdownMenuItem>
                              {canAddOperators && (
                                <DropdownMenuItem className="text-red-500">
                                  Remove Operator
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {filteredOperators.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No operators match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Operators;
