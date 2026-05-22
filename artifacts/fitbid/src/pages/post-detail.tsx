import { useGetPost } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, Clock, User } from "lucide-react";
import { getGetPostQueryKey } from "@workspace/api-client-react";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id || "0");
  
  const { data: post, isLoading } = useGetPost(postId, {
    query: { enabled: !!postId, queryKey: getGetPostQueryKey(postId) }
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return <div className="p-8 text-center">Post not found</div>;
  }

  return (
    <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={post.status === "open" ? "default" : "secondary"}>
            {post.status.replace("_", " ")}
          </Badge>
          {post.needsTrainer && <Badge variant="outline">Needs Trainer</Badge>}
          {post.needsNutritionist && <Badge variant="outline">Needs Nutritionist</Badge>}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        <p className="text-muted-foreground mt-4 whitespace-pre-wrap">{post.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <div className="text-2xl font-bold">${post.budgetMin} - ${post.budgetMax}</div>
            <div className="text-sm text-muted-foreground">Budget Range</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <Clock className="h-8 w-8 text-primary" />
            <div className="text-2xl font-bold">{post.durationWeeks} Weeks</div>
            <div className="text-sm text-muted-foreground">Duration</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <User className="h-8 w-8 text-primary" />
            <div className="text-2xl font-bold">{post.client?.name || "Client"}</div>
            <div className="text-sm text-muted-foreground">Posted By</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Bids ({post.bids?.length || 0})</h2>
        <div className="space-y-4">
          {post.bids?.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-dashed text-muted-foreground">
              No bids yet on this post.
            </div>
          ) : (
            post.bids?.map(bid => (
              <Card key={bid.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{bid.professional?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold text-primary mb-2">${bid.price} for {bid.estimatedWeeks} weeks</div>
                  <p className="text-sm">{bid.proposalText}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}