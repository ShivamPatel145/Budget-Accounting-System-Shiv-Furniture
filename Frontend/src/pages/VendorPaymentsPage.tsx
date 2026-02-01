import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "react-router-dom";
import { 
  Plus,
  Search,
  CreditCard, 
  Wallet, 
  AlertCircle, 
  CheckCircle, 
  Filter,
  IndianRupee,
  Calendar,
  Building2,
  FileText,
  MoreVertical,
  Eye,
  Printer,
  Download,
  ArrowDownLeft,
  XCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { paymentsService } from "@/lib/payments-service";
import { vendorBillsService } from "@/lib/vendor-bills-service";

const paymentSchema = z.object({
  vendorBillId: z.string().min(1, "Select a vendor bill"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  method: z.enum(["BANK", "UPI", "CARD", "CASH", "RAZORPAY"]),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

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

const VendorPaymentsPage = () => {
  const [searchParams] = useSearchParams();
  const [payments, setPayments] = useState<any[]>([]);
  const [vendorBills, setVendorBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailsPayment, setDetailsPayment] = useState<any | null>(null);
  const [receiptLoadingId, setReceiptLoadingId] = useState<string | null>(
    null,
  );

  // Pre-select bill from URL params (e.g., from VendorBillsPage)
  const preselectedBillId = searchParams.get("billId");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsData, billsData] = await Promise.all([
        paymentsService.list(),
        vendorBillsService.list()
      ]);
      // Filter for BILL type payments only
      const billPayments = (paymentsData || []).filter(
        (p: any) => p.paymentType === "BILL"
      );
      setPayments(billPayments);
      // Only show bills with remaining amount due
      const billsWithDue = (billsData || []).filter(
        (b: any) => b.amountDue > 0
      );
      setVendorBills(billsWithDue);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      vendorBillId: preselectedBillId || "",
      amount: 0,
      method: "BANK",
    },
  });

  // Update default bill when preselectedBillId changes
  useEffect(() => {
    if (preselectedBillId && vendorBills.length > 0) {
      const bill = vendorBills.find((b) => b.id === preselectedBillId);
      if (bill) {
        form.setValue("vendorBillId", preselectedBillId);
        form.setValue("amount", bill.amountDue);
        setIsDialogOpen(true);
      }
    }
  }, [preselectedBillId, vendorBills, form]);

  const handleSubmit = async (data: PaymentFormData) => {
    try {
      setSubmitting(true);
      await paymentsService.create({
        paymentType: "BILL",
        vendorBillId: data.vendorBillId,
        amount: data.amount,
        method: data.method,
      });
      toast.success("Payment recorded successfully");
      handleDialogClose();
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    form.reset({
      vendorBillId: "",
      amount: 0,
      method: "BANK",
    });
  };

  // Update amount when bill selection changes
  const handleBillChange = (billId: string) => {
    const bill = vendorBills.find((b) => b.id === billId);
    if (bill) {
      form.setValue("amount", bill.amountDue);
    }
  };

  const handleViewDetails = (payment: any) => {
    setDetailsPayment(payment);
  };

  const closeDetails = () => setDetailsPayment(null);

  const handleDownloadReceipt = async (payment: any, forPrint = false) => {
    try {
      setReceiptLoadingId(payment.id);
      const blob = await paymentsService.downloadReceipt(payment.id);
      const url = URL.createObjectURL(blob);

      if (forPrint) {
        const win = window.open(url);
        if (win) {
          win.addEventListener("load", () => {
            win.focus();
            win.print();
          });
        } else {
          window.open(url, "_blank");
        }
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = `${payment.number || "payment-receipt"}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Receipt downloaded");
      }

      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error("Receipt download failed", error);
      toast.error("Failed to generate receipt");
    } finally {
      setReceiptLoadingId(null);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = (payment.number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (payment.vendorBill?.vendor?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || 
                       (activeTab === "paid" && payment.status === "PAID") ||
                       (activeTab === "initiated" && payment.status === "INITIATED");
    return matchesSearch && matchesTab;
  });

  const stats = {
    totalPaid: payments.filter(p => p.status === "PAID").reduce((sum, p) => sum + Number(p.amount || 0), 0),
    pendingPayments: payments.filter(p => p.status === "INITIATED").length,
    completedPayments: payments.filter(p => p.status === "PAID").length
  };

  const getMethodBadge = (method: string) => {
    const methodConfig: Record<string, { color: string; label: string }> = {
      "BANK": { color: "text-blue-600 bg-blue-100", label: "Bank Transfer" },
      "UPI": { color: "text-purple-600 bg-purple-100", label: "UPI" },
      "CARD": { color: "text-amber-600 bg-amber-100", label: "Card" },
      "CASH": { color: "text-success bg-success/10", label: "Cash" },
      "RAZORPAY": { color: "text-indigo-600 bg-indigo-100", label: "Razorpay" }
    };
    const config = methodConfig[method] || { color: "", label: method };
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
      PAID: { icon: CheckCircle, color: "text-success bg-success/10 border-success/20", label: "Paid" },
      INITIATED: { icon: AlertCircle, color: "text-warning bg-warning/10 border-warning/20", label: "Initiated" },
      PARTIAL: { icon: AlertCircle, color: "text-blue-600 bg-blue-100 border-blue-200", label: "Partial" },
      FAILED: { icon: XCircle, color: "text-destructive bg-destructive/10 border-destructive/20", label: "Failed" }
    };
    const config = statusConfig[status] || statusConfig.INITIATED;
    return (
      <Badge variant="outline" className={config.color}>
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
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
          <h1 className="text-2xl font-bold text-foreground">Vendor Payments</h1>
          <p className="text-muted-foreground">Record and track payments to vendors</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => open ? setIsDialogOpen(true) : handleDialogClose()}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Make Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Record Vendor Payment</DialogTitle>
              <DialogDescription>
                Enter payment details for a vendor bill
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="vendorBillId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Bill</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleBillChange(value);
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vendor bill" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendorBills.map((bill) => (
                            <SelectItem key={bill.id} value={bill.id}>
                              {bill.number} - {bill.vendor?.name} (Due: {formatCurrency(bill.amountDue)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BANK">Bank Transfer</SelectItem>
                            <SelectItem value="UPI">UPI</SelectItem>
                            <SelectItem value="CARD">Card</SelectItem>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="RAZORPAY">Razorpay</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleDialogClose} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Recording..." : "Record Payment"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <Dialog open={!!detailsPayment} onOpenChange={(open) => !open && closeDetails()}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                {detailsPayment?.number || "Payment"}
              </DialogDescription>
            </DialogHeader>
            {detailsPayment && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground">Vendor</p>
                    <p className="font-medium">
                      {detailsPayment.vendorBill?.vendor?.name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bill</p>
                    <p className="font-mono">
                      {detailsPayment.vendorBill?.number || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p>
                      {detailsPayment.paidAt
                        ? formatDate(detailsPayment.paidAt)
                        : formatDate(detailsPayment.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Method</p>
                    <p className="font-medium">{detailsPayment.method}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/60 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs">Amount</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(Number(detailsPayment.amount))}
                    </p>
                  </div>
                  {getStatusBadge(detailsPayment.status)}
                </div>
                {detailsPayment.referenceNotes && (
                  <div>
                    <p className="text-muted-foreground text-xs">Notes</p>
                    <p>{detailsPayment.referenceNotes}</p>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReceipt(detailsPayment)}
                    disabled={receiptLoadingId === detailsPayment.id}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownloadReceipt(detailsPayment, true)}
                    disabled={receiptLoadingId === detailsPayment.id}
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Total Paid", value: formatCurrency(stats.totalPaid), subtitle: "This month", icon: Wallet, color: "text-destructive", bg: "bg-destructive/10" },
          { title: "Pending Approvals", value: stats.pendingPayments, subtitle: "Awaiting approval", icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" },
          { title: "Completed Payments", value: stats.completedPayments, subtitle: "Successfully processed", icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
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

      {/* Payments Table */}
      <Card className="card-elevated border-0">
        <div className="p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Payments</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="initiated">Initiated</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
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
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No payments match your search" : "No vendor payments yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Payment</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Bill</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment, idx) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-lg">
                            <AvatarFallback className="rounded-lg bg-gradient-to-br from-destructive/20 to-destructive/10 text-destructive text-xs">
                              <ArrowDownLeft className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium font-mono">{payment.number}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          {payment.vendorBill?.vendor?.name || "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {payment.vendorBill?.number || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {payment.paidAt ? formatDate(payment.paidAt) : formatDate(payment.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-destructive">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>{getMethodBadge(payment.method)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(payment)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadReceipt(payment)}
                              disabled={receiptLoadingId === payment.id}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {receiptLoadingId === payment.id
                                ? "Preparing..."
                                : "Download Receipt"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadReceipt(payment, true)}
                              disabled={receiptLoadingId === payment.id}
                            >
                              <Printer className="w-4 h-4 mr-2" />
                              {receiptLoadingId === payment.id ? "Preparing" : "Print"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default VendorPaymentsPage;
