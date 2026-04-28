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
    <div className="min-h-screen bg-white">
      <LandingNav />
      <LandingHero />
      <BentoGrid />
      <LandingFooter />
    </div>
  );
}