"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.push("/home");
      } else {
        setLoading(false);
      }
    };
    getSession();
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
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <section className="text-center py-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Organize sua vida com Meu To Do
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Crie tarefas, marque-as como concluídas e mantenha sua produtividade em dia.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => router.push("/auth/signup")}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
            >
              Criar Conta
            </Button>
            <Button
              onClick={() => router.push("/auth/signin")}
              variant="outline"
              size="lg"
              className="px-8 py-3"
            >
              Entrar
            </Button>
          </div>
        </section>

        {/* Recursos */}
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Fácil de Usar</CardTitle>
              <CardDescription>
                Interface intuitiva que permite adicionar, editar e marcar tarefas rapidamente.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Circle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Organização Visual</CardTitle>
              <CardDescription>
                Cards coloridos e badges para visualizar o status de cada tarefa de forma clara.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <ArrowRight className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Acessível em Qualquer Lugar</CardTitle>
              <CardDescription>
                Acesse suas tarefas de qualquer dispositivo e mantenha sua produtividade em dia.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* CTA final */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-gray-600 mb-8">
            Junte-se a milhares de usuários que já organizam suas vidas com Meu To Do.
          </p>
          <Button
            onClick={() => router.push("/auth/signup")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            Comece Agora
          </Button>
        </section>
      </div>
    </div>
  );
}