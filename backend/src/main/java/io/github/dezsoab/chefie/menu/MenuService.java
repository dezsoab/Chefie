package io.github.dezsoab.chefie.menu;

import io.github.dezsoab.chefie.common.ConflictException;
import io.github.dezsoab.chefie.common.NotFoundException;
import io.github.dezsoab.chefie.event.Event;
import io.github.dezsoab.chefie.event.EventDto;
import io.github.dezsoab.chefie.event.EventService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.OptionalInt;
import java.util.stream.Collectors;


@Service
public class MenuService {
    private final EventService eventService;
    private final MenuRepository menuRepository;
    private final MenuItemRepository menuItemRepository;
    private final RecipeLineRepository recipeLineRepository;
    private final IngredientRepository ingredientRepository;

    public MenuService(EventService eventService, MenuRepository menuRepository, MenuItemRepository menuItemRepository, RecipeLineRepository recipeLineRepository, IngredientRepository ingredientRepository) {
        this.eventService = eventService;
        this.menuRepository = menuRepository;
        this.menuItemRepository = menuItemRepository;
        this.recipeLineRepository = recipeLineRepository;
        this.ingredientRepository = ingredientRepository;
    }

    @Transactional(readOnly = true)
    public MenuResponse getCurrentMenu() {
        EventDto event = eventService.findCurrent();
        List<Menu> menus = menuRepository.findByEventIdOrderBySortOrder(event.id());
        List<MenuItem> items
                = menuItemRepository.findByMenu_Event_IdAndEnabledTrueOrderBySortOrder(event.id());
        List<RecipeLine> lines = recipeLineRepository.findAllForEvent(event.id());


        Map<Long, List<MenuItem>> itemsByMenu = items.stream()
                .collect(Collectors.groupingBy(item -> item.getMenu().getId()));
        Map<Long, List<RecipeLine>> linesByItem = lines.stream()
                .collect(Collectors.groupingBy(line -> line.getMenuItem().getId()));
        List<MenuResponse.MenuDto> menuDtos = menus.stream()
                .map(menu -> toMenuDto(menu, itemsByMenu.getOrDefault(menu.getId(), List.of()), linesByItem))
                .toList();

        return new MenuResponse(event.id(), event.name(), menuDtos, List.of());
    }

    private MenuResponse.MenuDto toMenuDto(Menu menu, List<MenuItem> items, Map<Long, List<RecipeLine>> linesByItem) {
        List<MenuResponse.MenuItemDto> menuItemDtos = items.stream()
                .map(item -> toItemDto(item, linesByItem.getOrDefault(item.getId(), List.of())))
                .toList();
        return new MenuResponse.MenuDto(menu.getId(), menu.getName(), menuItemDtos);
    }

    private MenuResponse.MenuItemDto toItemDto(MenuItem menuItem, List<RecipeLine> lines) {
        List<String> ingredients = lines.stream()
                .map(line -> line.getIngredient().getName())
                .toList();
        return new MenuResponse.MenuItemDto(menuItem.getId(), menuItem.getName(), menuItem.getDescription(), ingredients, calculateAvailable(lines));
    }

    private Integer calculateAvailable(List<RecipeLine> lines) {
        OptionalInt min = lines.stream()
                .filter(line -> line.getIngredient().getStock() != null)
                .mapToInt(line -> line.getIngredient().getStock() / line.getAmount())
                .min();

        if (min.isPresent()) {
            return min.getAsInt();
        }

        return null;
    }

    public MenuItem getOrderableMenuItem(Long itemId, Event event) {
        MenuItem menuItem = menuItemRepository.findById(itemId).orElseThrow(() -> new NotFoundException("Menu item is not found"));

        if (!menuItem.isEnabled()) {
            throw new NotFoundException("Menu item is not found");
        }

        if (!menuItem.getMenu().getEvent().getId().equals(event.getId())) {
            throw new NotFoundException("Menu item is not found");
        }

        return menuItem;
    }

    public void reserveStock(MenuItem item) {
        List<RecipeLine> recipeLines = recipeLineRepository.findByMenuItemId(item.getId()).stream().sorted(Comparator.comparing(line -> line.getIngredient().getId())).toList();
        for (RecipeLine line : recipeLines) {
            int stockReserved = ingredientRepository.reserve(line.getId().getIngredientId(), line.getAmount());
            if (stockReserved == 0) {
                throw new ConflictException(item.getName() + " is sold out");
            }
        }
    }
}
