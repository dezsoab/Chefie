package io.github.dezsoab.chefie.menu;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByMenu_Event_IdAndEnabledTrueOrderBySortOrder(Long eventId);

    List<MenuItem> findByMenu_Event_IdOrderBySortOrder(Long eventId);

    boolean existsByMenuId(Long menuId);

    long countByMenuId(Long menuId);

    @Modifying
    @Query("delete from MenuItem mi where mi.menu.id in (select m.id from Menu m where m.event.id = :eventId)")
    void deleteAllForEvent(@Param("eventId") Long eventId);
}
