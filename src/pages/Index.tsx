import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import InfoCards from "@/components/InfoCards";
import HomeDoodles from "@/components/HomeDoodles";
import SecretaryGeneralNote from "@/components/SecretaryGeneralNote";

const Index = () => {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <HomeDoodles />
      <Hero />
      <InfoCards />
      <SecretaryGeneralNote />
      <footer className="px-6 py-10 text-center text-white/60 text-sm">
        © {new Date().getFullYear()} DPS AMUN — Model United Nations
      </footer>
    </main>
  );
};

export default Index;
