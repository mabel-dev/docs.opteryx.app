/* CtaStrip.jsx + Footer.jsx */
function CtaStrip() {
  return (
    <section className="cta-strip">
      <div className="wrap">
        <h2>Make your data work harder.</h2>
        <p>Opteryx gives BI teams the governance of a warehouse and the cost story of object storage.</p>
        <div className="buttons">
          <a href="#waitlist" className="btn-navy btn-w">Start for free</a>
          <a href="#contact" className="btn-navy btn-o">Talk to the team</a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <BrandMark size={28} />
              <span className="name">Opteryx</span>
            </div>
            <p>A read-only analytical query engine for Parquet-lake analytics. Built by Mabel.</p>
          </div>
          <div className="foot-col">
            <h5>Product</h5>
            <a href="#">Studio</a>
            <a href="#">Connectors</a>
            <a href="#">Pricing</a>
            <a href="#">Changelog</a>
          </div>
          <div className="foot-col">
            <h5>Developers</h5>
            <a href="#">Documentation</a>
            <a href="#">SQL reference</a>
            <a href="#">Python client</a>
            <a href="#">Status</a>
          </div>
          <div className="foot-col">
            <h5>Company</h5>
            <a href="#">About</a>
            <a href="#">Security</a>
            <a href="#">Contact</a>
            <a href="#">Careers</a>
          </div>
        </div>
        <div className="foot-legal">
          <span>© 2026 Mabel. All rights reserved.</span>
          <span>Privacy · Terms · Acceptable use</span>
        </div>
      </div>
    </footer>
  );
}

window.CtaStrip = CtaStrip;
window.Footer = Footer;
