import {
  Building2,
  Trash2,
  Recycle,
  TriangleAlert,
  Search,
  Pencil,
  Trash,
  House,
} from "lucide-react";


export default function Home() {
  return (
    <div className="app">
      <div className="phone-layout">

        {/* NAVBAR */}
        <nav className="navbar">
          <button className="home-button">
            <House size={18} />
          </button>
        </nav>

        {/* HERO */}
        <section className="hero-container">

          <div className="hero-content">

            <span className="hero-badge">
              Gestão de Resíduos
            </span>

            <div className="hero-text">
              <h1>ECORECICLA</h1>

              <p>
                Plataforma para monitoramento de resíduos recicláveise acompanhamento de metas ambientais.
              </ p>
            </div>

          </div>

          <div className="hero-icon">
          </div>

        </section>

      </div>
    </div>
  );
}