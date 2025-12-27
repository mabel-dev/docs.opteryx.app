import Image from 'next/image'

export default function Hero(){
  return (
    <section className="hero relative bg-gradient-to-b from-white to-transparent py-20">
      <div className="hero-inner">
        <div className="hero-copy flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl leading-tight">Fast, lightweight SQL analytics<br className="hidden md:inline"/> for your data</h1>
          <p className="lead mt-4 max-w-2xl mx-auto md:mx-0">Run queries locally or in the cloud with minimal fuss — great for exploration, monitoring, and embedding into pipelines.</p>
          <div className="hero-ctas mt-6 flex justify-center md:justify-start gap-3">
            <a href="/docs/getting-started/quick-start" className="btn primary inline-block px-6 py-3 rounded-md bg-opteryx-teal text-white font-semibold">Get started</a>
            <a href="/docs" className="btn inline-block px-5 py-3 rounded-md border border-gray-200 bg-white">All docs</a>
          </div>
        </div>
        <div className="hero-art hidden md:block flex-none" aria-hidden>
          <img src="/docs/assets/images/hero-illustration.svg" alt="" loading="lazy" className="w-96" />
        </div>
      </div>
      <div className="hero-decor">
        <img src="/docs/assets/images/hero-illustration.svg" alt="" />
      </div>
    </section>
  )
}
