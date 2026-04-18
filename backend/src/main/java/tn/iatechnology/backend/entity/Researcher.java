package tn.iatechnology.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "researchers")
@Data
@NoArgsConstructor
public class Researcher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    private String email;

    private String affiliation;

    @ManyToOne
    @JoinColumn(name = "domaine_principal_id")
    private Domain domainePrincipal;

    @ManyToMany
    @JoinTable(
            name = "researcher_domain",
            joinColumns = @JoinColumn(name = "researcher_id"),
            inverseJoinColumns = @JoinColumn(name = "domain_id")
    )
    private Set<Domain> autresDomaines = new HashSet<>();

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}