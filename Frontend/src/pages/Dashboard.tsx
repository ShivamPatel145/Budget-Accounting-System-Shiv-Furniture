import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  IndianRupee,
  Target,
  PieChart,
  BarChart3,
  Sparkles,
  Bot,
  Calendar,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BudgetHealthWidget from "@/components/dashboard/BudgetHealthWidget";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
import CostCenterSnapshot from "@/components/dashboard/CostCenterSnapshot";
import AlertsWidget from "@/components/dashboard/AlertsWidget";
import AISmartSummary from "@/components/dashboard/AISmartSummary";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import { useQuery } from "@tanstack/react-query";
import { dashboardService, DashboardPeriod } from "@/lib/dashboard-service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import PortalDashboardContent from "./PortalDashboard";
import { budgetsService } from "@/lib/budgets-service";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const periodLabels: Record<DashboardPeriod, string> = {
  week: 'This Week',
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year',
  all: 'All Time'
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>('month');

  // If user is PORTAL, show the portal dashboard content
  if (user?.role === "PORTAL") {
    return <PortalDashboardContent />;
  }
  
  const { data: dashboardData, isLoading, error, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["dashboard-stats", selectedPeriod],
    queryFn: () => dashboardService.getStats(selectedPeriod),
    refetchInterval: 60000, // Refetch every minute
  });

  const { data: budgetsData } = useQuery({
    queryKey: ["dashboard-budgets"],
    queryFn: () => budgetsService.list(),
    staleTime: 60000,
  });

  const derivedBudgetTotals = (() => {
    if (!budgetsData || budgetsData.length === 0) return null;

    const active = budgetsData.filter(
      (b: any) => b.status === "CONFIRMED" || b.status === "REVISED"
    );
    if (active.length === 0) return null;

    let income = 0;
    let expense = 0;
    let plannedExpense = 0;

    active.forEach((b: any) => {
      b.lines.forEach((l: any) => {
        if (l.type === "INCOME") {
          income += Number(l.actualAmount || 0);
        } else {
          expense += Number(l.actualAmount || 0);
          plannedExpense += Number(l.budgetedAmount || 0);
        }
      });
    });

    const utilization = plannedExpense > 0 ? Math.round((expense / plannedExpense) * 100) : 0;
    return {
      income,
      expense,
      net: income - expense,
      budgetUtilization: utilization,
      activeCount: active.length,
    };
  })();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatChange = (change: number) => {
    const prefix = change >= 0 ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  };

  const getTimeSinceUpdate = () => {
    if (!dataUpdatedAt) return 'Just now';
    const diff = Date.now() - dataUpdatedAt;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 min ago';
    return `${minutes} min ago`;
  };

  const stats = [
    {
      title: "Total Income",
      value: formatCurrency(
        (derivedBudgetTotals?.income ?? 0) || dashboardData?.totalIncome || 0
      ),
      change: dashboardData?.incomeChange ?? 0,
      trend:
        ((dashboardData?.incomeChange ?? 0) >= 0 ? "up" : "down") as
          | "up"
          | "down"
          | "neutral",
      icon: ArrowUpRight,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Total Expenses",
      value: formatCurrency(
        (derivedBudgetTotals?.expense ?? 0) || dashboardData?.totalExpense || 0
      ),
      change: dashboardData?.expenseChange ?? 0,
      trend:
        ((dashboardData?.expenseChange ?? 0) >= 0 ? "up" : "down") as
          | "up"
          | "down"
          | "neutral",
      icon: ArrowDownLeft,
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      title: "Net Balance",
      value: formatCurrency(
        (derivedBudgetTotals?.net ?? 0) || dashboardData?.netBalance || 0
      ),
      change: dashboardData?.balanceChange ?? 0,
      trend:
        ((derivedBudgetTotals?.net ?? dashboardData?.netBalance ?? 0) >= 0
          ? "up"
          : "down") as "up" | "down" | "neutral",
      icon: Wallet,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Budget Utilized",
      value: `${
        derivedBudgetTotals?.budgetUtilization ?? dashboardData?.budgetUtilization ?? 0
      }%`,
      change: null,
      trend: "neutral",
      statusText:
        (derivedBudgetTotals?.budgetUtilization ?? dashboardData?.budgetUtilization ?? 0) <=
        80
          ? "On Track"
          : (derivedBudgetTotals?.budgetUtilization ?? dashboardData?.budgetUtilization ?? 0) <=
              100
            ? "Warning"
            : "Over Budget",
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-semibold">Failed to load dashboard data</p>
          <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as DashboardPeriod)}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
            <Clock className="w-3.5 h-3.5" />
            Last updated: {getTimeSinceUpdate()}
          </Badge>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => refetch()} 
            disabled={isFetching}
            className="h-9 w-9 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all" 
            onClick={() => navigate('/reports/budget-actual')}
          >
            <BarChart3 className="w-4 h-4" />
            View Reports
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
          >
            <Card className="card-elevated border-0 hover:border-accent/20 transition-all group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-success' : stat.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {stat.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                      {stat.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                      {stat.change !== null ? (
                        <>
                          <span className="font-medium">{formatChange(stat.change)}</span>
                          <span className="text-muted-foreground">vs last {selectedPeriod === 'all' ? 'period' : selectedPeriod}</span>
                        </>
                      ) : (
                        <span className="font-medium">{stat.statusText}</span>
                      )}
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Budget Health - Spans 8 cols */}
        <motion.div variants={fadeInUp} className="col-span-12 lg:col-span-8">
          <BudgetHealthWidget />
        </motion.div>

        {/* Alerts - Spans 4 cols */}
        <motion.div variants={fadeInUp} className="col-span-12 lg:col-span-4">
          <AlertsWidget />
        </motion.div>

        {/* Income vs Expense Chart - Spans 8 cols */}
        <motion.div variants={fadeInUp} className="col-span-12 lg:col-span-8">
          <IncomeExpenseChart />
        </motion.div>

        {/* AI Smart Summary - Spans 4 cols */}
        <motion.div variants={fadeInUp} className="col-span-12 lg:col-span-4">
          <AISmartSummary />
        </motion.div>

        {/* Cost Center Snapshot - Spans 6 cols */}
        <motion.div variants={fadeInUp} className="col-span-12 lg:col-span-6">
          <CostCenterSnapshot />
        </motion.div>

        {/* Recent Transactions - Spans 6 cols */}
        <motion.div variants={fadeInUp} className="col-span-12 lg:col-span-6">
          <RecentTransactions />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
