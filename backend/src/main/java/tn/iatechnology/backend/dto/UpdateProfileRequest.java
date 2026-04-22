package tn.iatechnology.backend.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String nom;
    private String prenom;
    private String email;
    private String password;
}
