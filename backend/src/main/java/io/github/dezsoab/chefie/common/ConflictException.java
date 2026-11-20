package io.github.dezsoab.chefie.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.Map;

@ResponseStatus(HttpStatus.CONFLICT)
public class ConflictException extends RuntimeException {
    private final Map<String, String> params;

    public ConflictException(String code) {
        this(code, Map.of());
    }

    public ConflictException(String code, Map<String, String> params) {
        super(code);
        this.params = params;
    }

    public String getCode() {
        return getMessage();
    }

    public Map<String, String> getParams() {
        return params;
    }
}
