
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertCircle, Clock, User } from "lucide-react";
import { mockAttendance } from "@/utils/mockData";

interface Alert {
  id: string;
  type: "late_login" | "early_exit" | "off_app";
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

const SmartShiftAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // In a production app, this would run an ML model against real data
    // For demo purposes, we'll generate some simulated alerts
    generateSimulatedAlerts();
  }, []);

  const generateSimulatedAlerts = () => {
    // Analyze attendance data to generate alerts
    const now = new Date();
    const generatedAlerts: Alert[] = [];
    
    // Check for possible late logins (employees who checked in after 9 AM)
    mockAttendance.forEach(record => {
      const checkInTime = new Date(record.checkIn);
      const checkInHour = checkInTime.getHours();
      const checkInMinute = checkInTime.getMinutes();
      
      // Late login alert (after 9:30 AM)
      if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 30)) {
        generatedAlerts.push({
          id: `late-${record.id}`,
          type: "late_login",
          userId: record.userId,
          userName: record.userName,
          message: `Late login detected at ${checkInTime.toLocaleTimeString()}`,
          timestamp: now
        });
      }
      
      // Early exit alert (if someone checked out before 5 PM)
      if (record.checkOut) {
        const checkOutTime = new Date(record.checkOut);
        const checkOutHour = checkOutTime.getHours();
        
        if (checkOutHour < 17) {
          generatedAlerts.push({
            id: `early-${record.id}`,
            type: "early_exit",
            userId: record.userId,
            userName: record.userName,
            message: `Early exit detected at ${checkOutTime.toLocaleTimeString()}`,
            timestamp: now
          });
        }
      }
    });
    
    // Add a simulated off-app alert (based on ML prediction)
    generatedAlerts.push({
      id: "offapp-1",
      type: "off_app",
      userId: mockAttendance[0].userId,
      userName: mockAttendance[0].userName,
      message: "Unusual off-app time detected (25 min longer than average)",
      timestamp: now
    });
    
    setAlerts(generatedAlerts);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md font-medium">
          Smart Shift Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50">
                <div className="mt-1">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        <User size={12} />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{alert.userName}</span>
                  </div>
                  <p className="text-sm mt-1">{alert.message}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-center">
              No shift alerts to display
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartShiftAlerts;
