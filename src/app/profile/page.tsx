"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

interface Stats {
  total: number;
  completed: number;
  pending: number;
}

interface ProfileData {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  email?: string;
  created_at?: string;
}

export default function Profile() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, pending: 0 });
  const [profile, setProfile] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/auth/signin");
        return;
      }

      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("completed")
        .eq("user_id", session.user.id);

      if (tasksError) {
        toast.error(tasksError.message);
      } else {
        const total = tasks?.length ?? 0;
        const completed = tasks?.filter(t => t.completed).length ?? 0;
        setStats({ total, completed, pending: total - completed });
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url, created_at")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        toast.error(profileError.message);
      } else {
        setProfile({
          ...profileData,
          email: session.user.email ?? "",
        });
      }

      setLoading(false);
    };

    void load();
  }, [router]);

  const fullName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Usuário";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="flex flex-col items-center space-y-4 pt-6">
            <Avatar className="h-24 w-24 border-2 border-indigo-200">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={fullName} />
              ) : (
                <AvatarFallback className="text-3xl bg-indigo-100 text-indigo-600">
                  {fullName.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <CardTitle className="text-2xl">{profile.email}</CardTitle>
            {fullName !== profile.email && (
              <p className="text-sm text-gray-600">{fullName}</p>
            )}
            {profile.created_at && (
              <p className="flex items-center text-xs text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                Criado em {new Date(profile.created_at).toLocaleDateString("pt-BR")}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-4 px-6 py-4">
            <p className="text-gray-700">
              <strong>Tarefas criadas:</strong> {stats.total}
            </p>
            <p className="text-green-600">
              <strong>Concluídas:</strong> {stats.completed}
            </p>
            <p className="text-yellow-600">
              <strong>Pendentes:</strong> {stats.pending}
            </p>
          </CardContent>

          <CardFooter className="bg-slate-50 text-center py-3">
            <p className="text-xs text-gray-500">
              Dados atualizados em tempo real.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}