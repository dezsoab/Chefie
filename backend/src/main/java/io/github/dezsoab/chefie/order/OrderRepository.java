package io.github.dezsoab.chefie.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
    long countByEventIdAndStatusInAndNumberLessThan(Long eventId, Collection<OrderStatus> statuses, int number);

    @Query("select co from CustomerOrder co join fetch co.menuItem where co.event.id =:eventId and co.status in :statuses order by co.number")
    List<CustomerOrder> findActiveForKitchen(@Param("eventId") Long eventId, @Param("statuses") List<OrderStatus> statuses);

}
