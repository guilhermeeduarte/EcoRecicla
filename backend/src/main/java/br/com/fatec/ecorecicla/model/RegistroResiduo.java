package br.com.fatec.ecorecicla.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "registro_residuo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroResiduo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Município é obrigatório")
    @Column(nullable = false)
    private String municipio;

    @NotBlank(message = "Estado é obrigatório")
    @Column(nullable = false, length = 2)
    private String estado;

    @NotNull(message = "Quantidade gerada é obrigatória")
    @DecimalMin(value = "0.0", inclusive = true, message = "Quantidade gerada deve ser positiva")
    @Column(nullable = false)
    private Double quantidadeGerada;

    @NotNull(message = "Taxa de reciclagem é obrigatória")
    @DecimalMin(value = "0.0", message = "Taxa deve ser entre 0 e 100")
    @DecimalMax(value = "100.0", message = "Taxa deve ser entre 0 e 100")
    @Column(nullable = false)
    private Double taxaReciclagem;

    @NotNull(message = "Ano é obrigatório")
    @Min(value = 2000, message = "Ano deve ser maior que 2000")
    @Column(nullable = false)
    private Integer ano;
}
