import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Phone, MessageSquare, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import StatusBadge from "@/components/dashboard/StatusBadge";

// Define extended profile type with all the fields we need
interface ExtendedProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profile_image?: string | null;
  status?: string | null;
  on_holiday?: boolean | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface SupervisorType {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profile_image: string | null;
  status: string;
  onHoliday: boolean;
  performance: {
    operatorsManaged: number;
    tasksCompleted: number;
    avgResponseTime: number;
    rating: number;
  };
}

const SupervisorManagement = () => {
  const [supervisors, setSupervisors] = useState<SupervisorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const { isRole } = useAuth();
  const canManage = isRole(["owner"]);

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "supervisor");

      if (error) throw error;
      
      // Transform data and add mock performance metrics
      // Use type assertion to treat the data as an array of extended profiles
      const profileData = data as ExtendedProfile[];
      
      const supervisorsWithMetrics = profileData.map((supervisor) => ({
        ...supervisor,
        onHoliday: supervisor.on_holiday || false,
        performance: {
          operatorsManaged: Math.floor(Math.random() * 10) + 1,
          tasksCompleted: Math.floor(Math.random() * 100) + 10,
          avgResponseTime: Math.floor(Math.random() * 60) + 5,
          rating: (Math.random() * 2) + 3,  // Rating between 3-5
        }
      }));
      
      setSupervisors(supervisorsWithMetrics as SupervisorType[]);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
      toast({
        title: "Error",
        description: "Failed to load supervisors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleHolidayStatus = async (supervisorId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ on_holiday: !currentStatus })
        .eq("id", supervisorId);

      if (error) throw error;
      
      setSupervisors(prevState => 
        prevState.map(supervisor => 
          supervisor.id === supervisorId 
            ? { ...supervisor, onHoliday: !currentStatus } 
            : supervisor
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Supervisor is now ${!currentStatus ? 'on holiday' : 'active'}`,
      });
    } catch (error) {
      console.error("Error updating holiday status:", error);
      toast({
        title: "Error",
        description: "Failed to update supervisor status",
        variant: "destructive",
      });
    }
  };

  const handleCallSupervisor = (phone: string | null) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast({
        title: "No Phone Number",
        description: "This supervisor has no phone number recorded",
        variant: "destructive",
      });
    }
  };

  const handleMessageSupervisor = (supervisorId: string, name: string) => {
    // Navigate to the chat page with the supervisor's ID
    window.location.href = `/chat?userId=${supervisorId}&name=${encodeURIComponent(name)}`;
  };

  const filteredSupervisors = supervisors.filter(supervisor => {
    // Apply search filter
    const matchesSearch = supervisor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         supervisor.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === "all" || 
                          statusFilter === "holiday" ? supervisor.onHoliday : 
                          supervisor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="search" className="sr-only">
                  Search
                </Label>
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
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
                    <SelectItem value="holiday">On Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {canManage && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex items-center">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Supervisor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Supervisor</DialogTitle>
                      <DialogDescription>
                        Enter the details of the new supervisor.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input id="name" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input id="email" type="email" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                          Phone
                        </Label>
                        <Input id="phone" className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Add Supervisor</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Supervisors List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Supervisors ({filteredSupervisors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left font-medium p-3 pl-0">Supervisor</th>
                      <th className="text-left font-medium p-3">Status</th>
                      <th className="text-left font-medium p-3">Performance</th>
                      <th className="text-left font-medium p-3">Metrics</th>
                      <th className="text-left font-medium p-3">On Holiday</th>
                      <th className="text-left font-medium p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSupervisors.map((supervisor, index) => (
                      <tr key={supervisor.id} className={index < filteredSupervisors.length - 1 ? "border-b" : ""}>
                        <td className="py-4 pl-0">
                          <div className="flex items-center">
                            <Avatar className="h-9 w-9 mr-3">
                              <AvatarImage src={supervisor.profile_image || ""} />
                              <AvatarFallback className="bg-primary">
                                {getInitials(supervisor.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{supervisor.name}</p>
                              <p className="text-xs text-muted-foreground">{supervisor.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <StatusBadge 
                            status={supervisor.status as any} 
                            pulse={supervisor.status === "online"} 
                          />
                        </td>
                        <td className="py-4">
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">{supervisor.performance.operatorsManaged}</span>
                              <span className="text-muted-foreground"> operators managed</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">{supervisor.performance.tasksCompleted}</span>
                              <span className="text-muted-foreground"> tasks completed</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">{supervisor.performance.avgResponseTime} min</span>
                              <span className="text-muted-foreground"> avg. response</span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">{supervisor.performance.rating.toFixed(1)}/5</span>
                              <span className="text-muted-foreground"> rating</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <Switch
                            checked={supervisor.onHoliday}
                            onCheckedChange={() => toggleHolidayStatus(supervisor.id, supervisor.onHoliday)}
                            disabled={!canManage}
                          />
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleCallSupervisor(supervisor.phone)}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleMessageSupervisor(supervisor.id, supervisor.name)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            {canManage && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    Actions <ChevronDown className="ml-2 h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                                  <DropdownMenuItem>View Performance</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-500">
                                    Suspend Access
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {filteredSupervisors.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No supervisors match your search criteria.
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
    </div>
  );
};

export default SupervisorManagement;
