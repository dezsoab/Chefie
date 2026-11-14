package io.github.dezsoab.chefie.menu;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipeLineRepository extends JpaRepository<RecipeLine, RecipeLineId> {
    @Query("select rl from RecipeLine rl join fetch rl.ingredient where rl.menuItem.menu.event.id = :eventId")
    List<RecipeLine> findAllForEvent(@Param("eventId") Long eventId);
}
