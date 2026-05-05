import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, ShieldCheck, Trash2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { adminPendingTutorialsQuery, approveTutorial, deleteTutorial, rejectTutorial, type Tutorial } from "@/lib/api";
import { useFirebaseAuth } from "@/lib/firebase-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

function StatCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <Card className="rounded-2xl border-border/60 bg-card/80 shadow-sm">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const { user, isAdmin, loading } = useFirebaseAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading, error } = useQuery(adminPendingTutorialsQuery(user?.email));

  const mutation = useMutation({
    mutationFn: async ({ action, tutorial }: { action: "approve" | "reject" | "delete"; tutorial: Tutorial }) => {
      if (action === "approve") return approveTutorial(tutorial.id, user?.email);
      if (action === "reject") return rejectTutorial(tutorial.id, user?.email);
      await deleteTutorial(tutorial.id, user?.email);
      return tutorial;
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-tutorials"] });
      queryClient.invalidateQueries({ queryKey: ["tutorials"] });
      toast({
        title: variables.action === "approve" ? "Tutorial approved" : variables.action === "reject" ? "Tutorial rejected" : "Tutorial deleted",
        description: variables.tutorial.title,
      });
    },
  });

  if (loading) {
    return <div className="container px-4 py-16 text-center text-muted-foreground">Checking admin access...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-2xl px-4 py-20">
        <Card className="rounded-[2rem] border-destructive/20 bg-destructive/5">
          <CardContent className="p-10 text-center space-y-3">
            <ShieldCheck className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="text-3xl font-bold">Access denied</h1>
            <p className="text-muted-foreground">Please login with an admin Gmail account to review creator uploads.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const counts = data?.counts || { total: 0, pending: 0, approved: 0, rejected: 0 };
  const pending = data?.pending || [];

  return (
    <div className="container px-4 py-10 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="mb-3 rounded-full bg-primary/10 text-primary hover:bg-primary/10">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
              Admin Dashboard
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">Creator Upload Review</h1>
            <p className="mt-2 text-muted-foreground">Approve good content before it appears in public tutorials.</p>
          </div>
          <div className="text-sm text-muted-foreground">{user?.email}</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total tutorials" value={counts.total} tone="text-foreground" />
          <StatCard label="Pending" value={counts.pending} tone="text-amber-600" />
          <StatCard label="Approved" value={counts.approved} tone="text-primary" />
          <StatCard label="Rejected" value={counts.rejected} tone="text-destructive" />
        </div>

        <Card className="overflow-hidden rounded-[2rem] border-border/60 shadow-xl">
          <CardHeader className="border-b bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Pending uploads
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-muted-foreground">Loading pending tutorials...</div>
            ) : error ? (
              <div className="p-8 text-destructive">Unable to load admin uploads.</div>
            ) : pending.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">No pending uploads right now.</div>
            ) : (
              <div className="divide-y">
                {pending.map((tutorial, index) => (
                  <motion.div
                    key={tutorial.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="grid gap-4 p-5 lg:grid-cols-[96px_1fr_auto]"
                  >
                    <img src={tutorial.thumbnail} alt="" className="h-24 w-24 rounded-2xl object-cover" />
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold">{tutorial.title}</h3>
                        <Badge variant="outline">{tutorial.category}</Badge>
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">pending</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{tutorial.description || "No description provided."}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{tutorial.creator}</span>
                        <span>{tutorial.submittedByEmail || "No email"}</span>
                        <a className="text-primary underline-offset-4 hover:underline" href={tutorial.videoUrl || "#"} target="_blank" rel="noreferrer">
                          Open link
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <Button size="sm" className="rounded-full gap-2" onClick={() => mutation.mutate({ action: "approve", tutorial })}>
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-full gap-2" onClick={() => mutation.mutate({ action: "reject", tutorial })}>
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                      <Button size="icon" variant="destructive" className="rounded-full" onClick={() => mutation.mutate({ action: "delete", tutorial })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
