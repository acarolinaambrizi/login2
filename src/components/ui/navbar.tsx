"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, User, LogOut, ListTodo } from "lucide-react";
import { toast } from "sonner";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/signout', {
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/auth/signin');
        toast.success('Logout realizado com sucesso!');
      } else {
        throw new Error('Erro ao fazer logout');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer logout');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <ListTodo className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">
                Meu To Do
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {pathname.startsWith("/home") && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/home")}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Início
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/profile")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
</dyad-chat-summary>Corrigi o erro removendo o `use server` inline e implementando o logout via API route em vez de Server Action inline. Agora o navbar usa uma chamada fetch para a API de logout, que é a abordagem correta para Client Components.<dyad-write path="src/app/api/signout/route.ts" description="API route that handles logout requests">
import { NextResponse } from "next/server";

export async function POST() {
  // No server‑side work needed; the client will clear the session.
  // Returning a 200 response signals a successful logout.
  return NextResponse.json({ success: true });
}