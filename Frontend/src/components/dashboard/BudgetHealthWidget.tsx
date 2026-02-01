import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, ChevronRight, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { budgetsService, Budget } from "@/lib/budgets-service";

interface BudgetItem {
  name: string;
  allocated: number;
  used: number;
  status: "safe" | "warning" | "danger";
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getStatus = (percentage: number): "safe" | "warning" | "danger" => {
  if (percentage >= 90) return "danger";
  if (percentage >= 75) return "warning";
  return "safe";
};

const BudgetHealthWidget = () => {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const data = await budgetsService.list();
        
        const mappedBudgets: BudgetItem[] = data
          .filter((b: Budget) => b.status === "CONFIRMED" || b.status === "REVISED")
          .slice(0, 5)
          .map((budget: Budget) => {
            // Sum up EXPENSE lines for allocated and actual
            const expenseLines = budget.lines.filter(l => l.type === "EXPENSE");
            const allocated = expenseLines.reduce((sum, l) => sum + Number(l.budgetedAmount), 0);
            const used = expenseLines.reduce((sum, l) => sum + Number(l.actualAmount), 0);
            const percentage = allocated > 0 ? (used / allocated) * 100 : 0;
            
            return {
              name: budget.analyticalAccount?.name || budget.name,
              allocated,
              used,
              status: getStatus(percentage)
            };
          });

        setBudgets(mappedBudgets);
      } catch (error) {
        console.error("Error fetching budgets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalUsed = budgets.reduce((sum, b) => sum + b.used, 0);
  const overallPercentage = totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0;

  return (
    <Card className="card-elevated border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Budget Health Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Track your budget utilization</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-muted-foreground"
          onClick={() => navigate("/budgets")}
        >
          View All <ChevronRight className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active budgets found</p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => navigate("/budgets")}
            >
              Create a budget
            </Button>
          </div>
        ) : (
          <>
            {/* Overall Progress */}
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Overall Budget Utilization</span>
                <span className="text-2xl font-bold">{overallPercentage}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(overallPercentage, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                  className={`h-full rounded-full ${
                    overallPercentage >= 90 ? 'bg-destructive' : 
                    overallPercentage >= 75 ? 'bg-warning' : 'bg-success'
                  }`}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Used: {formatCurrency(totalUsed)}</span>
                <span>Total: {formatCurrency(totalAllocated)}</span>
              </div>
            </div>

            {/* Individual Budgets */}
            <div className="space-y-3">
              {budgets.map((budget, idx) => {
                const percentage = budget.allocated > 0 
                  ? Math.round((budget.used / budget.allocated) * 100) 
                  : 0;
                return (
                  <motion.div
                    key={budget.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1, duration: 0.3 }}
                    className="group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{budget.name}</span>
                        {budget.status === "danger" && (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(budget.used)} / {formatCurrency(budget.allocated)}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-medium ${
                            budget.status === 'danger' ? 'border-destructive/50 text-destructive bg-destructive/10' :
                            budget.status === 'warning' ? 'border-warning/50 text-warning bg-warning/10' :
                            'border-success/50 text-success bg-success/10'
                          }`}
                        >
                          {percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 + idx * 0.1 }}
                        className={`h-full rounded-full transition-all ${
                          budget.status === 'danger' ? 'bg-destructive' :
                          budget.status === 'warning' ? 'bg-warning' : 'bg-success'
                        }`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetHealthWidget;
