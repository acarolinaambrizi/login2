import { supabase } from "@/lib/supabase";  
import { auth } from "@supabase/auth-helpers-react";  

export async function GET({ cookies }) {  
  const session = await auth.getSession({ cookies });  
  return {  
    status: 200,  
    body: {  
      session: session.user,  
      error: session.error,  
    },  
  };  
}