import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Dumbbell, ShieldCheck } from "lucide-react";
import { Redirect } from "wouter";

export default function Login() {
  const { login, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect to="/dashboard" />;

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-card border-r">
        <div className="max-w-md space-y-8 w-full">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary">FitBid</h1>
            <p className="text-xl text-muted-foreground">Log in to your account</p>
          </div>
          
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>Authenticate with your Replit account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full" onClick={() => login()}>
                Log in with Replit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex-1 hidden md:flex flex-col justify-center p-12 lg:p-24 bg-zinc-950 text-zinc-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
        <div className="max-w-xl space-y-12 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight">The ultimate marketplace for health professionals.</h2>
          
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Verified Experts</h3>
                <p className="text-zinc-400">Work only with certified trainers and licensed nutritionists.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Integrated Tracking</h3>
                <p className="text-zinc-400">Log meals, workouts, and measurements directly in the platform.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Escrow</h3>
                <p className="text-zinc-400">Payments are held safely and released upon milestone completion.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}