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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Calendar } from "lucide-react";
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

      // Carregar estatísticas das tarefas
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

      // Carregar dados do perfil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url, email, created_at")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        toast.error(profileError.message);
      } else {
        setProfile(profileData ?? {});
      }

      setLoading(false);
    };

    void load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const fullName = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Usuário";

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
            <CardTitle className="text-2xl">{fullName}</CardTitle>
            {profile.email && (
              <p className="text-sm text-gray-600">{profile.email}</p>
            )}
            {profile.created_at && (
              <p className="flex items-center text-xs text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                Criado em {new Date(profile.created_at).toLocaleDateString("pt-BR")}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/profile/edit")}
              className="mt-2"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar perfil
            </Button>
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
              Dados atualizados em tempo real. Use o botão acima para modificar seu perfil.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}