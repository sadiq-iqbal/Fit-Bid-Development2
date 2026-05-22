import { useState } from "react";
import { useCreatePost } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function NewPost() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createPost = useCreatePost();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("");
  const [needsTrainer, setNeedsTrainer] = useState(false);
  const [needsNutritionist, setNeedsNutritionist] = useState(false);

  const handleSubmit = () => {
    if (!title) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    if (!needsTrainer && !needsNutritionist) {
      toast({ title: "Select what you need", description: "You must need either a trainer or nutritionist.", variant: "destructive" });
      return;
    }

    createPost.mutate({
      data: {
        title,
        description,
        budgetMin: parseInt(budgetMin) || undefined,
        budgetMax: parseInt(budgetMax) || undefined,
        durationWeeks: parseInt(durationWeeks) || undefined,
        needsTrainer,
        needsNutritionist,
      }
    }, {
      onSuccess: (data) => {
        toast({ title: "Post created successfully" });
        setLocation(`/posts/${data.id}`);
      },
      onError: () => {
        toast({ title: "Failed to create post", variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Goal Post</CardTitle>
          <CardDescription>Detail your fitness objectives so professionals can submit targeted bids.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Lose 10kg for my wedding in 12 weeks" />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your current lifestyle, any equipment you have, injuries, etc." className="h-32" />
          </div>

          <div className="space-y-4">
            <Label>What kind of help do you need?</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="trainer" checked={needsTrainer} onCheckedChange={(c: boolean) => setNeedsTrainer(c)} />
                <label htmlFor="trainer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Fitness Trainer
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="nutritionist" checked={needsNutritionist} onCheckedChange={(c: boolean) => setNeedsNutritionist(c)} />
                <label htmlFor="nutritionist" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Nutritionist
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Budget ($)</Label>
              <Input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Max Budget ($)</Label>
              <Input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duration (Weeks)</Label>
            <Input type="number" value={durationWeeks} onChange={(e) => setDurationWeeks(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createPost.isPending}>
            {createPost.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Post Goal
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}