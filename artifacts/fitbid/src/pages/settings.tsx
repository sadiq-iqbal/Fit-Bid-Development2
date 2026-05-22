import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and notifications.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-1">
          <h3 className="font-semibold text-lg">Account</h3>
          <p className="text-sm text-muted-foreground">Manage your core account details.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-lg">{user?.name}</div>
                  <div className="text-sm text-muted-foreground capitalize">{user?.role}</div>
                </div>
              </div>
              <Button variant="outline">Edit Profile Details</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-1">
          <h3 className="font-semibold text-lg">Notifications</h3>
          <p className="text-sm text-muted-foreground">Choose what you want to be notified about.</p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive daily digests of new messages and bids.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Bids</Label>
                  <p className="text-sm text-muted-foreground">Get notified when a professional bids on your post.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Messages</Label>
                  <p className="text-sm text-muted-foreground">Get notified for new engagement messages.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-1">
          <h3 className="font-semibold text-lg text-destructive">Danger Zone</h3>
        </div>
        <div className="md:col-span-2">
          <Card className="border-destructive/20">
            <CardContent className="p-6 space-y-4">
              <Button variant="destructive" onClick={() => logout()} className="w-full sm:w-auto">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}