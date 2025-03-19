import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";

export default function ConnectWallet() {
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const { toast } = useToast();

  const connectMutation = useMutation({
    mutationFn: async () => {
      const authClient = await AuthClient.create();
      const isAuthenticated = await authClient.isAuthenticated();

      if (!isAuthenticated) {
        await new Promise((resolve) => {
          authClient.login({
            identityProvider: "https://identity.ic0.app",
            onSuccess: resolve,
          });
        });
      }

      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal();
      return principal;
    },
    onSuccess: (principal) => {
      setPrincipal(principal);
      toast({
        title: "Connected",
        description: "Successfully connected with Internet Identity",
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

  if (principal) {
    return (
      <Button variant="outline">
        {principal.toString().slice(0, 6)}...{principal.toString().slice(-4)}
      </Button>
    );
  }

  return (
    <Button 
      onClick={() => connectMutation.mutate()}
      disabled={connectMutation.isPending}
    >
      {connectMutation.isPending ? "Connecting..." : "Connect with II"}
    </Button>
  );
}