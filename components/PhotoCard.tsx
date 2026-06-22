import Image from "next/image";
import { Photo } from "@/types";

export default function PhotoCard({ photo }: { photo: Photo }) {
  return (
    <article className="relative overflow-hidden bg-zinc-900 aspect-[3/2] group">
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white text-sm font-medium leading-tight">{photo.title}</p>
        <p className="text-white/60 text-xs mt-0.5">{photo.placeLabel}</p>
      </div>
    </article>
  );
}
