package tn.iatechnology.backend.dto;

import tn.iatechnology.backend.entity.Role;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserResponse {
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private Role role;
    private LocalDateTime dateInscription;
}