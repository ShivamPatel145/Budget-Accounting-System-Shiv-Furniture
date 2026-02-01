import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  BarChart3,
  Minus,
  Building2,
  Loader2
} from "lucide-react";
import { analyticalService, AnalyticalAccount } from "@/lib/analytical-service";
import { budgetsService, Budget } from "@/lib/budgets-service";

interface CostCenterData {
  id: string;
  name: string;
  income: number;
  expense: number;
  profit: number;
  margin: number;
  trend: "up" | "down" | "flat";
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const CostCenterProfitabilityPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("current-year");
  const [data, setData] = useState<CostCenterData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accounts, budgets] = await Promise.all([
          analyticalService.list(),
          budgetsService.list()
        ]);

        // Create a map of analytical account ID to aggregated data
        const dataMap = new Map<string, { income: number; expense: number }>();

        // Initialize with all accounts
        accounts.forEach((account: AnalyticalAccount) => {
          dataMap.set(account.id, { income: 0, expense: 0 });
        });

        // Aggregate budget data by analytical account
        budgets.forEach((budget: Budget) => {
          if (budget.status === "CONFIRMED" || budget.status === "REVISED") {
            const existing = dataMap.get(budget.analyticalAccountId) || { income: 0, expense: 0 };
            budget.lines.forEach(line => {
              const planned = Number(line.budgetedAmount) || 0;
              const actual = Number(line.actualAmount) || 0;
              const effectiveActual = actual > 0 ? actual : planned; // fallback when actuals not posted yet

              if (line.type === "INCOME") {
                existing.income += effectiveActual;
              } else {
                existing.expense += effectiveActual;
              }
            });
            dataMap.set(budget.analyticalAccountId, existing);
          }
        });

        // Map to CostCenterData
        const mappedData: CostCenterData[] = accounts.map((account: AnalyticalAccount, idx: number) => {
          const values = dataMap.get(account.id) || { income: 0, expense: 0 };
          const profit = values.income - values.expense;
          const margin = values.income > 0 ? (profit / values.income) * 100 : 0;
          
          // Determine trend based on profit (simplified)
          let trend: "up" | "down" | "flat" = "flat";
          if (profit > 0) trend = "up";
          else if (profit < 0) trend = "down";

          return {
            id: account.id,
            name: account.name,
            income: values.income,
            expense: values.expense,
            profit,
            margin,
            trend
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
  }, [selectedPeriod]);

  const chartData = data.map(item => ({
    name: item.name,
    income: item.income,
    expense: item.expense,
    profit: item.profit
  }));

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return { icon: ArrowUpRight, color: "text-success", bg: "bg-success/10" };
      case "down": return { icon: ArrowDownRight, color: "text-destructive", bg: "bg-destructive/10" };
      default: return { icon: Minus, color: "text-muted-foreground", bg: "bg-muted" };
    }
  };

  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = data.reduce((sum, item) => sum + item.expense, 0);
  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
  const profitableCenters = data.filter(d => d.profit > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
          <h1 className="text-2xl font-bold text-foreground">Cost Center Profitability</h1>
          <p className="text-muted-foreground">Analyze profit and loss by cost center</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="current-quarter">Current Quarter</SelectItem>
              <SelectItem value="current-year">Current Year</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { 
            title: "Total Income", 
            value: formatCurrency(totalIncome), 
            subtitle: "Revenue generated", 
            icon: TrendingUp, 
            color: "text-success", 
            bg: "bg-success/10"
          },
          { 
            title: "Total Expense", 
            value: formatCurrency(totalExpense), 
            subtitle: "Costs incurred", 
            icon: TrendingDown, 
            color: "text-destructive", 
            bg: "bg-destructive/10"
          },
          { 
            title: "Net Profit", 
            value: formatCurrency(totalProfit), 
            subtitle: totalProfit >= 0 ? "Profitable" : "Loss", 
            icon: IndianRupee, 
            color: totalProfit >= 0 ? "text-success" : "text-destructive", 
            bg: totalProfit >= 0 ? "bg-success/10" : "bg-destructive/10"
          },
          { 
            title: "Profitable Centers", 
            value: `${profitableCenters}/${data.length}`, 
            subtitle: "Contributing positively", 
            icon: Target, 
            color: "text-primary", 
            bg: "bg-primary/10"
          },
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

      {/* Chart */}
      <Card className="card-elevated border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Income vs Expense</CardTitle>
              <CardDescription>Financial performance by cost center</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `₹${value/100000}L`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                  formatter={(value: number) => [formatCurrency(value), ""]}
                />
                <Legend />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Bar dataKey="income" fill="hsl(var(--success))" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="hsl(var(--destructive))" name="Expense" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="hsl(var(--primary))" name="Profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="card-elevated border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">Profitability Details</CardTitle>
              <CardDescription>Performance breakdown by cost center</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Cost Center</TableHead>
                  <TableHead className="text-right">Income</TableHead>
                  <TableHead className="text-right">Expense</TableHead>
                  <TableHead className="text-right">Profit/Loss</TableHead>
                  <TableHead className="text-center">Margin</TableHead>
                  <TableHead className="text-center">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, idx) => {
                  const trendConfig = getTrendIcon(item.trend);
                  const TrendIcon = trendConfig.icon;
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-lg">
                            <AvatarFallback className={`rounded-lg ${
                              item.profit >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                            } text-xs`}>
                              {item.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-success">
                        {formatCurrency(item.income)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-destructive">
                        {formatCurrency(item.expense)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-mono font-medium ${item.profit >= 0 ? "text-success" : "text-destructive"}`}>
                          {item.profit >= 0 ? "+" : ""}{formatCurrency(item.profit)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={item.margin > 0 ? "text-success bg-success/10" : "text-muted-foreground bg-muted"}>
                          {item.margin > 0 ? `${item.margin.toFixed(1)}%` : "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`${trendConfig.bg} ${trendConfig.color} border-0`}>
                          <TrendIcon className="w-3 h-3 mr-1" />
                          {item.trend.charAt(0).toUpperCase() + item.trend.slice(1)}
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CostCenterProfitabilityPage;
