package io.github.dezsoab.chefie.common;

import java.util.Map;

public record ApiError(int status, String code, String message, Map<String, String> params) {
}
