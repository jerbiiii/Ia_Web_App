package tn.iatechnology.backend.dto;


import lombok.Data;

import java.util.Set;

@Data
public class ResearcherDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String affiliation;
    private Long domainePrincipalId;
    private String domainePrincipalNom;
    private Set<Long> autresDomainesIds;
    private Long userId;
}
