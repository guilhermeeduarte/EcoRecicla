import {
  Building2,
  Trash2,
  Recycle,
  TriangleAlert,
  Search,
  Pencil,
  Trash,
  House,
  Leaf,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/residuos";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedWaste, setGeneratedWaste] = useState("");
  const [recycledWaste, setRecycledWaste] = useState("");
  const [editingData, setEditingData] = useState(null);
  const [municipio, setMunicipio] = useState("");
  const [estado, setEstado] = useState("");
  const [ano, setAno] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [residuos, setResiduos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [onlyBelowMeta, setOnlyBelowMeta] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [csvFile, setCsvFile] = useState(null);

  const generated = Number(generatedWaste);
  const recycled = Number(recycledWaste);

  const recyclingRate =
    generated > 0
      ? ((recycled / generated) * 100).toFixed(1)
      : "0.0";

  const isAboveAverage = Number(recyclingRate) >= 25;
  const metaPercent = 25;

  const formatNumber = (value) =>
    Number(value).toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

  const loadResiduos = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("N�o foi poss�vel carregar os res�duos");
      }
      const data = await response.json();
      setResiduos(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao carregar registros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResiduos();
  }, []);

  const filteredResiduos = useMemo(() => {
    return residuos.filter((item) => {
      const matchesSearch = item.municipio
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesEstado = estadoFiltro
        ? item.estado === estadoFiltro
        : true;
      const matchesMeta = onlyBelowMeta
        ? Number(item.taxaReciclagem) < metaPercent
        : true;

      return matchesSearch && matchesEstado && matchesMeta;
    });
  }, [residuos, searchQuery, estadoFiltro, onlyBelowMeta]);

  const estados = useMemo(
    () => [...new Set(residuos.map((item) => item.estado))].sort(),
    [residuos]
  );

  const totalMunicipios = useMemo(
    () => new Set(residuos.map((item) => item.municipio)).size,
    [residuos]
  );

  const totalGerado = useMemo(
    () =>
      residuos.reduce(
        (sum, item) => sum + Number(item.quantidadeGerada || 0),
        0
      ),
    [residuos]
  );

  const totalReciclado = useMemo(
    () =>
      residuos.reduce(
        (sum, item) =>
          sum +
          (Number(item.quantidadeGerada || 0) * Number(item.taxaReciclagem || 0)) /
            100,
        0
      ),
    [residuos]
  );

  const averageTax = useMemo(
    () =>
      residuos.length
        ? (
            residuos.reduce(
              (sum, item) => sum + Number(item.taxaReciclagem || 0),
              0
            ) / residuos.length
          ).toFixed(1)
        : "0.0",
    [residuos]
  );

  const belowMetaCount = useMemo(
    () =>
      residuos.filter((item) => Number(item.taxaReciclagem) < metaPercent).length,
    [residuos]
  );

  const handleEdit = (item) => {
    setEditingData(item);
    setMunicipio(item.municipio);
    setEstado(item.estado);
    setAno(String(item.ano));
    setGeneratedWaste(String(item.quantidadeGerada || ""));
    const reciclado =
      Number(item.quantidadeGerada || 0) * Number(item.taxaReciclagem || 0) / 100;
    setRecycledWaste(String(reciclado));
    setError("");
    setIsModalOpen(true);
  };

  const openNewRecord = () => {
    setEditingData(null);
    setMunicipio("");
    setEstado("");
    setAno("");
    setGeneratedWaste("");
    setRecycledWaste("");
    setError("");
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setMunicipio("");
    setEstado("");
    setAno("");
    setGeneratedWaste("");
    setRecycledWaste("");
    setEditingData(null);
    setDeleteTarget(null);
    setIsModalOpen(false);
    setDeleteModalOpen(false);
    setError("");
  };

  const handleDelete = (item) => {
    setDeleteTarget(item);
    setDeleteModalOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");

    if (!municipio || !estado || !ano || generated <= 0 || recycled < 0) {
      setError("Preencha todos os campos corretamente antes de salvar.");
      return;
    }

    const payload = {
      municipio,
      estado,
      ano: Number(ano),
      quantidadeGerada: Number(generatedWaste),
      taxaReciclagem: Number(recyclingRate),
    };

    try {
      const url = editingData ? `${API_URL}/${editingData.id}` : API_URL;
      const method = editingData ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => null);
        throw new Error(details?.message || "Falha ao salvar o registro.");
      }

      resetForm();
      loadResiduos();
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao salvar registro.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao excluir o registro.");
      }

      resetForm();
      loadResiduos();
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao excluir registro.");
    }
  };

  const handleFileSelection = (event) => {
    setError("");
    const file = event.target.files?.[0] || null;
    if (file && !file.name.toLowerCase().endsWith(".csv")) {
      setError("Selecione um arquivo CSV válido.");
      setCsvFile(null);
      return;
    }
    setCsvFile(file);
  };

  const handleImportCsv = async () => {
    if (!csvFile) {
      setError("Selecione um arquivo CSV antes de importar.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("arquivo", csvFile);

      const response = await fetch(`${API_URL}/importar-csv`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const details = await response.json().catch(() => null);
        throw new Error(details?.message || "Falha ao importar CSV.");
      }

      const imported = await response.json();
      setResiduos(imported);
      setCsvFile(null);
      setError(`Importação concluída: ${imported.length} registros importados.`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao importar CSV.");
    } finally {
      setLoading(false);
    }
  };

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
              <Leaf size={18} />
              <h4>Gest�o de Res�duos</h4>
            </span>

            <div className="hero-text">
              <h1>ECORECICLA</h1>
              <p>
                Plataforma para monitoramento de res�duos recicl�veis e acompanhamento de metas ambientais.
              </p>
            </div>
          </div>

          <div className="hero-icon"></div>
        </section>

        <div className="container">
          {error && <div className="error-banner">{error}</div>}
          {loading && <div className="loading-banner">Carregando dados...</div>}

          {/* CARDS */}
          <div className="cards-grid">
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Munic�pios registrados</h3>
                <Building2 size={34} color="#1593ff" />
              </div>
              <div className="card-value" style={{ color: "#1593ff" }}>
                {totalMunicipios}
              </div>
              <div className="card-line" style={{ background: "#1593ff" }} />
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h3>Res�duos gerados (t)</h3>
                <Trash2 size={34} color="#f58b00" />
              </div>
              <div className="card-value" style={{ color: "#f58b00" }}>
                {formatNumber(totalGerado)}
              </div>
              <div className="card-line" style={{ background: "#f58b00" }} />
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h3>Total reciclado (t)</h3>
                <Recycle size={34} color="#7ad600" />
              </div>
              <div className="card-value" style={{ color: "#7ad600" }}>
                {formatNumber(totalReciclado)}
              </div>
              <div className="card-line" style={{ background: "#7ad600" }} />
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h3>Abaixo da m�dia</h3>
                <TriangleAlert size={34} color="#d8cf00" />
              </div>
              <div className="card-value" style={{ color: "#d8cf00" }}>
                {belowMetaCount}
              </div>
              <div className="card-line" style={{ background: "#d8cf00" }} />
            </div>
          </div>

          {/* TAXA */}
          <section className="progress-card">
            <div className="progress-circle-content">
              <div className="progress-circle">
                <span>{averageTax}%</span>
              </div>
              <div className="progress-content">
                <h2>Taxa m�dia de reciclagem</h2>
                <p>Meta nacional: {metaPercent}%</p>
              </div>
            </div>
            <div className="progress-status">
              <span>{averageTax >= metaPercent ? "Meta atingida" : "Abaixo da meta"}</span>
              <small>Registros analisados: {residuos.length}</small>
            </div>
          </section>

          {/* FILTROS */}
          <section className="filters-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar munic�pio"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={18} />
            </div>

            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="">Todos os estados</option>
              {estados.map((estadoItem) => (
                <option key={estadoItem} value={estadoItem}>
                  {estadoItem}
                </option>
              ))}
            </select>

            <button
              className={onlyBelowMeta ? "filter-button active" : "filter-button"}
              onClick={() => setOnlyBelowMeta(!onlyBelowMeta)}
              type="button"
            >
              <TriangleAlert size={16} />
              {onlyBelowMeta ? "Mostrar tudo" : "Abaixo da m�dia"}
            </button>

            <div className="import-controls">
              <label className="file-upload-label" htmlFor="csv-upload">
                {csvFile ? csvFile.name : "Selecionar CSV"}
              </label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileSelection}
                style={{ display: "none" }}
              />
              <button
                className="import-button"
                onClick={handleImportCsv}
                type="button"
              >
                Importar CSV
              </button>
            </div>

            <button className="new-button" onClick={openNewRecord} type="button">
              Novo +
            </button>
          </section>

          {/* TABELA */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>MUNIC�PIO</th>
                  <th>ESTADO</th>
                  <th>ANO</th>
                  <th>GERADO (t)</th>
                  <th>RECICLADO (t)</th>
                  <th>TAXA</th>
                  <th>STATUS</th>
                  <th>A��ES</th>
                </tr>
              </thead>
              <tbody>
                {filteredResiduos.length > 0 ? (
                  filteredResiduos.map((item) => {
                    const recicladoValue =
                      (Number(item.quantidadeGerada || 0) * Number(item.taxaReciclagem || 0)) /
                      100;
                    return (
                      <tr key={item.id}>
                        <td>{item.municipio}</td>
                        <td>{item.estado}</td>
                        <td>{item.ano}</td>
                        <td>{formatNumber(item.quantidadeGerada)}</td>
                        <td className="green-text">{formatNumber(recicladoValue)}</td>
                        <td>{Number(item.taxaReciclagem).toFixed(1)}%</td>
                        <td className="status-text">
                          {Number(item.taxaReciclagem) >= metaPercent ? "Atingido" : "Abaixo"}
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              className="edit-btn"
                              onClick={() => handleEdit(item)}
                              type="button"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDelete(item)}
                              type="button"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="empty-row">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <Leaf size={18} />
              </div>
              <div className="footer-text">
                <h3>ECORECICLA</h3>
                <p>
                  Plataforma de monitoramento de res�duos recicl�veis e sustentabilidade ambiental.
                </p>
              </div>
            </div>
            <div className="footer-bottom">
              <span>� 2026 Ecorecicla � Todos os direitos reservados</span>
            </div>
          </div>
        </footer>

        {/* MODAL */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h2>{editingData ? "Editar Registro" : "Novo Registro"}</h2>
                <button className="close-modal" onClick={resetForm} type="button">
                  ?
                </button>
              </div>
              <form className="modal-form" onSubmit={handleSave}>
                <div className="form-group">
                  <label>Munic�pio</label>
                  <input
                    type="text"
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="SP">SP</option>
                    <option value="RJ">RJ</option>
                    <option value="MG">MG</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ano de refer�ncia</label>
                  <input
                    type="number"
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Res�duos gerados (t)</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={generatedWaste}
                    onChange={(e) => setGeneratedWaste(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Res�duos reciclados (t)</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={recycledWaste}
                    onChange={(e) => setRecycledWaste(e.target.value)}
                  />
                </div>
                <div className="rate-preview">
                  <h3>Taxa de reciclagem</h3>
                  <div className="rate-value">{recyclingRate}%</div>
                  <span
                    className={
                      isAboveAverage ? "rate-status success" : "rate-status warning"
                    }
                  >
                    {isAboveAverage
                      ? "Acima da m�dia nacional"
                      : "Abaixo da m�dia nacional"}
                  </span>
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-button" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="save-button">
                    {editingData ? "Salvar Altera��es" : "Cadastrar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteModalOpen && (
          <div className="modal-overlay">
            <div className="delete-modal">
              <div className="delete-icon">??</div>
              <h2>Excluir registro?</h2>
              <p>Essa a��o n�o poder� ser desfeita.</p>
              <div className="delete-actions">
                <button
                  className="cancel-delete"
                  onClick={() => setDeleteModalOpen(false)}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="confirm-delete"
                  onClick={handleConfirmDelete}
                  type="button"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
