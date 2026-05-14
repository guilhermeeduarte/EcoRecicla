import '../styles/app.css'
import { House } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="navbar">
      <button className="home-button">
        <House size={18} />
      </button>
    </nav>
  )
}