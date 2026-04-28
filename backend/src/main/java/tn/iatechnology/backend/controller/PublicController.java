package tn.iatechnology.backend.controller;

import tn.iatechnology.backend.dto.ActualiteDTO;
import tn.iatechnology.backend.dto.DomainDTO;
import tn.iatechnology.backend.dto.PublicationResponse;
import tn.iatechnology.backend.dto.ResearcherDTO;
import tn.iatechnology.backend.entity.Publication;
import tn.iatechnology.backend.repository.PublicationRepository;
import tn.iatechnology.backend.service.ActualiteService;
import tn.iatechnology.backend.service.AuditLogService;
import tn.iatechnology.backend.service.DomainService;
import tn.iatechnology.backend.service.PublicationService;
import tn.iatechnology.backend.service.ResearcherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.io.IOException;

/**
 * Endpoints 100% publics — aucune authentification requise.
 * Le chemin /api/public/** est autorisé via WebSecurityConfig (permitAll).
 * Ces routes n'ont PAS de @PreAuthorize pour éviter tout conflit.
 */
@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private PublicationService publicationService;
    @Autowired
    private PublicationRepository publicationRepository;
    @Autowired
    private ResearcherService researcherService;
    @Autowired
    private DomainService domainService;
    @Autowired
    private ActualiteService actualiteService;
    @Autowired
    private AuditLogService auditLogService;

    // ══════════════════════ PUBLICATIONS ══════════════════════

    /** GET /api/public/publications?page=0&size=10 */
    @GetMapping("/publications")
    public ResponseEntity<Page<PublicationResponse>> getAllPublications(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("datePublication").descending());
        Page<Publication> pageResult = publicationRepository.findAll(pageable);
        return ResponseEntity.ok(pageResult.map(publicationService::convertToResponse));
    }

    /** GET /api/public/publications/{id} */
    @GetMapping("/publications/{id}")
    public ResponseEntity<PublicationResponse> getPublicationById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(publicationService.getPublicationById(id));
    }

    /**
     * GET /api/public/publications/{id}/download
     * Téléchargement public du fichier PDF associé à une publication.
     */
    @GetMapping("/publications/{id}/download")
    public ResponseEntity<Resource> downloadPublicationPublic(@PathVariable("id") Long id) throws IOException {
        auditLogService.log("DOWNLOAD", "PUBLICATION", id,
                "Téléchargement public du fichier PDF");
        return publicationService.downloadFile(id);
    }

    /**
     * GET /api/public/publications/search?keyword=...&domaineId=...&chercheur=...
     * Recherche multicritères avec intersection des résultats, retournant un objet
     * Page.
     */
    @GetMapping("/publications/search")
    public ResponseEntity<Page<PublicationResponse>> searchPublications(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "domaineId", required = false) Long domaineId,
            @RequestParam(name = "chercheur", required = false) String chercheur,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        boolean hasKeyword = keyword != null && !keyword.isBlank();
        boolean hasDomaine = domaineId != null;
        boolean hasChercheur = chercheur != null && !chercheur.isBlank();

        Pageable pageable = PageRequest.of(page, size, Sort.by("datePublication").descending());

        if (!hasKeyword && !hasDomaine && !hasChercheur) {
            Page<Publication> pageResult = publicationRepository.findAll(pageable);
            return ResponseEntity.ok(pageResult.map(publicationService::convertToResponse));
        }

        Set<Publication> results = null;

        if (hasDomaine) {
            results = intersect(results,
                    new LinkedHashSet<>(publicationRepository.findByDomainesId(domaineId)));
        }
        if (hasChercheur) {
            results = intersect(results,
                    new LinkedHashSet<>(publicationRepository.findByChercheurNomOuPrenom(chercheur, chercheur)));
        }
        if (hasKeyword) {
            results = intersect(results,
                    new LinkedHashSet<>(publicationRepository.findByKeywordInTitreOrResume(keyword)));
        }

        List<Publication> fullList = results == null ? List.of() : List.copyOf(results);
        int fromIndex = Math.min((int) pageable.getOffset(), fullList.size());
        int toIndex = Math.min(fromIndex + pageable.getPageSize(), fullList.size());

        List<PublicationResponse> content = fullList.subList(fromIndex, toIndex).stream()
                .map(publicationService::convertToResponse)
                .collect(Collectors.toList());

        Page<PublicationResponse> pageResult = new PageImpl<>(content, pageable, fullList.size());
        return ResponseEntity.ok(pageResult);
    }

    // ══════════════════════ CHERCHEURS ══════════════════════

    /** GET /api/public/researchers */
    @GetMapping("/researchers")
    public List<ResearcherDTO> getAllResearchers() {
        return researcherService.getAllResearchers();
    }

    /** GET /api/public/researchers/{id} */
    @GetMapping("/researchers/{id}")
    public ResponseEntity<ResearcherDTO> getResearcherById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(researcherService.getResearcherById(id));
    }

    /**
     * GET /api/public/researchers/search?keyword=...&nom=...&domaine=...
     * keyword est un alias de nom pour compatibilité frontend.
     */
    @GetMapping("/researchers/search")
    public List<ResearcherDTO> searchResearchers(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "nom", required = false) String nom,
            @RequestParam(name = "domaine", required = false) String domaine) {

        String searchNom = (nom != null && !nom.isBlank()) ? nom : keyword;
        return researcherService.search(searchNom, null, domaine);
    }

    // ══════════════════════ DOMAINES ══════════════════════

    /** GET /api/public/domains */
    @GetMapping("/domains")
    public List<DomainDTO> getAllDomains() {
        return domainService.getAllDomains();
    }

    /** GET /api/public/domains/{id} */
    @GetMapping("/domains/{id}")
    public ResponseEntity<DomainDTO> getDomainById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(domainService.getDomainById(id));
    }

    /**
     * CORRECTION — Ajout de la recherche publique par domaine.
     * GET /api/public/domains/search?keyword=nlp
     */
    @GetMapping("/domains/search")
    public List<DomainDTO> searchDomains(@RequestParam("keyword") String keyword) {
        return domainService.searchDomains(keyword);
    }

    // ══════════════════════ ACTUALITÉS ══════════════════════

    /**
     * GET /api/public/actualites — Uniquement les actualités actives,
     * accessibles sans authentification.
     */
    @GetMapping("/actualites")
    public List<ActualiteDTO> getActualitesActives() {
        return actualiteService.getAllActives();
    }

    // ══════════════════════ UTILITAIRE ══════════════════════

    private <T> Set<T> intersect(Set<T> base, Set<T> candidate) {
        if (base == null)
            return candidate;
        base.retainAll(candidate);
        return base;
    }
}