package tn.iatechnology.backend.repository;

import tn.iatechnology.backend.entity.Actualite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActualiteRepository extends JpaRepository<Actualite, Long> {
    List<Actualite> findAllByOrderByDatePublicationDesc();
    // ✅ Pour l'endpoint public - seulement les actualités actives
    List<Actualite> findByActifTrueOrderByDatePublicationDesc();
}