"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/libs/supabase";
import { ORDEN_CINTURONES, type Alumno } from "@/libs/types";

export default function EditarAlumno() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    identificacion: "",
    celular: "",
    email: "",
    eps: "",
    color_cinturon: "blanco",
    grado: "1",
    activo: true,
  });

  useEffect(() => {
    supabase
      .from("alumnos")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setAlumno(data);
          setForm({
            nombre: data.nombre,
            apellido: data.apellido,
            identificacion: data.identificacion,
            celular: data.celular || "",
            email: data.email || "",
            eps: data.eps || "",
            color_cinturon: data.color_cinturon,
            grado: String(data.grado),
            activo: data.activo,
          });
        }
        setCargando(false);
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  function handleGuardarClick(e: React.FormEvent) {
    e.preventDefault();
    setMostrarConfirmacion(true);
  }

  async function confirmarGuardar() {
    setMostrarConfirmacion(false);
    setGuardando(true);
    setError("");

    const { error: err } = await supabase
      .from("alumnos")
      .update({
        nombre: form.nombre,
        apellido: form.apellido,
        identificacion: form.identificacion,
        celular: form.celular || null,
        email: form.email || null,
        eps: form.eps || null,
        color_cinturon: form.color_cinturon,
        grado: parseInt(form.grado),
        activo: form.activo,
      })
      .eq("id", id);

    if (err) {
      if (err.message.includes("duplicate")) {
        setError("Ya existe otro alumno con esa identificación");
      } else {
        setError("Error al guardar: " + err.message);
      }
      setGuardando(false);
      return;
    }

    setGuardado(true);
    setTimeout(() => {
      router.push(`/alumnos/${id}`);
    }, 1500);
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 md:mb-8">
        <Link
          href={`/alumnos/${id}`}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al perfil
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Editar Alumno</h1>
        <p className="text-zinc-400 mt-1">
          {alumno.nombre} {alumno.apellido}
        </p>
      </div>

      {guardado ? (
        <div className="bg-green-600/10 border border-green-600/30 rounded-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-4">
            <Save className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Cambios Guardados</h2>
          <p className="text-zinc-400">Redirigiendo al perfil del alumno...</p>
        </div>
      ) : (
        <form onSubmit={handleGuardarClick} className="bg-[#27272a] rounded-xl border border-zinc-800 p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

          <div className="border-t border-zinc-700 pt-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="activo"
                checked={form.activo}
                onChange={handleChange}
                className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-zinc-300">Alumno activo</span>
            </label>
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
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <Save className="w-5 h-5" />
              Guardar Cambios
            </button>
            <Link
              href={`/alumnos/${id}`}
              className="px-6 py-3 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      )}

      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#27272a] rounded-xl border border-zinc-800 p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-600/15 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Confirmar cambios</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-6">
              ¿Estás seguro de que quieres guardar los cambios de <strong className="text-white">{form.nombre} {form.apellido}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmarGuardar}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                Sí, guardar
              </button>
              <button
                onClick={() => setMostrarConfirmacion(false)}
                className="flex-1 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 py-2.5 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
