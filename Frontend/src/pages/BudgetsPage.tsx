import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Archive,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Calendar,
  IndianRupee,
  Lock,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BudgetFormPanel from "@/components/budgets/BudgetFormPanel";
import { budgetsService, Budget as BudgetApi } from "@/lib/budgets-service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Budget {
  id: string;
  name: string;
  type: "income" | "expense";
  period: string;
  allocated: number;
  used: number;
  status: "active" | "archived" | "draft";
  costCenter: string;
  locked: boolean;
  lastRevision: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getStatusBadge = (status: Budget["status"]) => {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
    case "archived":
      return <Badge className="bg-muted text-muted-foreground">Archived</Badge>;
    case "draft":
      return <Badge className="bg-warning/10 text-warning border-warning/20">Draft</Badge>;
  }
};

const getUtilizationBadge = (percentage: number) => {
  if (percentage >= 90) {
    return <Badge className="bg-destructive/10 text-destructive border-destructive/20">{percentage}%</Badge>;
  } else if (percentage >= 75) {
    return <Badge className="bg-warning/10 text-warning border-warning/20">{percentage}%</Badge>;
  }
  return <Badge className="bg-success/10 text-success border-success/20">{percentage}%</Badge>;
};

const BudgetsPage = () => {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormPanel, setShowFormPanel] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const fetchBudgets = async () => {
    try {
      const data = await budgetsService.list();
      
      const mappedBudgets: Budget[] = data.map((b: BudgetApi) => {
        // Calculate allocated and used from lines
        const expenseLines = b.lines.filter(l => l.type === "EXPENSE");
        const incomeLines = b.lines.filter(l => l.type === "INCOME");
        
        const allocated = expenseLines.reduce((sum, l) => sum + Number(l.budgetedAmount), 0) + 
                         incomeLines.reduce((sum, l) => sum + Number(l.budgetedAmount), 0);
        const used = expenseLines.reduce((sum, l) => sum + Number(l.actualAmount), 0) + 
                    incomeLines.reduce((sum, l) => sum + Number(l.actualAmount), 0);
        
        // Determine type based on dominant line type
        const type = incomeLines.length >= expenseLines.length ? "income" : "expense";
        
        // Map status
        let status: "active" | "archived" | "draft" = "draft";
        if (b.status === "CONFIRMED" || b.status === "REVISED") status = "active";
        else if (b.status === "ARCHIVED") status = "archived";
        
        // Format period
        const start = new Date(b.periodStart);
        const end = new Date(b.periodEnd);
        const period = `${start.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`;
        
        return {
          id: b.id,
          name: b.name,
          type,
          period,
          allocated,
          used,
          status,
          costCenter: b.analyticalAccount?.name || "General",
          locked: b.status === "ARCHIVED",
          lastRevision: new Date(b.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
        };
      });

      setBudgets(mappedBudgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      toast.error("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         budget.costCenter.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || 
                      (activeTab === "active" && budget.status === "active") ||
                      (activeTab === "archived" && budget.status === "archived") ||
                      (activeTab === "income" && budget.type === "income") ||
                      (activeTab === "expense" && budget.type === "expense");
    return matchesSearch && matchesTab;
  });

  const stats = {
    totalBudgets: budgets.length,
    activeBudgets: budgets.filter(b => b.status === "active").length,
    totalAllocated: budgets.filter(b => b.status === "active").reduce((sum, b) => sum + b.allocated, 0),
    warningBudgets: budgets.filter(b => b.allocated > 0 && (b.used / b.allocated) >= 0.85 && b.status === "active").length
  };

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
          <h1 className="text-2xl font-bold text-foreground">Budget Management</h1>
          <p className="text-muted-foreground">Create and monitor your financial budgets</p>
        </div>
        <Button variant="gradient" className="gap-2" onClick={() => setShowFormPanel(true)}>
          <Plus className="w-4 h-4" />
          Create Budget
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: "Total Budgets", 
            value: stats.totalBudgets, 
            icon: Wallet, 
            color: "text-primary", 
            bg: "bg-primary/10" 
          },
          { 
            title: "Active Budgets", 
            value: stats.activeBudgets, 
            icon: CheckCircle, 
            color: "text-success", 
            bg: "bg-success/10" 
          },
          { 
            title: "Total Allocated", 
            value: formatCurrency(stats.totalAllocated), 
            icon: IndianRupee, 
            color: "text-accent", 
            bg: "bg-accent/10" 
          },
          { 
            title: "Needs Attention", 
            value: stats.warningBudgets, 
            icon: AlertTriangle, 
            color: "text-warning", 
            bg: "bg-warning/10" 
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
          >
            <Card className="card-elevated border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Card className="card-elevated border-0">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
                <TabsTrigger value="expense">Expense</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search budgets..."
                  className="pl-9 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Budget Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Cost Center</TableHead>
                <TableHead className="text-right">Allocated</TableHead>
                <TableHead className="text-right">Used</TableHead>
                <TableHead className="text-center">Utilization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBudgets.map((budget, idx) => {
                const percentage = Math.round((budget.used / budget.allocated) * 100);
                return (
                  <motion.tr
                    key={budget.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className="table-row-hover group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {budget.locked && <Lock className="w-4 h-4 text-muted-foreground" />}
                        <span className="font-medium">{budget.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={budget.type === 'income' ? 'text-success' : 'text-warning'}>
                        {budget.type === 'income' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : null}
                        {budget.type.charAt(0).toUpperCase() + budget.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {budget.period}
                      </div>
                    </TableCell>
                    <TableCell>{budget.costCenter}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(budget.allocated)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(budget.used)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        {getUtilizationBadge(percentage)}
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              percentage >= 90 ? 'bg-destructive' : 
                              percentage >= 75 ? 'bg-warning' : 'bg-success'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(budget.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Budget
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            View Transactions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Side Panel */}
      <BudgetFormPanel 
        open={showFormPanel} 
        onClose={() => setShowFormPanel(false)}
        budget={selectedBudget}
        onSuccess={fetchBudgets}
      />
    </motion.div>
  );
};

export default BudgetsPage;
