package io.github.dezsoab.chefie.menu;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    public List<Ingredient> findByEventIdAndExtraAmountNotNull(Long eventId);
}
