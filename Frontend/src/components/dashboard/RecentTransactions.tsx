import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Receipt, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownLeft,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { paymentsService, Payment } from "@/lib/payments-service";

interface Transaction {
  id: string;
  type: "income" | "expense";
  description: string;
  party: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  costCenter?: string;
}

const statusConfig = {
  completed: { label: "Completed", class: "bg-success/10 text-success border-success/20" },
  pending: { label: "Pending", class: "bg-warning/10 text-warning border-warning/20" },
  failed: { label: "Failed", class: "bg-destructive/10 text-destructive border-destructive/20" }
};

const mapPaymentStatus = (status: string): "completed" | "pending" | "failed" => {
  switch (status) {
    case "PAID": return "completed";
    case "PARTIAL": return "pending";
    case "FAILED": return "failed";
    default: return "pending";
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }
};

const RecentTransactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const payments = await paymentsService.list();
        
        const mappedTransactions: Transaction[] = payments.slice(0, 5).map((payment: Payment) => ({
          id: payment.id,
          type: payment.paymentType === "INVOICE" ? "income" : "expense",
          description: payment.paymentType === "INVOICE" ? "Invoice Payment" : "Bill Payment",
          party: payment.paymentType === "INVOICE" 
            ? (payment.customerInvoice?.customer?.name || "Customer")
            : (payment.vendorBill?.vendor?.name || "Vendor"),
          amount: Number(payment.amount),
          date: formatDate(payment.createdAt),
          status: mapPaymentStatus(payment.status),
          costCenter: payment.paymentType === "INVOICE" ? "Sales" : "Expenses"
        }));

        setTransactions(mappedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <Card className="card-elevated border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <p className="text-sm text-muted-foreground">Latest financial activities</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-muted-foreground"
          onClick={() => navigate("/customer-payments")}
        >
          View All <ChevronRight className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn, idx) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.3 }}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  txn.type === 'income' ? 'bg-success/10' : 'bg-warning/10'
                }`}>
                  {txn.type === 'income' ? (
                    <ArrowDownLeft className="w-5 h-5 text-success" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-warning" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{txn.description}</p>
                    <Badge variant="outline" className={statusConfig[txn.status].class + " text-[10px]"}>
                      {statusConfig[txn.status].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">{txn.party}</span>
                    {txn.costCenter && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{txn.costCenter}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount & Date */}
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${txn.type === 'income' ? 'text-success' : 'text-foreground'}`}>
                    {txn.type === 'income' ? '+' : '-'}₹{txn.amount >= 1000 ? (txn.amount / 1000).toFixed(0) + 'K' : txn.amount}
                  </p>
                  <p className="text-xs text-muted-foreground">{txn.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
