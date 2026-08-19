"use client";

import { useState, useRef } from "react";
import { supabase } from "@/libs/supabase";
import { Camera, Upload, X } from "lucide-react";

interface PhotoUploadProps {
  alumnoId: string;
  fotoUrl: string | null;
  onFotoActualizada: (url: string | null) => void;
}

export default function PhotoUpload({ alumnoId, fotoUrl, onFotoActualizada }: PhotoUploadProps) {
  const [subiendo, setSubiendo] = useState(false);
  const [preview, setPreview] = useState<string | null>(fotoUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten imágenes");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen no puede superar 2MB");
      return;
    }

    setSubiendo(true);

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    const extension = file.name.split(".").pop() || "jpg";
    const filePath = `${alumnoId}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("fotos-alumnos")
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.error("Error subiendo foto:", uploadError);
      alert("Error al subir la foto: " + uploadError.message);
      setSubiendo(false);
      setPreview(fotoUrl);
      return;
    }

    const { data } = supabase.storage.from("fotos-alumnos").getPublicUrl(filePath);
    const publicUrl = data.publicUrl + "?t=" + Date.now();

    const { error: updateError } = await supabase
      .from("alumnos")
      .update({ foto_url: publicUrl })
      .eq("id", alumnoId);

    if (updateError) {
      console.error("Error guardando URL:", updateError);
      alert("Foto subida pero no se pudo guardar: " + updateError.message);
    }

    onFotoActualizada(publicUrl);
    setSubiendo(false);
  }

  async function eliminarFoto() {
    if (!confirm("¿Eliminar la foto?")) return;

    setSubiendo(true);
    const extensiones = ["jpg", "jpeg", "png", "webp"];
    for (const ext of extensiones) {
      await supabase.storage.from("fotos-alumnos").remove([`${alumnoId}.${ext}`]);
    }

    await supabase.from("alumnos").update({ foto_url: null }).eq("id", alumnoId);

    setPreview(null);
    onFotoActualizada(null);
    setSubiendo(false);
  }

  return (
    <div className="relative shrink-0">
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-zinc-700 flex items-center justify-center cursor-pointer transition-all hover:border-red-500 ${
          subiendo ? "opacity-50" : ""
        }`}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Foto del alumno" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-zinc-500">
            <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[10px]">Foto</span>
          </div>
        )}

        {subiendo && (
          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="flex gap-1 mt-1.5 justify-center sm:absolute sm:-bottom-1 sm:-right-1 sm:justify-start sm:mt-0 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition-colors"
          title="Cambiar foto"
        >
          <Upload className="w-3 h-3" />
        </button>
        {preview && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              eliminarFoto();
            }}
            className="w-6 h-6 rounded-full bg-zinc-600 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
            title="Eliminar foto"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
