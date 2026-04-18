package tn.iatechnology.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Type d'action : CREATE, UPDATE, DELETE, LOGIN, LOGOUT */
    @Column(nullable = false)
    private String action;

    /** Entité concernée : RESEARCHER, PUBLICATION, DOMAIN, USER, ACTUALITE, HIGHLIGHT */
    @Column(nullable = false)
    private String entite;

    /** ID de l'objet concerné (peut être null pour des actions globales) */
    private Long entiteId;

    /** Email de l'utilisateur qui a effectué l'action */
    @Column(nullable = false)
    private String utilisateurEmail;

    /** Rôle de l'utilisateur au moment de l'action */
    private String utilisateurRole;

    /** Description lisible de l'action */
    @Column(length = 1000)
    private String description;

    /** Adresse IP de la requête */
    private String adresseIp;

    @Column(nullable = false)
    private LocalDateTime dateAction;

    @PrePersist
    protected void onCreate() {
        dateAction = LocalDateTime.now();
    }
}