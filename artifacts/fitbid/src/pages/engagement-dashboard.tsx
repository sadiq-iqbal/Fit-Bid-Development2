import { useGetEngagement } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LayoutDashboard, Dumbbell, Utensils, TrendingUp, MessageSquare, CheckCircle } from "lucide-react";
import { getGetEngagementQueryKey } from "@workspace/api-client-react";

import OverviewTab from "@/components/engagements/overview-tab";
import WorkoutsTab from "@/components/engagements/workouts-tab";
import MealsTab from "@/components/engagements/meals-tab";
import ProgressTab from "@/components/engagements/progress-tab";
import MessagesTab from "@/components/engagements/messages-tab";
import CheckInsTab from "@/components/engagements/check-ins-tab";

export default function EngagementDashboard() {
  const { id } = useParams<{ id: string }>();
  const engagementId = parseInt(id || "0");

  const { data: engagement, isLoading } = useGetEngagement(engagementId, {
    query: { enabled: !!engagementId, queryKey: getGetEngagementQueryKey(engagementId) }
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!engagement) {
    return <div className="p-8 text-center text-muted-foreground">Engagement not found</div>;
  }

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{engagement.post?.title || "Engagement"}</h1>
        <p className="text-muted-foreground mt-1">
          Client: {engagement.client?.name} | Status: <span className="capitalize">{engagement.status}</span>
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden bg-transparent border-b rounded-none h-auto p-0 space-x-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-2 py-3">
            <LayoutDashboard className="h-4 w-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="workouts" className="data-[state=active]:bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-2 py-3">
            <Dumbbell className="h-4 w-4 mr-2" /> Workouts
          </TabsTrigger>
          <TabsTrigger value="meals" className="data-[state=active]:bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-2 py-3">
            <Utensils className="h-4 w-4 mr-2" /> Meals
          </TabsTrigger>
          <TabsTrigger value="progress" className="data-[state=active]:bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-2 py-3">
            <TrendingUp className="h-4 w-4 mr-2" /> Progress
          </TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-2 py-3">
            <MessageSquare className="h-4 w-4 mr-2" /> Messages
          </TabsTrigger>
          <TabsTrigger value="checkins" className="data-[state=active]:bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-2 py-3">
            <CheckCircle className="h-4 w-4 mr-2" /> Check-ins
          </TabsTrigger>
        </TabsList>
        
        <div className="pt-6">
          <TabsContent value="overview" className="m-0">
            <OverviewTab engagementId={engagementId} />
          </TabsContent>
          <TabsContent value="workouts" className="m-0">
            <WorkoutsTab engagementId={engagementId} />
          </TabsContent>
          <TabsContent value="meals" className="m-0">
            <MealsTab engagementId={engagementId} />
          </TabsContent>
          <TabsContent value="progress" className="m-0">
            <ProgressTab engagementId={engagementId} />
          </TabsContent>
          <TabsContent value="messages" className="m-0">
            <MessagesTab engagementId={engagementId} />
          </TabsContent>
          <TabsContent value="checkins" className="m-0">
            <CheckInsTab engagementId={engagementId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}