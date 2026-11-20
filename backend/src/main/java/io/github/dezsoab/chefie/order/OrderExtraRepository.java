package io.github.dezsoab.chefie.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface OrderExtraRepository extends JpaRepository<OrderExtra, Long> {
    @Query("select oe from OrderExtra oe join fetch oe.ingredient where oe.order.id in :orderIds")
    List<OrderExtra> findWithIngredientByOrderIds(@Param("orderIds") Collection<Long> orderIds);

    @Modifying
    @Query("delete from OrderExtra oe where oe.order.id in (select co.id from CustomerOrder co where co.event.id = :eventId)")
    void deleteAllForEvent(@Param("eventId") Long eventId);
}
