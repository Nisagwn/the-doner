import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AssemblyLog from "@/components/AssemblyLog";
import FinalStack from "@/components/FinalStack";
import OrderBuilder from "@/components/OrderBuilder";
import MenuGrid from "@/components/MenuGrid";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-void">
      <Navbar />
      <Hero />
      <AssemblyLog />
      <FinalStack />
      <OrderBuilder />
      <MenuGrid />
      <Footer />
    </main>
  );
}
