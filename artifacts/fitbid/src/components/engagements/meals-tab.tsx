import { useListMealPlans, getListMealPlansQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MealsTab({ engagementId }: { engagementId: number }) {
  const { data: plans, isLoading } = useListMealPlans(engagementId, {
    query: { enabled: !!engagementId, queryKey: getListMealPlansQueryKey(engagementId) }
  });

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Meal Plans</h2>
        <Button size="sm">Create Plan</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans?.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-muted/20 rounded-lg border border-dashed text-muted-foreground">
            No meal plans created yet.
          </div>
        ) : (
          plans?.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle className="text-lg">Week {plan.weekNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div><strong>Cals:</strong> {plan.dailyCalories || '--'}</div>
                  <div><strong>Protein:</strong> {plan.proteinG || '--'}g</div>
                  <div><strong>Carbs:</strong> {plan.carbsG || '--'}g</div>
                  <div><strong>Fats:</strong> {plan.fatsG || '--'}g</div>
                </div>
                <Button variant="outline" className="w-full">View Plan</Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}