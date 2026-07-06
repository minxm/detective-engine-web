/** 证据板红线装饰 */
export default function EvidenceBoardDecor() {
  return (
    <svg className="evidence-board-lines pointer-events-none absolute inset-0 w-full h-full opacity-20" aria-hidden>
      <line x1="15%" y1="20%" x2="45%" y2="35%" stroke="#E50914" strokeWidth="1" />
      <line x1="45%" y1="35%" x2="75%" y2="25%" stroke="#E50914" strokeWidth="1" />
      <line x1="45%" y1="35%" x2="55%" y2="65%" stroke="#E50914" strokeWidth="0.8" strokeDasharray="4 4" />
      <line x1="25%" y1="70%" x2="55%" y2="65%" stroke="#E50914" strokeWidth="0.8" />
      <circle cx="15%" cy="20%" r="4" fill="#E50914" opacity="0.6" />
      <circle cx="45%" cy="35%" r="4" fill="#E50914" opacity="0.6" />
      <circle cx="75%" cy="25%" r="4" fill="#E50914" opacity="0.6" />
    </svg>
  );
}
