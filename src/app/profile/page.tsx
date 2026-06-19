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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-xl">
          <CardHeader className="flex flex-col items-center space-y-5 pt-8">
            <Avatar className="h-28 w-28 border-3 border-indigo-200 shadow-md">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={fullName} />
              ) : (
                <AvatarFallback className="text-4xl font-semibold bg-indigo-100 text-indigo-700">
                  {fullName.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <CardTitle className="text-3xl font-bold text-center">{profile.email}</CardTitle>
            {fullName !== profile.email && (
              <p className="text-lg text-gray-700 font-medium">{fullName}</p>
            )}
            {profile.created_at && (
              <p className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                <Calendar className="h-4 w-4 mr-2" />
                Criado em {new Date(profile.created_at).toLocaleDateString("pt-BR")}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-5 px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-600 mb-1">Tarefas criadas</p>
                <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-gray-600 mb-1">Concluídas</p>
                <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <p className="text-sm text-gray-600 mb-1">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-gray-50 text-center py-4">
            <p className="text-xs text-gray-500">
              Dados atualizados em tempo real.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}