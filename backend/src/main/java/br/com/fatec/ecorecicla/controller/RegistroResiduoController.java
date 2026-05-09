package br.com.fatec.ecorecicla.controller;

import br.com.fatec.ecorecicla.model.RegistroResiduo;
import br.com.fatec.ecorecicla.service.RegistroResiduoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/residuos")
@RequiredArgsConstructor
public class RegistroResiduoController {

    private final RegistroResiduoService service;

    @GetMapping
    public ResponseEntity<List<RegistroResiduo>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistroResiduo> buscarPorId(@PathVariable Long id) {
        RegistroResiduo registro = service.buscarPorIdOrThrow(id);
        return ResponseEntity.ok(registro);
    }

    @PostMapping
    public ResponseEntity<RegistroResiduo> criar(@Valid @RequestBody RegistroResiduo registro) {
        RegistroResiduo salvo = service.salvar(registro);
        URI location = URI.create("/api/residuos/" + salvo.getId());
        return ResponseEntity.created(location).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RegistroResiduo> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody RegistroResiduo registro) {
        return ResponseEntity.ok(service.atualizar(id, registro));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<RegistroResiduo>> buscarPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(service.buscarPorEstado(estado));
    }

    @GetMapping("/abaixo-da-meta")
    public ResponseEntity<List<RegistroResiduo>> buscarAbaixoDaMeta(
            @RequestParam(defaultValue = "20.0") Double meta) {
        return ResponseEntity.ok(service.buscarAbaixoDaMeta(meta));
    }

    @GetMapping("/acima-da-taxa")
    public ResponseEntity<List<RegistroResiduo>> buscarAcimaDaTaxa(
            @RequestParam Double taxa) {
        return ResponseEntity.ok(service.buscarAcimaDaTaxa(taxa));
    }

    @GetMapping("/ano/{ano}")
    public ResponseEntity<List<RegistroResiduo>> buscarPorAno(@PathVariable Integer ano) {
        return ResponseEntity.ok(service.buscarPorAno(ano));
    }

    @GetMapping("/municipio")
    public ResponseEntity<List<RegistroResiduo>> buscarPorMunicipio(
            @RequestParam String nome) {
        return ResponseEntity.ok(service.buscarPorMunicipio(nome));
    }

    @PostMapping("/importar-csv")
    public ResponseEntity<List<RegistroResiduo>> importarCsv(
            @RequestParam("arquivo") MultipartFile arquivo) {
        List<RegistroResiduo> importados = service.importarCsv(arquivo);
        return ResponseEntity.ok(importados);
    }
}
