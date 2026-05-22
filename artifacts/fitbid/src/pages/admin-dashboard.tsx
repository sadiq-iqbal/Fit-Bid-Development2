import { useGetAdminStats, getGetAdminStatsQueryKey, useListPendingVerifications, useVerifyProfessional } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { data: stats, isLoading: isStatsLoading } = useGetAdminStats();
  const { data: verifications, isLoading: isVerificationsLoading, refetch } = useListPendingVerifications();
  const verifyProf = useVerifyProfessional();

  const handleVerify = (userId: string, status: "approved" | "rejected") => {
    verifyProf.mutate({
      userId,
      data: { status }
    }, {
      onSuccess: () => {
        toast({ title: `Professional ${status}` });
        refetch();
      }
    });
  };

  if (isStatsLoading || isVerificationsLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalUsers || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Engagements</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.activeEngagements || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Posts</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalPosts || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending Verifications</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.pendingVerifications || 0}</div></CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Pending Verifications</h2>
        <div className="grid gap-4">
          {verifications?.length === 0 ? (
            <div className="p-8 text-center bg-muted/20 border border-dashed rounded-lg text-muted-foreground">
              No pending verifications.
            </div>
          ) : (
            verifications?.map(prof => (
              <Card key={prof.userId}>
                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-lg">{prof.name}</h3>
                    <p className="text-sm text-muted-foreground">{prof.specialty} • {prof.yearsExperience} years exp.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleVerify(prof.userId, "rejected")}>
                      <XCircle className="h-4 w-4 mr-2" /> Reject
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleVerify(prof.userId, "approved")}>
                      <CheckCircle className="h-4 w-4 mr-2" /> Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}