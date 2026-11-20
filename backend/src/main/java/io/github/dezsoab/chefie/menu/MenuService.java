package io.github.dezsoab.chefie.menu;

import io.github.dezsoab.chefie.common.ConflictException;
import io.github.dezsoab.chefie.common.NotFoundException;
import io.github.dezsoab.chefie.event.Event;
import io.github.dezsoab.chefie.event.EventDto;
import io.github.dezsoab.chefie.event.EventService;
import io.github.dezsoab.chefie.event.EventStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.OptionalInt;
import java.util.TreeMap;
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

        List<MenuResponse.ExtraDto> extras = ingredientRepository
                .findByEventIdAndExtraAmountNotNullOrderByName(event.id()).stream()
                .map(this::toExtraDto)
                .toList();

        return new MenuResponse(event.id(), event.name(), event.status() == EventStatus.OPEN, menuDtos, extras);
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
        List<MenuResponse.RecipeNeedDto> recipe = lines.stream()
                .map(line -> new MenuResponse.RecipeNeedDto(line.getIngredient().getId(), line.getAmount()))
                .toList();
        return new MenuResponse.MenuItemDto(menuItem.getId(), menuItem.getName(), menuItem.getDescription(), ingredients, recipe, calculateAvailable(lines));
    }

    private MenuResponse.ExtraDto toExtraDto(Ingredient ingredient) {
        Integer available = ingredient.getStock() == null
                ? null
                : ingredient.getStock() / ingredient.getExtraAmount();
        return new MenuResponse.ExtraDto(ingredient.getId(), ingredient.getName(), available, ingredient.getStock(), ingredient.getExtraAmount());
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
        MenuItem menuItem = menuItemRepository.findById(itemId).orElseThrow(() -> new NotFoundException("ITEM_NOT_FOUND"));

        if (!menuItem.isEnabled()) {
            throw new NotFoundException("ITEM_NOT_FOUND");
        }

        if (!menuItem.getMenu().getEvent().getId().equals(event.getId())) {
            throw new NotFoundException("ITEM_NOT_FOUND");
        }

        return menuItem;
    }

    public List<Ingredient> getOrderableExtras(List<Long> ingredientIds, Event event) {
        if (ingredientIds == null || ingredientIds.isEmpty()) {
            return List.of();
        }

        List<Long> distinctIds = ingredientIds.stream().distinct().toList();
        List<Ingredient> extras = ingredientRepository.findAllById(distinctIds);

        boolean allValid = extras.size() == distinctIds.size() && extras.stream()
                .allMatch(ingredient -> ingredient.getExtraAmount() != null
                        && ingredient.getEvent().getId().equals(event.getId()));
        if (!allValid) {
            throw new NotFoundException("EXTRA_NOT_FOUND");
        }

        return extras;
    }

    public void reserveStock(MenuItem item, List<Ingredient> extras) {
        Map<Long, Integer> amounts = new TreeMap<>();
        for (RecipeLine line : recipeLineRepository.findByMenuItemId(item.getId())) {
            amounts.merge(line.getId().getIngredientId(), line.getAmount(), Integer::sum);
        }
        for (Ingredient extra : extras) {
            amounts.merge(extra.getId(), extra.getExtraAmount(), Integer::sum);
        }

        for (Map.Entry<Long, Integer> entry : amounts.entrySet()) {
            int stockReserved = ingredientRepository.reserve(entry.getKey(), entry.getValue());
            if (stockReserved == 0) {
                throw new ConflictException("SOLD_OUT", Map.of("item", item.getName()));
            }
        }
    }

    public void releaseStock(MenuItem menuItem) {
        List<RecipeLine> recipeLines = recipeLineRepository.findByMenuItemId(menuItem.getId());

        for (RecipeLine recipeLine : recipeLines) {
            ingredientRepository.release(recipeLine.getIngredient().getId(), recipeLine.getAmount());
        }
    }

    public Map<Long, List<Portion>> getPortionsByMenuItem(Long eventId) {
        return recipeLineRepository.findAllForEvent(eventId).stream()
                .collect(Collectors.groupingBy(
                        line -> line.getMenuItem().getId(),
                        Collectors.collectingAndThen(
                                Collectors.mapping(
                                        line -> new Portion(line.getIngredient().getName(), line.getAmount(), line.getIngredient().getUnit()),
                                        Collectors.toList()),
                                portions -> portions.stream().sorted(Comparator.comparing(Portion::name)).toList())));
    }

    public void releaseIngredient(Long ingredientId, int amount) {
        ingredientRepository.release(ingredientId, amount);
    }
}
