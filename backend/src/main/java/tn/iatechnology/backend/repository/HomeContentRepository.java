package tn.iatechnology.backend.repository;

import tn.iatechnology.backend.entity.HomeContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface HomeContentRepository extends JpaRepository<HomeContent, Long> {
    List<HomeContent> findByActifTrue();
    Optional<HomeContent> findByCle(String cle);
}