package tn.iatechnology.backend.repository;

import tn.iatechnology.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findAllByOrderByDateActionDesc();

    List<AuditLog> findByUtilisateurEmailOrderByDateActionDesc(String email);

    List<AuditLog> findByEntiteOrderByDateActionDesc(String entite);

    List<AuditLog> findByActionOrderByDateActionDesc(String action);

    @Query("SELECT a FROM AuditLog a WHERE a.dateAction BETWEEN :debut AND :fin ORDER BY a.dateAction DESC")
    List<AuditLog> findByPeriode(@Param("debut") LocalDateTime debut, @Param("fin") LocalDateTime fin);

    @Query("SELECT a FROM AuditLog a WHERE " +
            "(:action IS NULL OR a.action = :action) AND " +
            "(:entite IS NULL OR a.entite = :entite) AND " +
            "(:email IS NULL OR a.utilisateurEmail LIKE %:email%) " +
            "ORDER BY a.dateAction DESC")
    List<AuditLog> findByFilters(
            @Param("action") String action,
            @Param("entite") String entite,
            @Param("email") String email
    );
}