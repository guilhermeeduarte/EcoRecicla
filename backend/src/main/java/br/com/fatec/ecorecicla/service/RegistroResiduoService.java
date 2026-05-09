package br.com.fatec.ecorecicla.service;

import br.com.fatec.ecorecicla.exception.CsvImportException;
import br.com.fatec.ecorecicla.exception.RegistroNotFoundException;
import br.com.fatec.ecorecicla.model.RegistroResiduo;
import br.com.fatec.ecorecicla.repository.RegistroResiduoRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RegistroResiduoService {

    private final RegistroResiduoRepository repository;

    public List<RegistroResiduo> listarTodos() {
        return repository.findAll();
    }

    public Optional<RegistroResiduo> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public RegistroResiduo buscarPorIdOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RegistroNotFoundException(id));
    }

    public RegistroResiduo salvar(RegistroResiduo registro) {
        return repository.save(registro);
    }

    public RegistroResiduo atualizar(Long id, RegistroResiduo dadosAtualizados) {
        RegistroResiduo existente = buscarPorIdOrThrow(id);
        existente.setMunicipio(dadosAtualizados.getMunicipio());
        existente.setEstado(dadosAtualizados.getEstado());
        existente.setQuantidadeGerada(dadosAtualizados.getQuantidadeGerada());
        existente.setTaxaReciclagem(dadosAtualizados.getTaxaReciclagem());
        existente.setAno(dadosAtualizados.getAno());
        return repository.save(existente);
    }

    public void deletar(Long id) {
        RegistroResiduo existente = buscarPorIdOrThrow(id);
        repository.delete(existente);
    }

    public List<RegistroResiduo> buscarPorEstado(String estado) {
        return repository.findByEstado(estado.toUpperCase());
    }

    public List<RegistroResiduo> buscarAbaixoDaMeta(Double meta) {
        return repository.findByTaxaReciclagemLessThan(meta);
    }

    public List<RegistroResiduo> buscarAcimaDaTaxa(Double taxa) {
        return repository.findByTaxaReciclagemGreaterThan(taxa);
    }

    public List<RegistroResiduo> buscarPorAno(Integer ano) {
        return repository.findByAno(ano);
    }

    public List<RegistroResiduo> buscarPorMunicipio(String municipio) {
        return repository.findByMunicipioContainingIgnoreCase(municipio);
    }

    public List<RegistroResiduo> importarCsv(MultipartFile arquivo) {
        List<RegistroResiduo> registros = new ArrayList<>();

        try (CSVReader reader = new CSVReader(
                new InputStreamReader(arquivo.getInputStream(), StandardCharsets.UTF_8))) {

            String[] cabecalho = reader.readNext(); // pula o cabeçalho
            if (cabecalho == null) {
                throw new CsvImportException("Arquivo CSV vazio ou sem cabeçalho.");
            }

            String[] linha;
            int numeroLinha = 1;
            while ((linha = reader.readNext()) != null) {
                numeroLinha++;
                if (linha.length < 5) {
                    throw new CsvImportException("Linha " + numeroLinha + " inválida: colunas insuficientes.");
                }
                try {
                    RegistroResiduo registro = RegistroResiduo.builder()
                            .municipio(linha[0].trim())
                            .estado(linha[1].trim().toUpperCase())
                            .quantidadeGerada(Double.parseDouble(linha[2].trim().replace(",", ".")))
                            .taxaReciclagem(Double.parseDouble(linha[3].trim().replace(",", ".")))
                            .ano(Integer.parseInt(linha[4].trim()))
                            .build();
                    registros.add(registro);
                } catch (NumberFormatException e) {
                    throw new CsvImportException("Erro ao converter dados numéricos na linha " + numeroLinha + ": " + e.getMessage());
                }
            }

            return repository.saveAll(registros);

        } catch (IOException | CsvValidationException e) {
            throw new CsvImportException("Erro ao processar arquivo CSV: " + e.getMessage(), e);
        }
    }
}
