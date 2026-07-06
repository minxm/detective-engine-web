export default function MysteryBackdrop() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.18),transparent_55%)]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-[radial-gradient(circle,rgba(239,68,68,0.08),transparent_70%)]" />
      <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(251,191,36,0.05),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,8,16,0.55)_100%)]" />
    </div>
  );
}
