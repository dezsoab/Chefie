package io.github.dezsoab.chefie.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
    long countByEventIdAndStatusInAndNumberLessThan(Long eventId, Collection<OrderStatus> statuses, int number);

    List<CustomerOrder> id(Long id);
}
