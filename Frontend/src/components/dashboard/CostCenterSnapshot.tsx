import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { PieChart as PieChartIcon, ChevronRight, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { analyticalService, AnalyticalAccount } from "@/lib/analytical-service";
import { budgetsService, Budget } from "@/lib/budgets-service";

interface CostCenterData {
  name: string;
  value: number;
  profit: number;
  color: string;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          Revenue: ₹{(item.value / 100000).toFixed(2)}L
        </p>
        <p className={`text-sm font-medium ${item.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
          {item.profit >= 0 ? 'Profit' : 'Loss'}: ₹{Math.abs(item.profit / 100000).toFixed(2)}L
        </p>
      </div>
    );
  }
  return null;
};

const CostCenterSnapshot = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<CostCenterData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accounts, budgets] = await Promise.all([
          analyticalService.list(),
          budgetsService.list()
        ]);

        // Create a map of analytical account ID to budget data
        const budgetMap = new Map<string, { income: number; expense: number }>();
        
        budgets.forEach((budget: Budget) => {
          if (budget.status === "CONFIRMED" || budget.status === "REVISED") {
            const existing = budgetMap.get(budget.analyticalAccountId) || { income: 0, expense: 0 };
            budget.lines.forEach(line => {
              if (line.type === "INCOME") {
                existing.income += Number(line.actualAmount) || 0;
              } else {
                existing.expense += Number(line.actualAmount) || 0;
              }
            });
            budgetMap.set(budget.analyticalAccountId, existing);
          }
        });

        const mappedData: CostCenterData[] = accounts.slice(0, 5).map((account: AnalyticalAccount, idx: number) => {
          const budgetData = budgetMap.get(account.id) || { income: 0, expense: 0 };
          const value = budgetData.income + budgetData.expense; // Total activity
          const profit = budgetData.income - budgetData.expense;
          
          return {
            name: account.name,
            value: value || 100000 * (5 - idx), // Fallback for visualization
            profit: profit,
            color: COLORS[idx % COLORS.length]
          };
        });

        setData(mappedData);
      } catch (error) {
        console.error("Error fetching cost center data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalRevenue = data.reduce((sum, d) => sum + d.value, 0);
  const totalProfit = data.reduce((sum, d) => sum + d.profit, 0);

  return (
    <Card className="card-elevated border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
            <PieChartIcon className="w-5 h-5 text-chart-1" />
          </div>
          <div>
            <CardTitle className="text-lg">Cost Center Snapshot</CardTitle>
            <p className="text-sm text-muted-foreground">Revenue distribution by center</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-muted-foreground"
          onClick={() => navigate("/cost-center-profitability")}
        >
          View P&L <ChevronRight className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <PieChartIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No cost center data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Chart */}
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend & Stats */}
            <div className="space-y-3">
              {data.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.08 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.profit >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                    )}
                    <span className={`text-sm font-medium ${item.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {item.profit >= 0 ? '+' : ''}₹{(item.profit / 100000).toFixed(1)}L
                    </span>
                  </div>
                </motion.div>
              ))}

              <div className="pt-3 mt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Profit</span>
                  <Badge variant="outline" className={`${totalProfit >= 0 ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                    {totalProfit >= 0 ? '+' : ''}₹{(totalProfit / 100000).toFixed(2)}L
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CostCenterSnapshot;
