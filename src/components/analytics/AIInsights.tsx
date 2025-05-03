import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { generatePerformanceInsights } from "@/utils/aiTaskPrediction";
import { useToast } from "@/components/ui/use-toast";

const AIInsights = () => {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Generate initial insights
  useEffect(() => {
    generateInitialInsights();
  }, []);

  const generateInitialInsights = () => {
    // In a real app, this would call an API to get ML-generated insights
    // For demo, we'll generate a few random ones
    setLoading(true);
    setTimeout(() => {
      const newInsights = [
        generatePerformanceInsights(),
        generatePerformanceInsights(),
        generatePerformanceInsights()
      ];
      
      // Ensure no duplicate insights
      const uniqueInsights = Array.from(new Set(newInsights));
      setInsights(uniqueInsights);
      setLoading(false);
    }, 1000);
  };
  
  const refreshInsights = () => {
    setLoading(true);
    toast({
      title: "Analyzing data",
      description: "Generating new AI insights...",
    });
    
    setTimeout(() => {
      const newInsight = generatePerformanceInsights();
      setInsights(prev => {
        const newInsights = [newInsight, ...prev];
        // Keep only most recent 5 insights
        return newInsights.slice(0, 5);
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">
          AI Performance Insights
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshInsights}
          disabled={loading}
        >
          <Lightbulb className="mr-2 h-4 w-4" />
          Generate Insight
        </Button>
      </CardHeader>
      <CardContent>
        {insights.length > 0 ? (
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start">
                <div className="mr-2 mt-0.5">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                </div>
                <p className="text-sm">{insight}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Lightbulb className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-center">
              {loading ? "Analyzing performance data..." : "No insights available yet."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;
