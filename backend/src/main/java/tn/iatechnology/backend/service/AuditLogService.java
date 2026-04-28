package tn.iatechnology.backend.service;

import tn.iatechnology.backend.entity.AuditLog;
import tn.iatechnology.backend.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import tn.iatechnology.backend.security.services.UserDetailsImpl;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@Service
public class AuditLogService {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogService.class);

    @Autowired
    private AuditLogRepository auditLogRepository;

    /**
     * Enregistre une action dans le journal d'audit.
     */
    public void log(String action, String entite, Long entiteId, String description) {
        try {
            AuditLog log = new AuditLog();
            log.setAction(action);
            log.setEntite(entite);
            log.setEntiteId(entiteId);
            log.setDescription(description);

            // Récupérer l'utilisateur connecté
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                log.setUtilisateurEmail(userDetails.getEmail());
                String role = userDetails.getAuthorities().iterator().next()
                        .getAuthority().replace("ROLE_", "");
                log.setUtilisateurRole(role);
            } else {
                log.setUtilisateurEmail("anonyme");
                log.setUtilisateurRole("PUBLIC");
            }

            auditLogRepository.save(log);
            logger.info("[AUDIT] {} - {} #{} - {} - {}", action, entite, entiteId,
                    log.getUtilisateurEmail(), description);

        } catch (Exception e) {
            logger.error("Erreur lors de l'enregistrement du log d'audit: {}", e.getMessage());
        }
    }

    /**
     * Enregistre une action avec l'adresse IP.
     */
    public void log(String action, String entite, Long entiteId, String description, HttpServletRequest request) {
        try {
            AuditLog log = new AuditLog();
            log.setAction(action);
            log.setEntite(entite);
            log.setEntiteId(entiteId);
            log.setDescription(description);

            // Extraire l'IP
            String ip = request.getHeader("X-Forwarded-For");
            if (ip == null || ip.isEmpty()) {
                ip = request.getRemoteAddr();
            }
            log.setAdresseIp(ip);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
                log.setUtilisateurEmail(userDetails.getEmail());
                String role = userDetails.getAuthorities().iterator().next()
                        .getAuthority().replace("ROLE_", "");
                log.setUtilisateurRole(role);
            } else {
                log.setUtilisateurEmail("anonyme");
                log.setUtilisateurRole("PUBLIC");
            }

            auditLogRepository.save(log);

        } catch (Exception e) {
            logger.error("Erreur lors de l'enregistrement du log d'audit: {}", e.getMessage());
        }
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByDateActionDesc();
    }

    public List<AuditLog> getLogsByFilters(String action, String entite, String email) {
        return auditLogRepository.findByFilters(
                (action != null && !action.isEmpty()) ? action : null,
                (entite != null && !entite.isEmpty()) ? entite : null,
                (email != null && !email.isEmpty()) ? email : null);
    }
}