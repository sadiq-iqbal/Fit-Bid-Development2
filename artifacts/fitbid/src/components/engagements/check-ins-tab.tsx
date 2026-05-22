import { useListCheckIns, getListCheckInsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function CheckInsTab({ engagementId }: { engagementId: number }) {
  const { data: checkIns, isLoading } = useListCheckIns(engagementId, {
    query: { enabled: !!engagementId, queryKey: getListCheckInsQueryKey(engagementId) }
  });

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Weekly Check-ins</h2>
      
      <div className="space-y-4">
        {checkIns?.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed text-muted-foreground">
            No check-ins submitted yet.
          </div>
        ) : (
          checkIns?.map(checkIn => (
            <Card key={checkIn.id}>
              <CardHeader>
                <CardTitle className="text-lg">Week {checkIn.weekNumber}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <div className="font-semibold">What went well?</div>
                  <p className="text-muted-foreground">{checkIn.wentWell}</p>
                </div>
                <div>
                  <div className="font-semibold">Challenges</div>
                  <p className="text-muted-foreground">{checkIn.challenges || "None reported"}</p>
                </div>
                {checkIn.professionalFeedback && (
                  <div className="mt-4 p-4 bg-primary/10 rounded-md border border-primary/20">
                    <div className="font-semibold text-primary">Professional Feedback</div>
                    <p>{checkIn.professionalFeedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}