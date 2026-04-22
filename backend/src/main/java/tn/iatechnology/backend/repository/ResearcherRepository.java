package tn.iatechnology.backend.repository;

import tn.iatechnology.backend.entity.Researcher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResearcherRepository extends JpaRepository<Researcher, Long> {
    List<Researcher> findByNomContainingIgnoreCase(String nom);
    List<Researcher> findByPrenomContainingIgnoreCase(String prenom);

    @Query("SELECT r FROM Researcher r WHERE LOWER(r.nom) LIKE LOWER(CONCAT('%', :nom, '%')) OR LOWER(r.prenom) LIKE LOWER(CONCAT('%', :prenom, '%'))")
    List<Researcher> findByNomOrPrenom(@Param("nom") String nom, @Param("prenom") String prenom);

    List<Researcher> findByDomainePrincipalNomIgnoreCase(String domaineNom);

    @Query("SELECT r FROM Researcher r JOIN r.autresDomaines d WHERE d.nom = :domaineNom")
    List<Researcher> findByAutreDomaineNom(@Param("domaineNom") String domaineNom);

    // Méthode corrigée avec requête explicite
    @Query("SELECT r FROM Researcher r WHERE r.user.id = :userId")
    Optional<Researcher> findByUserId(@Param("userId") Long userId);
}