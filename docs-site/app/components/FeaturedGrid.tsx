type Card = { title: string, desc: string, href: string, icon?: string }

export default function FeaturedGrid({ cards }: { cards: Card[] }){
  return (
    <section className="featured-grid" aria-labelledby="featured-resources">
      <div className="max-w-7xl mx-auto px-4">
        <h2 id="featured-resources" className="text-2xl font-semibold">Featured resources</h2>
        <p className="text-sm text-gray-500 mt-2">Dive into our top picks</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(c => (
          <a key={c.title} href={c.href} className="card block">
            {c.icon && <img src={c.icon} alt="" className="w-10 h-10" />}
            <h3 className="text-lg font-medium">{c.title}</h3>
            <p className="text-sm text-gray-600 mt-2">{c.desc}</p>
          </a>
        ))}
      </div>
    </section>
  )
}
