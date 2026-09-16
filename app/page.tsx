import { photos } from "@/data/photos";
import Gallery from "@/components/Gallery";
import InfoNote from "@/components/InfoNote";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Gallery photos={photos} />
      <InfoNote />
    </main>
  );
}
