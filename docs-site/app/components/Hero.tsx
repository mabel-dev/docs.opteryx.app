import Image from 'next/image'

export default function Hero(){
  return (
    <section className="hero bg-white">
      <div className="hero-inner">
        <div className="hero-copy flex-1">
          <h1>Welcome to Opteryx Documentation</h1>
          <p className="lead">Fast, lightweight SQL analytics for your data — run queries locally or in the cloud.</p>
          <div className="hero-ctas">
            <a href="/docs/getting-started/quick-start" className="btn primary inline-block px-4 py-2 rounded-md bg-opteryx-teal text-white">Get started</a>
            <a href="/docs" className="btn inline-block px-4 py-2 rounded-md border border-gray-200">All docs</a>
          </div>
        </div>
        <div className="hero-art w-80">
          <img src="/docs/assets/images/hero-illustration.svg" alt="Opteryx illustration" loading="lazy" />
        </div>
      </div>
    </section>
  )
}
