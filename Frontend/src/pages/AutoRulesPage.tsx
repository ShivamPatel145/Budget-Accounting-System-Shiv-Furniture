import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Search,
  Edit, 
  Trash2, 
  Zap, 
  Settings, 
  CheckCircle,
  Filter,
  Power,
  MoreVertical,
  XCircle,
  ArrowRight,
  Target,
  Hash,
  User,
  Package,
  Tags
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
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
  FormDescription,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { autoModelsService, AutoAnalyticalModel } from "@/lib/auto-models-service";
import { analyticalService, AnalyticalAccount } from "@/lib/analytical-service";
import { contactsService } from "@/lib/contacts-service";
import { productsService } from "@/lib/products-service";

const ruleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  conditionType: z.enum(["partner", "product", "partnerTag", "productCategory"]),
  partnerId: z.string().optional(),
  partnerTag: z.string().optional(),
  productId: z.string().optional(),
  productCategory: z.string().optional(),
  analyticalAccountId: z.string().min(1, "Analytical account is required"),
  priority: z.coerce.number().min(1, "Priority must be at least 1"),
});

type RuleFormData = z.infer<typeof ruleSchema>;

const conditionTypes = [
  { value: "partner", label: "Partner (Vendor/Customer)" },
  { value: "product", label: "Product" },
  { value: "partnerTag", label: "Partner Tag" },
  { value: "productCategory", label: "Product Category" }
];

