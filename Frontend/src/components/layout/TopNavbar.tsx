import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Search,
  Bot,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Building2,
  HelpCircle,
  FileText,
  ShoppingCart,
  Receipt,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

interface TopNavbarProps {
  sidebarCollapsed: boolean;
}

const TopNavbar = ({ sidebarCollapsed }: TopNavbarProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: "warning", title: "Budget Warning", message: "Marketing budget is at 85% utilization", time: "2 min ago", read: false },
    { id: 2, type: "success", title: "Payment Received", message: "INV-2024-0234 paid by ABC Retailers", time: "1 hour ago", read: false },
    { id: 3, type: "info", title: "New Order", message: "Purchase order PO-2024-0089 created", time: "3 hours ago", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const searchItems = [
    { icon: FileText, title: "Sales Orders", href: "/sale/orders", category: "Sale" },
    { icon: Receipt, title: "Customer Invoices", href: "/sale/invoices", category: "Sale" },
    { icon: ShoppingCart, title: "Purchase Orders", href: "/purchase/orders", category: "Purchase" },
    { icon: Wallet, title: "Vendor Bills", href: "/purchase/bills", category: "Purchase" },
    { icon: Wallet, title: "Budgets", href: "/account/budgets", category: "Account" },
    { icon: User, title: "Contacts", href: "/account/contacts", category: "Account" },
    { icon: Settings, title: "Settings", href: "/settings", category: "System" },
    { icon: Bot, title: "AI Insights", href: "/ai-insights", category: "System" },
  ];

  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'RS';
  const userName = user?.name || 'Rahul Sharma';
  const userEmail = user?.email || 'rahul@shivfurniture.com';
  const userRole = user?.role === 'ADMIN' ? 'Admin' : 'User';

  return (
    <>
      {/* Search Command Dialog */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setSearchOpen(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div 
            className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                autoFocus
                placeholder="Search transactions, budgets, reports..."
                className="flex-1 bg-transparent border-0 outline-none text-base text-gray-900 placeholder:text-gray-400"
                onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded-md">
                ESC
              </kbd>
            </div>
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Navigation</p>
              <div className="space-y-0.5">
                {searchItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => {
                      navigate(item.href);
                      setSearchOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <item.icon className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-gray-900">{item.title}</span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <motion.header
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 right-0 left-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-40 flex items-center justify-between px-6"
      >
        {/* Search */}
        <div className="flex-1 max-w-md">
          <button 
            onClick={() => setSearchOpen(true)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border-0 text-sm text-left text-muted-foreground hover:bg-muted transition-all flex items-center relative"
          >
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <span>Search transactions, budgets, reports...</span>
            <kbd className="absolute right-3 hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* AI Assistant */}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 hidden sm:flex"
            onClick={() => navigate('/ai-insights')}
          >
            <Bot className="w-4 h-4 text-accent" />
            <span>AI Assistant</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs h-6" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <DropdownMenuItem 
                    key={notif.id}
                    className={`flex flex-col items-start gap-1 cursor-pointer ${!notif.read ? 'bg-muted/50' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        notif.type === 'warning' ? 'bg-warning' : 
                        notif.type === 'success' ? 'bg-success' : 'bg-info'
                      }`} />
                      <span className="font-medium text-sm">{notif.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-4">{notif.message}</p>
                    <span className="text-xs text-muted-foreground pl-4">{notif.time}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-accent cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 pr-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-medium">
                  {userInitials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userRole}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-medium">
                    {userInitials}
                  </div>
                  <div>
                    <p className="font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Building2 className="w-4 h-4 mr-2" />
                Company Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/help')}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>
    </>
  );
};

export default TopNavbar;
