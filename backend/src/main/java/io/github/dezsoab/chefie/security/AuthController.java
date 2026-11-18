package io.github.dezsoab.chefie.security;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
public class AuthController {
    @GetMapping("/api/auth/csrf")
    public CsrfToken csrf(CsrfToken token) {
        return token;
    }

    @GetMapping("/api/auth/me")
    public MeResponse me(Principal principal) {
        return new MeResponse(principal.getName());
    }
}
