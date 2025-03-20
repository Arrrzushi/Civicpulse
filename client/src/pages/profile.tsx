import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Profile() {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    setAddress(window.ethereum?.selectedAddress || null);
  }, []);

  const { data: user } = useQuery({
    queryKey: ['user', address],
    queryFn: () => apiRequest('GET', `/api/users/${address}`),
    enabled: !!address
  });

  if (!address) {
    return <div className="p-4">Please connect your wallet to view your profile.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Wallet Address</h3>
              <p className="text-sm text-gray-500">{address}</p>
            </div>
            <div>
              <h3 className="font-medium">Civic Tokens</h3>
              <p className="text-2xl font-bold">{user?.tokens || 0}</p>
            </div>
            <div>
              <h3 className="font-medium">Statistics</h3>
              <p>Complaints Submitted: {user?.complaintsSubmitted || 0}</p>
              <p>Cases Resolved: {user?.casesResolved || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}