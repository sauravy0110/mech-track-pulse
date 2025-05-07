
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Users, Clipboard, UserCog, BarChart, Settings, MessageSquare, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const { user } = useAuth();
  
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Operators", href: "/operators", icon: Users },
    { name: "Tasks", href: "/tasks", icon: Clipboard },
    { name: "Supervisors", href: "/supervisors", icon: UserCog, role: "owner" },
    { name: "Reports", href: "/reports", icon: BarChart },
    { name: "Schedule", href: "/schedule", icon: Calendar },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 border-r border-border bg-card">
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-border">
          <img
            className="h-8 w-auto"
            src="/lovable-uploads/652b5d11-8b9e-4675-b76c-5f552280f24f.png"
            alt="MechTrackPulse"
          />
          <span className="ml-2 text-lg font-semibold">MechTrackPulse</span>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              // Skip items that require specific roles if user doesn't have that role
              if (item.role && user?.role !== item.role) {
                return null;
              }
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-border p-4">
          <div className="flex items-center">
            <div>
              <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.role || "Unknown Role"}</p>
              {user?.companyName && (
                <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {user.companyName}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
