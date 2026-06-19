"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="text-center space-y-8 max-w-md">
        {/* App benefits */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">Meu To Do</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
              <p className="text-gray-600">
                Organize suas tarefas de forma simples e intuitiva
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
              <p className="text-gray-600">
                Acesse de qualquer dispositivo, a qualquer hora
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
              <p className="text-gray-600">
                Mantenha seu foco no que realmente importa
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
              <p className="text-gray-600">
                Sincronização automática entre todos seus dispositivos
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Button
            onClick={() => router.push("/auth/signin")}
            variant="outline"
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-md"
          >
            Entrar
          </Button>
          <Button
            onClick={() => router.push("/auth/signup")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-md"
          >
            Cadastrar
          </Button>
        </div>
      </div>
    </div>
  );
}