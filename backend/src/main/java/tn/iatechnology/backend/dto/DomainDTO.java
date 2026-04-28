package tn.iatechnology.backend.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class DomainDTO {
    private Long id;
    private String nom;
    private String description;
    private Long parentId;
    private List<DomainDTO> enfants = new ArrayList<>();
}