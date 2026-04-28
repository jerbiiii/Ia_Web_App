package tn.iatechnology.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)  // ignore les champs inconnus (ex: score de Python)
@JsonInclude(JsonInclude.Include.NON_NULL)    // n'inclut pas les nulls dans le JSON
public class PublicationResponse {
    private Long id;
    private String titre;
    private String resume;
    private LocalDate datePublication;
    private String doi;
    private String cheminFichier;
    private Set<Long> chercheursIds;
    private Set<String> chercheursNoms;
    private Set<Long> domainesIds;
    private Set<String> domainesNoms;

    // ── Champ ajouté pour la recherche sémantique IA ──
    private Double score;
}