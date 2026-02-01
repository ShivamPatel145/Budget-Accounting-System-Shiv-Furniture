import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Package,
  User,
  Building2
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Link } from "react-router-dom";

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

const PortalDashboard = () => {
  const { user } = useAuth();

  const quickLinks = [
    {
      title: "Sales Orders",
      description: "View your sales orders and track status",
      icon: ShoppingCart,
      href: "/sale/orders",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Customer Invoices",
      description: "View and download your invoices",
      icon: FileText,
      href: "/sale/invoices",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Purchase Orders",
      description: "Track your purchase orders",
      icon: Package,
      href: "/purchase/orders",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Vendor Bills",
      description: "View bills from vendors",
      icon: Receipt,
      href: "/purchase/bills",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    }
  ];

  const stats = [
    {
      title: "Welcome",
      value: user?.name || "Portal User",
      subtitle: "Client Portal",
      icon: User,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Role",
      value: "Portal User",
      subtitle: "View Access",
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Status",
      value: "Active",
      subtitle: "Account Status",
      icon: AlertCircle,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Company",
      value: "Shiv Furniture",
      subtitle: "Budget System",
      icon: Building2,
      color: "text-muted-foreground",
      bgColor: "bg-muted"
    }
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client Portal Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "User"}! Access your account information below.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
            <Clock className="w-3.5 h-3.5" />
            Portal Mode
          </Badge>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
          >
            <Card className="card-elevated border-0 hover:border-accent/20 transition-all group h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
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

      <motion.div variants={fadeInUp}>
        <Card className="card-elevated border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Quick Access
            </CardTitle>
            <CardDescription>Navigate to different sections of the portal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link, idx) => (
                <motion.div
                  key={link.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.3 }}
                >
                  <Link to={link.href}>
                    <Card className="h-full hover:shadow-lg transition-all cursor-pointer border hover:border-primary/30 group">
                      <CardContent className="p-4">
                        <div className={`w-10 h-10 rounded-lg ${link.bgColor} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
                          <link.icon className={`w-5 h-5 ${link.color}`} />
                        </div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{link.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Card className="card-elevated border-0">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Tips for using the Client Portal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-foreground">View Your Orders</p>
                <p className="text-sm text-muted-foreground">Navigate to Sales Orders or Purchase Orders to view your transaction history.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <FileText className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Access Invoices</p>
                <p className="text-sm text-muted-foreground">Download and view your customer invoices and vendor bills from the respective sections.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Need Help?</p>
                <p className="text-sm text-muted-foreground">Contact the admin if you need additional access or have questions about your account.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default PortalDashboard;
