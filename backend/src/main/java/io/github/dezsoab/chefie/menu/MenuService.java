package io.github.dezsoab.chefie.menu;

import io.github.dezsoab.chefie.event.EventDto;
import io.github.dezsoab.chefie.event.EventService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
public class MenuService {
    private final EventService eventService;
    private final MenuRepository menuRepository;
    private final MenuItemRepository menuItemRepository;
    private final RecipeLineRepository recipeLineRepository;

    public MenuService(EventService eventService, MenuRepository menuRepository, MenuItemRepository menuItemRepository, RecipeLineRepository recipeLineRepository) {
        this.eventService = eventService;
        this.menuRepository = menuRepository;
        this.menuItemRepository = menuItemRepository;
        this.recipeLineRepository = recipeLineRepository;
    }

    @Transactional(readOnly = true)
    public MenuResponse getCurrentMenu() {
        EventDto event = eventService.findCurrent();
        List<Menu> menus = menuRepository.findByEventIdOrderBySortOrder(event.id());
        List<MenuItem> items
                = menuItemRepository.findByMenu_Event_IdAndEnabledTrueOrderBySortOrder(event.id());
        List<RecipeLine> lines = recipeLineRepository.findByMenuItem_Menu_Event_Id(event.id());


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
        return new MenuResponse.MenuItemDto(menuItem.getId(), menuItem.getName(), menuItem.getDescription(), ingredients, null);
    }
}
