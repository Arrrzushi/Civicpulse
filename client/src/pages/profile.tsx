import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Coins, FileText, Gift, ChevronRight } from "lucide-react";
import type { User, Complaint } from "@shared/schema";

export default function Profile() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users/current"],
    enabled: false, // Only enable when wallet is connected
  });

  const { data: complaints } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
  });

  const userComplaints = complaints?.filter(
    (c) => c.walletAddress === user?.walletAddress
  );

  const stats = [
    {
      icon: Coins,
      label: "Civic Tokens",
      value: user?.tokens || 0,
    },
    {
      icon: FileText,
      label: "Complaints",
      value: user?.complaintsSubmitted || 0,
    },
    {
      icon: Gift,
      label: "Donations",
      value: user?.donationsMade || 0,
    },
  ];

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Connect your wallet to view your profile
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Progress to Next Level */}
        <Card>
          <CardHeader>
            <CardTitle>Progress to Next Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={66} />
              <p className="text-sm text-gray-500">
                34 more tokens until next level
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userComplaints?.map((complaint) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <div className="font-medium">
                      {complaint.description.slice(0, 50)}...
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
