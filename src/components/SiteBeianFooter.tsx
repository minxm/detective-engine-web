import {
  ICP_BEIAN_NUMBER,
  ICP_BEIAN_URL,
  PSB_BEIAN_ICON_URL,
  PSB_BEIAN_NUMBER,
  PSB_BEIAN_URL,
} from '@/config/beian';

export default function SiteBeianFooter() {
  return (
    <footer className="site-beian-footer" aria-label="网站备案信息">
      <span>ICP备案/许可证号：</span>
      <a href={ICP_BEIAN_URL} target="_blank" rel="noopener noreferrer">
        {ICP_BEIAN_NUMBER}
      </a>
      <span className="site-beian-sep" aria-hidden>
        ·
      </span>
      <a
        href={PSB_BEIAN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="site-beian-psb"
      >
        <img src={PSB_BEIAN_ICON_URL} alt="" width={16} height={16} loading="lazy" />
        {PSB_BEIAN_NUMBER}
      </a>
    </footer>
  );
}
