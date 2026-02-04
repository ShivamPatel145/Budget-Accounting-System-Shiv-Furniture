import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCcw,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { aiService, BudgetInsight, Anomaly } from "@/lib/ai-service";
import { dashboardService } from "@/lib/dashboard-service";
import { budgetsService, Budget } from "@/lib/budgets-service";

interface AIInsight {
  id: string;
  type: "prediction" | "anomaly" | "recommendation" | "summary";
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  confidence: number;
  impact: string;
  action?: string;
}

interface PredictionData {
  month: string;
  predicted: number;
  actual: number;
  confidence: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const AIInsightsPage = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
  const [trendData, setTrendData] = useState<Array<{ month: string; efficiency: number; cost: number }>>([]);

  const fetchData = async () => {
    try {
      const [budgetInsights, anomalies, stats, budgets, realPredictions, realTrends] = await Promise.all([
        aiService.getInsights().catch(() => [] as BudgetInsight[]),
        aiService.getAnomalies().catch(() => [] as Anomaly[]),
        dashboardService.getStats().catch(() => null),
        budgetsService.list().catch(() => [] as Budget[]),
        aiService.getPredictions().catch(() => []),
        aiService.getTrends().catch(() => [])
      ]);

      const generatedInsights: AIInsight[] = [];
      // ... (existing insights logic) ...

      // Set Real Data
      setInsights(generatedInsights);
      setPredictionData(realPredictions);
      setTrendData(realTrends);

      // Convert budget insights to AIInsight format
      budgetInsights.forEach((insight: BudgetInsight, idx: number) => {
        generatedInsights.push({
          id: `budget-${idx}`,
          type: "prediction",
          title: `${insight.analyticalAccount} Budget ${insight.severity === "CRITICAL" ? "Exceeded" : "Warning"}`,
          description: insight.message,
          severity: insight.severity === "CRITICAL" ? "high" : "medium",
          confidence: 87,
          impact: `Usage: ${insight.usage}`,
          action: insight.severity === "CRITICAL" ? "Review and reallocate budget immediately" : "Monitor spending closely"
        });
      });

      // Convert anomalies to insights
      anomalies.forEach((anomaly: Anomaly, idx: number) => {
        generatedInsights.push({
          id: `anomaly-${idx}`,
          type: "anomaly",
          title: `Unusual Transaction Detected`,
          description: `Bill ${anomaly.number}: ${anomaly.reason}`,
          severity: "medium",
          confidence: 92,
          impact: formatCurrency(anomaly.amount),
          action: "Review transaction details"
        });
      });

      // Add summary insight based on stats
      if (stats) {
        const profit = stats.totalIncome - stats.totalExpense;
        const isHealthy = profit >= 0;
        generatedInsights.push({
          id: "summary",
          type: "summary",
          title: `Overall Financial Health: ${isHealthy ? "Good" : "Needs Attention"}`,
          description: isHealthy
            ? `Net profit of ${formatCurrency(profit)}. ${stats.activeBudgetsCount} active budgets being tracked.`
            : `Net loss of ${formatCurrency(Math.abs(profit))}. Consider reviewing expenses.`,
          severity: isHealthy ? "low" : "high",
          confidence: 95,
          impact: isHealthy ? "Stable financial position" : "Requires immediate attention"
        });
      }

      // Add recommendation if no critical issues
      if (generatedInsights.filter(i => i.severity === "high").length === 0) {
        generatedInsights.push({
          id: "recommendation",
          type: "recommendation",
          title: "Budget Optimization Opportunity",
          description: "Your budgets are within acceptable ranges. Consider reviewing underutilized budgets for reallocation.",
          severity: "low",
          confidence: 78,
          impact: "Potential savings opportunity",
          action: "Review budget allocation"
        });
      }

      // If no insights generated, show placeholder
      if (generatedInsights.length === 0) {
        generatedInsights.push({
          id: "placeholder",
          type: "summary",
          title: "Getting Started",
          description: "Add more transactions and budgets to enable AI-powered insights and predictions.",
          severity: "low",
          confidence: 100,
          impact: "Add data to see insights"
        });
      }

      setInsights(generatedInsights);

    } catch (error) {
      console.error("Error fetching AI data:", error);
      toast.error("Failed to load AI insights");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.info("Analyzing your data...");
    fetchData();
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "high": return { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" };
      case "medium": return { icon: Clock, color: "text-warning", bg: "bg-warning/10" };
      case "low": return { icon: CheckCircle, color: "text-success", bg: "bg-success/10" };
      default: return { icon: Lightbulb, color: "text-primary", bg: "bg-primary/10" };
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "prediction": return { icon: Target, label: "Prediction", color: "text-primary", bg: "bg-primary/10" };
      case "anomaly": return { icon: AlertTriangle, label: "Anomaly", color: "text-warning", bg: "bg-warning/10" };
      case "recommendation": return { icon: Lightbulb, label: "Recommendation", color: "text-success", bg: "bg-success/10" };
      case "summary": return { icon: Brain, label: "Summary", color: "text-accent", bg: "bg-accent/10" };
      default: return { icon: Zap, label: "Insight", color: "text-muted-foreground", bg: "bg-muted" };
    }
  };

  const stats = {
    highPriority: insights.filter(i => i.severity === "high").length,
    avgConfidence: insights.length > 0 ? Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length) : 0,
    totalInsights: insights.length
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Analyzing your financial data...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Insights
          </h1>
          <p className="text-muted-foreground">Intelligent analysis and predictions for your finances</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Analyzing..." : "Refresh Analysis"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Total Insights", value: stats.totalInsights, subtitle: "Active insights", icon: Brain, color: "text-primary", bg: "bg-primary/10" },
          { title: "High Priority", value: stats.highPriority, subtitle: "Need attention", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
          { title: "Avg Confidence", value: `${stats.avgConfidence}%`, subtitle: "Model accuracy", icon: Target, color: "text-success", bg: "bg-success/10" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
          >
            <Card className="card-elevated border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Insights List */}
        <Card className="card-elevated border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Active Insights</CardTitle>
                  <CardDescription>AI-generated analysis and recommendations</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, idx) => {
              const typeConfig = getTypeConfig(insight.type);
              const severityConfig = getSeverityConfig(insight.severity);
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.3 }}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 rounded-lg">
                        <AvatarFallback className={`rounded-lg ${typeConfig.bg} ${typeConfig.color}`}>
                          <typeConfig.icon className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{insight.title}</span>
                          <Badge variant="outline" className={`${severityConfig.bg} ${severityConfig.color} border-0`}>
                            <severityConfig.icon className="w-3 h-3 mr-1" />
                            {insight.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{insight.impact}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Confidence:</span>
                        <Badge variant="outline">{insight.confidence}%</Badge>
                      </div>
                    </div>
                    {insight.action && (
                      <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs">
                        View Action
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* Prediction Chart */}
        <Card className="card-elevated border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <CardTitle className="text-lg">Budget Predictions</CardTitle>
                  <CardDescription>AI-predicted vs actual spending</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictionData}>
                  <defs>
                    <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `₹${value / 1000}K`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--primary))"
                    fill="url(#predictedGradient)"
                    strokeWidth={2}
                    name="Predicted"
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--success))"
                    fill="url(#actualGradient)"
                    strokeWidth={2}
                    name="Actual"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm text-muted-foreground">Predicted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-sm text-muted-foreground">Actual</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Trend */}
        <Card className="card-elevated border-0 lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">Efficiency vs Cost Trend</CardTitle>
                  <CardDescription>Production efficiency correlation with costs</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    yAxisId="left"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `₹${value / 1000}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="efficiency"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--success))", strokeWidth: 2 }}
                    name="Efficiency %"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cost"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2 }}
                    name="Cost"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-sm text-muted-foreground">Efficiency %</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <span className="text-sm text-muted-foreground">Cost</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default AIInsightsPage;
