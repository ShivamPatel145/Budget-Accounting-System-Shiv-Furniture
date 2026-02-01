import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  X, 
  Wallet, 
  Calendar, 
  Building2, 
  IndianRupee,
  AlertTriangle,
  Check,
  Info,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { analyticalService, AnalyticalAccount } from "@/lib/analytical-service";
import { budgetsService } from "@/lib/budgets-service";
import { toast } from "sonner";

interface BudgetFormPanelProps {
  open: boolean;
  onClose: () => void;
  budget?: any;
  onSuccess?: () => void;
}

const BudgetFormPanel = ({ open, onClose, budget, onSuccess }: BudgetFormPanelProps) => {
  const [costCenters, setCostCenters] = useState<AnalyticalAccount[]>([]);
  const [loadingCostCenters, setLoadingCostCenters] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalBudgets, setTotalBudgets] = useState(0);
  
  const [formData, setFormData] = useState({
    name: budget?.name || "",
    type: budget?.type || "expense",
    period: budget?.period || "",
    costCenter: (budget as any)?.analyticalAccountId || budget?.costCenter || "",
    allocated: (budget as any)?.lineAmount || budget?.allocated || "",
    description: "",
    warningThreshold: 85,
    lockAfterPeriod: true
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name || "",
        type: budget.type || "expense",
        period: budget.period || "",
        costCenter: (budget as any)?.analyticalAccountId || budget.costCenter || "",
        allocated: (budget as any)?.lineAmount || budget.allocated || "",
        description: "",
        warningThreshold: 85,
        lockAfterPeriod: true,
      });
    } else {
      setFormData({
        name: "",
        type: "expense",
        period: "",
        costCenter: "",
        allocated: "",
        description: "",
        warningThreshold: 85,
        lockAfterPeriod: true,
      });
    }
  }, [budget]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accounts, budgets] = await Promise.all([
          analyticalService.list(),
          budgetsService.list()
        ]);
        setCostCenters(accounts);
        
        // Calculate total budgets
        const total = budgets.reduce((sum, b) => {
          return sum + b.lines.reduce((lineSum, l) => lineSum + Number(l.budgetedAmount), 0);
        }, 0);
        setTotalBudgets(total);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingCostCenters(false);
      }
    };
    
    if (open) {
      fetchData();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.costCenter || !formData.allocated) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date();
      const periodEnd = new Date();
      
      // Determine period dates based on selection
      if (formData.period.startsWith("Q")) {
        const quarter = parseInt(formData.period[1]);
        const year = parseInt(formData.period.slice(-4));
        const startMonth = (quarter - 1) * 3;
        const endMonth = startMonth + 2;
        periodEnd.setFullYear(year, endMonth + 1, 0);
        now.setFullYear(year, startMonth, 1);
      } else if (formData.period.startsWith("FY")) {
        const year = parseInt(formData.period.slice(-4));
        now.setFullYear(year, 3, 1); // April
        periodEnd.setFullYear(year + 1, 2, 31); // March
      } else {
        periodEnd.setMonth(now.getMonth() + 3);
      }

      const payload = {
        name: formData.name,
        analyticalAccountId: formData.costCenter,
        periodStart: now.toISOString(),
        periodEnd: periodEnd.toISOString(),
        lines: [{
          type: formData.type === "income" ? "INCOME" : "EXPENSE",
          budgetedAmount: parseFloat(formData.allocated),
        }],
      } as any;

      if (budget?.id) {
        await budgetsService.update(budget.id, payload);
        toast.success("Budget updated successfully");
      } else {
        await budgetsService.create(payload);
        toast.success("Budget created successfully");
      }

      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating budget:", error);
      toast.error("Failed to create budget");
    } finally {
      setSubmitting(false);
    }
  };

  const [showImpactPreview, setShowImpactPreview] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full max-w-lg bg-background border-l shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    {budget ? "Edit Budget" : "Create New Budget"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {budget ? "Update budget details" : "Define a new budget allocation"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* Budget Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Budget Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Marketing & Advertising"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Type & Period */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Budget Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Budget Period</Label>
                  <Select 
                    value={formData.period} 
                    onValueChange={(value) => setFormData({ ...formData, period: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1 2025">Q1 2025</SelectItem>
                      <SelectItem value="Q2 2025">Q2 2025</SelectItem>
                      <SelectItem value="Q3 2025">Q3 2025</SelectItem>
                      <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                      <SelectItem value="FY 2025">FY 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cost Center */}
              <div className="space-y-2">
                <Label>Cost Center</Label>
                <Select 
                  value={formData.costCenter} 
                  onValueChange={(value) => setFormData({ ...formData, costCenter: value })}
                  disabled={loadingCostCenters}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCostCenters ? "Loading..." : "Select cost center"} />
                  </SelectTrigger>
                  <SelectContent>
                    {costCenters.map((cc) => (
                      <SelectItem key={cc.id} value={cc.id}>{cc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Allocated Amount</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-9"
                    value={formData.allocated}
                    onChange={(e) => setFormData({ ...formData, allocated: e.target.value })}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add notes about this budget..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Smart Settings */}
              <div className="space-y-4 p-4 rounded-lg bg-muted/50 border">
                <h3 className="font-medium flex items-center gap-2">
                  <Info className="w-4 h-4 text-accent" />
                  Smart Budget Settings
                </h3>
                
                {/* Warning Threshold */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="threshold">Warning Threshold</Label>
                    <Badge variant="outline">{formData.warningThreshold}%</Badge>
                  </div>
                  <input
                    type="range"
                    id="threshold"
                    min="50"
                    max="95"
                    value={formData.warningThreshold}
                    onChange={(e) => setFormData({ ...formData, warningThreshold: Number(e.target.value) })}
                    className="w-full accent-accent"
                  />
                  <p className="text-xs text-muted-foreground">
                    Alert when budget utilization reaches this threshold
                  </p>
                </div>

                {/* Lock Setting */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lock">Lock After Period</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Prevent modifications after period ends
                    </p>
                  </div>
                  <Switch
                    id="lock"
                    checked={formData.lockAfterPeriod}
                    onCheckedChange={(checked) => setFormData({ ...formData, lockAfterPeriod: checked })}
                  />
                </div>
              </div>

              {/* Impact Preview */}
              {formData.allocated && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-accent/5 border border-accent/20"
                >
                  <h3 className="font-medium flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-accent" />
                    Transaction Impact Preview
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Total Budgets:</span>
                      <span className="font-medium">₹{totalBudgets.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-accent">
                      <span>+ New Budget:</span>
                      <span className="font-medium">+₹{Number(formData.allocated).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t flex justify-between font-medium">
                      <span>New Total:</span>
                      <span>₹{(totalBudgets + Number(formData.allocated)).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-background border-t px-6 py-4 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="gradient" className="gap-2" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {budget ? "Update Budget" : "Create Budget"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BudgetFormPanel;
