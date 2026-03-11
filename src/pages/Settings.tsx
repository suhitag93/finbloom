import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Link2, Target, Shield, Bell } from "lucide-react";
import { motion } from "framer-motion";
import ProfileTab from "@/components/settings/ProfileTab";
import ConnectedAccountsTab from "@/components/settings/ConnectedAccountsTab";
import GoalsBucketsTab from "@/components/settings/GoalsBucketsTab";
import SecurityTab from "@/components/settings/SecurityTab";
import DemoBanner from "@/components/DemoBanner";

const Settings = () => {
  return (
    <>
    <DemoBanner />
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-display text-3xl font-semibold text-foreground mb-1">Settings</h1>
          <p className="text-muted-foreground text-sm mb-6">Manage your profile, accounts, and preferences</p>

          <Tabs defaultValue="accounts" className="space-y-6">
            <TabsList className="bg-secondary/50 p-1">
              <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm">
                <User className="w-3.5 h-3.5" /> Profile
              </TabsTrigger>
              <TabsTrigger value="accounts" className="gap-1.5 text-xs sm:text-sm">
                <Link2 className="w-3.5 h-3.5" /> Connected Accounts
              </TabsTrigger>
              <TabsTrigger value="goals" className="gap-1.5 text-xs sm:text-sm">
                <Target className="w-3.5 h-3.5" /> Goals & Buckets
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm">
                <Shield className="w-3.5 h-3.5" /> Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile"><ProfileTab /></TabsContent>
            <TabsContent value="accounts"><ConnectedAccountsTab /></TabsContent>
            <TabsContent value="goals"><GoalsBucketsTab /></TabsContent>
            <TabsContent value="security"><SecurityTab /></TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
