/* Nav.jsx */
function BrandMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="300 310 1420 1420">
      <rect fill="#07797C" x="300" y="310" width="1420" height="1420" rx="165" ry="165" />
      <g fill="#FFFFFF">
        <polygon points="718.6,837.06 651.19,666.76 392.74,628.06 555.18,887.01 555.56,887.61 776.33,1077.22 759.67,900.82" />
        <path d="M1403.02,1110.35l-359.82-96.07l194.34-111.64l276.03-220.13l0.54-0.43l77.43-112.13l-500.94,91.17l-1.67,0.31L891.97,900.04l25.22-196.91l-21.44-90.03l-128.98,83.28l-36.69,100.49l81.83-24.91L778.25,917l-0.17,0.74L795.03,1097L987,1208.71l-10.81-53.46l90.16,127.83l-4.67,106.63c-19.2,0.56-34.64,16.35-34.64,35.68v4.66h29.31l0,0.01h43.78l57.89-234.19l256.95-17.4l1.31-0.09l190.99-135.08L1403.02,1110.35z" />
        <path d="M899.89,1191.19l34.94,89.51l-59.53,108.99h-7.97c-19.68,0-35.7,16.01-35.7,35.7v4.66h65.6l105.18-152.6l-9.51-46.37L899.89,1191.19z" />
      </g>
    </svg>
  );
}

function Nav() {
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <a href="#" className="nav-logo">
          <BrandMark size={28} />
          <span>Opteryx</span>
        </a>
        <div className="nav-links">
          <a href="#product">Product</a>
          <a href="#integrations">Integrations</a>
          <a href="#pricing">Pricing</a>
          <a href="#docs">Docs</a>
          <a href="#company">Company</a>
        </div>
        <div className="nav-cta">
          <a href="#signin" className="btn-secondary">Sign in</a>
          <a href="#waitlist" className="btn-navy">Join the waitlist</a>
        </div>
      </div>
    </nav>
  );
}

window.Nav = Nav;
window.BrandMark = BrandMark;
