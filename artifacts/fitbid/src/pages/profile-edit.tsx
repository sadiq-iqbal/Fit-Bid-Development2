import { useState, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { useGetMyClientProfile, useUpsertClientProfile, useGetMyProfessionalProfile, useUpsertProfessionalProfile } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ProfileEdit() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isClient = user?.role === "client";
  
  const { data: clientProfile, isLoading: isClientLoading } = useGetMyClientProfile({
    query: { enabled: isClient }
  });
  const upsertClient = useUpsertClientProfile();

  const { data: profProfile, isLoading: isProfLoading } = useGetMyProfessionalProfile({
    query: { enabled: !isClient }
  });
  const upsertProf = useUpsertProfessionalProfile();

  // Client form state
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  // Professional form state
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  useEffect(() => {
    if (clientProfile) {
      setAge(clientProfile.age?.toString() || "");
      setGender(clientProfile.gender || "");
      setHeightCm(clientProfile.heightCm?.toString() || "");
      setWeightKg(clientProfile.weightKg?.toString() || "");
    }
  }, [clientProfile]);

  useEffect(() => {
    if (profProfile) {
      setSpecialty(profProfile.specialty || "");
      setBio(profProfile.bio || "");
      setYearsExperience(profProfile.yearsExperience?.toString() || "");
      setHourlyRate(profProfile.hourlyRate?.toString() || "");
    }
  }, [profProfile]);

  if ((isClient && isClientLoading) || (!isClient && isProfLoading)) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const handleSave = () => {
    if (isClient) {
      upsertClient.mutate({
        data: {
          age: parseInt(age) || undefined,
          gender,
          heightCm: parseInt(heightCm) || undefined,
          weightKg: parseInt(weightKg) || undefined,
        }
      }, {
        onSuccess: () => toast({ title: "Profile updated" })
      });
    } else {
      upsertProf.mutate({
        data: {
          specialty,
          bio,
          yearsExperience: parseInt(yearsExperience) || undefined,
          hourlyRate: parseFloat(hourlyRate) || undefined,
        }
      }, {
        onSuccess: () => toast({ title: "Profile updated" })
      });
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground mt-1">Update your public information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>This information helps us match you with the right people.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isClient ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Input value={gender} onChange={(e) => setGender(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Specialty</Label>
                  <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Input type="number" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Hourly Rate ($)</Label>
                  <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="h-32" />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6">
          <Button onClick={handleSave} disabled={upsertClient.isPending || upsertProf.isPending}>
            {(upsertClient.isPending || upsertProf.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}