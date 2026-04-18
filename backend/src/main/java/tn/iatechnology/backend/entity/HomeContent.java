package tn.iatechnology.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "home_content")
@Data
@NoArgsConstructor
public class HomeContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Clé unique pour identifier la section (ex: "hero_title", "hero_subtitle") */
    @Column(nullable = false, unique = true)
    private String cle;

    /** Libellé lisible pour l'interface admin */
    @Column(nullable = false)
    private String libelle;

    /** Valeur du contenu */
    @Column(length = 2000)
    private String valeur;

    /** Type : TEXT, HTML, URL */
    @Column(nullable = false)
    private String type = "TEXT";

    /** Section de la page : HERO, CTA, FOOTER */
    @Column(nullable = false)
    private String section;

    @Column(nullable = false)
    private boolean actif = true;

    private LocalDateTime dateModification;

    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        dateModification = LocalDateTime.now();
    }
}