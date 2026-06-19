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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");

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
        // Initialize edit fields with current profile data
        setEditFirstName(profileData?.first_name ?? "");
        setEditLastName(profileData?.last_name ?? "");
        setEditEmail(profileData?.email ?? "");
      }

      setLoading(false);
    };

    void load();
  }, [router]);

  const handleUpdateProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: editFirstName,
          last_name: editLastName,
          email: editEmail,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id);

      if (error) throw error;

      // Update local profile state
      setProfile({
        first_name: editFirstName,
        last_name: editLastName,
        avatar_url: profile.avatar_url,
        email: editEmail,
        created_at: profile.created_at,
      });

      toast.success("Perfil atualizado com sucesso!");
      setIsProfileEditOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar perfil");
    }
  };

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
              onClick={() => setIsProfileEditOpen(true)}
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

      {/* Edit Profile Dialog */}
      <Dialog open={isProfileEditOpen} onOpenChange={setIsProfileEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize suas informações de perfil abaixo.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            handleUpdateProfile();
          }}>
            <div className="space-y-2">
              <Label htmlFor="edit-first-name">Nome</Label>
              <Input
                id="edit-first-name"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                placeholder="Digite seu nome"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-last-name">Sobrenome</Label>
              <Input
                id="edit-last-name"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                placeholder="Digite seu sobrenome"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">E-mail</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
          </form>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProfileEditOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}