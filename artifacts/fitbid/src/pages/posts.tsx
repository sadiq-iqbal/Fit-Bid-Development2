import { useListPosts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign, Clock, Users } from "lucide-react";

export default function Posts() {
  const { data: response, isLoading } = useListPosts({ status: "open" } as any);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const posts = response?.posts || [];

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground mt-1">Browse open posts and submit your bids.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {posts.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-lg border border-dashed">
            <h3 className="text-lg font-medium text-foreground">No open posts found</h3>
            <p className="text-muted-foreground mt-2">Check back later for new opportunities.</p>
          </div>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {post.tags?.map((tag) => (
                        <Badge variant="secondary" key={tag}>{tag}</Badge>
                      ))}
                      {post.needsTrainer && <Badge variant="outline">Needs Trainer</Badge>}
                      {post.needsNutritionist && <Badge variant="outline">Needs Nutritionist</Badge>}
                    </div>
                  </div>
                  <div className="text-right whitespace-nowrap space-y-1">
                    <div className="font-semibold text-lg">
                      ${post.budgetMin} - ${post.budgetMax}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" />
                      {post.durationWeeks} weeks
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-muted-foreground">
                  {post.description}
                </p>
              </CardContent>
              <CardFooter className="bg-muted/30 pt-4 flex justify-between">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {post.bidCount || 0} bids
                </div>
                <Link href={`/posts/${post.id}`}>
                  <Button>View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}