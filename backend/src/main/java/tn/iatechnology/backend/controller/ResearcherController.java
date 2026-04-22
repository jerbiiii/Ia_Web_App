package tn.iatechnology.backend.controller;

import jakarta.validation.Valid;
import tn.iatechnology.backend.dto.ResearcherDTO;
import tn.iatechnology.backend.service.ResearcherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/researchers")
public class ResearcherController {

    @Autowired private ResearcherService researcherService;

    // ── Lecture (authentifiés uniquement — données internes) ──────────────

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATEUR') or hasRole('UTILISATEUR')")
    public List<ResearcherDTO> getAllResearchers() {
        return researcherService.getAllResearchers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATEUR') or hasRole('UTILISATEUR')")
    public ResponseEntity<ResearcherDTO> getResearcherById(@PathVariable Long id) {
        return ResponseEntity.ok(researcherService.getResearcherById(id));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATEUR') or hasRole('UTILISATEUR')")
    public List<ResearcherDTO> searchResearchers(
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) String prenom,
            @RequestParam(required = false) String domaine) {
        return researcherService.search(nom, prenom, domaine);
    }

    @GetMapping("/by-user/{userId}")
    @PreAuthorize("hasRole('UTILISATEUR') or hasRole('MODERATEUR') or hasRole('ADMIN')")
    public ResponseEntity<ResearcherDTO> getResearcherByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(researcherService.getResearcherByUserId(userId));
    }

    // ── Écriture (Admin uniquement) ───────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResearcherDTO> createResearcher(
            @Valid @RequestBody ResearcherDTO researcherDTO) {   // CORRECTION : @Valid ajouté
        ResearcherDTO created = researcherService.createResearcher(researcherDTO);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResearcherDTO> updateResearcher(
            @PathVariable Long id,
            @Valid @RequestBody ResearcherDTO researcherDTO) {   // CORRECTION : @Valid ajouté
        ResearcherDTO updated = researcherService.updateResearcher(id, researcherDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteResearcher(@PathVariable Long id) {
        researcherService.deleteResearcher(id);
        return ResponseEntity.noContent().build();
    }
}