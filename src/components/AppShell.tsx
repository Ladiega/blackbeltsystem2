"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, cargando } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const esLogin = pathname === "/login";

  useEffect(() => {
    if (!cargando && !esLogin && !isLoggedIn) {
      router.replace("/login");
    }
  }, [cargando, esLogin, isLoggedIn, router]);

  if (esLogin) {
    return <>{children}</>;
  }

  if (cargando || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 md:p-8 overflow-auto pb-20 md:pb-8">{children}</main>
      </div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#18181b] border-t border-zinc-800 z-40">
        <MobileNav />
      </div>
    </div>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Inicio", icon: "📊" },
    { href: "/alumnos", label: "Alumnos", icon: "👥" },
    { href: "/alumnos/nuevo", label: "Nuevo", icon: "➕" },
  ];

  return (
    <nav className="flex items-center justify-around h-16">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
              isActive ? "text-red-500" : "text-zinc-400"
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-[10px] font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
