import { useNavigate } from "react-router-dom";  
import { supabase } from "@/lib/supabase";  
import { auth } from "@supabase/auth-helpers-react";  

export default function Home() {  
  const navigate = useNavigate();  
  const { error, status } = supabase.auth.getUser();  

  if (status !== 200 || !session.user) {  
    navigate("/login");  
  }  

  return (  
    <div className="min-h-screen p-8 text-center">  
      <h1 className="text-3xl font-bold mb-8">Bem-vindo ao Meu To Do!</h1>  
      <p>Esta é a tela protegida para usuários autenticados.</p>  
      <button onClick={() => navigate("/logout")} className="bg-red-600 text-white px-4 py-2 rounded">  
        Sair  
      </button>  
    </div>  
  );  
};