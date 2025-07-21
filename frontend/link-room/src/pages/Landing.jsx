import Hero from "../components/Hero";
import Features from "../components/Features";
import Stats from "../components/Stats";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

const Landing = () => {
    return (
        <div className="min-h-screen">
            <Hero />
            <Stats />
            <Features />
            <CTA />
            <Footer />
        </div>
    );
};

export default Landing;