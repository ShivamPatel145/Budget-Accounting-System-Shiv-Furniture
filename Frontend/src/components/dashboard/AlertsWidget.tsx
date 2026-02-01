import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Bell, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { aiService, BudgetInsight } from "@/lib/ai-service";
import { budgetsService, Budget } from "@/lib/budgets-service";
import { customerInvoicesService } from "@/lib/customer-invoices-service";
import { toast } from "sonner";

interface Alert {
  id: string;
  type: "warning" | "error" | "info" | "success";
  title: string;
  description: string;
  time: string;
}

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20"
  },
  error: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20"
  },
  info: {
    icon: AlertCircle,
    color: "text-info",
    bg: "bg-info/10",
    border: "border-info/20"
  },
  success: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20"
  }
};

const AlertsWidget = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [insights, budgets, invoices] = await Promise.all([
          aiService.getInsights().catch(() => [] as BudgetInsight[]),
          budgetsService.list().catch(() => [] as Budget[]),
          customerInvoicesService.list().catch(() => [])
        ]);

        const generatedAlerts: Alert[] = [];

        // Generate alerts from AI insights (budget warnings)
        insights.forEach((insight, idx) => {
          generatedAlerts.push({
            id: `insight-${idx}`,
            type: insight.severity === "CRITICAL" ? "error" : "warning",
            title: `${insight.analyticalAccount} Budget ${insight.severity === "CRITICAL" ? "Exceeded" : "Warning"}`,
            description: insight.message,
            time: "Just now"
          });
        });

        // Check for overdue invoices
        const overdueInvoices = invoices.filter(inv => {
          const dueDate = new Date(inv.dueDate);
          return dueDate < new Date() && inv.status !== "PAID";
        });

        overdueInvoices.slice(0, 2).forEach((inv, idx) => {
          generatedAlerts.push({
            id: `overdue-${idx}`,
            type: "info",
            title: "Invoice Overdue",
            description: `${inv.number} - ₹${inv.total.toLocaleString('en-IN')} pending`,
            time: "Action needed"
          });
        });

        // Add success alert if budgets are healthy
        if (insights.length === 0 && budgets.length > 0) {
          generatedAlerts.push({
            id: "healthy",
            type: "success",
            title: "Budgets Healthy",
            description: "All budgets within acceptable limits",
            time: "Current"
          });
        }

        // If no real alerts, show placeholder
        if (generatedAlerts.length === 0) {
          generatedAlerts.push({
            id: "no-alerts",
            type: "success",
            title: "All Clear",
            description: "No alerts or warnings at this time",
            time: "Now"
          });
        }

        setAlerts(generatedAlerts);
      } catch (error) {
        console.error("Error fetching alerts:", error);
        toast.error("Failed to load alerts");
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const errorWarningCount = alerts.filter(a => a.type === 'error' || a.type === 'warning').length;

  return (
    <Card className="card-elevated border-0 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-warning" />
            {errorWarningCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {errorWarningCount}
              </span>
            )}
          </div>
          <div>
            <CardTitle className="text-lg">Alerts & Warnings</CardTitle>
            <p className="text-sm text-muted-foreground">Action required</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          alerts.map((alert, idx) => {
            const config = alertConfig[alert.type];
            const Icon = config.icon;
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
                className={`p-3 rounded-lg border ${config.border} ${config.bg} cursor-pointer hover:shadow-sm transition-all`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${config.color} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.time}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        <Button 
          variant="ghost" 
          className="w-full mt-2 text-muted-foreground"
          onClick={() => navigate("/budgets")}
        >
          View All Budgets <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AlertsWidget;
