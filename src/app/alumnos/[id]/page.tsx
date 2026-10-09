"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/libs/supabase";
import {
  ORDEN_CINTURONES,
  getIndiceGlobal,
  getTotalGrados,
  getLabelCinturon,
  getColorTexto,
  type Alumno,
  type EventoProgreso,
} from "@/libs/types";
import { ArrowLeft, Mail, Phone, Shield, Calendar, MapPin, Pencil, TrendingUp, Award } from "lucide-react";
import PhotoUpload from "@/components/PhotoUpload";

export default function PerfilAlumno() {
  const params = useParams();
  const id = params.id as string;
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [eventos, setEventos] = useState<EventoProgreso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ascendiendo, setAscendiendo] = useState(false);
  const [mostrarModalEvento, setMostrarModalEvento] = useState(false);
  const [tipoEvento, setTipoEvento] = useState<"competencia" | "seminario">("competencia");
  const [descEvento, setDescEvento] = useState("");
  const [guardandoEvento, setGuardandoEvento] = useState(false);

  const cargarDatos = useCallback(async () => {
    const [alumnoResult, eventosResult] = await Promise.all([
      supabase.from("alumnos").select("*").eq("id", id).single(),
      supabase.from("eventos_progreso").select("*").eq("alumno_id", id).order("fecha", { ascending: false }),
    ]);
    setAlumno(alumnoResult.data);
    setEventos(eventosResult.data || []);
    setCargando(false);
  }, [id]);

  useEffect(() => {
    let activo = true;
    Promise.all([
      supabase.from("alumnos").select("*").eq("id", id).single(),
      supabase.from("eventos_progreso").select("*").eq("alumno_id", id).order("fecha", { ascending: false }),
    ])
      .then(([alumnoResult, eventosResult]) => {
        if (!activo) return;
        setAlumno(alumnoResult.data);
        setEventos(eventosResult.data || []);
        setCargando(false);
      })
      .catch(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [id]);

  async function ascenderGrado() {
    if (!alumno) return;
    setAscendiendo(true);

    const indiceActual = getIndiceGlobal(alumno.color_cinturon, alumno.grado);
    const totalGrados = getTotalGrados();

    if (indiceActual >= totalGrados - 1) {
      setAscendiendo(false);
      return;
    }

    const nuevoIndice = indiceActual + 1;
    const nuevoColorIdx = Math.floor(nuevoIndice / 4);
    const nuevoGrado = (nuevoIndice % 4) + 1;
    const nuevoColor = ORDEN_CINTURONES[nuevoColorIdx].color;

    const colorAnterior = alumno.color_cinturon;
    const gradoAnterior = alumno.grado;
    const esCambioColor = colorAnterior !== nuevoColor;

    const descripcion = esCambioColor
      ? `Ascenso de ${getLabelCinturon(colorAnterior, gradoAnterior)} a ${getLabelCinturon(nuevoColor, nuevoGrado as 1 | 2 | 3 | 4)}`
      : `Ascenso a ${nuevoGrado}° grado ${nuevoColor}`;

    await Promise.all([
      supabase
        .from("alumnos")
        .update({ color_cinturon: nuevoColor, grado: nuevoGrado })
        .eq("id", id),
      supabase.from("eventos_progreso").insert({
        alumno_id: id,
        fecha: new Date().toISOString().split("T")[0],
        descripcion,
        tipo: "grado",
      }),
    ]);

    await cargarDatos();
    setAscendiendo(false);
  }

  async function registrarEvento(e: React.FormEvent) {
    e.preventDefault();
    if (!descEvento.trim()) return;
    setGuardandoEvento(true);

    await supabase.from("eventos_progreso").insert({
      alumno_id: id,
      fecha: new Date().toISOString().split("T")[0],
      descripcion: descEvento,
      tipo: tipoEvento,
    });

    setDescEvento("");
    setMostrarModalEvento(false);
    setGuardandoEvento(false);
    await cargarDatos();
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!alumno) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-white mb-2">Alumno no encontrado</h2>
        <Link href="/alumnos" className="text-red-400 hover:text-red-300">
          Volver a la lista
        </Link>
      </div>
    );
  }

  const indiceGlobal = getIndiceGlobal(alumno.color_cinturon, alumno.grado);
  const totalGrados = getTotalGrados();
  const porcentajeProgreso = ((indiceGlobal + 1) / totalGrados) * 100;
  const puedeAscender = indiceGlobal < totalGrados - 1;

  const eventosAscenso = eventos.filter((e) => e.tipo === "grado");
  const competencias = eventos.filter((e) => e.tipo === "competencia");
  const seminarios = eventos.filter((e) => e.tipo === "seminario");

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/alumnos"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4 md:mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a la lista
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="lg:col-span-2 bg-[#27272a] rounded-xl border border-zinc-800 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-5">
            <PhotoUpload
              alumnoId={id}
              fotoUrl={alumno.foto_url}
              onFotoActualizada={(url) => setAlumno(alumno ? { ...alumno, foto_url: url } : null)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  {alumno.nombre} {alumno.apellido}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    alumno.activo ? "bg-green-600/15 text-green-400" : "bg-zinc-600/15 text-zinc-400"
                  }`}
                >
                  {alumno.activo ? "Activo" : "Inactivo"}
                </span>
                <Link
                  href={`/alumnos/${id}/editar`}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                  title="Editar alumno"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
              </div>
              <p className={`text-sm font-medium mb-3 md:mb-4 ${getColorTexto(alumno.color_cinturon)}`}>
                {getLabelCinturon(alumno.color_cinturon, alumno.grado)}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Shield className="w-4 h-4 shrink-0" />
                  CC: {alumno.identificacion}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Phone className="w-4 h-4 shrink-0" />
                  {alumno.celular || "No registrado"}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">{alumno.email || "No registrado"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <MapPin className="w-4 h-4 shrink-0" />
                  EPS: {alumno.eps || "No registrada"}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Calendar className="w-4 h-4 shrink-0" />
                  Ingreso: {new Date(alumno.fecha_ingreso).toLocaleDateString("es-CO")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-zinc-800 p-4 md:p-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Estadísticas</h3>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div>
              <p className="text-xl md:text-2xl font-bold text-white">{eventosAscenso.length}</p>
              <p className="text-xs text-zinc-500">Ascensos</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-white">{competencias.length}</p>
              <p className="text-xs text-zinc-500">Competencias</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-white">{seminarios.length}</p>
              <p className="text-xs text-zinc-500">Seminarios</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={ascenderGrado}
              disabled={!puedeAscender || ascendiendo || !alumno.activo}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {ascendiendo ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              Ascender Grado
            </button>

            <button
              onClick={() => setMostrarModalEvento(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Award className="w-4 h-4" />
              Registrar Evento
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#27272a] rounded-xl border border-zinc-800 p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-semibold text-white">Progreso de Cinturones</h2>
          <span className="text-xs md:text-sm text-zinc-400">
            {indiceGlobal + 1} / {totalGrados}
          </span>
        </div>

        <div className="mb-4 md:mb-6">
          <div className="progress-bar-track h-4 md:h-5 rounded-full">
            <div
              className="progress-bar-fill rounded-full"
              style={{
                width: `${porcentajeProgreso}%`,
                background: "linear-gradient(90deg, #22c55e, #eab308, #f97316, #ef4444, #171717)",
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-zinc-500">
            <span>Inicio</span>
            <span>{porcentajeProgreso.toFixed(0)}%</span>
            <span>Negro 4°</span>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
          {ORDEN_CINTURONES.map((cinturon, i) => {
            const indiceInicio = i * 4;
            const indiceFin = i * 4 + 3;
            const estaCompletado = indiceGlobal > indiceFin;
            const estaEnCurso = indiceGlobal >= indiceInicio && indiceGlobal <= indiceFin;
            const gradoEnCurso = estaEnCurso ? indiceGlobal - indiceInicio + 1 : 0;

            return (
              <div
                key={cinturon.color}
                className={`rounded-xl p-2.5 md:p-4 border transition-all ${
                  estaCompletado
                    ? `cinturon-${cinturon.color} border-transparent`
                    : estaEnCurso
                    ? `cinturon-${cinturon.color} border-white/30 ring-2 ring-white/20`
                    : "bg-zinc-800/50 border-zinc-700/50"
                }`}
              >
                <p className={`text-[10px] md:text-xs font-medium mb-1.5 md:mb-2 ${estaCompletado || estaEnCurso ? "text-white" : "text-zinc-400"}`}>
                  {cinturon.nombre}
                </p>
                <div className="flex gap-1 md:gap-1.5">
                  {[1, 2, 3, 4].map((grado) => {
                    const completado = estaCompletado || (estaEnCurso && grado <= gradoEnCurso);
                    return (
                      <div
                        key={grado}
                        className={`w-5 h-5 md:w-7 md:h-7 rounded-md flex items-center justify-center text-[10px] md:text-xs font-bold ${
                          completado
                            ? "bg-white/25 text-white"
                            : "bg-zinc-700/50 text-zinc-500"
                        }`}
                      >
                        {grado}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#27272a] rounded-xl border border-zinc-800 p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-white mb-4">Historial de Progreso</h2>
        <div className="space-y-2 md:space-y-3">
          {eventos.map((evento) => (
            <div key={evento.id} className="flex items-start gap-3 md:gap-4 p-2.5 md:p-3 rounded-lg bg-zinc-800/30">
              <div
                className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  evento.tipo === "grado"
                    ? "bg-amber-400"
                    : evento.tipo === "competencia"
                    ? "bg-red-400"
                    : "bg-blue-400"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">{evento.descripcion}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {new Date(evento.fecha).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                  evento.tipo === "grado"
                    ? "bg-amber-600/15 text-amber-400"
                    : evento.tipo === "competencia"
                    ? "bg-red-600/15 text-red-400"
                    : "bg-blue-600/15 text-blue-400"
                }`}
              >
                {evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1)}
              </span>
            </div>
          ))}
          {eventos.length === 0 && (
            <p className="text-zinc-500 text-center py-4 text-sm">No hay eventos registrados</p>
          )}
        </div>
      </div>

      {mostrarModalEvento && (
        <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-[#27272a] rounded-t-2xl md:rounded-xl border border-zinc-800 p-5 md:p-6 w-full max-w-md md:mx-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Registrar Evento</h3>
            <form onSubmit={registrarEvento} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Tipo de evento</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setTipoEvento("competencia")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      tipoEvento === "competencia"
                        ? "bg-red-600 text-white"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    Competencia
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoEvento("seminario")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      tipoEvento === "seminario"
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                  >
                    Seminario
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Descripción</label>
                <input
                  type="text"
                  value={descEvento}
                  onChange={(e) => setDescEvento(e.target.value)}
                  placeholder="Ej: Competencia regional - 2do puesto"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!descEvento.trim() || guardandoEvento}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  {guardandoEvento ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Guardar"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalEvento(false);
                    setDescEvento("");
                  }}
                  className="px-6 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
