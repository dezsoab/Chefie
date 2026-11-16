package io.github.dezsoab.chefie.menu;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    public List<Ingredient> findByEventIdAndExtraAmountNotNull(Long eventId);

    @Modifying
    @Query("update Ingredient i set i.stock = i.stock - :amount, i.version = i.version +1" + "where i.id = :id and (i.stock is null or i.stock>:amount)")
    int reserve(@Param("id") Long id, @Param("amount") int amount);
}
