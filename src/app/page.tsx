"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/libs/supabase";
import { ORDEN_CINTURONES, getColorTailwind, getIndiceGlobal, getLabelCinturon, type Alumno } from "@/libs/types";
import { Users, UserCheck, Trophy, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase
      .from("alumnos")
      .select("*")
      .then(({ data }) => {
        setAlumnos(data || []);
        setCargando(false);
      });
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalAlumnos = alumnos.length;
  const alumnosActivos = alumnos.filter((a) => a.activo).length;
  const totalGrados = ORDEN_CINTURONES.length * 4;

  const distribucion = ORDEN_CINTURONES.map((c) => ({
    ...c,
    cantidad: alumnos.filter((a) => a.color_cinturon === c.color).length,
  }));

  const promedioGrado =
    totalAlumnos > 0
      ? alumnos.reduce((acc, a) => acc + getIndiceGlobal(a.color_cinturon, a.grado), 0) / totalAlumnos
      : 0;

  const maxPorColor = Math.max(...distribucion.map((d) => d.cantidad), 1);

  const topAlumnos = alumnos
    .filter((a) => a.activo)
    .sort((a, b) => getIndiceGlobal(b.color_cinturon, b.grado) - getIndiceGlobal(a.color_cinturon, a.grado))
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1 text-sm md:text-base">Vista general de la academia</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-[#27272a] rounded-xl p-4 md:p-5 border border-zinc-800">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-600/15 flex items-center justify-center">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
            </div>
            <span className="text-xs md:text-sm text-zinc-400">Total</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white">{totalAlumnos}</p>
        </div>

        <div className="bg-[#27272a] rounded-xl p-4 md:p-5 border border-zinc-800">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-green-600/15 flex items-center justify-center">
              <UserCheck className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
            </div>
            <span className="text-xs md:text-sm text-zinc-400">Activos</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white">{alumnosActivos}</p>
        </div>

        <div className="bg-[#27272a] rounded-xl p-4 md:p-5 border border-zinc-800">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-600/15 flex items-center justify-center">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
            </div>
            <span className="text-xs md:text-sm text-zinc-400">Grados</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white">{totalGrados}</p>
        </div>

        <div className="bg-[#27272a] rounded-xl p-4 md:p-5 border border-zinc-800">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-violet-600/15 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-violet-500" />
            </div>
            <span className="text-xs md:text-sm text-zinc-400">Promedio</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white">{promedioGrado.toFixed(1)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-[#27272a] rounded-xl p-4 md:p-6 border border-zinc-800">
          <h2 className="text-base md:text-lg font-semibold text-white mb-4 md:mb-6">Distribución por Cinturón</h2>
          <div className="space-y-3 md:space-y-4">
            {distribucion.map((d) => (
              <div key={d.color}>
                <div className="flex items-center justify-between mb-1.5 md:mb-2">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${getColorTailwind(d.color)}`} />
                    <span className="text-xs md:text-sm text-zinc-300">{d.nombre}</span>
                  </div>
                  <span className="text-xs md:text-sm font-medium text-white">{d.cantidad}</span>
                </div>
                <div className="progress-bar-track h-2.5 md:h-3">
                  <div
                    className={`progress-bar-fill cinturon-${d.color}`}
                    style={{ width: `${(d.cantidad / maxPorColor) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl p-4 md:p-6 border border-zinc-800">
          <h2 className="text-base md:text-lg font-semibold text-white mb-4 md:mb-6">Alumnos Más Avanzados</h2>
          <div className="space-y-2 md:space-y-3">
            {topAlumnos.map((a, i) => (
              <Link
                key={a.id}
                href={`/alumnos/${a.id}`}
                className="flex items-center gap-3 md:gap-4 p-2.5 md:p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
              >
                <span className="text-base md:text-lg font-bold text-zinc-500 w-5 md:w-6">{i + 1}</span>
                {a.foto_url ? (
                  <img
                    src={a.foto_url}
                    alt=""
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getColorTailwind(
                      a.color_cinturon
                    )}`}
                  >
                    {a.nombre.charAt(0)}{a.apellido.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm md:text-base truncate">
                    {a.nombre} {a.apellido}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">
                    {getLabelCinturon(a.color_cinturon, a.grado)}
                  </p>
                </div>
                <div
                  className={`px-2.5 md:px-3 py-1 rounded-full text-xs font-medium shrink-0 ${getColorTailwind(a.color_cinturon)}`}
                >
                  {a.grado}°
                </div>
              </Link>
            ))}
            {topAlumnos.length === 0 && (
              <p className="text-zinc-500 text-center py-4 text-sm">No hay alumnos registrados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
