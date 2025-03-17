import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { connectWallet, shortenAddress } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

export default function ConnectWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const { toast } = useToast();

  const connectMutation = useMutation({
    mutationFn: connectWallet,
    onSuccess: (address) => {
      setAddress(address);
      toast({
        title: "Connected",
        description: "Wallet connected successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (address) {
    return (
      <Button variant="outline">
        {shortenAddress(address)}
      </Button>
    );
  }

  return (
    <Button 
      onClick={() => connectMutation.mutate()}
      disabled={connectMutation.isPending}
    >
      {connectMutation.isPending ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
