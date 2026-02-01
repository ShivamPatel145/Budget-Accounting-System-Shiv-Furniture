import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Lock, 
  User, 
  Shield, 
  Globe, 
  Moon, 
  Palette, 
  Key, 
  Smartphone, 
  Mail, 
  Building2,
  CheckCircle,
  Camera,
  Save
} from "lucide-react";
import { toast } from "sonner";

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const userRole = localStorage.getItem("userRole") || "admin";
  const userEmail = userRole === "admin" ? "admin@shivfurniture.com" : "portal@shivfurniture.com";

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    budgetAlerts: true,
    orderUpdates: true,
    weeklyReport: false,
    marketing: false
  });

  const [appearance, setAppearance] = useState({
    theme: "system",
    compactMode: false,
    animations: true
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Settings saved successfully");
    }, 1000);
  };

  const handlePasswordChange = () => {
    toast.success("Password change email sent");
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
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <Badge variant="outline" className="w-fit">
          {userRole === "admin" ? "Administrator" : "Portal User"}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Account Status", value: "Active", subtitle: "Verified account", icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
          { title: "Role", value: userRole === "admin" ? "Admin" : "User", subtitle: "Full access", icon: Shield, color: "text-primary", bg: "bg-primary/10" },
          { title: "Last Login", value: "Today", subtitle: "2 hours ago", icon: Key, color: "text-accent", bg: "bg-accent/10" },
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

      <Card className="card-elevated border-0">
        <Tabs defaultValue="profile" className="space-y-0">
          <div className="p-6 pb-4">
            <TabsList className="grid w-full grid-cols-4 max-w-lg">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4 hidden sm:block" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="w-4 h-4 hidden sm:block" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Lock className="w-4 h-4 hidden sm:block" />
                Security
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="w-4 h-4 hidden sm:block" />
                Theme
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Settings */}
          <TabsContent value="profile" className="m-0">
            <div className="px-6 pb-6 space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                    <AvatarImage src="/avatars/01.png" alt="Profile" />
                    <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      {userRole === "admin" ? "SA" : "PU"}
                    </AvatarFallback>
                  </Avatar>
                  <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{userRole === "admin" ? "Shiv Admin" : "Portal User"}</h3>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                  <Badge variant="outline" className="text-success bg-success/10 mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" defaultValue={userRole === "admin" ? "Shiv" : "Portal"} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" defaultValue={userRole === "admin" ? "Admin" : "User"} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" defaultValue={userEmail} disabled className="pl-10 bg-muted" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="phone" placeholder="+91 98765 43210" className="pl-10 bg-background" />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company">Company</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="company" defaultValue="Shiv Furniture" className="pl-10 bg-background" />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell us about yourself..." 
                    className="resize-none h-24 bg-background"
                    defaultValue={userRole === "admin" ? "System administrator for Shiv Furniture budget management system." : "Portal user with access to basic features."}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading} className="gap-2">
                  <Save className="w-4 h-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="m-0">
            <div className="px-6 pb-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium">Notification Preferences</h3>
                <p className="text-sm text-muted-foreground">Choose how you want to be notified</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: "email", label: "Email Notifications", desc: "Receive notifications via email", icon: Mail },
                  { key: "push", label: "Push Notifications", desc: "Receive in-app push notifications", icon: Bell },
                  { key: "budgetAlerts", label: "Budget Alerts", desc: "Get notified when budgets are near limits", icon: Shield },
                  { key: "orderUpdates", label: "Order Updates", desc: "Notifications for order status changes", icon: CheckCircle },
                  { key: "weeklyReport", label: "Weekly Reports", desc: "Receive weekly summary reports", icon: Globe },
                  { key: "marketing", label: "Marketing Updates", desc: "News and feature announcements", icon: Palette },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications[item.key as keyof typeof notifications]} 
                      onCheckedChange={(checked) => setNotifications({...notifications, [item.key]: checked})}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading} className="gap-2">
                  <Save className="w-4 h-4" />
                  {loading ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="m-0">
            <div className="px-6 pb-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium">Security Settings</h3>
                <p className="text-sm text-muted-foreground">Manage your password and security preferences</p>
              </div>

              <div className="rounded-lg border p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handlePasswordChange}>
                    Change Password
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-warning bg-warning/10">Not Enabled</Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Key className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-muted-foreground">Manage your logged-in devices</p>
                    </div>
                  </div>
                  <Button variant="outline">View Sessions</Button>
                </div>
              </div>

              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-center gap-4">
                  <Shield className="w-5 h-5 text-destructive" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive">Danger Zone</p>
                    <p className="text-sm text-muted-foreground">Irreversible and destructive actions</p>
                  </div>
                  <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="m-0">
            <div className="px-6 pb-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium">Appearance</h3>
                <p className="text-sm text-muted-foreground">Customize how the app looks and feels</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base">Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: "light", label: "Light", icon: Globe },
                      { value: "dark", label: "Dark", icon: Moon },
                      { value: "system", label: "System", icon: Palette },
                    ].map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => setAppearance({...appearance, theme: theme.value})}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                          appearance.theme === theme.value 
                            ? "border-primary bg-primary/5" 
                            : "border-muted hover:border-muted-foreground/50"
                        }`}
                      >
                        <theme.icon className={`w-6 h-6 ${appearance.theme === theme.value ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-sm font-medium ${appearance.theme === theme.value ? "text-primary" : ""}`}>
                          {theme.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  {[
                    { key: "compactMode", label: "Compact Mode", desc: "Reduce padding and spacing for denser content" },
                    { key: "animations", label: "Animations", desc: "Enable smooth transitions and animations" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch 
                        checked={appearance[item.key as keyof typeof appearance] as boolean} 
                        onCheckedChange={(checked) => setAppearance({...appearance, [item.key]: checked})}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading} className="gap-2">
                  <Save className="w-4 h-4" />
                  {loading ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </motion.div>
  );
};

export default SettingsPage;
