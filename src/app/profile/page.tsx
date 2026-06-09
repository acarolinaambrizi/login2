"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Stats {
  total: number;
  completed: number;
  pending: number;
}

export default function Profile() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/auth/signin");
        return;
      }
      const { data, error } = await supabase
        .from("tasks")
        .select("completed")
        .eq("user_id", session.user.id);

      if (error) console.error(error);
      else {
        const total = data?.length ?? 0;
        const completed = data?.filter(t => t.completed).length ?? 0;
        setStats({ total, completed, pending: total - completed });
      }
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Meu Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">Tarefas criadas: {stats.total}</p>
            <p className="text-green-600">Concluídas: {stats.completed}</p>
            <p className="text-yellow-600">Pendentes: {stats.pending}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}