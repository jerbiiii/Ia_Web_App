package tn.iatechnology.backend.controller;

import tn.iatechnology.backend.dto.HighlightRequest;
import tn.iatechnology.backend.dto.MessageResponse;
import tn.iatechnology.backend.entity.Highlight;
import tn.iatechnology.backend.repository.HighlightRepository;
import tn.iatechnology.backend.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
public class HighlightController {

    @Autowired
    private HighlightRepository highlightRepository;
    @Autowired
    private AuditLogService auditLogService;

    // ── Accès public ──────────────────────────────────────────────────────

    /** GET /api/public/highlights — Retourne uniquement les highlights actifs */
    @GetMapping("/public/highlights")
    public List<Highlight> getActiveHighlights() {
        return highlightRepository.findByActifTrueOrderByDateCreationDesc();
    }

    /**
     * GET /api/public/highlights/{id} — Détail d'un projet à la une (uniquement si
     * actif)
     */
    @GetMapping("/public/highlights/{id}")
    public ResponseEntity<Highlight> getActiveHighlightById(@PathVariable Long id) {
        Highlight highlight = highlightRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projet à la une introuvable"));
        if (!highlight.isActif()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Projet à la une introuvable");
        }
        return ResponseEntity.ok(highlight);
    }

    // ── Accès Modérateur / Admin ──────────────────────────────────────────

    /** GET /api/moderator/highlights — Tous les highlights (actifs et inactifs) */
    @GetMapping("/moderator/highlights")
    @PreAuthorize("hasRole('MODERATEUR') or hasRole('ADMIN')")
    public List<Highlight> getAllHighlights() {
        return highlightRepository.findAll();
    }

    /** GET /api/moderator/highlights/{id} */
    @GetMapping("/moderator/highlights/{id}")
    @PreAuthorize("hasRole('MODERATEUR') or hasRole('ADMIN')")
    public ResponseEntity<Highlight> getHighlightById(@PathVariable Long id) {
        Highlight highlight = highlightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Highlight non trouvé avec l'id : " + id));
        return ResponseEntity.ok(highlight);
    }

    /** POST /api/moderator/highlights */
    @PostMapping("/moderator/highlights")
    @PreAuthorize("hasRole('MODERATEUR') or hasRole('ADMIN')")
    public Highlight createHighlight(
            @RequestBody HighlightRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        Highlight highlight = new Highlight();
        highlight.setTitre(request.getTitre());
        highlight.setDescription(request.getDescription());
        highlight.setImageUrl(request.getImageUrl());
        highlight.setDateCreation(LocalDateTime.now());
        highlight.setActif(request.isActif());

        Highlight saved = highlightRepository.save(highlight);
        auditLogService.log("CREATE", "HIGHLIGHT", saved.getId(),
                "Création du highlight : " + saved.getTitre(), httpRequest);
        return saved;
    }

    /** PUT /api/moderator/highlights/{id} */
    @PutMapping("/moderator/highlights/{id}")
    @PreAuthorize("hasRole('MODERATEUR') or hasRole('ADMIN')")
    public ResponseEntity<Highlight> updateHighlight(
            @PathVariable Long id,
            @RequestBody HighlightRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        Highlight highlight = highlightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Highlight non trouvé avec l'id : " + id));

        highlight.setTitre(request.getTitre());
        highlight.setDescription(request.getDescription());
        highlight.setImageUrl(request.getImageUrl());
        highlight.setActif(request.isActif());

        Highlight updated = highlightRepository.save(highlight);
        auditLogService.log("UPDATE", "HIGHLIGHT", id,
                "Modification du highlight : " + updated.getTitre(), httpRequest);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/moderator/highlights/{id}
     * CORRECTION : autorisation étendue au MODERATEUR (était ADMIN uniquement).
     * Le modérateur gère le contenu de la page d'accueil selon le cahier des
     * charges.
     */
    @DeleteMapping("/moderator/highlights/{id}")
    @PreAuthorize("hasRole('MODERATEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteHighlight(
            @PathVariable Long id,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        highlightRepository.findById(id).ifPresent(h -> auditLogService.log("DELETE", "HIGHLIGHT", id,
                "Suppression du highlight : " + h.getTitre(), httpRequest));
        highlightRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Highlight supprimé avec succès"));
    }
}