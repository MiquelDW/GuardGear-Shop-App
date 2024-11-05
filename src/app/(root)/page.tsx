import CallToAction from "@/components/LandingPage/CallToAction";
import HeroSection from "@/components/LandingPage/HeroSection";
import ValueProposition from "@/components/LandingPage/ValueProposition";

const Home = () => {
  return (
    <div className="bg-slate-50">
      <HeroSection />
      <ValueProposition />
      <CallToAction />
    </div>
  );
};

export default Home;
