import { useListProgressEntries, getListProgressEntriesQueryKey } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

export default function ProgressTab({ engagementId }: { engagementId: number }) {
  const { data: entries, isLoading } = useListProgressEntries(engagementId, {
    query: { enabled: !!engagementId, queryKey: getListProgressEntriesQueryKey(engagementId) }
  });

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const chartData = entries?.map(entry => ({
    date: format(new Date(entry.createdAt), "MMM dd"),
    weight: entry.weightKg,
    energy: entry.energyLevel
  })).reverse() || [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Progress Tracking</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Weight Progress (kg)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Not enough data to display chart
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid gap-4">
        {entries?.map(entry => (
          <Card key={entry.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">{format(new Date(entry.createdAt), "MMMM d, yyyy")}</div>
                <div className="text-sm text-muted-foreground">
                  Energy: {entry.energyLevel}/5 • Sleep: {entry.sleepQuality}/5 • Mood: {entry.mood}/5
                </div>
                {entry.notes && <p className="text-sm mt-2">{entry.notes}</p>}
              </div>
              <div className="text-xl font-bold text-primary">
                {entry.weightKg} kg
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}