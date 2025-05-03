
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIInsights from "@/components/analytics/AIInsights";
import SmartShiftAlerts from "@/components/dashboard/SmartShiftAlerts";

const AIFeatureSection = () => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>AI Features</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-6">
            <TabsTrigger value="insights">Performance Insights</TabsTrigger>
            <TabsTrigger value="alerts">Smart Alerts</TabsTrigger>
          </TabsList>
          <TabsContent value="insights" className="p-6 pt-4">
            <AIInsights />
          </TabsContent>
          <TabsContent value="alerts" className="p-6 pt-4">
            <SmartShiftAlerts />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIFeatureSection;
