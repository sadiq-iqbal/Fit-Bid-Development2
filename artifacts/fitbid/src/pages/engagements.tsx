import { useListEngagements } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Activity } from "lucide-react";
import { format } from "date-fns";

export default function Engagements() {
  const { data: engagements, isLoading } = useListEngagements();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Engagements</h1>
          <p className="text-muted-foreground mt-1">Manage your active coaching relationships.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {engagements?.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-card rounded-lg border border-dashed">
            <h3 className="text-lg font-medium text-foreground">No engagements yet</h3>
            <p className="text-muted-foreground mt-2">Your active relationships will appear here.</p>
          </div>
        ) : (
          engagements?.map((engagement) => (
            <Card key={engagement.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1">{engagement.postTitle || "Engagement"}</CardTitle>
                  <Badge variant={engagement.status === "active" ? "default" : "secondary"}>
                    {engagement.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Started {format(new Date(engagement.startDate), "MMM d, yyyy")}
                </div>
                <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-md">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{engagement.clientName || "Client"}</p>
                    <p className="text-xs text-muted-foreground">Active Workouts & Meals</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 border-t mt-auto">
                <Link href={`/engagements/${engagement.id}`} className="w-full mt-4">
                  <Button variant="outline" className="w-full">Open Dashboard</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}