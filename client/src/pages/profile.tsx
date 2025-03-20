
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Coins, FileText, CheckCircle } from 'lucide-react';

export default function Profile() {
  const [principal, setPrincipal] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authClient = await AuthClient.create();
      if (await authClient.isAuthenticated()) {
        const identity = authClient.getIdentity();
        setPrincipal(identity.getPrincipal().toString());
      }
    };
    checkAuth();
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', principal],
    queryFn: () => apiRequest('GET', `/api/users/${principal}`),
    enabled: !!principal
  });

  if (!principal) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-lg text-gray-600">Please connect with Internet Identity to view your profile.</p>
              <ConnectWallet />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-12 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{address.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Wallet Address</h3>
              <p className="font-mono text-sm">{address}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <div>
                <h3 className="font-medium">Civic Tokens</h3>
                <p className="text-2xl font-bold">{user?.tokens || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="font-medium">Complaints Submitted</h3>
                  <p className="text-xl">{user?.complaintsSubmitted || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <h3 className="font-medium">Cases Resolved</h3>
                  <p className="text-xl">{user?.casesResolved || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