const AutoRulesPage = () => {
  const [rules, setRules] = useState<AutoAnalyticalModel[]>([]);
  const [analyticalAccounts, setAnalyticalAccounts] = useState<AnalyticalAccount[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoAnalyticalModel | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rulesData, accountsData, contactsData, productsData] = await Promise.all([
        autoModelsService.list(),
        analyticalService.list(),
        contactsService.list(),
        productsService.list()
      ]);
      setRules(rulesData || []);
      setAnalyticalAccounts(accountsData || []);
      setContacts(contactsData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const form = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: "",
      conditionType: "partner",
      partnerId: "",
      partnerTag: "",
      productId: "",
      productCategory: "",
      analyticalAccountId: "",
      priority: 1,
    },
  });

  const selectedConditionType = form.watch("conditionType");

  const handleSubmit = async (data: RuleFormData) => {
    try {
      setSubmitting(true);
      
      const payload: any = {
        name: data.name,
        analyticalAccountId: data.analyticalAccountId,
        priority: data.priority,
        active: true,
      };

      // Set the appropriate condition based on type
      if (data.conditionType === "partner" && data.partnerId) {
        payload.partnerId = data.partnerId;
      } else if (data.conditionType === "product" && data.productId) {
        payload.productId = data.productId;
      } else if (data.conditionType === "partnerTag" && data.partnerTag) {
        payload.partnerTag = data.partnerTag;
      } else if (data.conditionType === "productCategory" && data.productCategory) {
        payload.productCategory = data.productCategory;
      }

      if (editingRule) {
        await autoModelsService.update(editingRule.id, payload);
        toast.success("Auto rule updated successfully");
      } else {
        await autoModelsService.create(payload);
        toast.success("Auto rule created successfully");
      }
      
      handleDialogClose();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingRule(null);
    form.reset({
      name: "",
      conditionType: "partner",
      partnerId: "",
      partnerTag: "",
      productId: "",
      productCategory: "",
      analyticalAccountId: "",
      priority: 1,
    });
  };

  const openEditDialog = (rule: AutoAnalyticalModel) => {
    setEditingRule(rule);
    
    // Determine condition type
    let conditionType: "partner" | "product" | "partnerTag" | "productCategory" = "partner";
    if (rule.productId) conditionType = "product";
    else if (rule.partnerTag) conditionType = "partnerTag";
    else if (rule.productCategory) conditionType = "productCategory";
    
    form.reset({
      name: rule.name,
      conditionType,
      partnerId: rule.partnerId || "",
      partnerTag: rule.partnerTag || "",
      productId: rule.productId || "",
      productCategory: rule.productCategory || "",
      analyticalAccountId: rule.analyticalAccountId,
      priority: rule.priority,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await autoModelsService.delete(id);
      toast.success("Auto rule deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const toggleRuleStatus = async (rule: AutoAnalyticalModel) => {
    try {
      await autoModelsService.update(rule.id, { active: !rule.active });
      toast.success("Rule status updated");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const filteredRules = rules.filter((rule) => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || 
                      (activeTab === "active" && rule.active) ||
                      (activeTab === "inactive" && !rule.active);
    return matchesSearch && matchesTab;
  });

  const stats = {
    totalRules: rules.length,
    activeRules: rules.filter(r => r.active).length,
    inactiveRules: rules.filter(r => !r.active).length
  };

  const getRuleCondition = (rule: AutoAnalyticalModel) => {
    if (rule.partnerId && rule.partner) {
      return { type: "Partner", value: rule.partner.name, icon: User };
    }
    if (rule.productId && rule.product) {
      return { type: "Product", value: rule.product.name, icon: Package };
    }
    if (rule.partnerTag) {
      return { type: "Partner Tag", value: rule.partnerTag, icon: Tags };
    }
    if (rule.productCategory) {
      return { type: "Product Category", value: rule.productCategory, icon: Tags };
    }
    return { type: "Unknown", value: "-", icon: Settings };
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
          <h1 className="text-2xl font-bold text-foreground">Auto Analytical Rules</h1>
          <p className="text-muted-foreground">Automate cost center assignments and reduce manual work</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => open ? setIsDialogOpen(true) : handleDialogClose()}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingRule ? "Edit Auto Rule" : "Add New Auto Rule"}</DialogTitle>
              <DialogDescription>
                {editingRule 
                  ? "Update automation rule settings"
                  : "Create a new rule to automatically assign cost centers"
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rule Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Marketing Vendor Rule" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="conditionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {conditionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Conditional fields based on condition type */}
                {selectedConditionType === "partner" && (
                  <FormField
                    control={form.control}
                    name="partnerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Partner</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a partner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contacts.map((contact) => (
                              <SelectItem key={contact.id} value={contact.id}>
                                {contact.name} ({contact.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {selectedConditionType === "product" && (
                  <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Product</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {selectedConditionType === "partnerTag" && (
                  <FormField
                    control={form.control}
                    name="partnerTag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Tag</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Premium, VIP" {...field} />
                        </FormControl>
                        <FormDescription>Enter a tag to match partners</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {selectedConditionType === "productCategory" && (
                  <FormField
                    control={form.control}
                    name="productCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Furniture, Electronics" {...field} />
                        </FormControl>
                        <FormDescription>Enter a category to match products</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="analyticalAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign to Analytical Account</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select analytical account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {analyticalAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} ({account.type})
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority (Lower = Higher Priority)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleDialogClose} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : editingRule ? "Update Rule" : "Create Rule"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Total Rules", value: stats.totalRules, subtitle: "Defined rules", icon: Settings, color: "text-primary", bg: "bg-primary/10" },
          { title: "Active Rules", value: stats.activeRules, subtitle: "Currently running", icon: Zap, color: "text-success", bg: "bg-success/10" },
          { title: "Inactive Rules", value: stats.inactiveRules, subtitle: "Paused rules", icon: XCircle, color: "text-muted-foreground", bg: "bg-muted" },
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

      {/* Rules Table */}
      <Card className="card-elevated border-0">
        <div className="p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Rules</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search rules..."
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
          ) : filteredRules.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No rules match your search" : "No auto rules yet. Create your first one!"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Rule</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Assigns To</TableHead>
                    <TableHead className="text-center">Priority</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map((rule, idx) => {
                    const condition = getRuleCondition(rule);
                    const ConditionIcon = condition.icon;
                    return (
                      <motion.tr
                        key={rule.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.3 }}
                        className="group hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 rounded-lg">
                              <AvatarFallback className={`rounded-lg ${
                                rule.active 
                                  ? "bg-gradient-to-br from-success/20 to-success/10 text-success" 
                                  : "bg-muted text-muted-foreground"
                              } text-xs`}>
                                <Zap className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{rule.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-normal">
                              <ConditionIcon className="w-3 h-3 mr-1" />
                              {condition.type}
                            </Badge>
                            <span className="text-muted-foreground">=</span>
                            <span className="text-sm truncate max-w-[150px]">{condition.value}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="outline" className="text-primary bg-primary/10">
                              <Target className="w-3 h-3 mr-1" />
                              {rule.analyticalAccount?.name || "Unknown"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-mono">
                            <Hash className="w-3 h-3 mr-1" />
                            {rule.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={rule.active}
                            onCheckedChange={() => toggleRuleStatus(rule)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(rule)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Rule</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{rule.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(rule.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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

export default AutoRulesPage;
