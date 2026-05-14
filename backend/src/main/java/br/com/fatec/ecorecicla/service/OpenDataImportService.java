package br.com.fatec.ecorecicla.service;

import br.com.fatec.ecorecicla.exception.OpenDataImportException;
import br.com.fatec.ecorecicla.model.RegistroResiduo;
import br.com.fatec.ecorecicla.repository.RegistroResiduoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OpenDataImportService {

    private final RegistroResiduoRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${open-data.snis.url:}")
    private String defaultSnisUrl;

    @Value("${open-data.mma.url:}")
    private String defaultMmaUrl;

    private HttpClient httpClient;

    @PostConstruct
    public void init() {
        this.httpClient = HttpClient.newHttpClient();
    }

    public List<RegistroResiduo> importarDadosAbertos(String source, String url) {
        String effectiveUrl = chooseUrl(source, url);
        if (effectiveUrl == null || effectiveUrl.isBlank()) {
            throw new OpenDataImportException("Nenhuma URL de dados abertos foi configurada ou informada.");
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(effectiveUrl))
                .GET()
                .build();

        try {
            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            if (response.statusCode() >= 400) {
                throw new OpenDataImportException("Falha ao buscar dados abertos. HTTP " + response.statusCode());
            }

            String contentType = response.headers()
                    .firstValue("Content-Type")
                    .orElse("application/json");

            if (contentType.contains("csv") || effectiveUrl.endsWith(".csv")) {
                return importarCsvStream(response.body());
            }

            return importarJsonStream(response.body());
        } catch (IOException | InterruptedException e) {
            throw new OpenDataImportException("Erro ao importar dados abertos de " + effectiveUrl, e);
        }
    }

    private String chooseUrl(String source, String url) {
        if (url != null && !url.isBlank()) {
            return url;
        }
        if (source == null || source.isBlank()) {
            return defaultSnisUrl != null && !defaultSnisUrl.isBlank() ? defaultSnisUrl : defaultMmaUrl;
        }

        return switch (source.toLowerCase()) {
            case "snis" -> defaultSnisUrl;
            case "mma", "meioambiente", "ministério" -> defaultMmaUrl;
            default -> url;
        };
    }

    private List<RegistroResiduo> importarCsvStream(InputStream inputStream) {
        try (CSVReader reader = new CSVReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String[] cabecalho = reader.readNext();
            if (cabecalho == null) {
                throw new OpenDataImportException("Arquivo CSV vazio ou sem cabeçalho.");
            }

            List<RegistroResiduo> registros = new ArrayList<>();
            String[] linha;
            int numeroLinha = 1;
            while ((linha = reader.readNext()) != null) {
                numeroLinha++;
                if (linha.length < 5) {
                    continue;
                }
                registros.add(parseLineToRegistro(linha, numeroLinha));
            }

            return repository.saveAll(registros);
        } catch (IOException | CsvValidationException e) {
            throw new OpenDataImportException("Erro ao processar CSV de dados abertos.", e);
        }
    }

    private RegistroResiduo parseLineToRegistro(String[] linha, int numeroLinha) {
        try {
            return RegistroResiduo.builder()
                    .municipio(linha[0].trim())
                    .estado(linha[1].trim().toUpperCase())
                    .quantidadeGerada(parseDoubleValue(linha[2]))
                    .taxaReciclagem(parseDoubleValue(linha[3]))
                    .ano(Integer.parseInt(linha[4].trim()))
                    .build();
        } catch (NumberFormatException e) {
            throw new OpenDataImportException("Erro ao converter linha " + numeroLinha + ": " + e.getMessage(), e);
        }
    }

    private List<RegistroResiduo> importarJsonStream(InputStream inputStream) {
        try {
            JsonNode root = objectMapper.readTree(inputStream);
            JsonNode items = extractArrayNode(root);
            if (items == null || !items.isArray()) {
                throw new OpenDataImportException("Formato de JSON de dados abertos inválido.");
            }

            List<RegistroResiduo> registros = new ArrayList<>();
            for (JsonNode node : items) {
                RegistroResiduo registro = mapJsonNodeToRegistro(node);
                if (registro != null) {
                    registros.add(registro);
                }
            }
            return repository.saveAll(registros);
        } catch (IOException e) {
            throw new OpenDataImportException("Erro ao processar JSON de dados abertos.", e);
        }
    }

    private JsonNode extractArrayNode(JsonNode root) {
        if (root.isArray()) {
            return root;
        }
        if (root.has("data") && root.get("data").isArray()) {
            return root.get("data");
        }
        if (root.has("results") && root.get("results").isArray()) {
            return root.get("results");
        }
        if (root.has("records") && root.get("records").isArray()) {
            return root.get("records");
        }
        return null;
    }

    private RegistroResiduo mapJsonNodeToRegistro(JsonNode node) {
        String municipio = extractText(node, Set.of("municipio", "municipio_nome", "municipioNome", "municipio_nome",
                "city", "municipio_residuo", "nome_municipio"));
        String estado = extractText(node, Set.of("estado", "uf", "unidade_federativa", "estado_sigla", "sigla_uf"));
        Double quantidadeGerada = extractDouble(node, Set.of("quantidadeGerada", "quantidade_gerada", "gerado", "volume", "residuo_gerado", "quantidade"));
        Double taxaReciclagem = extractDouble(node, Set.of("taxaReciclagem", "taxa_reciclagem", "reciclagem_percentual", "taxa", "percentual_reciclagem", "porcentagem"));
        Integer ano = extractInteger(node, Set.of("ano", "ano_referencia", "year", "referencia_ano"));

        if (municipio == null || estado == null || quantidadeGerada == null || taxaReciclagem == null || ano == null) {
            return null;
        }

        return RegistroResiduo.builder()
                .municipio(municipio)
                .estado(estado.toUpperCase())
                .quantidadeGerada(quantidadeGerada)
                .taxaReciclagem(taxaReciclagem)
                .ano(ano)
                .build();
    }

    private String extractText(JsonNode node, Set<String> keys) {
        for (String key : keys) {
            JsonNode value = node.get(key);
            if (value != null && !value.isNull()) {
                String text = value.asText().trim();
                if (!text.isBlank()) {
                    return text;
                }
            }
        }
        return null;
    }

    private Double extractDouble(JsonNode node, Set<String> keys) {
        for (String key : keys) {
            JsonNode value = node.get(key);
            if (value != null && !value.isNull()) {
                String text = value.asText().trim();
                if (!text.isBlank()) {
                    return parseDoubleValue(text);
                }
            }
        }
        return null;
    }

    private Integer extractInteger(JsonNode node, Set<String> keys) {
        for (String key : keys) {
            JsonNode value = node.get(key);
            if (value != null && !value.isNull()) {
                String text = value.asText().trim();
                if (!text.isBlank()) {
                    try {
                        return Integer.parseInt(text.replaceAll("[^0-9]", ""));
                    } catch (NumberFormatException ignored) {
                    }
                }
            }
        }
        return null;
    }

    private Double parseDoubleValue(String raw) {
        try {
            String normalized = raw.trim().replace("%", "").replace(" ", "").replace("\u00A0", "");
            if (normalized.contains(",") && normalized.contains(".")) {
                normalized = normalized.replace(".", "").replace(",", ".");
            } else {
                normalized = normalized.replace(",", ".");
            }
            return Double.parseDouble(normalized);
        } catch (NumberFormatException e) {
            throw new OpenDataImportException("Não foi possível converter valor numérico: " + raw, e);
        }
    }
}
