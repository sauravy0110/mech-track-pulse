
import { cn } from "@/lib/utils";
import { UserStatus } from "@/utils/mockData";

interface StatusBadgeProps {
  status: UserStatus;
  pulse?: boolean;
  className?: string;
}

const statusConfig = {
  online: {
    color: "bg-success",
    text: "Online",
  },
  offline: {
    color: "bg-error",
    text: "Offline",
  },
  away: {
    color: "bg-warning",
    text: "Away",
  },
  busy: {
    color: "bg-info",
    text: "Busy",
  },
};

const StatusBadge = ({ status, pulse = false, className }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center", className)}>
      <div
        className={cn(
          "h-2.5 w-2.5 rounded-full mr-2",
          config.color,
          pulse && "animate-pulse-slow"
        )}
      />
      <span className="text-sm font-medium">{config.text}</span>
    </div>
  );
};

export default StatusBadge;
