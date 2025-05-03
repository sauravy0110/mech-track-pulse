
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockUsers, mockProjects } from "@/utils/mockData";
import { ChevronDown, Search, UserPlus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const clients = mockUsers.clients;
  
  const filteredClients = clients.filter(client => {
    return client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           client.id.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Get projects for a client
  const getClientProjects = (clientId: string) => {
    return mockProjects.filter(project => project.clientId === clientId);
  };
  
  // Calculate client statistics
  const getClientStats = (clientId: string) => {
    const projects = getClientProjects(clientId);
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === "in-progress").length;
    const completedProjects = projects.filter(p => p.status === "completed").length;
    
    let totalProgress = 0;
    projects.forEach(project => {
      totalProgress += project.progress;
    });
    
    const avgProgress = totalProjects > 0 ? totalProgress / totalProjects : 0;
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      avgProgress
    };
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground mt-1">
          View and manage client information and projects.
        </p>
      </div>
      
      <div className="flex flex-col gap-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search" className="sr-only">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search clients..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button className="flex items-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Clients List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => {
            const stats = getClientStats(client.id);
            
            return (
              <Card key={client.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage src={undefined} />
                        <AvatarFallback className="bg-primary">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{client.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{client.id}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-muted/50 rounded-md">
                        <p className="text-xl font-bold">{stats.totalProjects}</p>
                        <p className="text-xs text-muted-foreground">Total Projects</p>
                      </div>
                      <div className="p-2 bg-muted/50 rounded-md">
                        <p className="text-xl font-bold">{stats.activeProjects}</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                      <div className="p-2 bg-muted/50 rounded-md">
                        <p className="text-xl font-bold">{stats.completedProjects}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Average Progress</span>
                        <span className="text-sm">{Math.round(stats.avgProgress)}%</span>
                      </div>
                      <Progress value={stats.avgProgress} className="h-1.5" />
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button className="flex-1" variant="default">
                        View Details
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Projects</DropdownMenuItem>
                          <DropdownMenuItem>Contact Client</DropdownMenuItem>
                          <DropdownMenuItem>View Documents</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">
                            Remove Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {filteredClients.length === 0 && (
            <Card className="col-span-1 md:col-span-2 lg:col-span-3">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-lg font-medium mb-2">No clients found</p>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? "Try adjusting your search criteria"
                    : "There are no clients in the system yet"}
                </p>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New Client
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
