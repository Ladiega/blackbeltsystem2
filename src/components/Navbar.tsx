"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { nombreUsuario, logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="h-14 md:h-16 bg-[#18181b] border-b border-zinc-800 flex items-center justify-between px-4 md:px-6 shrink-0 relative z-50">
      <div className="flex items-center gap-3 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">BB</span>
        </div>
        <span className="text-sm font-bold text-white">Black Belt</span>
      </div>
      <div className="hidden md:block" />

      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
            <User className="w-4 h-4 text-zinc-300" />
          </div>
          <span className="font-medium">{nombreUsuario}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>

      <div className="md:hidden relative">
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {menuAbierto && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuAbierto(false)} />
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#27272a] rounded-xl border border-zinc-800 shadow-xl p-3 z-50">
              <div className="flex items-center gap-2 px-3 py-2 mb-2 border-b border-zinc-700">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                  <User className="w-4 h-4 text-zinc-300" />
                </div>
                <span className="text-sm font-medium text-white">{nombreUsuario}</span>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
