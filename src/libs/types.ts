export type ColorCinturon = "blanco" | "azul" | "violeta" | "marron" | "negro";

export type Grado = 1 | 2 | 3 | 4;

export type RolUsuario = "admin" | "instructor";

export type TipoEvento = "grado" | "competencia" | "seminario";

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  created_at: string;
}

export interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
  identificacion: string;
  celular: string | null;
  email: string | null;
  eps: string | null;
  foto_url: string | null;
  color_cinturon: ColorCinturon;
  grado: Grado;
  fecha_ingreso: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Asistencia {
  id: string;
  alumno_id: string;
  fecha: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  registrado_por: string | null;
  created_at: string;
}

export interface EventoProgreso {
  id: string;
  alumno_id: string;
  fecha: string;
  descripcion: string;
  tipo: TipoEvento;
  registrado_por: string | null;
  created_at: string;
}

export const ORDEN_CINTURONES: { color: ColorCinturon; nombre: string; siguiente: ColorCinturon | null }[] = [
  { color: "blanco", nombre: "Blanco", siguiente: "azul" },
  { color: "azul", nombre: "Azul", siguiente: "violeta" },
  { color: "violeta", nombre: "Violeta", siguiente: "marron" },
  { color: "marron", nombre: "Marrón", siguiente: "negro" },
  { color: "negro", nombre: "Negro", siguiente: null },
];

export function getIndiceGlobal(color: ColorCinturon, grado: Grado): number {
  const base = ORDEN_CINTURONES.findIndex((c) => c.color === color);
  return base * 4 + (grado - 1);
}

export function getTotalGrados(): number {
  return ORDEN_CINTURONES.length * 4;
}

export function getColorHex(color: ColorCinturon): string {
  const colores: Record<ColorCinturon, string> = {
    blanco: "#f5f5f5",
    azul: "#2563eb",
    violeta: "#7c3aed",
    marron: "#92400e",
    negro: "#171717",
  };
  return colores[color];
}

export function getColorTailwind(color: ColorCinturon): string {
  const colores: Record<ColorCinturon, string> = {
    blanco: "bg-gray-100 border-gray-300 text-gray-800",
    azul: "bg-blue-600 text-white",
    violeta: "bg-violet-600 text-white",
    marron: "bg-amber-800 text-white",
    negro: "bg-neutral-900 text-white border border-neutral-600",
  };
  return colores[color];
}

export function getColorTexto(color: ColorCinturon): string {
  const colores: Record<ColorCinturon, string> = {
    blanco: "text-gray-600",
    azul: "text-blue-600",
    violeta: "text-violet-600",
    marron: "text-amber-800",
    negro: "text-neutral-400",
  };
  return colores[color];
}

export function getLabelCinturon(color: ColorCinturon, grado: Grado): string {
  return `Cinturón ${color.charAt(0).toUpperCase() + color.slice(1)} - ${grado}° Grado`;
}
