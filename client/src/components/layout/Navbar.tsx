import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import ConnectWallet from "../shared/ConnectWallet";
import TokenDisplay from "../shared/TokenDisplay";
import { Home, FileText, Trophy, User } from "lucide-react";

const Navbar = () => {
  const [location] = useLocation();

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/feed", icon: FileText, label: "Complaints" },
    { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">
                CivicChain
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {links.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="relative inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  <Icon className="w-5 h-5 mr-1" />
                  {label}
                  {location === href && (
                    <motion.div
                      layoutId="underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={false}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <TokenDisplay />
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
