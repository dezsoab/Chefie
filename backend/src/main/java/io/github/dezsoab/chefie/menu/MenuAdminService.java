package io.github.dezsoab.chefie.menu;

import io.github.dezsoab.chefie.common.ConflictException;
import io.github.dezsoab.chefie.common.NotFoundException;
import io.github.dezsoab.chefie.event.Event;
import io.github.dezsoab.chefie.event.EventService;
import io.github.dezsoab.chefie.menu.MenuAdminDtos.IngredientDto;
import io.github.dezsoab.chefie.menu.MenuAdminDtos.IngredientRequest;
import io.github.dezsoab.chefie.menu.MenuAdminDtos.MenuDto;
import io.github.dezsoab.chefie.menu.MenuAdminDtos.MenuItemDto;
import io.github.dezsoab.chefie.menu.MenuAdminDtos.MenuItemRequest;
import io.github.dezsoab.chefie.menu.MenuAdminDtos.RecipeLineDto;
import io.github.dezsoab.chefie.menu.MenuAdminDtos.RecipeLineRequest;
import io.github.dezsoab.chefie.menu.MenuAdminDtos.SetupDto;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MenuAdminService {
    private final EventService eventService;
    private final IngredientRepository ingredientRepository;
    private final MenuRepository menuRepository;
    private final MenuItemRepository menuItemRepository;
    private final RecipeLineRepository recipeLineRepository;

    public MenuAdminService(EventService eventService, IngredientRepository ingredientRepository,
                            MenuRepository menuRepository, MenuItemRepository menuItemRepository,
                            RecipeLineRepository recipeLineRepository) {
        this.eventService = eventService;
        this.ingredientRepository = ingredientRepository;
        this.menuRepository = menuRepository;
        this.menuItemRepository = menuItemRepository;
        this.recipeLineRepository = recipeLineRepository;
    }

    @Transactional(readOnly = true)
    public SetupDto getSetup(Long eventId) {
        Event event = eventService.getEvent(eventId);

        List<IngredientDto> ingredients = ingredientRepository.findByEventIdOrderByName(eventId).stream()
                .map(IngredientDto::from)
                .toList();

        Map<Long, List<MenuItem>> itemsByMenu = menuItemRepository.findByMenu_Event_IdOrderBySortOrder(eventId).stream()
                .collect(Collectors.groupingBy(item -> item.getMenu().getId()));
        Map<Long, List<RecipeLine>> linesByItem = recipeLineRepository.findAllForEvent(eventId).stream()
                .collect(Collectors.groupingBy(line -> line.getMenuItem().getId()));

        List<MenuDto> menus = menuRepository.findByEventIdOrderBySortOrder(eventId).stream()
                .map(menu -> new MenuDto(menu.getId(), menu.getName(),
                        itemsByMenu.getOrDefault(menu.getId(), List.of()).stream()
                                .map(item -> toItemDto(item, linesByItem.getOrDefault(item.getId(), List.of())))
                                .toList()))
                .toList();

        return new SetupDto(event.getId(), event.getName(), ingredients, menus);
    }

    @Transactional
    public void createIngredient(Long eventId, IngredientRequest request) {
        Event event = eventService.getEvent(eventId);
        ingredientRepository.save(new Ingredient(event, request.name().trim(), request.unit().trim(),
                request.stock(), request.extraAmount()));
    }

    @Transactional
    public void updateIngredient(Long id, IngredientRequest request) {
        Ingredient ingredient = findIngredient(id);
        if (request.version() != null && request.version() != ingredient.getVersion()) {
            throw new ConflictException(ingredient.getName() + " changed in the meantime. Check the new numbers and save again.");
        }
        ingredient.update(request.name().trim(), request.unit().trim(), request.stock(), request.extraAmount());
    }

    @Transactional
    public void adjustStock(Long id, int delta) {
        Ingredient ingredient = findIngredient(id);
        if (ingredient.getStock() == null) {
            throw new ConflictException(ingredient.getName() + " has unlimited stock.");
        }
        if (ingredientRepository.adjustStock(id, delta) == 0) {
            throw new ConflictException("Stock of " + ingredient.getName() + " can't go below 0.");
        }
    }

    @Transactional
    public void deleteIngredient(Long id) {
        Ingredient ingredient = findIngredient(id);
        try {
            ingredientRepository.delete(ingredient);
            ingredientRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException(ingredient.getName() + " is still used by a menu item or an order.");
        }
    }

    @Transactional
    public void createMenu(Long eventId, String name) {
        Event event = eventService.getEvent(eventId);
        int sortOrder = menuRepository.findByEventIdOrderBySortOrder(eventId).size() + 1;
        menuRepository.save(new Menu(event, name.trim(), sortOrder));
    }

    @Transactional
    public void deleteMenu(Long id) {
        Menu menu = menuRepository.findById(id).orElseThrow(() -> new NotFoundException("Category not found."));
        if (menuItemRepository.existsByMenuId(id)) {
            throw new ConflictException("Remove the items in " + menu.getName() + " first.");
        }
        menuRepository.delete(menu);
    }

    @Transactional
    public void createMenuItem(Long menuId, MenuItemRequest request) {
        Menu menu = menuRepository.findById(menuId).orElseThrow(() -> new NotFoundException("Category not found."));
        int sortOrder = (int) menuItemRepository.countByMenuId(menuId) + 1;
        MenuItem item = menuItemRepository.save(new MenuItem(menu, request.name().trim(), sortOrder));
        item.setEnabled(request.enabled());
        saveLines(item, menu.getEvent().getId(), request.lines());
    }

    @Transactional
    public void updateMenuItem(Long id, MenuItemRequest request) {
        MenuItem item = findItem(id);
        item.rename(request.name().trim());
        item.setEnabled(request.enabled());

        recipeLineRepository.deleteAll(recipeLineRepository.findByMenuItemId(id));
        recipeLineRepository.flush();

        saveLines(item, item.getMenu().getEvent().getId(), request.lines());
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        MenuItem item = findItem(id);
        try {
            recipeLineRepository.deleteAll(recipeLineRepository.findByMenuItemId(id));
            menuItemRepository.delete(item);
            menuItemRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException(item.getName() + " was already ordered. Hide it instead.");
        }
    }

    private void saveLines(MenuItem item, Long eventId, List<RecipeLineRequest> lines) {
        Map<Long, Integer> amounts = new LinkedHashMap<>();
        for (RecipeLineRequest line : lines) {
            amounts.merge(line.ingredientId(), line.amount(), Integer::sum);
        }
        if (amounts.isEmpty()) {
            return;
        }

        List<Ingredient> ingredients = ingredientRepository.findAllById(amounts.keySet());
        boolean allValid = ingredients.size() == amounts.size()
                && ingredients.stream().allMatch(ingredient -> ingredient.getEvent().getId().equals(eventId));
        if (!allValid) {
            throw new NotFoundException("Ingredient not found.");
        }

        recipeLineRepository.saveAll(ingredients.stream()
                .map(ingredient -> new RecipeLine(new RecipeLineId(item.getId(), ingredient.getId()), item, ingredient,
                        amounts.get(ingredient.getId())))
                .toList());
    }

    private MenuItemDto toItemDto(MenuItem item, List<RecipeLine> lines) {
        List<RecipeLineDto> lineDtos = lines.stream()
                .sorted(Comparator.comparing(line -> line.getIngredient().getName()))
                .map(line -> new RecipeLineDto(line.getIngredient().getId(), line.getIngredient().getName(),
                        line.getIngredient().getUnit(), line.getAmount()))
                .toList();
        return new MenuItemDto(item.getId(), item.getName(), item.isEnabled(), lineDtos);
    }

    private Ingredient findIngredient(Long id) {
        return ingredientRepository.findById(id).orElseThrow(() -> new NotFoundException("Ingredient not found."));
    }

    private MenuItem findItem(Long id) {
        return menuItemRepository.findById(id).orElseThrow(() -> new NotFoundException("Item not found."));
    }
}
