package tn.iatechnology.backend.dto;

import tn.iatechnology.backend.entity.Role;
import lombok.Data;

@Data
public class AdminCreateUserRequest {
    private String email;
    private String password;
    private String nom;
    private String prenom;
    private Role role;
}