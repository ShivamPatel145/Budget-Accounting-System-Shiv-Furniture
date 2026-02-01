import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Edit,
  Eye,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Trash2,
  IndianRupee,
  Calendar,
  Building2,
  FileCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { customerInvoicesService, CustomerInvoice } from "@/lib/customer-invoices-service";
import { useNavigate } from "react-router-dom";
import { contactsService, Contact } from "@/lib/contacts-service";
import { productsService, Product } from "@/lib/products-service";
import { analyticalService, AnalyticalAccount } from "@/lib/analytical-service";

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

const statusConfig: Record<string, { label: string; icon: any; class: string }> = {
  DRAFT: { label: "Draft", icon: FileText, class: "bg-muted text-muted-foreground border-muted" },
  CONFIRMED: { label: "Confirmed", icon: Clock, class: "bg-warning/10 text-warning border-warning/20" },
  PARTIAL: { label: "Partial", icon: Clock, class: "bg-blue-100 text-blue-600 border-blue-200" },
  PAID: { label: "Paid", icon: CheckCircle, class: "bg-success/10 text-success border-success/20" },
  CANCELLED: { label: "Cancelled", icon: XCircle, class: "bg-destructive/10 text-destructive border-destructive/20" }
};

const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().optional(),
  analyticalAccountId: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [customers, setCustomers] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [analyticalAccounts, setAnalyticalAccounts] = useState<AnalyticalAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState([{ productId: "", quantity: "", unitPrice: "" }]);
  const navigate = useNavigate();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      analyticalAccountId: "",
    },
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const [data, contactsData, productsData, analyticalData] = await Promise.all([
        customerInvoicesService.list(),
        contactsService.list(),
        productsService.list(),
        analyticalService.list(),
      ]);
      setInvoices(data);
      setCustomers(contactsData.filter((c) => c.type === "CUSTOMER" || c.type === "BOTH"));
      setProducts(productsData);
      setAnalyticalAccounts(analyticalData);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await customerInvoicesService.confirm(id);
      toast.success("Invoice confirmed successfully");
      await fetchInvoices();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to confirm invoice");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setInvoiceItems([{ productId: "", quantity: "", unitPrice: "" }]);
    form.reset({
      customerId: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      analyticalAccountId: "",
    });
  };

  const addItem = () => {
    setInvoiceItems([...invoiceItems, { productId: "", quantity: "", unitPrice: "" }]);
  };

  const removeItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updated = invoiceItems.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    setInvoiceItems(updated);
  };

  const handleCreate = async (data: InvoiceFormData) => {
    try {
      setSubmitting(true);

      const lines = invoiceItems
        .filter((item) => item.productId && item.quantity && item.unitPrice)
        .map((item) => ({
          productId: item.productId,
          quantity: parseFloat(item.quantity) || 0,
          unitPrice: parseFloat(item.unitPrice) || 0,
          analyticalAccountId: data.analyticalAccountId || undefined,
        }));

      if (lines.length === 0) {
        toast.error("Please add at least one line");
        return;
      }

      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`;

      const invoiceDateIso = data.invoiceDate
        ? new Date(`${data.invoiceDate}T00:00:00.000Z`).toISOString()
        : new Date().toISOString();
      const dueDateIso = data.dueDate
        ? new Date(`${data.dueDate}T00:00:00.000Z`).toISOString()
        : undefined;

      await customerInvoicesService.create({
        number: invoiceNumber,
        customerId: data.customerId,
        invoiceDate: invoiceDateIso,
        dueDate: dueDateIso,
        lines,
      });

      toast.success("Invoice created successfully");
      await fetchInvoices();
      handleDialogClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      const blob = await customerInvoicesService.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF downloaded successfully");
    } catch (error: any) {
      toast.error("Failed to download PDF");
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || invoice.status.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    totalInvoices: invoices.length,
    pendingAmount: invoices.filter(i => i.status === 'CONFIRMED').reduce((sum, i) => sum + Number(i.amountDue), 0),
    overdueAmount: invoices.filter(i => Number(i.amountDue) > 0 && new Date(i.dueDate || '') < new Date()).reduce((sum, i) => sum + Number(i.amountDue), 0),
    paidThisMonth: invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + Number(i.total), 0)
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
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Manage customer invoices and payments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : handleDialogClose())}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[620px]">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
              <DialogDescription>Capture customer, lines, and dates</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="analyticalAccountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Center (optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cost center" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {analyticalAccounts.map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="invoiceDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Invoice Lines</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="w-4 h-4 mr-1" /> Add Line
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {invoiceItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-5">
                          <Select
                            value={item.productId}
                            onValueChange={(v) => updateItem(idx, "productId", v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            min="0"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            min="0"
                            placeholder="Unit Price"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                          />
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Invoice"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { title: "Total Invoices", value: stats.totalInvoices, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
          { title: "Pending Amount", value: formatCurrency(stats.pendingAmount), icon: Clock, color: "text-warning", bg: "bg-warning/10" },
          { title: "Overdue Amount", value: formatCurrency(stats.overdueAmount), icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
          { title: "Paid This Month", value: formatCurrency(stats.paidThisMonth), icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
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

      {/* Main Content */}
      <Card className="card-elevated border-0">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No invoices match your search" : "No invoices yet."}
              </p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice, idx) => {
                const status = statusConfig[invoice.status] || statusConfig.DRAFT;
                const StatusIcon = status.icon;
                return (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className="table-row-hover group cursor-pointer"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileCheck className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{invoice.number}</p>
                          <p className="text-xs text-muted-foreground">{invoice.lines?.length || 0} items</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span>{invoice.customer?.name || "Unknown Customer"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(invoice.total)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(invoice.invoiceDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={invoice.amountDue > 0 && invoice.dueDate && new Date(invoice.dueDate) < new Date() ? 'text-destructive' : ''}>
                        {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.class}>
                        <StatusIcon className="w-3.5 h-3.5 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Invoice
                          </DropdownMenuItem>
                          {invoice.status === "DRAFT" && (
                            <>
                              <DropdownMenuItem onClick={() => handleConfirm(invoice.id)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Confirm Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => handleDownloadPdf(invoice.id)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="w-4 h-4 mr-2" />
                            Send to Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InvoicesPage;
