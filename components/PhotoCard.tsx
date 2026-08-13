import { Photo } from "@/types";

export default function PhotoCard({ photo }: { photo: Photo }) {
  return (
    <article className="relative overflow-hidden bg-black aspect-[4/3] group">
      <img
        src={photo.src}
        alt={photo.alt}
        className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white/60 text-xs mt-0.5">{photo.placeLabel}</p>
      </div>
    </article>
  );
}
