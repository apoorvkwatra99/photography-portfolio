import { Photo } from "@/types";
import PhotoCard from "@/components/PhotoCard";

export default function PhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}
