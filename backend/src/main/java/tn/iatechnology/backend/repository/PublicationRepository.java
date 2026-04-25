package tn.iatechnology.backend.repository;

import tn.iatechnology.backend.entity.Publication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, Long> {
    List<Publication> findByChercheursId(Long chercheurId);
    List<Publication> findByDomainesId(Long domaineId);

    @Query("SELECT p FROM Publication p JOIN p.chercheurs c WHERE LOWER(c.nom) LIKE LOWER(CONCAT('%', :nom, '%')) OR LOWER(c.prenom) LIKE LOWER(CONCAT('%', :prenom, '%'))")
    List<Publication> findByChercheurNomOuPrenom(@Param("nom") String nom, @Param("prenom") String prenom);

    @Query("SELECT p FROM Publication p WHERE LOWER(p.titre) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.resume) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Publication> findByKeywordInTitreOrResume(@Param("keyword") String keyword);
}