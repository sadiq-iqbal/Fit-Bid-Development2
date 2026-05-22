import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Activity, ShieldCheck, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center py-24 md:py-32 px-4 text-center overflow-hidden bg-background">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Your health goals, <br/>
            <span className="text-primary">competitively priced.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Post your fitness objectives. Certified trainers and nutritionists bid to work with you. A single platform for your complete health transformation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-base w-full sm:w-auto group">
                Find a Professional
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base w-full sm:w-auto">
                Apply as a Professional
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-card border-t px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto md:mx-0">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Post Your Goals</h3>
              <p className="text-muted-foreground leading-relaxed">
                Define your objectives, current stats, and budget. Be specific to get the best tailored proposals.
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto md:mx-0">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Receive Bids</h3>
              <p className="text-muted-foreground leading-relaxed">
                Verified professionals review your profile and submit competitive bids with their strategies and pricing.
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto md:mx-0">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Track Progress</h3>
              <p className="text-muted-foreground leading-relaxed">
                Manage your workouts, nutrition, and direct messaging all in one shared dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}