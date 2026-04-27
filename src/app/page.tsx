import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { GeneratorCard } from "@/components/sections/GeneratorCard";
import { Hero } from "@/components/sections/Hero";

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <GeneratorCard />
      </main>
      <Footer />
    </div>
  );
}
