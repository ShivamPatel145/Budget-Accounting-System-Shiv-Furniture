import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { BarChart3, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { customerInvoicesService } from "@/lib/customer-invoices-service";
import { vendorBillsService } from "@/lib/vendor-bills-service";

interface ChartData {
  month: string;
  income: number;
  expense: number;
}

const formatYAxis = (value: number) => {
  if (value >= 1000000) {
    return `₹${(value / 100000).toFixed(0)}L`;
  }
  return `₹${(value / 1000).toFixed(0)}K`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 space-y-2">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">
              ₹{(entry.value / 100000).toFixed(2)}L
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const IncomeExpenseChart = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoices, bills] = await Promise.all([
          customerInvoicesService.list(),
          vendorBillsService.list()
        ]);

        // Group by month (last 6 months)
        const monthlyData: Record<string, { income: number; expense: number }> = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Initialize last 6 months
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = months[d.getMonth()];
          monthlyData[key] = { income: 0, expense: 0 };
        }

        // Aggregate invoice amounts by month
        invoices.forEach((inv: any) => {
          const date = new Date(inv.invoiceDate);
          const monthKey = months[date.getMonth()];
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].income += Number(inv.total) || 0;
          }
        });

        // Aggregate bill amounts by month
        bills.forEach((bill: any) => {
          const date = new Date(bill.billDate);
          const monthKey = months[date.getMonth()];
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].expense += Number(bill.total) || 0;
          }
        });

        const chartData: ChartData[] = Object.entries(monthlyData).map(([month, values]) => ({
          month,
          income: values.income,
          expense: values.expense
        }));

        setData(chartData);
      } catch (error) {
        console.error("Error fetching income/expense data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = data.reduce((sum, d) => sum + d.expense, 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <Card className="card-elevated border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-lg">Income vs Expense</CardTitle>
            <p className="text-sm text-muted-foreground">Last 6 months comparison</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!loading && (
            <Badge variant="outline" className={`${netProfit >= 0 ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
              Net {netProfit >= 0 ? 'Profit' : 'Loss'}: ₹{Math.abs(netProfit / 100000).toFixed(2)}L
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-muted-foreground"
            onClick={() => navigate("/invoices")}
          >
            Details <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 || data.every(d => d.income === 0 && d.expense === 0) ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <BarChart3 className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No transaction data available</p>
          </div>
        ) : (
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatYAxis}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                />
                <Bar 
                  dataKey="income" 
                  name="Income" 
                  fill="hsl(var(--success))" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar 
                  dataKey="expense" 
                  name="Expense" 
                  fill="hsl(var(--warning))" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseChart;
