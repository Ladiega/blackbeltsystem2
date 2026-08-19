"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/libs/supabase";
import { ORDEN_CINTURONES } from "@/libs/types";

export default function NuevoAlumno() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    identificacion: "",
    celular: "",
    email: "",
    eps: "",
    color_cinturon: "blanco",
    grado: "1",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const { error: err } = await supabase.from("alumnos").insert({
      nombre: form.nombre,
      apellido: form.apellido,
      identificacion: form.identificacion,
      celular: form.celular || null,
      email: form.email || null,
      eps: form.eps || null,
      color_cinturon: form.color_cinturon,
      grado: parseInt(form.grado),
    });

    if (err) {
      if (err.message.includes("duplicate")) {
        setError("Ya existe un alumno con esa identificación");
      } else {
        setError("Error al guardar: " + err.message);
      }
      setGuardando(false);
      return;
    }

    router.push("/alumnos");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 md:mb-8">
        <Link
          href="/alumnos"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la lista
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Nuevo Alumno</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#27272a] rounded-xl border border-zinc-800 p-4 md:p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Apellido *</label>
            <input
              type="text"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Número de Identificación *</label>
          <input
            type="text"
            name="identificacion"
            value={form.identificacion}
            onChange={handleChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Celular</label>
            <input
              type="tel"
              name="celular"
              value={form.celular}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">EPS</label>
          <select
            name="eps"
            value={form.eps}
            onChange={handleChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
          >
            <option value="">Selecciona una EPS</option>
            <option value="SURA">SURA</option>
            <option value="Sanitas">Sanitas</option>
            <option value="Compensar">Compensar</option>
            <option value="EPS Sur">EPS Sur</option>
            <option value="Nueva EPS">Nueva EPS</option>
            <option value="Coomeva">Coomeva</option>
            <option value="Famisanar">Famisanar</option>
          </select>
        </div>

        <div className="border-t border-zinc-700 pt-5">
          <p className="text-sm text-zinc-400 mb-4">Nivel en la academia</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Cinturón</label>
              <select
                name="color_cinturon"
                value={form.color_cinturon}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              >
                {ORDEN_CINTURONES.map((c) => (
                  <option key={c.color} value={c.color}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Grado</label>
              <select
                name="grado"
                value={form.grado}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="1">1° Grado</option>
                <option value="2">2° Grado</option>
                <option value="3">3° Grado</option>
                <option value="4">4° Grado</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-600/10 border border-red-600/30 rounded-lg px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={!form.nombre || !form.apellido || !form.identificacion || guardando}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm"
          >
            {guardando ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Registrar Alumno
              </>
            )}
          </button>
          <Link
            href="/alumnos"
            className="px-6 py-3 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
