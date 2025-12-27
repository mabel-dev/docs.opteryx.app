type Card = { title: string, desc: string, href: string, icon?: string }

export default function FeaturedGrid({ cards }: { cards: Card[] }){
  return (
    <section className="featured-grid py-12" aria-labelledby="featured-resources">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 id="featured-resources" className="text-2xl font-semibold">Featured resources</h2>
        <p className="text-sm text-gray-500 mt-2">Dive into our top picks</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(c => (
          <a key={c.title} href={c.href} className="card card-snow block p-6 hover:shadow-lg focus:outline-none" tabIndex={0}>
            <div className="flex items-start gap-4">
              {c.icon && <img src={c.icon} alt="" className="w-12 h-12 flex-none" />}
              <div>
                <h3 className="text-lg font-medium">{c.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{c.desc}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
