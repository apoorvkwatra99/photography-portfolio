import { photos } from "@/data/photos";
import Gallery from "@/components/Gallery";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Gallery photos={photos} />
    </main>
  );
}
