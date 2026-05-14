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
  ArrowUpDown,
  X,
  SlidersHorizontal,
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
  const [anoFiltro, setAnoFiltro] = useState("");
  const [taxaMin, setTaxaMin] = useState("");
  const [taxaMax, setTaxaMax] = useState("");
  const [onlyBelowMeta, setOnlyBelowMeta] = useState(false);
  const [sortField, setSortField] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const generated = Number(generatedWaste);
  const recycled = Number(recycledWaste);

  const recyclingRate =
    generated > 0 ? ((recycled / generated) * 100).toFixed(1) : "0.0";

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
      if (!response.ok) throw new Error("Nao foi possivel carregar os residuos");
      const data = await response.json();
      setResiduos(data);
    } catch (err) {
      setError(err.message || "Erro ao carregar registros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResiduos();
  }, []);

  // anos disponiveis para filtro
  const anos = useMemo(
    () => [...new Set(residuos.map((item) => item.ano))].sort((a, b) => b - a),
    [residuos]
  );

  const estados = useMemo(
    () => [...new Set(residuos.map((item) => item.estado))].sort(),
    [residuos]
  );

  const filteredResiduos = useMemo(() => {
    let list = residuos.filter((item) => {
      const matchesSearch = item.municipio
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesEstado = estadoFiltro ? item.estado === estadoFiltro : true;
      const matchesAno = anoFiltro ? String(item.ano) === anoFiltro : true;
      const matchesMeta = onlyBelowMeta
        ? Number(item.taxaReciclagem) < metaPercent
        : true;
      const matchesTaxaMin = taxaMin !== ""
        ? Number(item.taxaReciclagem) >= Number(taxaMin)
        : true;
      const matchesTaxaMax = taxaMax !== ""
        ? Number(item.taxaReciclagem) <= Number(taxaMax)
        : true;
      return matchesSearch && matchesEstado && matchesAno && matchesMeta && matchesTaxaMin && matchesTaxaMax;
    });

    if (sortField) {
      list = [...list].sort((a, b) => {
        const va = a[sortField];
        const vb = b[sortField];
        const numA = Number(va);
        const numB = Number(vb);
        const isNum = !isNaN(numA) && !isNaN(numB);
        if (isNum) return sortDir === "asc" ? numA - numB : numB - numA;
        return sortDir === "asc"
          ? String(va).localeCompare(String(vb), "pt-BR")
          : String(vb).localeCompare(String(va), "pt-BR");
      });
    }

    return list;
  }, [residuos, searchQuery, estadoFiltro, anoFiltro, onlyBelowMeta, taxaMin, taxaMax, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setEstadoFiltro("");
    setAnoFiltro("");
    setTaxaMin("");
    setTaxaMax("");
    setOnlyBelowMeta(false);
    setSortField("");
    setSortDir("asc");
  };

  const hasActiveFilters =
    searchQuery || estadoFiltro || anoFiltro || taxaMin || taxaMax || onlyBelowMeta;

  const totalMunicipios = useMemo(
    () => new Set(residuos.map((item) => item.municipio)).size,
    [residuos]
  );

  const totalGerado = useMemo(
    () => residuos.reduce((sum, item) => sum + Number(item.quantidadeGerada || 0), 0),
    [residuos]
  );

  const totalReciclado = useMemo(
    () =>
      residuos.reduce(
        (sum, item) =>
          sum + (Number(item.quantidadeGerada || 0) * Number(item.taxaReciclagem || 0)) / 100,
        0
      ),
    [residuos]
  );

  const averageTax = useMemo(
    () =>
      residuos.length
        ? (
            residuos.reduce((sum, item) => sum + Number(item.taxaReciclagem || 0), 0) /
            residuos.length
          ).toFixed(1)
        : "0.0",
    [residuos]
  );

  const belowMetaCount = useMemo(
    () => residuos.filter((item) => Number(item.taxaReciclagem) < metaPercent).length,
    [residuos]
  );

  const handleEdit = (item) => {
    setEditingData(item);
    setMunicipio(item.municipio);
    setEstado(item.estado);
    setAno(String(item.ano));
    setGeneratedWaste(String(item.quantidadeGerada || ""));
    const reciclado =
      (Number(item.quantidadeGerada || 0) * Number(item.taxaReciclagem || 0)) / 100;
    setRecycledWaste(String(reciclado.toFixed(2)));
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => null);
        throw new Error(details?.message || "Falha ao salvar o registro.");
      }

      resetForm();
      loadResiduos();
    } catch (err) {
      setError(err.message || "Erro ao salvar registro.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      const response = await fetch(`${API_URL}/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha ao excluir o registro.");
      resetForm();
      loadResiduos();
    } catch (err) {
      setError(err.message || "Erro ao excluir registro.");
    }
  };

  const handleFileSelection = (event) => {
    setError("");
    const file = event.target.files?.[0] || null;
    if (file && !file.name.toLowerCase().endsWith(".csv")) {
      setError("Selecione um arquivo CSV valido.");
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
      setError(`Importacao concluida: ${imported.length} registros importados.`);
    } catch (err) {
      setError(err.message || "Erro ao importar CSV.");
    } finally {
      setLoading(false);
    }
  };

  const SortIcon = ({ field }) => (
    <ArrowUpDown
      size={13}
      className={`sort-icon ${sortField === field ? "sort-icon--active" : ""}`}
    />
  );

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
              <h4>Gestao de Residuos</h4>
            </span>
            <div className="hero-text">
              <h1>ECORECICLA</h1>
              <p>
                Plataforma para monitoramento de residuos reciclaveis e
                acompanhamento de metas ambientais.
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
                <h3>Municipios registrados</h3>
                <Building2 size={34} color="#1593ff" />
              </div>
              <div className="card-value" style={{ color: "#1593ff" }}>
                {totalMunicipios}
              </div>
              <div className="card-line" style={{ background: "#1593ff" }} />
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h3>Residuos gerados (t)</h3>
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
                <h3>Abaixo da media</h3>
                <TriangleAlert size={34} color="#d8cf00" />
              </div>
              <div className="card-value" style={{ color: "#d8cf00" }}>
                {belowMetaCount}
              </div>
              <div className="card-line" style={{ background: "#d8cf00" }} />
            </div>
          </div>

          {/* TAXA MEDIA */}
          <section className="progress-card">
            <div className="progress-circle-content">
              <div className="progress-circle">
                <span>{averageTax}%</span>
              </div>
              <div className="progress-content">
                <h2>Taxa media de reciclagem</h2>
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

            {/* linha 1: busca + toggle painel */}
            <div className="filters-row filters-row--top">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Buscar municipio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={18} />
              </div>

              <button
                className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters((v) => !v)}
                type="button"
              >
                <SlidersHorizontal size={16} />
                Filtros
                {hasActiveFilters && <span className="filter-badge" />}
              </button>

              {hasActiveFilters && (
                <button className="clear-filters-btn" onClick={clearFilters} type="button">
                  <X size={14} />
                  Limpar
                </button>
              )}

              <div className="filters-right">
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
                  <button className="import-button" onClick={handleImportCsv} type="button">
                    Importar CSV
                  </button>
                </div>

                <button className="new-button" onClick={openNewRecord} type="button">
                  Novo +
                </button>
              </div>
            </div>

            {/* linha 2: painel de filtros avancados */}
            {showFilters && (
              <div className="filters-panel">

                {/* Estado */}
                <div className="filter-item">
                  <label className="filter-label">Estado</label>
                  <select
                    value={estadoFiltro}
                    onChange={(e) => setEstadoFiltro(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {estados.map((est) => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>

                {/* Ano */}
                <div className="filter-item">
                  <label className="filter-label">Ano</label>
                  <select
                    value={anoFiltro}
                    onChange={(e) => setAnoFiltro(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {anos.map((a) => (
                      <option key={a} value={String(a)}>{a}</option>
                    ))}
                  </select>
                </div>

                {/* Taxa minima */}
                <div className="filter-item">
                  <label className="filter-label">Taxa min (%)</label>
                  <input
                    type="number"
                    className="filter-input-num"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={taxaMin}
                    onChange={(e) => setTaxaMin(e.target.value)}
                  />
                </div>

                {/* Taxa maxima */}
                <div className="filter-item">
                  <label className="filter-label">Taxa max (%)</label>
                  <input
                    type="number"
                    className="filter-input-num"
                    placeholder="100"
                    min="0"
                    max="100"
                    value={taxaMax}
                    onChange={(e) => setTaxaMax(e.target.value)}
                  />
                </div>

                {/* Abaixo da meta */}
                <div className="filter-item filter-item--toggle">
                  <label className="filter-label">Abaixo da meta</label>
                  <button
                    className={`toggle-btn ${onlyBelowMeta ? "toggle-btn--on" : ""}`}
                    onClick={() => setOnlyBelowMeta((v) => !v)}
                    type="button"
                  >
                    <TriangleAlert size={14} />
                    {onlyBelowMeta ? "Ativo" : "Inativo"}
                  </button>
                </div>

              </div>
            )}

            {/* contador de resultados */}
            <div className="results-count">
              {filteredResiduos.length} resultado{filteredResiduos.length !== 1 ? "s" : ""}
              {hasActiveFilters && ` (de ${residuos.length} total)`}
            </div>

          </section>

          {/* TABELA */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort("municipio")} className="th-sortable">
                    MUNICIPIO <SortIcon field="municipio" />
                  </th>
                  <th onClick={() => handleSort("estado")} className="th-sortable">
                    ESTADO <SortIcon field="estado" />
                  </th>
                  <th onClick={() => handleSort("ano")} className="th-sortable">
                    ANO <SortIcon field="ano" />
                  </th>
                  <th onClick={() => handleSort("quantidadeGerada")} className="th-sortable">
                    GERADO (t) <SortIcon field="quantidadeGerada" />
                  </th>
                  <th>RECICLADO (t)</th>
                  <th onClick={() => handleSort("taxaReciclagem")} className="th-sortable">
                    TAXA <SortIcon field="taxaReciclagem" />
                  </th>
                  <th>STATUS</th>
                  <th>ACOES</th>
                </tr>
              </thead>
              <tbody>
                {filteredResiduos.length > 0 ? (
                  filteredResiduos.map((item) => {
                    const recicladoValue =
                      (Number(item.quantidadeGerada || 0) * Number(item.taxaReciclagem || 0)) / 100;
                    const atingiu = Number(item.taxaReciclagem) >= metaPercent;
                    return (
                      <tr key={item.id}>
                        <td>{item.municipio}</td>
                        <td>
                          <span className="estado-badge">{item.estado}</span>
                        </td>
                        <td>{item.ano}</td>
                        <td>{formatNumber(item.quantidadeGerada)}</td>
                        <td className="green-text">{formatNumber(recicladoValue)}</td>
                        <td>
                          <span className={`taxa-pill ${atingiu ? "taxa-pill--ok" : "taxa-pill--low"}`}>
                            {Number(item.taxaReciclagem).toFixed(1)}%
                          </span>
                        </td>
                        <td>
                          <span className={`status-text ${atingiu ? "" : "status-text--below"}`}>
                            {atingiu ? "Atingido" : "Abaixo"}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button className="edit-btn" onClick={() => handleEdit(item)} type="button">
                              <Pencil size={14} />
                            </button>
                            <button className="delete-btn" onClick={() => handleDelete(item)} type="button">
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
                  Plataforma de monitoramento de residuos reciclaveis e
                  sustentabilidade ambiental.
                </p>
              </div>
            </div>
            <div className="footer-bottom">
              <span>2026 Ecorecicla - Todos os direitos reservados</span>
            </div>
          </div>
        </footer>

        {/* MODAL NOVO / EDITAR */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h2>{editingData ? "Editar Registro" : "Novo Registro"}</h2>
                <button className="close-modal" onClick={resetForm} type="button">
                  X
                </button>
              </div>
              <form className="modal-form" onSubmit={handleSave}>
                <div className="form-group">
                  <label>Municipio</label>
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
                    {[
                      "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA",
                      "MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN",
                      "RO","RR","RS","SC","SE","SP","TO"
                    ].map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ano de referencia</label>
                  <input
                    type="number"
                    placeholder="Ex: 2023"
                    value={ano}
                    onChange={(e) => setAno(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Residuos gerados (t)</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={generatedWaste}
                    onChange={(e) => setGeneratedWaste(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Residuos reciclados (t)</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={recycledWaste}
                    onChange={(e) => setRecycledWaste(e.target.value)}
                  />
                </div>
                <div className="rate-preview">
                  <h3>Taxa de reciclagem calculada</h3>
                  <div className="rate-value">{recyclingRate}%</div>
                  <span className={isAboveAverage ? "rate-status success" : "rate-status warning"}>
                    {isAboveAverage ? "Acima da media nacional" : "Abaixo da media nacional"}
                  </span>
                </div>
                {error && <div className="form-error">{error}</div>}
                <div className="modal-actions">
                  <button type="button" className="cancel-button" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="save-button">
                    {editingData ? "Salvar Alteracoes" : "Cadastrar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DELETE */}
        {deleteModalOpen && (
          <div className="modal-overlay">
            <div className="delete-modal">
              <div className="delete-icon">!</div>
              <h2>Excluir registro?</h2>
              <p>
                {deleteTarget?.municipio} / {deleteTarget?.estado} ({deleteTarget?.ano})<br />
                Essa acao nao podera ser desfeita.
              </p>
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