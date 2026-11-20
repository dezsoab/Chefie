package io.github.dezsoab.chefie.menu;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    public List<Menu> findByEventIdOrderBySortOrder(Long eventId);

    @Modifying
    @Query("delete from Menu m where m.event.id = :eventId")
    void deleteAllForEvent(@Param("eventId") Long eventId);
}
