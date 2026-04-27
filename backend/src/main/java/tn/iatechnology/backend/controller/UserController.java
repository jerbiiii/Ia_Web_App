package tn.iatechnology.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import tn.iatechnology.backend.dto.AdminCreateUserRequest;
import tn.iatechnology.backend.dto.MessageResponse;
import tn.iatechnology.backend.dto.RoleUpdateRequest;
import tn.iatechnology.backend.dto.UserResponse;
import tn.iatechnology.backend.entity.Role;
import tn.iatechnology.backend.entity.User;
import tn.iatechnology.backend.repository.UserRepository;
import tn.iatechnology.backend.service.AuditLogService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return ResponseEntity.ok(convertToResponse(user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUserByAdmin(@RequestBody AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Erreur: Email déjà utilisé!"));
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : Role.UTILISATEUR);
        user.setDateInscription(LocalDateTime.now());

        User saved = userRepository.save(user);
        auditLogService.log("CREATE", "USER", saved.getId(),
                "Création de l'utilisateur : " + saved.getEmail() + " (rôle: " + saved.getRole() + ")");

        return ResponseEntity.ok(new MessageResponse("Utilisateur créé avec succès"));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody RoleUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Role ancienRole = user.getRole();
        user.setRole(request.getRole());
        userRepository.save(user);

        auditLogService.log("UPDATE", "USER", id,
                "Changement de rôle de " + user.getEmail() + " : " + ancienRole + " → " + request.getRole());

        return ResponseEntity.ok(new MessageResponse("Rôle mis à jour avec succès"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.findById(id).ifPresent(user ->
                auditLogService.log("DELETE", "USER", id,
                        "Suppression de l'utilisateur : " + user.getEmail())
        );
        userRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Utilisateur supprimé"));
    }

    private UserResponse convertToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setNom(user.getNom());
        response.setPrenom(user.getPrenom());
        response.setRole(user.getRole());
        response.setDateInscription(user.getDateInscription());
        return response;
    }
}