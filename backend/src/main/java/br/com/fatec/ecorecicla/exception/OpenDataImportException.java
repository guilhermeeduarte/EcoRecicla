package br.com.fatec.ecorecicla.exception;

public class OpenDataImportException extends RuntimeException {

    public OpenDataImportException(String message) {
        super(message);
    }

    public OpenDataImportException(String message, Throwable cause) {
        super(message, cause);
    }
}
