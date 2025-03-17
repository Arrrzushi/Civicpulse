import { useQuery } from "@tanstack/react-query";
import { Coins } from "lucide-react";
import { motion } from "framer-motion";

export default function TokenDisplay() {
  const { data: user } = useQuery({
    queryKey: ["/api/users/current"],
    enabled: false, // Only enable when wallet is connected
  });

  return (
    <motion.div 
      className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Coins className="w-4 h-4 text-primary" />
      <span className="font-medium">
        {user?.tokens || 0} CT
      </span>
    </motion.div>
  );
}
