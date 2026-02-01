import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import {
  Building2,
  LayoutDashboard,
  Users,
  Package,
  Wallet,
  FileText,
  ShoppingCart,
  Receipt,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronDown,
  LogOut,
  CreditCard,
  TrendingUp,
  Calculator,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownLeft,
  Bot,
  Landmark,
  Zap,
  UserCog,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  children?: { title: string; href: string }[];
  roles?: ("ADMIN" | "PORTAL")[]; // Which roles can see this item
}

// Menu structure - with role restrictions
// ADMIN: Full access to everything
// PORTAL: Dashboard, Sale (orders/invoices/receipts), Purchase (orders/bills) - view only
const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "PORTAL"] },
  { 
    title: "Account", 
    href: "/account", 
    icon: Landmark,
    roles: ["ADMIN"], // Only ADMIN can access Account menu
    children: [
      { title: "Contacts", href: "/account/contacts" },
      { title: "Products", href: "/account/products" },
      { title: "Analytical Accounts", href: "/account/analytical-accounts" },
      { title: "Auto Analytical Models", href: "/account/auto-models" },
      { title: "Budgets", href: "/account/budgets" },
    ]
  },
  { 
    title: "Purchase", 
    href: "/purchase", 
    icon: ShoppingCart,
    roles: ["ADMIN", "PORTAL"], // Both can see, but PORTAL has limited access
    children: [
      { title: "Purchase Orders", href: "/purchase/orders" },
      { title: "Vendor Bills", href: "/purchase/bills" },
      { title: "Payments", href: "/purchase/payments" },
    ]
  },
  { 
    title: "Sale", 
    href: "/sale", 
    icon: TrendingUp,
    roles: ["ADMIN", "PORTAL"], // Both can see
    children: [
      { title: "Sales Orders", href: "/sale/orders" },
      { title: "Customer Invoices", href: "/sale/invoices" },
      { title: "Receipts", href: "/sale/receipts" },
    ]
  },
  { 
    title: "Reports", 
    href: "/reports", 
    icon: BarChart3,
    roles: ["ADMIN"], // Only ADMIN
    children: [
      { title: "Budget vs Actual", href: "/reports/budget-actual" },
      { title: "Cost Center P&L", href: "/reports/cost-center-pl" },
    ]
  },
];

const bottomNavItems: NavItem[] = [
  { title: "User Management", href: "/users", icon: UserCog, roles: ["ADMIN"] },
  { title: "AI Insights", href: "/ai-insights", icon: Bot, roles: ["ADMIN"] },
  { title: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN", "PORTAL"] },
  { title: "Help & Support", href: "/help", icon: HelpCircle, roles: ["ADMIN", "PORTAL"] },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppSidebar = ({ collapsed, onToggle }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Account", "Purchase", "Sale"]);

  // Filter nav items based on user role
  const userRole = user?.role || "PORTAL";
  const filteredMainNav = mainNavItems.filter(item => !item.roles || item.roles.includes(userRole));
  const filteredBottomNav = bottomNavItems.filter(item => !item.roles || item.roles.includes(userRole));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => location.pathname === href;
  const isParentActive = (item: NavItem) =>
    item.children?.some((child) => location.pathname.startsWith(child.href));

  const renderNavItem = (item: NavItem, isBottom = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const active = isActive(item.href) || isParentActive(item);

    const content = (
      <div className="relative">
        <button
          onClick={() => hasChildren ? toggleExpanded(item.title) : null}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            "hover:bg-sidebar-accent",
            active
              ? "bg-sidebar-accent text-sidebar-primary"
              : "text-sidebar-foreground/80",
            collapsed && "justify-center px-2"
          )}
        >
          <item.icon className={cn("w-5 h-5 shrink-0", active && "text-sidebar-primary")} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <span className="px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded-full">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              )}
            </>
          )}
        </button>

        {/* Children */}
        {hasChildren && !collapsed && (
          <motion.div
            initial={false}
            animate={{
              height: isExpanded ? "auto" : 0,
              opacity: isExpanded ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 ml-5 pl-3 border-l border-sidebar-border space-y-1">
              {item.children!.map((child) => (
                <Link
                  key={child.href}
                  to={child.href}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive(child.href)
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  {child.title}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );

    if (collapsed && !hasChildren) {
      return (
        <Tooltip key={item.title} delayDuration={0}>
          <TooltipTrigger asChild>
            <Link to={item.href}>{content}</Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-foreground text-background">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    if (!hasChildren) {
      return <Link key={item.title} to={item.href}>{content}</Link>;
    }

    return <div key={item.title}>{content}</div>;
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-sidebar sidebar-gradient flex flex-col z-50 border-r border-sidebar-border"
    >
      {/* Header */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-sidebar-border shrink-0",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary/20 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-sidebar-primary" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="font-bold text-sidebar-foreground">Shiv Furniture</h1>
              <p className="text-xs text-sidebar-muted">Budget System</p>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-4 top-7 w-8 h-8 rounded-full bg-background border-2 border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all z-50"
      >
        <ChevronLeft className={cn("w-4 h-4 transition-transform duration-300", collapsed && "rotate-180")} />
      </button>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
        {filteredMainNav.map((item) => renderNavItem(item))}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-sidebar-border py-4 px-3 space-y-1">
        {filteredBottomNav.map((item) => renderNavItem(item, true))}
        
        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            "text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
