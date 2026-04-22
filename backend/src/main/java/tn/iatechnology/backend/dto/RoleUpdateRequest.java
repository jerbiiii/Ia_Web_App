package tn.iatechnology.backend.dto;

import tn.iatechnology.backend.entity.Role;
import lombok.Data;

@Data
public class RoleUpdateRequest {
    private Role role;
}