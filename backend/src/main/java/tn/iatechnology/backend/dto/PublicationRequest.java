package tn.iatechnology.backend.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class PublicationRequest {
    private String titre;
    private String resume;
    private LocalDate datePublication;
    private String doi;
    private Set<Long> chercheursIds;
    private Set<Long> domainesIds;

}