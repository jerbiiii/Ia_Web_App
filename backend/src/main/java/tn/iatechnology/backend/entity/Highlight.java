package tn.iatechnology.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "highlights")
@Data
@NoArgsConstructor
public class Highlight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(length = 1000)
    private String description;

    private String imageUrl; // optionnel

    private LocalDateTime dateCreation;

    private boolean actif; // pour afficher ou non
}