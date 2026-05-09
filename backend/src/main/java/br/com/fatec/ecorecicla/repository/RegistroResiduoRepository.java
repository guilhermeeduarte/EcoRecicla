package br.com.fatec.ecorecicla.repository;

import br.com.fatec.ecorecicla.model.RegistroResiduo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistroResiduoRepository extends JpaRepository<RegistroResiduo, Long> {

    List<RegistroResiduo> findByEstado(String estado);

    List<RegistroResiduo> findByTaxaReciclagemGreaterThan(Double taxa);

    List<RegistroResiduo> findByTaxaReciclagemLessThan(Double taxa);

    List<RegistroResiduo> findByAno(Integer ano);

    List<RegistroResiduo> findByMunicipioContainingIgnoreCase(String municipio);
}
