import { useListProfessionals } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Star, ShieldCheck } from "lucide-react";

export default function Directory() {
  const { data: response, isLoading } = useListProfessionals({ limit: 50 });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const professionals = response?.professionals || [];

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Professional Directory</h1>
          <p className="text-muted-foreground mt-1">Find verified trainers and nutritionists.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {professionals.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-card rounded-lg border border-dashed">
            <h3 className="text-lg font-medium text-foreground">No professionals found</h3>
          </div>
        ) : (
          professionals.map((prof) => (
            <Card key={prof.userId} className="overflow-hidden flex flex-col">
              <div className="h-24 bg-primary/10 relative">
                {prof.verificationStatus === "approved" && (
                  <div className="absolute top-2 right-2 bg-background rounded-full p-1 shadow-sm">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </div>
              <CardHeader className="pt-0 relative">
                <div className="h-16 w-16 bg-muted border-4 border-background rounded-full absolute -top-8 flex items-center justify-center overflow-hidden">
                  {prof.avatarUrl ? (
                    <img src={prof.avatarUrl} alt={prof.name || ""} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-muted-foreground">{prof.name?.charAt(0) || "U"}</span>
                  )}
                </div>
                <div className="pt-10 space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {prof.name}
                  </CardTitle>
                  <p className="text-sm text-primary font-medium">{prof.specialty || prof.role}</p>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 text-sm">
                <p className="line-clamp-2 text-muted-foreground">
                  {prof.bio || "No bio available."}
                </p>
                <div className="flex items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-medium text-foreground">{prof.avgRating?.toFixed(1) || "New"}</span>
                  </div>
                  <div>
                    {prof.hourlyRate ? `$${prof.hourlyRate}/hr` : "Rates vary"}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Link href={`/profile/${prof.userId}`} className="w-full">
                  <Button variant="outline" className="w-full">View Profile</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}