
import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Search, UserPlus, Phone, MessageSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import OperatorDetailsForm from "@/components/operators/OperatorDetailsForm";
import SupervisorManagement from "@/components/supervisors/SupervisorManagement";

// Define operator type
interface Operator {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profile_image: string | null;
  status: string;
  height?: string;
  weight?: string;
  attendance?: {
    checkIn: Date | null;
    checkOut: Date | null;
  };
  performance?: {
    tasksCompleted: number;
    onTimeCompletion: number;
    clientFeedback: number;
  };
}

const Operators = () => {
  const { isRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [isAddOperatorOpen, setIsAddOperatorOpen] = useState(false);
  const [isEditOperatorOpen, setIsEditOperatorOpen] = useState(false);
  const { toast } = useToast();
  
  const canAddOperators = isRole(["owner", "supervisor"]);
  const isOwner = isRole(["owner"]);

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "operator");

      if (error) throw error;
      
      // Add mock attendance and performance data
      const operatorsWithMockData = data.map((operator: any) => {
        const hasAttendanceToday = Math.random() > 0.3;
        
        return {
          ...operator,
          attendance: hasAttendanceToday ? {
            checkIn: new Date(new Date().setHours(8, Math.floor(Math.random() * 30), 0)),
            checkOut: Math.random() > 0.5 ? new Date(new Date().setHours(17, Math.floor(Math.random() * 30), 0)) : null
          } : null,
          performance: {
            tasksCompleted: Math.floor(Math.random() * 50) + 5,
            onTimeCompletion: Math.floor(Math.random() * 40) + 60,
            clientFeedback: Math.floor(Math.random() * 3) + 3
          }
        };
      });
      
      setOperators(operatorsWithMockData);
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

  const handleCallOperator = (phone: string | null) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast({
        title: "No Phone Number",
        description: "This operator has no phone number recorded",
        variant: "destructive",
      });
    }
  };

  const handleMessageOperator = (operatorId: string, name: string) => {
    // Navigate to the chat page with the operator's ID
    window.location.href = `/chat?userId=${operatorId}&name=${encodeURIComponent(name)}`;
  };

  const handleAddOperatorSuccess = () => {
    setIsAddOperatorOpen(false);
    fetchOperators();
    toast({
      title: "Success",
      description: "New operator has been added",
    });
  };

  const handleEditOperatorSuccess = () => {
    setIsEditOperatorOpen(false);
    fetchOperators();
    toast({
      title: "Success",
      description: "Operator has been updated",
    });
  };

  const filteredOperators = operators.filter(operator => {
    // Apply search filter
    const matchesSearch = operator.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         operator.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === "all" || operator.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Workforce Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage and monitor operators and supervisors in your company.
        </p>
      </div>

      {isOwner && (
        <Tabs defaultValue="operators" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="operators">Operators</TabsTrigger>
            <TabsTrigger value="supervisors">Supervisors</TabsTrigger>
          </TabsList>
          <TabsContent value="operators">
            <OperatorsPanel 
              operators={filteredOperators}
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              canAddOperators={canAddOperators}
              loading={loading}
              formatTime={formatTime}
              getInitials={getInitials}
              handleCallOperator={handleCallOperator}
              handleMessageOperator={handleMessageOperator}
              setSelectedOperator={setSelectedOperator}
              setIsEditOperatorOpen={setIsEditOperatorOpen}
              setIsAddOperatorOpen={setIsAddOperatorOpen}
            />
          </TabsContent>
          <TabsContent value="supervisors">
            <SupervisorManagement />
          </TabsContent>
        </Tabs>
      )}

      {!isOwner && (
        <OperatorsPanel 
          operators={filteredOperators}
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          canAddOperators={canAddOperators}
          loading={loading}
          formatTime={formatTime}
          getInitials={getInitials}
          handleCallOperator={handleCallOperator}
          handleMessageOperator={handleMessageOperator}
          setSelectedOperator={setSelectedOperator}
          setIsEditOperatorOpen={setIsEditOperatorOpen}
          setIsAddOperatorOpen={setIsAddOperatorOpen}
        />
      )}

      {/* Add Operator Dialog */}
      <Dialog open={isAddOperatorOpen} onOpenChange={setIsAddOperatorOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Operator</DialogTitle>
            <DialogDescription>
              Enter the operator's details below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <OperatorDetailsForm onSuccess={handleAddOperatorSuccess} />
        </DialogContent>
      </Dialog>

      {/* Edit Operator Dialog */}
      <Dialog open={isEditOperatorOpen} onOpenChange={setIsEditOperatorOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Operator</DialogTitle>
            <DialogDescription>
              Update the operator's details.
            </DialogDescription>
          </DialogHeader>
          <OperatorDetailsForm 
            operatorId={selectedOperator || undefined} 
            onSuccess={handleEditOperatorSuccess} 
            isEdit={true} 
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

// Separated Operators Panel component to reduce complexity
const OperatorsPanel = ({ 
  operators,
  searchQuery, 
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  canAddOperators,
  loading,
  formatTime,
  getInitials,
  handleCallOperator,
  handleMessageOperator,
  setSelectedOperator,
  setIsEditOperatorOpen,
  setIsAddOperatorOpen
}: {
  operators: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  canAddOperators: boolean;
  loading: boolean;
  formatTime: (date: Date | null) => string;
  getInitials: (name: string) => string;
  handleCallOperator: (phone: string | null) => void;
  handleMessageOperator: (operatorId: string, name: string) => void;
  setSelectedOperator: (id: string | null) => void;
  setIsEditOperatorOpen: (isOpen: boolean) => void;
  setIsAddOperatorOpen: (isOpen: boolean) => void;
}) => {
  return (
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
                  placeholder="Search by name or email..."
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
              <Button className="flex items-center" onClick={() => setIsAddOperatorOpen(true)}>
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
          <CardTitle>Operators ({operators.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
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
                  {operators.map((operator, index) => {
                    const attendance = operator.attendance;
                    const performance = operator.performance;
                    
                    return (
                      <tr key={operator.id} className={index < operators.length - 1 ? "border-b" : ""}>
                        <td className="py-4 pl-0">
                          <div className="flex items-center">
                            <Avatar className="h-9 w-9 mr-3">
                              <AvatarImage src={operator.profile_image || ""} />
                              <AvatarFallback className="bg-primary">
                                {getInitials(operator.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{operator.name}</p>
                              <p className="text-xs text-muted-foreground">{operator.email}</p>
                              {operator.height && operator.weight && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {operator.height}cm / {operator.weight}kg
                                </p>
                              )}
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
                                  <span className="text-xs">Tasks: {performance.tasksCompleted}</span>
                                  <span className="text-xs">On-time: {performance.onTimeCompletion}%</span>
                                </div>
                                <Progress value={performance.onTimeCompletion} className="h-1" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs">Feedback</span>
                                  <span className="text-xs">{performance.clientFeedback}/5</span>
                                </div>
                                <Progress 
                                  value={(performance.clientFeedback / 5) * 100}
                                  className="h-1" 
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No data available</span>
                          )}
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleCallOperator(operator.phone)}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleMessageOperator(operator.id, operator.name)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Actions <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedOperator(operator.id);
                                  setIsEditOperatorOpen(true);
                                }}>
                                  Edit Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>View Timesheet</DropdownMenuItem>
                                <DropdownMenuItem>View Tasks</DropdownMenuItem>
                                {canAddOperators && (
                                  <DropdownMenuItem className="text-red-500">
                                    Remove Operator
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {operators.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No operators match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Operators;
