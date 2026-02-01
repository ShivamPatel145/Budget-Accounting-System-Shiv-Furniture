import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search,
  FileText, 
  Eye, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Filter,
  IndianRupee,
  MoreVertical,
  Calendar,
  Building2,
  Download,
  Printer
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { vendorBillsService, VendorBill } from "@/lib/vendor-bills-service";
import { useNavigate } from "react-router-dom";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const VendorBillsPage = () => {
  const [bills, setBills] = useState<VendorBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = await vendorBillsService.list();
      setBills(data);
    } catch (error) {
      console.error("Failed to fetch bills:", error);
      toast.error("Failed to load vendor bills");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await vendorBillsService.confirm(id);
      toast.success("Bill confirmed successfully");
      await fetchBills();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to confirm bill");
    }
  };

  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bill.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || bill.status.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    totalBills: bills.length,
    totalAmount: bills.reduce((sum, bill) => sum + Number(bill.total), 0),
    paidAmount: bills.reduce((sum, bill) => sum + (bill.total - bill.amountDue), 0),
    outstandingAmount: bills.reduce((sum, bill) => sum + Number(bill.amountDue), 0)
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
      DRAFT: { icon: FileText, color: "text-muted-foreground bg-muted", label: "Draft" },
      CONFIRMED: { icon: Clock, color: "text-blue-600 bg-blue-100", label: "Confirmed" },
      PARTIAL: { icon: Clock, color: "text-warning bg-warning/10", label: "Partial" },
      PAID: { icon: CheckCircle, color: "text-success bg-success/10", label: "Paid" },
      CANCELLED: { icon: AlertCircle, color: "text-destructive bg-destructive/10", label: "Cancelled" }
    };
    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <Badge variant="outline" className={config.color}>
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const makePayment = (billId: string) => {
    navigate(`/accounting/vendor-payments?billId=${billId}`);
  };

  const viewBill = (billId: string) => {
    toast.info("Opening bill details...");
  };

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
          <h1 className="text-2xl font-bold text-foreground">Vendor Bills</h1>
          <p className="text-muted-foreground">Track and pay bills from your purchase orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { title: "Total Bills", value: stats.totalBills, subtitle: "This month", icon: FileText, color: "text-primary", bg: "bg-primary/10" },
          { title: "Total Amount", value: formatCurrency(stats.totalAmount), subtitle: "All bills", icon: IndianRupee, color: "text-muted-foreground", bg: "bg-muted" },
          { title: "Paid Amount", value: formatCurrency(stats.paidAmount), subtitle: "Total paid", icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
          { title: "Outstanding", value: formatCurrency(stats.outstandingAmount), subtitle: "Pending payment", icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
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

      {/* Bills Table */}
      <Card className="card-elevated border-0">
        <div className="p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Bills</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="partial">Partial</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search bills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No bills match your search" : "No vendor bills yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Bill</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>PO Reference</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Payment Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill, idx) => {
                    const paidAmount = bill.total - bill.amountDue;
                    const paymentProgress = bill.total > 0 ? Math.round((paidAmount / bill.total) * 100) : 0;
                    return (
                      <motion.tr
                        key={bill.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.3 }}
                        className="group hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 rounded-lg">
                              <AvatarFallback className="rounded-lg bg-gradient-to-br from-destructive/20 to-destructive/10 text-destructive text-xs">
                                <FileText className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium font-mono">{bill.number}</span>
                              <p className="text-xs text-muted-foreground">{formatDate(bill.billDate)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            {bill.vendor?.name || "Unknown Vendor"}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {bill.purchaseOrder?.number || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {bill.dueDate ? formatDate(bill.dueDate) : "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {formatCurrency(bill.total)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 w-36">
                            <Progress 
                              value={paymentProgress} 
                              className={`h-2 ${
                                paymentProgress === 100 
                                  ? "[&>div]:bg-success" 
                                  : paymentProgress > 0 
                                    ? "[&>div]:bg-warning" 
                                    : "[&>div]:bg-muted"
                              }`}
                            />
                            <span className="text-xs text-muted-foreground w-10">
                              {paymentProgress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(bill.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {bill.status !== "PAID" && bill.amountDue > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => makePayment(bill.id)}
                                className="gap-1"
                              >
                                <CreditCard className="h-4 w-4" />
                                Pay
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => viewBill(bill.id)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {bill.status === "DRAFT" && (
                                  <DropdownMenuItem onClick={() => handleConfirm(bill.id)}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Confirm Bill
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="w-4 h-4 mr-2" />
                                  Print
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default VendorBillsPage;
