package tn.iatechnology.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tn.iatechnology.backend.entity.AuditLog;
import tn.iatechnology.backend.service.AuditLogService;

@RestController
@RequestMapping("/api/admin/audit")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    /**
     * Récupérer tous les logs (admin uniquement)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    /**
     * Filtrer les logs par action, entité et email
     */
    @GetMapping("/filter")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entite,
            @RequestParam(required = false) String email) {
        return ResponseEntity.ok(auditLogService.getLogsByFilters(action, entite, email));
    }
}