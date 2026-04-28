package tn.iatechnology.backend.controller;

import tn.iatechnology.backend.entity.HomeContent;
import tn.iatechnology.backend.repository.HomeContentRepository;
import tn.iatechnology.backend.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HomeContentController {

    @Autowired
    private HomeContentRepository homeContentRepository;

    @Autowired
    private AuditLogService auditLogService;

    /** Accès public — renvoie uniquement les contenus actifs */
    @GetMapping("/public/home-content")
    public List<HomeContent> getPublicContent() {
        return homeContentRepository.findByActifTrue();
    }

    /** Modérateur — accès complet */
    @GetMapping("/moderator/home-content")
    @PreAuthorize("hasRole('MODERATEUR') or hasRole('ADMIN')")
    public List<HomeContent> getAllContent() {
        return homeContentRepository.findAll();
    }

    @GetMapping("/moderator/home-content/{id}")
    @PreAuthorize("hasRole('MODERATEUR') or hasRole('ADMIN')")
    public ResponseEntity<HomeContent> getById(@PathVariable Long id) {
        HomeContent content = homeContentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contenu non trouvé"));
        return ResponseEntity.ok(content);
    }

    @PostMapping("/moderator/home-content")
    @PreAuthorize("hasRole('MODERATEUR') or hasRole('ADMIN')")
    public ResponseEntity<HomeContent> create(@RequestBody HomeContent content) {
        HomeContent saved = homeContentRepository.save(content);
        auditLogService.log("CREATE", "HOME_CONTENT", saved.getId(),
                "Création du contenu : " + saved.getCle());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/moderator/home-content/{id}")
    @PreAuthorize("hasRole('MODERATEUR') or hasRole('ADMIN')")
    public ResponseEntity<HomeContent> update(@PathVariable Long id, @RequestBody HomeContent content) {
        HomeContent existing = homeContentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contenu non trouvé"));
        existing.setLibelle(content.getLibelle());
        existing.setValeur(content.getValeur());
        existing.setType(content.getType());
        existing.setSection(content.getSection());
        existing.setActif(content.isActif());
        HomeContent updated = homeContentRepository.save(existing);
        auditLogService.log("UPDATE", "HOME_CONTENT", id,
                "Modification du contenu : " + updated.getCle() + " = " + updated.getValeur());
        return ResponseEntity.ok(updated);
    }

    /** Mise à jour rapide de la valeur seulement */
    @PatchMapping("/moderator/home-content/{id}/valeur")
    @PreAuthorize("hasRole('MODERATEUR') or hasRole('ADMIN')")
    public ResponseEntity<HomeContent> updateValeur(@PathVariable Long id, @RequestBody Map<String, String> body) {
        HomeContent existing = homeContentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contenu non trouvé"));
        existing.setValeur(body.get("valeur"));
        HomeContent updated = homeContentRepository.save(existing);
        auditLogService.log("UPDATE", "HOME_CONTENT", id,
                "Mise à jour du contenu : " + updated.getCle());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/moderator/home-content/{id}")
    @PreAuthorize("hasRole('MODERATEUR') or hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        homeContentRepository.findById(id).ifPresent(c -> auditLogService.log("DELETE", "HOME_CONTENT", id,
                "Suppression du contenu : " + c.getCle()));
        homeContentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}