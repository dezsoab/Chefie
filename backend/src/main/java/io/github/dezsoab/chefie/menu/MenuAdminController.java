package io.github.dezsoab.chefie.menu;

import io.github.dezsoab.chefie.menu.MenuAdminDtos.IngredientRequest;
import io.github.dezsoab.chefie.menu.MenuAdminDtos.MenuItemRequest;
import io.github.dezsoab.chefie.menu.MenuAdminDtos.MenuRequest;
import io.github.dezsoab.chefie.menu.MenuAdminDtos.SetupDto;
import io.github.dezsoab.chefie.menu.MenuAdminDtos.StockAdjustRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class MenuAdminController {
    private final MenuAdminService menuAdminService;

    public MenuAdminController(MenuAdminService menuAdminService) {
        this.menuAdminService = menuAdminService;
    }

    @GetMapping("/events/{eventId}/setup")
    public SetupDto getSetup(@PathVariable Long eventId) {
        return menuAdminService.getSetup(eventId);
    }

    @PostMapping("/events/{eventId}/ingredients")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void createIngredient(@PathVariable Long eventId, @Valid @RequestBody IngredientRequest request) {
        menuAdminService.createIngredient(eventId, request);
    }

    @PutMapping("/ingredients/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateIngredient(@PathVariable Long id, @Valid @RequestBody IngredientRequest request) {
        menuAdminService.updateIngredient(id, request);
    }

    @PostMapping("/ingredients/{id}/stock")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void adjustStock(@PathVariable Long id, @RequestBody StockAdjustRequest request) {
        menuAdminService.adjustStock(id, request.delta());
    }

    @DeleteMapping("/ingredients/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteIngredient(@PathVariable Long id) {
        menuAdminService.deleteIngredient(id);
    }

    @PostMapping("/events/{eventId}/menus")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void createMenu(@PathVariable Long eventId, @Valid @RequestBody MenuRequest request) {
        menuAdminService.createMenu(eventId, request.name());
    }

    @DeleteMapping("/menus/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMenu(@PathVariable Long id) {
        menuAdminService.deleteMenu(id);
    }

    @PostMapping("/menus/{menuId}/items")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void createMenuItem(@PathVariable Long menuId, @Valid @RequestBody MenuItemRequest request) {
        menuAdminService.createMenuItem(menuId, request);
    }

    @PutMapping("/menu-items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateMenuItem(@PathVariable Long id, @Valid @RequestBody MenuItemRequest request) {
        menuAdminService.updateMenuItem(id, request);
    }

    @DeleteMapping("/menu-items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMenuItem(@PathVariable Long id) {
        menuAdminService.deleteMenuItem(id);
    }
}
