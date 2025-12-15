import Header from "./components/Header";
import Footer from "./components/Footer";
import BrowseRange from "./components/Home/BrowseRange";
import OurProducts from "./components/Home/OurProduct";
import Inspirations from "./components/Home/Inspirations";
import PremiumSofaShowcase from "./components/Home/PremiumSofaShowcase";
import GlobalLoader from "./components/GlobalLoader";
import FeaturesSection from "./components/FeaturesSection";
import FurnitureHero from "./components/Home/FurnitureHero";
import IconCategoryRow from "./components/Home/IconCategoryRow";
import Testimonials from "./components/Home/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <GlobalLoader />
      <Header />
      <main className="flex-1">
        <FurnitureHero />
        <PremiumSofaShowcase />
        <IconCategoryRow />
        <BrowseRange />
        <OurProducts />
        <Inspirations />
        <FeaturesSection />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
