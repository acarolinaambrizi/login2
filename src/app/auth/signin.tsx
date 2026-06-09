import { useNavigate } from "react-router-dom";  
import { supabase } from "@/lib/supabase";  
import { auth } from "@supabase/auth-helpers-react";  

export default function SignIn() {  
  const navigate = useNavigate();  
  const { error, status } = supabase.auth.getUser();  

  const handleSubmit = async (e) => {  
    e.preventDefault();  
    const { email, password } = e.target.elements;  
    try {  
      const { data, error } = await supabase.auth.signInWithPassword({  
        email: email.value,  
        password: password.value,  
      });  
      if (error) throw error;  
      navigate("/home");  
    } catch (error) {  
      alert(error.message);  
    }  
  };  

  return (  
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">  
      <h2 className="text-2xl font-bold mb-4">Login</h2>  
      {status === 200 && session.user ? (  
        <p>Já logado como {session.user.email}</p>  
      ) : (  
        <form onSubmit={handleSubmit} className="space-y-4">  
          <div>  
            <label className="block mb-2">Email</label>  
            <input type="email" name="email" className="w-full p-2 border rounded" required />  
          </div>  
          <div>  
            <label className="block mb-2">Senha</label>  
            <input type="password" name="password" className="w-full p-2 border rounded" required />  
          </div>  
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">  
            Entrar  
          </button>  
        </form>  
      )}  
    </div>  
  );  
};