
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge";
import { MessageSquare, Phone } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { UserStatus } from "@/utils/mockData";

interface OperatorCardProps {
  operator: {
    id: string;
    name: string;
    profileImage?: string;
    status: UserStatus;
    currentTask?: string | null;
    progress?: number;
    performanceScore: number;
    skillScore: number;
  };
}

const OperatorCard = ({ operator }: OperatorCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-4 pt-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-3">
              {operator.profileImage ? (
                <AvatarImage src={operator.profileImage} alt={operator.name} />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(operator.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{operator.name}</h3>
              <p className="text-sm text-muted-foreground">{operator.id}</p>
            </div>
          </div>
          <StatusBadge status={operator.status} pulse={operator.status === "online"} />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-4">
          {operator.currentTask && (
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-sm font-medium">Current Task</p>
                {operator.progress !== undefined && (
                  <span className="text-sm">{operator.progress}%</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{operator.currentTask}</p>
              {operator.progress !== undefined && (
                <Progress value={operator.progress} className="h-2" />
              )}
            </div>
          )}
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Performance</p>
              <div className="bg-muted rounded-full h-1.5">
                <div 
                  className="bg-info h-1.5 rounded-full" 
                  style={{ width: `${operator.performanceScore}%` }}
                />
              </div>
              <p className="text-xs text-right mt-1">{operator.performanceScore}/100</p>
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Skill Level</p>
              <div className="bg-muted rounded-full h-1.5">
                <div 
                  className="bg-success h-1.5 rounded-full" 
                  style={{ width: `${operator.skillScore}%` }}
                />
              </div>
              <p className="text-xs text-right mt-1">{operator.skillScore}/100</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-6 py-3 border-t">
        <div className="flex space-x-2 w-full">
          <Button variant="outline" size="sm" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OperatorCard;
