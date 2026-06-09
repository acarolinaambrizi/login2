import { useNavigate } from "react-router-dom";  
import { supabase } from "@/lib/supabase";  
import { auth } from "@supabase/auth-helpers-react";  

export default function RootLayout({ children }: { children: React.ReactNode }) {  
  const navigate = useNavigate();  
  const { error, status } = supabase.auth.getUser();  

  if (status !== 200 || !session.user) {  
    navigate("/login");  
  }  

  return (  
    <html lang="en">  
      <body className="font-sans antialiased text-gray-900 leading-normal tracking-wider bg-white">  
        <div className="container mx-auto px-4 py-8">  
          <header className="flex justify-between items-center mb-8">  
            <h1 className="text-2xl font-bold">Meu To Do</h1>  
            <nav>  
              <a href="/login" className="text-blue-600 hover:text-blue-800">Login</a>  
              <a href="/signup" className="ml-4 text-blue-600 hover:text-blue-800">Cadastro</a>  
            </nav>  
          </header>  
          <main>{children}</main>  
        </div>  
      </body>  
    </html>  
  );  
}