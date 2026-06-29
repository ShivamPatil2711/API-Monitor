import { Link } from "react-router-dom";
const Footer=()=>{
  return (
     <footer className="border-t border-gray-200 py-6 bg-white mt-auto">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 font-mono text-[11px] text-gray-500">
          <span>© {new Date().getFullYear()} WatchAPI</span>
          <Link to="/" className="hover:text-gray-900">v0.1.0</Link>
        </div>
      </footer>
  )
}
export default Footer;