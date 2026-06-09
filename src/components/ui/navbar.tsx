"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, User, Settings } from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Início", icon: Home },
    { href: "/home", label: "Tarefas", icon: Home },
    { href: "/profile", label: "Perfil", icon: User },
    { href: "/settings", label: "Configurações", icon: Settings },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-primary">
              Meu To Do
            </Link>
            <div className="hidden md:flex space-x-2">
              {links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === href
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Botão de logout (apenas na página de tarefas) */}
          {pathname.startsWith("/home") && (
            <form
              action={async () => {
                "use server";
                const { supabase } = await import("@/lib/supabase");
                await supabase.auth.signOut();
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </form>
          )}
        </div>
      </div>
    </nav>
  );
};