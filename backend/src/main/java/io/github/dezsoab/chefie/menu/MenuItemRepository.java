package io.github.dezsoab.chefie.menu;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByMenu_Event_IdAndEnabledTrueOrderBySortOrder(Long eventId);

    List<MenuItem> findByMenu_Event_IdOrderBySortOrder(Long eventId);

    boolean existsByMenuId(Long menuId);

    long countByMenuId(Long menuId);
}
