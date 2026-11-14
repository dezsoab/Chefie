package io.github.dezsoab.chefie.menu;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    public List<Menu> findByEventIdOrderBySortOrder(Long eventId);
}
