import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Book, 
  LifeBuoy, 
  Mail, 
  MessageCircle, 
  Phone, 
  Globe,
  Search,
  HelpCircle,
  FileText,
  Video,
  Users,
  Zap,
  Send,
  Clock,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

const HelpSupportPage = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Support ticket created successfully!");
      setSubject("");
      setMessage("");
    }, 1000);
  };

  const faqs = [
    {
      question: "How do I create a new budget?",
      answer: "Navigate to the 'Budgets' section and click on the 'Create Budget' button. Fill in the required details including cost center, period, and amount. The system will automatically track spending against this budget."
    },
    {
      question: "Can I export reports to PDF?",
      answer: "Yes, most reports have a download/export button in the top right corner. You can export them as PDF or Excel files. Simply click the export icon and choose your preferred format."
    },
    {
      question: "How do I add a new user?",
      answer: "Navigate to Settings > Users and click 'Add User'. Fill in their details and assign appropriate roles. Users will receive an email invitation to set up their account."
    },
    {
      question: "What happens if a purchase order exceeds the budget?",
      answer: "The system will show a warning if the amount is close to the limit. If it exceeds the budget, it may require special approval depending on your company's policy configuration. You'll see visual indicators on the purchase order."
    },
    {
      question: "How can I change my password?",
      answer: "Go to Settings > Security, enter your current password, and then your new password twice to confirm. For security, we recommend changing your password every 90 days."
    },
    {
      question: "How do auto-analytical rules work?",
      answer: "Auto-analytical rules automatically assign cost centers to transactions based on conditions you define. For example, you can create a rule to assign all purchases from a specific vendor to the Production cost center."
    }
  ];

  const resources = [
    { title: "Documentation", desc: "Complete user guide", icon: FileText, link: "#" },
    { title: "Video Tutorials", desc: "Step-by-step guides", icon: Video, link: "#" },
    { title: "Community Forum", desc: "Connect with users", icon: Users, link: "#" },
    { title: "API Reference", desc: "For developers", icon: Zap, link: "#" },
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
          <p className="text-muted-foreground">Find answers to common questions or contact our support team</p>
        </div>
        <Badge variant="outline" className="w-fit gap-2">
          <Clock className="w-3 h-3" />
          Response time: ~2 hours
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "FAQs", value: `${faqs.length}`, subtitle: "Common questions", icon: HelpCircle, color: "text-primary", bg: "bg-primary/10" },
          { title: "Resources", value: `${resources.length}`, subtitle: "Helpful guides", icon: Book, color: "text-success", bg: "bg-success/10" },
          { title: "Support", value: "24/7", subtitle: "Always available", icon: LifeBuoy, color: "text-accent", bg: "bg-accent/10" },
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* FAQs */}
        <Card className="card-elevated border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
                  <CardDescription>Quick answers to common queries</CardDescription>
                </div>
              </div>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No FAQs match your search</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-muted">
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-medium pr-4">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="space-y-6">
          <Card className="card-elevated border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <CardTitle className="text-lg">Contact Support</CardTitle>
                  <CardDescription>We're here to help you</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    rows={4}
                    required
                    className="resize-none"
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  <Send className="w-4 h-4" />
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Contact */}
          <Card className="card-elevated border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">Quick Contact</CardTitle>
                  <CardDescription>Reach us directly</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Mail className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@shivfurniture.com</p>
                </div>
                <Badge variant="outline" className="text-success bg-success/10">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-success/10 text-success">
                    <Phone className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                </div>
                <Badge variant="outline">Mon-Sat</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Resources */}
      <Card className="card-elevated border-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Book className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Resources</CardTitle>
              <CardDescription>Helpful guides and documentation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {resources.map((resource, idx) => (
              <motion.a
                key={resource.title}
                href={resource.link}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                className="flex flex-col items-center gap-3 p-6 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-center group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <resource.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{resource.title}</p>
                  <p className="text-sm text-muted-foreground">{resource.desc}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HelpSupportPage;
