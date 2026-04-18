package tn.iatechnology.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "publications")
@Data
@NoArgsConstructor
public class Publication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(length = 2000)
    private String resume;

    private LocalDate datePublication;

    private String doi;

    private String cheminFichier; // chemin du fichier PDF stocké

    @ManyToMany
    @JoinTable(
            name = "publication_researcher",
            joinColumns = @JoinColumn(name = "publication_id"),
            inverseJoinColumns = @JoinColumn(name = "researcher_id")
    )
    private Set<Researcher> chercheurs = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "publication_domain",
            joinColumns = @JoinColumn(name = "publication_id"),
            inverseJoinColumns = @JoinColumn(name = "domain_id")
    )
    private Set<Domain> domaines = new HashSet<>();
}