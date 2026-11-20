package io.github.dezsoab.chefie.menu;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipeLineRepository extends JpaRepository<RecipeLine, RecipeLineId> {
    @Query("select rl from RecipeLine rl join fetch rl.ingredient where rl.menuItem.menu.event.id = :eventId")
    List<RecipeLine> findAllForEvent(@Param("eventId") Long eventId);

    List<RecipeLine> findByMenuItemId(Long menuItemId);

    @Modifying
    @Query("delete from RecipeLine rl where rl.menuItem.id in (select mi.id from MenuItem mi where mi.menu.event.id = :eventId)")
    void deleteAllForEvent(@Param("eventId") Long eventId);
}
