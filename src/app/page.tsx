import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LandingHero } from "@/components/landing/LandingHero";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";

export default async function Home() {
  const { userId } = await auth();

  // Login olmuş kullanıcıyı doğrudan boards'a yönlendir
  if (userId) {
    redirect("/boards");
  }

  return (
    <div className="relative min-h-screen bg-white">
      {/* Glow container — kendi içinde overflow gizler */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        {/* Üst sol — violet, daha güçlü */}
        <div className="absolute -left-[10%] top-[-10%] h-[700px] w-[700px] rounded-full bg-violet-400/30 blur-[100px]" />

        {/* Üst sağ — fuchsia */}
        <div className="absolute right-[-10%] top-[5%] h-[600px] w-[600px] rounded-full bg-fuchsia-300/25 blur-[100px]" />

        {/* Orta — blue accent */}
        <div className="absolute left-1/2 top-[40%] h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-300/20 blur-[120px]" />

        {/* Alt — pink accent */}
        <div className="absolute right-[20%] bottom-[10%] h-[500px] w-[500px] rounded-full bg-pink-300/20 blur-[120px]" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgb(15 23 42) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <LandingNav />
      <LandingHero />
      <BentoGrid />
      <LandingFooter />
    </div>
  );
}