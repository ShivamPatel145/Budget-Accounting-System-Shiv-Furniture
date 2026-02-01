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
  Target, 
  TrendingUp, 
  TrendingDown,
  Building2,
  CheckCircle,
  XCircle,
  Filter,
  Percent,
  Briefcase,
  Calendar,
  Layers,
  FolderOpen
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { analyticalService, AnalyticalAccount, AnalyticalType } from "@/lib/analytical-service";

const costCenterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["DEPARTMENT", "SESSION", "EVENT", "PROJECT", "OTHER"]),
});

type CostCenterFormData = z.infer<typeof costCenterSchema>;

const CostCentersPage = () => {
  const [costCenters, setCostCenters] = useState<AnalyticalAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCostCenter, setEditingCostCenter] = useState<AnalyticalAccount | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await analyticalService.list();
      setCostCenters(data || []);
    } catch (error) {
      console.error("Error fetching analytical accounts:", error);
      toast.error("Failed to load analytical accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const form = useForm<CostCenterFormData>({
    resolver: zodResolver(costCenterSchema),
    defaultValues: {
      name: "",
      type: "DEPARTMENT",
    },
  });

  const handleSubmit = async (data: CostCenterFormData) => {
    try {
      setSubmitting(true);
      
      if (editingCostCenter) {
        await analyticalService.update(editingCostCenter.id, {
          name: data.name,
          type: data.type,
        });
        toast.success("Analytical account updated successfully");
      } else {
        await analyticalService.create({
          name: data.name,
          type: data.type,
        });
        toast.success("Analytical account created successfully");
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
    setEditingCostCenter(null);
    form.reset({
      name: "",
      type: "DEPARTMENT",
    });
  };

  const openEditDialog = (costCenter: AnalyticalAccount) => {
    setEditingCostCenter(costCenter);
    form.reset({
      name: costCenter.name,
      type: costCenter.type,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await analyticalService.delete(id);
      toast.success("Analytical account deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const getTypeIcon = (type: AnalyticalType) => {
    const icons: Record<AnalyticalType, any> = {
      DEPARTMENT: Building2,
      SESSION: Calendar,
      EVENT: Target,
      PROJECT: Briefcase,
      OTHER: FolderOpen,
    };
    return icons[type] || Layers;
  };

  const getTypeColor = (type: AnalyticalType) => {
    const colors: Record<AnalyticalType, string> = {
      DEPARTMENT: "text-blue-600 bg-blue-100 border-blue-200",
      SESSION: "text-purple-600 bg-purple-100 border-purple-200",
      EVENT: "text-amber-600 bg-amber-100 border-amber-200",
      PROJECT: "text-success bg-success/10 border-success/20",
      OTHER: "text-muted-foreground bg-muted",
    };
    return colors[type] || "";
  };

  const filteredCostCenters = costCenters.filter((center) => {
    const matchesSearch = center.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || center.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const typeCounts = {
    DEPARTMENT: costCenters.filter(c => c.type === "DEPARTMENT").length,
    SESSION: costCenters.filter(c => c.type === "SESSION").length,
    EVENT: costCenters.filter(c => c.type === "EVENT").length,
    PROJECT: costCenters.filter(c => c.type === "PROJECT").length,
    OTHER: costCenters.filter(c => c.type === "OTHER").length,
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
          <h1 className="text-2xl font-bold text-foreground">Analytical Accounts</h1>
          <p className="text-muted-foreground">Track income & expenses by activity or department</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => open ? setIsDialogOpen(true) : handleDialogClose()}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Cost Center
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingCostCenter ? "Edit Cost Center" : "Add Cost Center"}</DialogTitle>
              <DialogDescription>
                {editingCostCenter ? "Update cost center information" : "Create a new analytical account for tracking"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Marketing, Project Alpha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DEPARTMENT">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-blue-600" />
                              Department
                            </div>
                          </SelectItem>
                          <SelectItem value="PROJECT">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-success" />
                              Project
                            </div>
                          </SelectItem>
                          <SelectItem value="EVENT">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-amber-600" />
                              Event
                            </div>
                          </SelectItem>
                          <SelectItem value="SESSION">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-purple-600" />
                              Session
                            </div>
                          </SelectItem>
                          <SelectItem value="OTHER">
                            <div className="flex items-center gap-2">
                              <FolderOpen className="w-4 h-4 text-muted-foreground" />
                              Other
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleDialogClose} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : editingCostCenter ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { title: "Total Accounts", value: costCenters.length, subtitle: "All analytical accounts", icon: Target, color: "text-primary", bg: "bg-primary/10" },
          { title: "Departments", value: typeCounts.DEPARTMENT, subtitle: "Department tracking", icon: Building2, color: "text-blue-600", bg: "bg-blue-100" },
          { title: "Projects", value: typeCounts.PROJECT, subtitle: "Project tracking", icon: Briefcase, color: "text-success", bg: "bg-success/10" },
          { title: "Events/Sessions", value: typeCounts.EVENT + typeCounts.SESSION, subtitle: "Temporary activities", icon: Calendar, color: "text-purple-600", bg: "bg-purple-100" },
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

      {/* Cost Centers Table */}
      <Card className="card-elevated border-0">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="DEPARTMENT">Departments</TabsTrigger>
                <TabsTrigger value="PROJECT">Projects</TabsTrigger>
                <TabsTrigger value="EVENT">Events</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search centers..."
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
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredCostCenters.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No cost centers match your search" : "No cost centers yet. Add your first one!"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCostCenters.map((center, idx) => {
                    const TypeIcon = getTypeIcon(center.type);
                    return (
                      <motion.tr
                        key={center.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.3 }}
                        className="group hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 rounded-lg">
                              <AvatarFallback className={`rounded-lg ${getTypeColor(center.type)} text-sm`}>
                                <TypeIcon className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{center.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTypeColor(center.type)}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {center.type.charAt(0) + center.type.slice(1).toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(center.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(center)}
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
                                  <AlertDialogTitle>Delete Analytical Account</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{center.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(center.id)}
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
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CostCentersPage;
