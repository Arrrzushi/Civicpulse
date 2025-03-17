import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import { shortenAddress } from "@/lib/web3";
import type { User } from "@shared/schema";

const rankIcons = {
  0: { icon: Trophy, color: "text-yellow-500" },
  1: { icon: Medal, color: "text-gray-400" },
  2: { icon: Award, color: "text-amber-600" },
};

export default function Leaderboard() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl">
              Community Leaders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                users?.map((user, index) => {
                  const RankIcon = rankIcons[index as keyof typeof rankIcons]?.icon || Trophy;
                  const iconColor = rankIcons[index as keyof typeof rankIcons]?.color || "text-gray-400";
                  
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="relative"
                    >
                      <div className={`
                        flex items-center justify-between p-4 rounded-lg
                        ${index < 3 ? 'bg-primary/5' : 'bg-gray-50'}
                        hover:shadow-md transition-shadow
                      `}>
                        <div className="flex items-center space-x-4">
                          <div className={`
                            w-8 h-8 flex items-center justify-center rounded-full
                            ${index < 3 ? 'bg-primary/10' : 'bg-gray-100'}
                          `}>
                            <RankIcon className={`w-5 h-5 ${iconColor}`} />
                          </div>
                          <div>
                            <div className="font-medium">
                              {shortenAddress(user.walletAddress)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.complaintsSubmitted} complaints · {user.donationsMade} donations
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-primary">
                            {user.tokens}
                          </span>
                          <span className="text-sm text-gray-500">CT</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
