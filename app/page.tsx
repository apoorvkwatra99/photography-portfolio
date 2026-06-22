import { photos } from "@/data/photos";
import PhotoGrid from "@/components/PhotoGrid";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <header className="px-6 py-8">
        <h1 className="text-white/90 text-sm font-medium tracking-widest uppercase">
          Portfolio
        </h1>
      </header>
      <main>
        <PhotoGrid photos={photos} />
      </main>
    </div>
  );
}
