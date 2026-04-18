package tn.iatechnology.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "actualites")
@Data
@NoArgsConstructor
public class Actualite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(length = 5000)
    private String contenu;

    private LocalDateTime datePublication;

    @ManyToOne
    @JoinColumn(name = "auteur_id")
    private User auteur;


    @Column(nullable = false)
    private boolean actif = true;
}