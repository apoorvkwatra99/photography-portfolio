import { photos } from "@/data/photos";
import Gallery from "@/components/Gallery";
import InfoNote from "@/components/InfoNote";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-black">
      <div className="flex-1">
        <Gallery photos={photos} />
      </div>
      <InfoNote />
    </main>
  );
}
