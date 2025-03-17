import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, Trophy, ArrowRight } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: FileText,
      title: "Submit Complaints",
      description: "Report issues in your community and earn Civic Tokens",
    },
    {
      icon: AlertCircle,
      title: "Fund Solutions",
      description: "Donate tokens to help resolve reported issues",
    },
    {
      icon: Trophy,
      title: "Earn Rewards",
      description: "Get rewarded for your contributions to the community",
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Empower Your Community
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Join the decentralized platform for public complaints and community improvement. 
              Submit issues, earn rewards, and make a difference.
            </p>
            <div className="mt-10">
              <Link href="/submit">
                <Button size="lg" className="group">
                  Submit a Complaint
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                className="relative p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="absolute -top-4 left-6 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="mt-8 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
