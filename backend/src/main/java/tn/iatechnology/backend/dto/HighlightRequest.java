package tn.iatechnology.backend.dto;

import lombok.Data;

@Data
public class HighlightRequest {
    private String titre;
    private String description;
    private String imageUrl;
    private boolean actif;
}