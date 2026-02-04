import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { aiService, BudgetInsight } from "@/lib/ai-service";
import { dashboardService } from "@/lib/dashboard-service";
import { toast } from "sonner";

interface Insight {
  icon: any;
  color: string;
  bg: string;
  text: string;
}

const AISmartSummary = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [prediction, setPrediction] = useState<string>("");

  const fetchInsights = async () => {
    try {
      const [budgetInsights, stats] = await Promise.all([
        aiService.getInsights().catch(() => [] as BudgetInsight[]),
        dashboardService.getStats().catch(() => null)
      ]);

      const generatedInsights: Insight[] = [];

      // Add budget insights
      budgetInsights.forEach((insight: BudgetInsight) => {
        generatedInsights.push({
          icon: insight.severity === "CRITICAL" ? AlertTriangle : AlertTriangle,
          color: insight.severity === "CRITICAL" ? "text-destructive" : "text-warning",
          bg: insight.severity === "CRITICAL" ? "bg-destructive/10" : "bg-warning/10",
          text: `${insight.analyticalAccount}: ${insight.message} (${insight.usage} used)`
        });
      });

      // Generate insights from dashboard stats
      if (stats) {
        const profit = stats.totalIncome - stats.totalExpense;
        const profitMargin = stats.totalIncome > 0 ? (profit / stats.totalIncome * 100) : 0;

        if (profit > 0) {
          generatedInsights.push({
            icon: TrendingUp,
            color: "text-success",
            bg: "bg-success/10",
            text: `Net profit of ₹${(profit / 100000).toFixed(2)}L with ${profitMargin.toFixed(1)}% margin this period.`
          });
        }

        if (stats.activeBudgetsCount > 0) {
          generatedInsights.push({
            icon: CheckCircle,
            color: "text-primary",
            bg: "bg-primary/10",
            text: `${stats.activeBudgetsCount} active budget(s) being tracked for cost management.`
          });
        }

        // Generate prediction based on stats
        if (stats.incomeChange > 0) {
          setPrediction(`Based on current trends, revenue is up +${stats.incomeChange}% compared to last period.`);
        } else if (stats.incomeChange < 0) {
          setPrediction(`Revenue is trending down ${stats.incomeChange}%. Consider reviewing underperforming cost centers.`);
        } else {
          setPrediction("Stable revenue trend observed. No significant changes predicted.");
        }
      }

      // Default insight if none
      if (generatedInsights.length === 0) {
        generatedInsights.push({
          icon: Lightbulb,
          color: "text-accent",
          bg: "bg-accent/10",
          text: "Start adding transactions and budgets to get AI-powered insights."
        });
        setPrediction("Add more data to enable AI predictions.");
      }

      setInsights(generatedInsights.slice(0, 3));
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      setInsights([{
        icon: Lightbulb,
        color: "text-muted-foreground",
        bg: "bg-muted",
        text: "Unable to load insights at this time."
      }]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    toast.info("Refreshing AI insights...");
    fetchInsights().then(() => {
      toast.success("Insights updated");
    });
  };

  return (
    <Card className="card-elevated border-0 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center relative">
            <Bot className="w-5 h-5 text-accent" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
            </motion.div>
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              AI Summary
              <Badge variant="secondary" className="text-xs font-normal">Beta</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Intelligent insights</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.15, duration: 0.4 }}
                className="flex items-start gap-3"
              >
                <div className={`w-8 h-8 rounded-lg ${insight.bg} flex items-center justify-center shrink-0`}>
                  <insight.icon className={`w-4 h-4 ${insight.color}`} />
                </div>
                <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
              </motion.div>
            ))}

            <div className="pt-4 mt-4 border-t">
              <div className="p-3 rounded-lg bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Prediction</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {prediction || "Collecting data for predictions..."}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate("/ai-insights")}
            >
              <Bot className="w-4 h-4" />
              View All AI Insights
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AISmartSummary;
