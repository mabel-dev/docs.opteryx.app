export default function Footer(){
  return (
    <footer className="w-full border-t bg-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 text-sm text-gray-600">
        <div className="flex flex-col md:flex-row md:justify-between">
          <div>© {new Date().getFullYear()} Opteryx</div>
          <div className="mt-3 md:mt-0">Built with ❤️ — Opteryx Docs</div>
        </div>
      </div>
    </footer>
  )
}
