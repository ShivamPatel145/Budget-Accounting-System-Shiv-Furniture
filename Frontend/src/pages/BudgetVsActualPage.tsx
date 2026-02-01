import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  CheckCircle,
  IndianRupee,
  BarChart3,
  Loader2
} from "lucide-react";
import { budgetsService, Budget } from "@/lib/budgets-service";
import { toast } from "sonner";

interface BudgetData {
  costCenter: string;
  plannedBudget: number;
  actualSpent: number;
  remainingBalance: number;
  utilizationPercent: number;
  status: "safe" | "warning" | "over";
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const BudgetVsActualPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("current-quarter");
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const budgets = await budgetsService.list();
        
        // Group budgets by cost center (analytical account)
        const costCenterMap = new Map<string, { planned: number; actual: number }>();
        
        budgets.forEach((b: Budget) => {
          if (b.status !== "CONFIRMED" && b.status !== "REVISED") return;
          
          const costCenterName = b.analyticalAccount?.name || "General";
          
          b.lines.forEach(line => {
            const existing = costCenterMap.get(costCenterName) || { planned: 0, actual: 0 };
            existing.planned += Number(line.budgetedAmount);
            existing.actual += Number(line.actualAmount);
            costCenterMap.set(costCenterName, existing);
          });
        });

        const data: BudgetData[] = Array.from(costCenterMap.entries()).map(([costCenter, values]) => {
          const utilizationPercent = values.planned > 0 ? Math.round((values.actual / values.planned) * 100) : 0;
          let status: "safe" | "warning" | "over" = "safe";
          if (utilizationPercent > 100) status = "over";
          else if (utilizationPercent >= 85) status = "warning";
          
          return {
            costCenter,
            plannedBudget: values.planned,
            actualSpent: values.actual,
            remainingBalance: values.planned - values.actual,
            utilizationPercent,
            status
          };
        });

        setBudgetData(data);
      } catch (error) {
        console.error("Error fetching budgets:", error);
        toast.error("Failed to load budget data");
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  const chartData = budgetData.map(item => ({
    name: item.costCenter,
    planned: item.plannedBudget,
    actual: item.actualSpent,
    variance: item.plannedBudget - item.actualSpent
  }));

  const pieData = budgetData.map(item => ({
    name: item.costCenter,
    value: item.actualSpent
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--accent))', 'hsl(var(--destructive))'];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "safe": return { color: "text-success", bg: "bg-success/10", icon: CheckCircle, label: "Safe" };
      case "warning": return { color: "text-warning", bg: "bg-warning/10", icon: AlertTriangle, label: "Warning" };
      case "over": return { color: "text-destructive", bg: "bg-destructive/10", icon: TrendingDown, label: "Over" };
      default: return { color: "text-muted-foreground", bg: "bg-muted", icon: Target, label: "Unknown" };
    }
  };

  const totalBudget = budgetData.reduce((sum, item) => sum + item.plannedBudget, 0);
  const totalSpent = budgetData.reduce((sum, item) => sum + item.actualSpent, 0);
  const totalVariance = totalBudget - totalSpent;
  const overallUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

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
          <h1 className="text-2xl font-bold text-foreground">Budget vs Actual</h1>
          <p className="text-muted-foreground">Compare planned budgets against actual spending</p>
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
              <SelectItem value="custom">Custom Range</SelectItem>
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
            title: "Total Budget", 
            value: formatCurrency(totalBudget), 
            subtitle: "Planned for period", 
            icon: Wallet, 
            color: "text-primary", 
            bg: "bg-primary/10",
            trend: null
          },
          { 
            title: "Total Spent", 
            value: formatCurrency(totalSpent), 
            subtitle: `${overallUtilization}% utilized`, 
            icon: IndianRupee, 
            color: "text-accent", 
            bg: "bg-accent/10",
            trend: null
          },
          { 
            title: "Variance", 
            value: formatCurrency(Math.abs(totalVariance)), 
            subtitle: totalVariance >= 0 ? "Under budget" : "Over budget", 
            icon: totalVariance >= 0 ? TrendingUp : TrendingDown, 
            color: totalVariance >= 0 ? "text-success" : "text-destructive", 
            bg: totalVariance >= 0 ? "bg-success/10" : "bg-destructive/10",
            trend: totalVariance >= 0 ? "up" : "down"
          },
          { 
            title: "At Risk", 
            value: budgetData.filter(b => b.status !== "safe").length, 
            subtitle: "Cost centers", 
            icon: AlertTriangle, 
            color: "text-warning", 
            bg: "bg-warning/10",
            trend: null
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
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {stat.trend && (
                        stat.trend === "up" 
                          ? <ArrowUpRight className="w-3 h-3 text-success" />
                          : <ArrowDownRight className="w-3 h-3 text-destructive" />
                      )}
                      {stat.subtitle}
                    </div>
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

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Chart */}
        <Card className="card-elevated border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Budget Comparison</CardTitle>
                <CardDescription>Planned vs actual by cost center</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `₹${value/100000}L`} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                  />
                  <Bar dataKey="planned" fill="hsl(var(--primary))" name="Planned" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="actual" fill="hsl(var(--success))" name="Actual" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm text-muted-foreground">Planned</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-sm text-muted-foreground">Actual</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="card-elevated border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg">Spending Distribution</CardTitle>
                <CardDescription>Actual spending by cost center</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="card-elevated border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-success" />
              </div>
              <div>
                <CardTitle className="text-lg">Budget Details</CardTitle>
                <CardDescription>Detailed breakdown by cost center</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Cost Center</TableHead>
                  <TableHead className="text-right">Planned Budget</TableHead>
                  <TableHead className="text-right">Actual Spent</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetData.map((item, idx) => {
                  const statusConfig = getStatusConfig(item.status);
                  const variance = item.plannedBudget - item.actualSpent;
                  return (
                    <motion.tr
                      key={item.costCenter}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-lg">
                            <AvatarFallback className={`rounded-lg ${statusConfig.bg} ${statusConfig.color} text-xs`}>
                              {item.costCenter.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{item.costCenter}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(item.plannedBudget)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(item.actualSpent)}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-mono ${variance >= 0 ? "text-success" : "text-destructive"}`}>
                          {variance >= 0 ? "+" : ""}{formatCurrency(variance)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress 
                            value={Math.min(item.utilizationPercent, 100)} 
                            className="w-24 h-2"
                          />
                          <span className={`text-sm font-medium ${
                            item.utilizationPercent > 100 ? "text-destructive" : 
                            item.utilizationPercent > 80 ? "text-warning" : "text-success"
                          }`}>
                            {item.utilizationPercent}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`${statusConfig.bg} ${statusConfig.color} border-0`}>
                          <statusConfig.icon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
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

export default BudgetVsActualPage;
