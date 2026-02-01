import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, PieChart, Wallet } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const features = [
  { title: "Smart Budgeting", desc: "AI-powered budget predictions", icon: PieChart },
  { title: "Secure & Compliant", desc: "Enterprise-grade security", icon: ShieldCheck },
  { title: "Real-time Analytics", desc: "Live financial insights", icon: TrendingUp },
  { title: "Cost Center Control", desc: "Track every expense", icon: Wallet },
];

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex">
      <div className="hidden lg:flex w-1/2 bg-sidebar relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-grid-white pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-sidebar/90 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
            <span className="text-xl font-bold">S</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">ShivERP</span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center items-center">
          <div className="relative w-full max-w-md aspect-square">
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: -5 }}
              animate={{ opacity: 1, y: 0, rotate: -5 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute top-1/4 left-0 w-72 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-100 font-medium">Monthly Budget</span>
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-[10px] font-bold border border-green-500/30">
                  On Track
                </span>
              </div>
              <p className="text-3xl font-bold text-white mb-4">₹12,45,000</p>

              <div className="w-full bg-blue-950/50 h-1.5 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "68%" }}
                  transition={{ duration: 1.5, delay: 1 }}
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-300"
                />
              </div>
              <p className="text-xs text-blue-200">Used: ₹8,46,600</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 5 }}
              animate={{ opacity: 1, y: 0, rotate: 5 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute top-[45%] right-0 w-56 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs text-white/60">Savings</p>
                  <p className="text-lg font-bold text-white">+₹2,34,000</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4 w-full max-w-lg">
          {features.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <div className="p-2 rounded-lg bg-white/10 text-white">
                <item.icon size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-[10px] text-white/50">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-5"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
