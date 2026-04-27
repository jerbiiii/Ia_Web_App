package tn.iatechnology.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import tn.iatechnology.backend.dto.*;
import tn.iatechnology.backend.entity.Role;
import tn.iatechnology.backend.entity.User;
import tn.iatechnology.backend.repository.UserRepository;
import tn.iatechnology.backend.security.LoginRateLimiter;
import tn.iatechnology.backend.security.jwt.JwtUtils;
import tn.iatechnology.backend.security.services.UserDetailsImpl;
import tn.iatechnology.backend.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    AuditLogService auditLogService;

    @Autowired
    LoginRateLimiter rateLimiter;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {

        if (rateLimiter.isBlocked(loginRequest.getEmail())) {
            return ResponseEntity.status(429)
                    .body(new MessageResponse("Trop de tentatives. Compte bloqué pour 15 minutes."));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String role = userDetails.getAuthorities().iterator().next()
                    .getAuthority().replace("ROLE_", "");

            // Reset rate limiter on success
            rateLimiter.loginSucceeded(loginRequest.getEmail());

            // ✅ CORRECTION : log de la connexion
            auditLogService.log(
                    "LOGIN",
                    "USER",
                    userDetails.getId(),
                    "Connexion de l'utilisateur : " + userDetails.getEmail(),
                    request
            );

            return ResponseEntity.ok(new JwtResponse(
                    jwt,
                    userDetails.getId(),
                    userDetails.getEmail(),
                    userDetails.getNom(),
                    userDetails.getPrenom(),
                    role));

        } catch (org.springframework.security.core.AuthenticationException e) {
            rateLimiter.loginFailed(loginRequest.getEmail());
            return ResponseEntity.status(401)
                    .body(new MessageResponse("Erreur: Email ou mot de passe incorrect!"));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Erreur: Email déjà utilisé!"));
        }

        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setNom(signUpRequest.getNom());
        user.setPrenom(signUpRequest.getPrenom());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setRole(Role.UTILISATEUR);
        user.setDateInscription(LocalDateTime.now());

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Utilisateur enregistré avec succès!"));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('UTILISATEUR') or hasRole('MODERATEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(encoder.encode(request.getPassword()));
        }
        userRepository.save(user);

        // ✅ CORRECTION : log de la modification de profil
        auditLogService.log(
                "UPDATE",
                "USER",
                userDetails.getId(),
                "Mise à jour du profil : " + user.getEmail()
        );

        return ResponseEntity.ok(new MessageResponse("Profil mis à jour avec succès"));
    }

    // ✅ CORRECTION : endpoint logout pour tracer la déconnexion
    @PostMapping("/signout")
    @PreAuthorize("hasRole('UTILISATEUR') or hasRole('MODERATEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> logoutUser(
            Authentication authentication,
            HttpServletRequest request) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        auditLogService.log(
                "LOGOUT",
                "USER",
                userDetails.getId(),
                "Déconnexion de l'utilisateur : " + userDetails.getEmail(),
                request
        );

        return ResponseEntity.ok(new MessageResponse("Déconnexion enregistrée"));
    }

    @PostMapping("/admin/signup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerUserByAdmin(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Erreur: Email déjà utilisé!"));
        }

        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setNom(signUpRequest.getNom());
        user.setPrenom(signUpRequest.getPrenom());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setRole(signUpRequest.getRole() != null ? signUpRequest.getRole() : Role.UTILISATEUR);
        user.setDateInscription(LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Utilisateur créé avec succès"));
    }
}