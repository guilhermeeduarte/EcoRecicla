package br.com.fatec.ecorecicla.exception;

public class RegistroNotFoundException extends RuntimeException {
    public RegistroNotFoundException(Long id) {
        super("Registro não encontrado com id: " + id);
    }
}
