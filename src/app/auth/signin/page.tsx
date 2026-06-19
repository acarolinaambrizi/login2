"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(formData);
      if (error) throw error;
      router.push("/home");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Branding & Illustration */}
        <div className="hidden lg:block space-y-8 px-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-100">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Organize sua vida com elegância</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent leading-tight">
              Bem-vindo de volta!
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              Acesse sua conta e continue gerenciando suas tarefas com a simplicidade que você merece.
            </p>
          </div>

          {/* Illustration */}
          <div className="relative">
            <div className="w-80 h-80 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl rotate-6 opacity-10" />
              <div className="absolute inset-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
                    <LogIn className="h-10 w-10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded-full w-32 mx-auto" />
                    <div className="h-3 bg-gray-200 rounded-full w-24 mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-10">
            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Entrar na sua conta</h2>
              <p className="text-gray-500">Digite suas credenciais para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "h-12 rounded-xl border-gray-200 bg-gray-50/50 transition-all duration-200",
                        "focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200",
                        focusedField === "email" && "ring-2 ring-purple-200"
                      )}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "h-12 rounded-xl border-gray-200 bg-gray-50/50 pr-12 transition-all duration-200",
                        "focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200",
                        focusedField === "password" && "ring-2 ring-purple-200"
                      )}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">Lembrar de mim</span>
                </label>
                <a href="/auth/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
                  Esqueceu a senha?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-purple-200 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Entrar
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-gray-600">
                Não tem conta?{" "}
                <a href="/auth/signup" className="text-purple-600 hover:text-purple-700 font-medium transition-colors inline-flex items-center gap-1">
                  Criar conta
                  <ArrowRight className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Let me continue with the other pages to complete the aesthetic overhaul. I'll redesign the signup page next.
<dyad-write path="src/app/auth/signup/page.tsx" description="Redesigned signup page with modern split-screen layout and improved UX">
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, UserPlus, ArrowRight, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignUp() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Senhas não correspondem");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;
      alert("Cadastro realizado! Faça login.");
      router.push("/auth/signin");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = formData.password.length >= 8 ? "forte" : formData.password.length >= 4 ? "média" : "fraca";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200 to-sky-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Branding & Illustration */}
        <div className="hidden lg:block space-y-8 px-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-100">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">Comece hoje mesmo</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-800 bg-clip-text text-transparent leading-tight">
              Crie sua conta grátis
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              Junte-se a milhares de usuários que já organizam suas vidas com nossa plataforma.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-4">
            {[
              "Interface intuitiva e moderna",
              "Sincronização em tempo real",
              "Acesso em qualquer dispositivo",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Signup Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-10">
            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Criar conta</h2>
              <p className="text-gray-500">Preencha os dados abaixo para começar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "h-12 rounded-xl border-gray-200 bg-gray-50/50 transition-all duration-200",
                        "focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
                        focusedField === "email" && "ring-2 ring-emerald-200"
                      )}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "h-12 rounded-xl border-gray-200 bg-gray-50/50 pr-12 transition-all duration-200",
                        "focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
                        focusedField === "password" && "ring-2 ring-emerald-200"
                      )}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={cn(
                          "h-full transition-all duration-300",
                          passwordStrength === "forte" && "w-full bg-emerald-500",
                          passwordStrength === "média" && "w-2/3 bg-yellow-500",
                          passwordStrength === "fraca" && "w-1/3 bg-red-500"
                        )} />
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{passwordStrength}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                    Confirmar Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "h-12 rounded-xl border-gray-200 bg-gray-50/50 pr-12 transition-all duration-200",
                        "focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
                        focusedField === "confirmPassword" && "ring-2 ring-emerald-200"
                      )}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium shadow-lg shadow-emerald-200 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Criando conta...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Criar Conta
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-gray-600">
                Já tem conta?{" "}
                <a href="/auth/signin" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors inline-flex items-center gap-1">
                  Fazer login
                  <ArrowRight className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}