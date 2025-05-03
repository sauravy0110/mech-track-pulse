
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Activity,
  Bell,
  Calendar,
  ChevronDown,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import { UserRole } from "@/context/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout, isRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const links = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["operator", "supervisor", "client", "owner"] as UserRole[],
    },
    {
      name: "Operators",
      href: "/operators",
      icon: Activity,
      roles: ["supervisor", "owner"] as UserRole[],
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: FileText,
      roles: ["operator", "supervisor", "owner"] as UserRole[],
    },
    {
      name: "Clients",
      href: "/clients",
      icon: Users,
      roles: ["supervisor", "owner"] as UserRole[],
    },
    {
      name: "Chat",
      href: "/chat",
      icon: MessageSquare,
      roles: ["operator", "supervisor", "client", "owner"] as UserRole[],
    },
    {
      name: "Schedule",
      href: "/schedule",
      icon: Calendar,
      roles: ["operator", "supervisor", "owner"] as UserRole[],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: Activity,
      roles: ["supervisor", "owner"] as UserRole[],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["operator", "supervisor", "client", "owner"] as UserRole[],
    },
  ];
  
  const filteredLinks = links.filter(link => 
    link.roles.some(role => isRole(role))
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar for large screens */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-gray-200">
        <div className="flex flex-col items-center justify-center h-32 border-b border-gray-200 px-6 py-3">
          <div className="w-36 h-36 flex items-center justify-center">
            <img 
              src="/lovable-uploads/6d28bdaa-dc4e-49fd-abe0-0cab55db6c87.png" 
              alt="MechTrackPulse Logo" 
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto pt-5 pb-4">
          <nav className="flex-1 px-3 space-y-1">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="bg-primary">
                {user?.name ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/70 capitalize">
                {user?.role}
              </p>
              <p className="text-xs text-sidebar-foreground/70">
                ID: {user?.id}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            className="w-full mt-2 text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>
      
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden bg-black/50 transition-opacity",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />
      
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar transform transition-transform lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-200 px-6">
          <div className="w-36 h-16 flex items-center justify-center">
            <img 
              src="/lovable-uploads/6d28bdaa-dc4e-49fd-abe0-0cab55db6c87.png" 
              alt="MechTrackPulse Logo" 
              className="w-full h-auto object-contain"
            />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(false)}
            className="text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto pt-5 pb-4">
          <nav className="flex-1 px-3 space-y-1">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="bg-primary">
                {user?.name ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/70 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            className="w-full mt-2 text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center lg:hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex-1 px-4 flex justify-between">
                <div className="flex-1" />
                <div className="flex items-center">
                  {/* Notification dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-xs font-bold text-white">
                          3
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="max-h-80 overflow-y-auto">
                        <DropdownMenuItem className="cursor-pointer py-2">
                          <div className="flex flex-col space-y-1">
                            <p className="font-medium">New task assigned</p>
                            <p className="text-sm text-muted-foreground">
                              You have been assigned a new maintenance task.
                            </p>
                            <p className="text-xs text-muted-foreground">5 min ago</p>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer py-2">
                          <div className="flex flex-col space-y-1">
                            <p className="font-medium">Operator offline</p>
                            <p className="text-sm text-muted-foreground">
                              John Smith has gone offline during shift.
                            </p>
                            <p className="text-xs text-muted-foreground">20 min ago</p>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer py-2">
                          <div className="flex flex-col space-y-1">
                            <p className="font-medium">Task completed</p>
                            <p className="text-sm text-muted-foreground">
                              Engine maintenance for client #C123 was completed.
                            </p>
                            <p className="text-xs text-muted-foreground">1 hour ago</p>
                          </div>
                        </DropdownMenuItem>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer justify-center">
                        View all notifications
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Profile dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="ml-4 flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={user?.profileImage} />
                          <AvatarFallback className="bg-primary">
                            {user?.name ? getInitials(user.name) : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden md:flex items-center">
                          <span className="mr-1">{user?.name}</span>
                          <ChevronDown className="h-4 w-4" />
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
