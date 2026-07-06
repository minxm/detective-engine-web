export default function HomeAtmosphere() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="hero-glow-orb w-[600px] h-[400px] -top-32 left-1/2 -translate-x-1/2 bg-blue-500/20" />
      <div className="hero-glow-orb w-[300px] h-[300px] top-1/4 -right-20 bg-red-500/10 animation-delay-1000" style={{ animationDelay: '1s' }} />
    </div>
  );
}
