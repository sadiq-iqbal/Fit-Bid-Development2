import { useGetProfessionalProfile, getGetProfessionalProfileQueryKey, useListReviews, getListReviewsQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Star, Award, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProfileDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { data: profile, isLoading: isProfileLoading } = useGetProfessionalProfile(id || "", {
    query: { enabled: !!id, queryKey: getGetProfessionalProfileQueryKey(id || "") }
  });

  const { data: reviewsResponse, isLoading: isReviewsLoading } = useListReviews(id || "", {
    query: { enabled: !!id, queryKey: getListReviewsQueryKey(id || "") }
  });

  if (isProfileLoading || isReviewsLoading) {
    return <div className="flex-1 flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!profile) return <div className="p-12 text-center">Profile not found</div>;

  return (
    <div className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="h-32 w-32 shrink-0 rounded-full border-4 border-background shadow-md overflow-hidden bg-muted flex items-center justify-center">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name || "Professional"} className="h-full w-full object-cover" />
          ) : (
            <span className="text-4xl font-bold text-muted-foreground">{profile.name?.charAt(0) || "P"}</span>
          )}
        </div>
        
        <div className="space-y-4 flex-1">
          <div>
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-lg text-primary font-medium">{profile.specialty || profile.role}</p>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-medium text-foreground">{profile.avgRating?.toFixed(1) || "New"}</span>
              <span>({profile.totalEngagements} engagements)</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{profile.yearsExperience || 0} years experience</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span>{profile.hourlyRate ? `$${profile.hourlyRate}/hr` : "Rates vary"}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {profile.certifications?.map(cert => (
              <Badge variant="secondary" key={cert}>{cert}</Badge>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About Me</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{profile.bio || "No bio available."}</p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        <div className="space-y-4">
          {reviewsResponse?.reviews.length === 0 ? (
            <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed text-muted-foreground">
              No reviews yet.
            </div>
          ) : (
            reviewsResponse?.reviews.map(review => (
              <Card key={review.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'fill-primary text-primary' : 'fill-muted text-muted'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm">{review.comment}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}