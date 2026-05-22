import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@workspace/replit-auth-web";
import { MainLayout } from "@/components/layout/main-layout";
import { Loader2 } from "lucide-react";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

import Onboarding from "@/pages/onboarding";
import Posts from "@/pages/posts";
import NewPost from "@/pages/new-post";
import PostDetail from "@/pages/post-detail";
import Engagements from "@/pages/engagements";
import EngagementDashboard from "@/pages/engagement-dashboard";
import Directory from "@/pages/directory";
import ProfileDetail from "@/pages/profile-detail";
import ProfileEdit from "@/pages/profile-edit";
import AdminDashboard from "@/pages/admin-dashboard";
import Settings from "@/pages/settings";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, requireAuth = true, requireOnboarded = true, ...rest }: any) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (requireAuth && isAuthenticated && requireOnboarded && !user?.onboardingCompleted) {
    return <Redirect to="/onboarding" />;
  }

  return <Component {...rest} />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Home />}
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/onboarding" component={Onboarding} />
      
      <Route path="/dashboard">
        <MainLayout>
          <ProtectedRoute component={Dashboard} />
        </MainLayout>
      </Route>

      <Route path="/posts">
        <MainLayout>
          <ProtectedRoute component={Posts} />
        </MainLayout>
      </Route>

      <Route path="/posts/new">
        <MainLayout>
          <ProtectedRoute component={NewPost} />
        </MainLayout>
      </Route>

      <Route path="/posts/:id">
        <MainLayout>
          <ProtectedRoute component={PostDetail} />
        </MainLayout>
      </Route>

      <Route path="/engagements">
        <MainLayout>
          <ProtectedRoute component={Engagements} />
        </MainLayout>
      </Route>

      <Route path="/engagements/:id">
        <MainLayout>
          <ProtectedRoute component={EngagementDashboard} />
        </MainLayout>
      </Route>

      <Route path="/directory">
        <MainLayout>
          <ProtectedRoute component={Directory} requireOnboarded={false} />
        </MainLayout>
      </Route>

      <Route path="/profile/edit">
        <MainLayout>
          <ProtectedRoute component={ProfileEdit} />
        </MainLayout>
      </Route>

      <Route path="/profile/:id">
        <MainLayout>
          <ProtectedRoute component={ProfileDetail} requireOnboarded={false} />
        </MainLayout>
      </Route>

      <Route path="/admin">
        <MainLayout>
          <ProtectedRoute component={AdminDashboard} />
        </MainLayout>
      </Route>

      <Route path="/settings">
        <MainLayout>
          <ProtectedRoute component={Settings} />
        </MainLayout>
      </Route>

      <Route>
        <MainLayout>
          <NotFound />
        </MainLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;