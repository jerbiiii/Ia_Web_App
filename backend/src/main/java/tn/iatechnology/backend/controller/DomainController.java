package tn.iatechnology.backend.controller;

import tn.iatechnology.backend.dto.DomainDTO;
import tn.iatechnology.backend.service.AuditLogService;
import tn.iatechnology.backend.service.DomainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/domains")
public class DomainController {

    @Autowired
    private DomainService domainService;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATEUR') or hasRole('UTILISATEUR')")
    public List<DomainDTO> getAllDomains() {
        return domainService.getAllDomains();
    }

    @GetMapping("/roots")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATEUR') or hasRole('UTILISATEUR')")
    public List<DomainDTO> getRootDomains() {
        return domainService.getRootDomains();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATEUR') or hasRole('UTILISATEUR')")
    public ResponseEntity<DomainDTO> getDomainById(@PathVariable Long id) {
        return ResponseEntity.ok(domainService.getDomainById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DomainDTO> createDomain(@RequestBody DomainDTO domainDTO) {
        DomainDTO created = domainService.createDomain(domainDTO);
        auditLogService.log("CREATE", "DOMAIN", created.getId(),
                "Création du domaine : " + created.getNom());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DomainDTO> updateDomain(@PathVariable Long id, @RequestBody DomainDTO domainDTO) {
        DomainDTO updated = domainService.updateDomain(id, domainDTO);
        auditLogService.log("UPDATE", "DOMAIN", id,
                "Modification du domaine : " + updated.getNom());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDomain(@PathVariable Long id) {
        try {
            DomainDTO d = domainService.getDomainById(id);
            auditLogService.log("DELETE", "DOMAIN", id,
                    "Suppression du domaine : " + d.getNom());
        } catch (Exception ignored) {}

        domainService.deleteDomain(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATEUR') or hasRole('UTILISATEUR')")
    public List<DomainDTO> searchDomains(@RequestParam String keyword) {
        return domainService.searchDomains(keyword);
    }
}