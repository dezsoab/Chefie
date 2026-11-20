package io.github.dezsoab.chefie.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
    @GetMapping({"/kitchen", "/admin", "/admin/setup", "/admin/events/{id}/setup", "/board", "/login", "/orders/{id}"})
    public String index() {
        return "forward:/index.html";
    }
}
