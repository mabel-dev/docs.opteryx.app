/* Integrations.jsx — BI + source integrations card grid */
function Integrations() {
  const bi = [
    { initials: 'Ta', name: 'Tableau',   desc: 'Connect over standard ODBC.',      tag: 'BI' },
    { initials: 'Pb', name: 'Power BI',  desc: 'DirectQuery via Opteryx gateway.', tag: 'BI' },
    { initials: 'Lk', name: 'Looker',    desc: 'LookML over our SQL dialect.',     tag: 'BI' },
    { initials: 'Md', name: 'Metabase',  desc: 'Community-supported driver.',      tag: 'BI' },
    { initials: 'S3', name: 'Amazon S3', desc: 'Read Parquet directly.',           tag: 'Source' },
    { initials: 'Gc', name: 'GCS',       desc: 'Read Parquet directly.',           tag: 'Source' },
    { initials: 'Py', name: 'Python',    desc: 'pip install opteryx.',             tag: 'Source' },
    { initials: 'OD', name: 'OData',     desc: 'Read-only v4 endpoint.',           tag: 'Protocol' },
  ];
  return (
    <section id="integrations" className="block alt">
      <div className="wrap">
        <div className="section-head">
          <div className="label">Integrations</div>
          <h2>Bring your own BI tool. And your own storage.</h2>
          <p>
            Opteryx is a BI-backend-first warehouse. Connect Tableau, Power BI, or Looker,
            and point us at the Parquet already sitting in your own object store.
          </p>
        </div>
        <div className="integrations-grid">
          {bi.map(i => (
            <div key={i.name} className="integration">
              <div className="logo-box">{i.initials}</div>
              <div className="name">{i.name}</div>
              <div className="desc">{i.desc}</div>
              <div className="tag">{i.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.Integrations = Integrations;
