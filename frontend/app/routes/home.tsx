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
import React, { useState } from "react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [generatedWaste, setGeneratedWaste] = useState("");
  const [recycledWaste, setRecycledWaste] = useState("");

  const generated = Number(generatedWaste);
  const recycled = Number(recycledWaste);

  const recyclingRate =
    generated > 0
      ? ((recycled / generated) * 100).toFixed(1)
      : 0;

  const isAboveAverage = Number(recyclingRate) >= 25;

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

        <div className="container">

          {/* CARDS */}
          <div className="cards-grid">

            <div className="dashboard-card">
              <div className="card-header">
                <h3>Municípios registrados</h3>
              </div>

              <div
                className="card-value"
                style={{ color: "#1593ff" }}
              >
                10
              </div>

              <div
                className="card-line"
                style={{ background: "#1593ff" }}
              />
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h3>Resíduos gerados (mil t)</h3>
              </div>

              <div
                className="card-value"
                style={{ color: "#f58b00" }}
              >
                55.4
              </div>

              <div
                className="card-line"
                style={{ background: "#f58b00" }}
              />
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h3>Total reciclado(mil t)</h3>
              </div>
              <div
                className="card-value"
                style={{ color: "#7ad600" }}
              >
                55.4
              </div>

              <div
                className="card-line"
                style={{ background: "#7ad600" }}
              />
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h3>Abaixo da média (mil t)</h3>
              </div>

              <div
                className="card-value"
                style={{ color: "#d8cf00" }}
              >
                55.4
              </div>

              <div
                className="card-line"
                style={{ background: "#d8cf00" }}
              />
            </div>

          </div>

          {/* TAXA */}
          <section className="progress-card">

            <div className="progress-circle-content">
              <div className="progress-circle">
                <span>20.6%</span>
              </div>

              <div className="progress-content">
                <h2>Taxa média de reciclagem</h2>
                <p>Meta nacional: 25%</p>
              </div>
            </div>

            <div className="progress-status">
              <span>Abaixo da meta</span>
              <small>COBERTURA 10.25 t</small>
            </div>

          </section>


          {/* FILTROS */}
          <section className="filters-container">

            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar município"
              />

              <Search size={18} />
            </div>

            <select>
              <option>Estado</option>
              <option>SP</option>

            </select>

            <button className="filter-button">
              <TriangleAlert size={16} />
              Abaixo da média
            </button>

            <button
              className="new-button"
              onClick={() => setIsModalOpen(true)}
            >
              Novo +
            </button>

          </section>


          {/* TABELA */}
          <div className="table-container">

            <table>

              <thead>
                <tr>
                  <th>MUNICÍPIO</th>
                  <th>ESTADO</th>
                  <th>ANO</th>
                  <th>GERADO (t)</th>
                  <th>RECICLADO</th>
                  <th>TAXA</th>
                  <th>STATUS</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>

              <tbody>

                {[1, 2, 3].map((item) => (
                  <tr key={item}>

                    <td>Campinas</td>
                    <td>SP</td>
                    <td>2023</td>
                    <td>3.200</td>

                    <td className="green-text">
                      896
                    </td>

                    <td>28.0%</td>

                    <td className="status-text">
                      Atingido
                    </td>

                    <td>

                      <div className="actions">

                        <button className="edit-btn">
                          <Pencil size={14} />
                        </button>

                        <button className="delete-btn">
                          <Trash size={14} />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        </div>
        {/* MODAL */}

        {
          isModalOpen && (

            <div className="modal-overlay">

              <div className="modal-container">

                {/* HEADER */}

                <div className="modal-header">

                  <h2>Novo Registro</h2>

                  <button
                    className="close-modal"
                    onClick={() => setIsModalOpen(false)}
                  >
                    ✕
                  </button>

                </div>

                {/* FORM */}

                <form className="modal-form">

                  <div className="form-group">

                    <label>Município</label>

                    <input
                      type="text"
                      placeholder="Digite o município"
                    />

                  </div>

                  <div className="form-group">

                    <label>Estado</label>

                    <select>
                      <option>Selecione</option>
                      <option>SP</option>
                      <option>RJ</option>
                      <option>MG</option>
                    </select>

                  </div>

                  <div className="form-group">

                    <label>Ano de referência</label>

                    <input
                      type="number"
                      placeholder="2024"
                    />

                  </div>

                  <div className="form-group">

                    <label>Resíduos gerados (t)</label>

                    <input
                      type="number"
                      placeholder="0.0"
                      value={generatedWaste}
                      onChange={(e) => setGeneratedWaste(e.target.value)}
                    />
                  </div>

                  <div className="form-group">

                    <label>Resíduos reciclados (t)</label>

                    <input
                      type="number"
                      placeholder="0.0"
                      value={recycledWaste}
                      onChange={(e) => setRecycledWaste(e.target.value)}
                    />
                  </div>

                  {/*resultado da taxa*/}
                  <div className="rate-preview">

                    <h3>Taxa de reciclagem</h3>

                    <div className="rate-value">
                      {recyclingRate}%
                    </div>

                    <span
                      className={
                        isAboveAverage
                          ? "rate-status success"
                          : "rate-status warning"
                      }
                    >
                      {
                        isAboveAverage
                          ? "Acima da média nacional"
                          : "Abaixo da média nacional"
                      }
                    </span>

                  </div>

                  {/* ACTIONS */}

                  <div className="modal-actions">

                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="save-button"
                    >
                      Salvar
                    </button>

                  </div>

                </form>

              </div>

            </div>

          )
        }


      </div>
    </div>
  );
}