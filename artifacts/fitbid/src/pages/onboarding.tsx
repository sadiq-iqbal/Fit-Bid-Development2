import { useState } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { useCompleteOnboarding } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell, Activity, User, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Onboarding() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const completeOnboarding = useCompleteOnboarding();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"client" | "trainer" | "nutritionist" | "">("");

  // Client Profile
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  // Professional Profile
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");

  const handleNext = () => {
    if (step === 1 && !role) {
      toast({ title: "Select a role", description: "Please select a role to continue.", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
    if (!role) return;

    let payload: any = { role };

    if (role === "client") {
      payload.clientProfile = {
        age: parseInt(age) || undefined,
        gender,
        heightCm: parseInt(heightCm) || undefined,
        weightKg: parseInt(weightKg) || undefined,
      };
    } else {
      payload.professionalProfile = {
        specialty,
        bio,
        yearsExperience: parseInt(yearsExperience) || undefined,
        availabilityStatus: "open",
      };
    }

    completeOnboarding.mutate({ data: payload }, {
      onSuccess: () => {
        toast({ title: "Welcome aboard!" });
        setLocation("/dashboard");
      },
      onError: () => {
        toast({ title: "Error", description: "Could not complete onboarding.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-2xl border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>Tell us a bit about yourself to get started on FitBid.</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">I am a...</h3>
              <RadioGroup value={role} onValueChange={(val: any) => setRole(val)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`relative flex flex-col items-center justify-between rounded-xl border-2 p-6 transition-all hover:bg-muted ${role === "client" ? "border-primary bg-primary/5" : "border-muted"}`}>
                  <RadioGroupItem value="client" id="role-client" className="sr-only" />
                  <Label htmlFor="role-client" className="flex flex-col items-center gap-4 cursor-pointer">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <span className="block font-semibold">Client</span>
                      <span className="text-xs text-muted-foreground mt-1">I want to achieve my fitness goals</span>
                    </div>
                  </Label>
                </div>
                
                <div className={`relative flex flex-col items-center justify-between rounded-xl border-2 p-6 transition-all hover:bg-muted ${role === "trainer" ? "border-primary bg-primary/5" : "border-muted"}`}>
                  <RadioGroupItem value="trainer" id="role-trainer" className="sr-only" />
                  <Label htmlFor="role-trainer" className="flex flex-col items-center gap-4 cursor-pointer">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Dumbbell className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <span className="block font-semibold">Trainer</span>
                      <span className="text-xs text-muted-foreground mt-1">I want to train clients</span>
                    </div>
                  </Label>
                </div>
                
                <div className={`relative flex flex-col items-center justify-between rounded-xl border-2 p-6 transition-all hover:bg-muted ${role === "nutritionist" ? "border-primary bg-primary/5" : "border-muted"}`}>
                  <RadioGroupItem value="nutritionist" id="role-nutritionist" className="sr-only" />
                  <Label htmlFor="role-nutritionist" className="flex flex-col items-center gap-4 cursor-pointer">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <span className="block font-semibold">Nutritionist</span>
                      <span className="text-xs text-muted-foreground mt-1">I want to manage diets</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {step === 2 && role === "client" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Input value={gender} onChange={(e) => setGender(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (role === "trainer" || role === "nutritionist") && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g. Strength Training, Weight Loss" />
              </div>
              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input type="number" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell clients about your approach..." className="h-32" />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step === 2 ? (
            <>
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleSubmit} disabled={completeOnboarding.isPending}>
                Complete Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="ml-auto">
              <Button onClick={handleNext}>
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}