import { Utensils, Pizza, Apple, Cake, ArrowRight } from 'lucide-react';

export default function LandingPageComponent({ onNavigateAuth }) {
  return (
    <div className="hero-container animate-fade-in">
      <div className="hero-content stagger-1">
        <h1 className="hero-title">Redistribute Food.<br/>Reduce Waste.</h1>
        <p className="hero-subtitle stagger-2">
          A minimalist platform connecting surplus food directly to the organizations that need it most. Elegantly simple, exceptionally impactful.
        </p>
        <div className="hero-buttons flex gap-4 stagger-3">
          <button className="btn btn-primary" onClick={onNavigateAuth}>
            Get Started <ArrowRight size={18} />
          </button>
        </div>
      </div>
      <div className="hero-art stagger-4">
        {/* Abstract floating minimal monochrome icons */}
        <Utensils className="art-element" size={180} style={{ top: '10%', left: '20%', animationDelay: '0s' }} strokeWidth={1} />
        <Pizza className="art-element" size={140} style={{ top: '40%', right: '10%', animationDelay: '2s' }} strokeWidth={1} />
        <Apple className="art-element" size={100} style={{ bottom: '10%', left: '30%', animationDelay: '4s' }} strokeWidth={1} />
        <Cake className="art-element" size={80} style={{ top: '60%', left: '10%', animationDelay: '1s' }} strokeWidth={1} />
      </div>
    </div>
  );
}
