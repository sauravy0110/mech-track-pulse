
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import OperatorCard from "@/components/dashboard/OperatorCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { mockUsers } from "@/utils/mockData";
import AIFeatureSection from "@/components/dashboard/AIFeatureSection";

const Dashboard = () => {
  const { user, isRole } = useAuth();
  const operators = mockUsers.operators;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user ? user.name : "User"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Operator Status</CardTitle>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {operators.slice(0, 4).map((operator) => (
                <OperatorCard key={operator.id} operator={operator} />
              ))}
            </div>
          </CardContent>
        </Card>

        <AIFeatureSection />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
