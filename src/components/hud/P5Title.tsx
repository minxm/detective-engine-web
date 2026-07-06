export default function P5Title({ children, className = '', red = false }: { children: React.ReactNode; className?: string; red?: boolean }) {
  return (
    <div className={`p5-title-wrap ${className}`}>
      <span className={`p5-title ${red ? 'p5-title-red' : ''}`}>{children}</span>
    </div>
  );
}
