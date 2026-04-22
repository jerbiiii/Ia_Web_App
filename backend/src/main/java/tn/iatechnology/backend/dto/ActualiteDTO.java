package tn.iatechnology.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ActualiteDTO {
    private Long id;
    private String titre;
    private String contenu;
    private LocalDateTime datePublication;
    private Long auteurId;
    private String auteurNom;
    private boolean actif = true;
}