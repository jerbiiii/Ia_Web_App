package tn.iatechnology.backend.controller;

import tn.iatechnology.backend.dto.ActualiteDTO;
import tn.iatechnology.backend.service.ActualiteService;
import tn.iatechnology.backend.service.AuditLogService;
import tn.iatechnology.backend.security.services.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actualites")
public class ActualiteController {

    @Autowired
    private ActualiteService actualiteService;

    @Autowired
    private AuditLogService auditLogService;

    // ── Lecture ───────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<ActualiteDTO>> getAll() {
        return ResponseEntity.ok(actualiteService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActualiteDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(actualiteService.getById(id));
    }

    // ── Écriture : MODERATEUR et ADMIN ────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('MODERATEUR') or hasRole('ADMIN')")
    public ResponseEntity<ActualiteDTO> create(
            @Valid @RequestBody ActualiteDTO dto,
            Authentication authentication,
            HttpServletRequest request) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();


        dto.setAuteurId(userDetails.getId());

        ActualiteDTO created = actualiteService.create(dto);

        auditLogService.log(
                "CREATE", "ACTUALITE", created.getId(),
                "Création actualité : « " + created.getTitre() + " » par " + userDetails.getEmail(),
                request
        );

        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MODERATEUR') or hasRole('ADMIN')")
    public ResponseEntity<ActualiteDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody ActualiteDTO dto,
            Authentication authentication,
            HttpServletRequest request) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        ActualiteDTO updated = actualiteService.update(id, dto);

        auditLogService.log(
                "UPDATE", "ACTUALITE", id,
                "Modification actualité : « " + updated.getTitre() + " » par " + userDetails.getEmail(),
                request
        );

        return ResponseEntity.ok(updated);
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MODERATEUR') or hasRole('ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            Authentication authentication,
            HttpServletRequest request) {

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        actualiteService.delete(id);

        auditLogService.log(
                "DELETE", "ACTUALITE", id,
                "Suppression actualité ID " + id + " par " + userDetails.getEmail(),
                request
        );

        return ResponseEntity.noContent().build();
    }
}