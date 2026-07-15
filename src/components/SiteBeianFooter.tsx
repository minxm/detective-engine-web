import {
  ICP_BEIAN_NUMBER,
  ICP_BEIAN_URL,
  PSB_BEIAN_NUMBER,
  PSB_BEIAN_URL,
} from '@/config/beian';

function PsbBeianIcon() {
  return (
    <svg
      className="site-beian-psb-icon"
      viewBox="0 0 20 20"
      width={16}
      height={16}
      aria-hidden
    >
      <circle cx="10" cy="10" r="9" fill="#C9A227" />
      <circle cx="10" cy="10" r="7.25" fill="#1E3A8A" />
      <path
        d="M10 4.5l1.2 2.8h3l-2.4 1.8.9 2.9L10 10.2 7.3 11.9l.9-2.9-2.4-1.8h3L10 4.5z"
        fill="#F8D34A"
      />
    </svg>
  );
}

export default function SiteBeianFooter() {
  return (
    <footer className="site-beian-footer" aria-label="网站备案信息">
      <span className="site-beian-label">ICP备案/许可证号：</span>
      <a href={ICP_BEIAN_URL} target="_blank" rel="noopener noreferrer">
        {ICP_BEIAN_NUMBER}
      </a>
      <span className="site-beian-sep" aria-hidden>
        |
      </span>
      <a
        href={PSB_BEIAN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="site-beian-psb"
      >
        <PsbBeianIcon />
        {PSB_BEIAN_NUMBER}
      </a>
    </footer>
  );
}
