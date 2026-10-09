"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/libs/supabase";
import { getColorTailwind, getLabelCinturon, type Alumno } from "@/libs/types";
import { Search, Plus, Eye } from "lucide-react";

export default function ListaAlumnos() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCinturon, setFiltroCinturon] = useState("todos");
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("alumnos")
          .select("*")
          .order("apellido", { ascending: true });
        if (!activo) return;
        if (error) {
          setError(error.message);
        } else {
          setAlumnos(data || []);
        }
      } catch (err) {
        if (activo) setError(err instanceof Error ? err.message : "Error al cargar los datos");
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const alumnosFiltrados = alumnos.filter((a) => {
    const coincideBusqueda =
      a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.identificacion.includes(busqueda) ||
      (a.email && a.email.toLowerCase().includes(busqueda.toLowerCase()));

    const coincideCinturon = filtroCinturon === "todos" || a.color_cinturon === filtroCinturon;

    return coincideBusqueda && coincideCinturon;
  });

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-white mb-2">Error al cargar los datos</h2>
        <p className="text-zinc-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Alumnos</h1>
          <p className="text-zinc-400 mt-1 text-sm md:text-base">{alumnos.length} alumnos registrados</p>
        </div>
        <Link
          href="/alumnos/nuevo"
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
        >
          <Plus className="w-5 h-5" />
          Nuevo Alumno
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o cédula..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[#27272a] border border-zinc-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors text-sm"
          />
        </div>
        <select
          value={filtroCinturon}
          onChange={(e) => setFiltroCinturon(e.target.value)}
          className="bg-[#27272a] border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors text-sm"
        >
          <option value="todos">Todos</option>
          <option value="blanco">Blanco</option>
          <option value="azul">Azul</option>
          <option value="violeta">Violeta</option>
          <option value="marron">Marrón</option>
          <option value="negro">Negro</option>
        </select>
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block bg-[#27272a] rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Nombre</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Identificación</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Cinturón</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Celular</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Estado</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-zinc-400">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alumnosFiltrados.map((a) => (
              <tr key={a.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {a.foto_url ? (
                      <img src={a.foto_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold cinturon-${a.color_cinturon}`}>
                        {a.nombre.charAt(0)}{a.apellido.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">
                        {a.nombre} {a.apellido}
                      </p>
                      <p className="text-xs text-zinc-400">{a.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-300">{a.identificacion}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getColorTailwind(a.color_cinturon)}`}>
                    <span className="w-2 h-2 rounded-full bg-white/30" />
                    {getLabelCinturon(a.color_cinturon, a.grado)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-300">{a.celular}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      a.activo
                        ? "bg-green-600/15 text-green-400"
                        : "bg-zinc-600/15 text-zinc-400"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${a.activo ? "bg-green-400" : "bg-zinc-400"}`} />
                    {a.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/alumnos/${a.id}`}
                    className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {alumnosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No se encontraron alumnos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="md:hidden space-y-3">
        {alumnosFiltrados.map((a) => (
          <Link
            key={a.id}
            href={`/alumnos/${a.id}`}
            className="block bg-[#27272a] rounded-xl border border-zinc-800 p-4 hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              {a.foto_url ? (
                <img src={a.foto_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
              ) : (
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 cinturon-${a.color_cinturon}`}>
                  {a.nombre.charAt(0)}{a.apellido.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {a.nombre} {a.apellido}
                </p>
                <p className="text-xs text-zinc-400">CC: {a.identificacion}</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                  a.activo ? "bg-green-600/15 text-green-400" : "bg-zinc-600/15 text-zinc-400"
                }`}
              >
                {a.activo ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getColorTailwind(a.color_cinturon)}`}>
                <span className="w-2 h-2 rounded-full bg-white/30" />
                {getLabelCinturon(a.color_cinturon, a.grado)}
              </span>
              <Eye className="w-4 h-4 text-zinc-500" />
            </div>
          </Link>
        ))}
        {alumnosFiltrados.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-sm">
            No se encontraron alumnos.
          </div>
        )}
      </div>
    </div>
  );
}
