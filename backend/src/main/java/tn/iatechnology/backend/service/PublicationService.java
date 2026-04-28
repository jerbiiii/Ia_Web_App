package tn.iatechnology.backend.service;

import tn.iatechnology.backend.dto.PublicationRequest;
import tn.iatechnology.backend.dto.PublicationResponse;
import tn.iatechnology.backend.entity.Domain;
import tn.iatechnology.backend.entity.Publication;
import tn.iatechnology.backend.entity.Researcher;
import tn.iatechnology.backend.repository.DomainRepository;
import tn.iatechnology.backend.repository.PublicationRepository;
import tn.iatechnology.backend.repository.ResearcherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PublicationService {

    @Autowired
    private PublicationRepository publicationRepository;

    @Autowired
    private ResearcherRepository researcherRepository;

    @Autowired
    private DomainRepository domainRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public List<PublicationResponse> getAllPublications() {
        return publicationRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public PublicationResponse getPublicationById(Long id) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publication non trouvée avec l'id: " + id));
        return convertToResponse(publication);
    }

    @Transactional
    public PublicationResponse createPublication(PublicationRequest request, MultipartFile fichier) throws IOException {
        Publication publication = new Publication();
        publication.setTitre(request.getTitre());
        publication.setResume(request.getResume());
        publication.setDatePublication(request.getDatePublication());
        publication.setDoi(request.getDoi());

        // Gestion du fichier
        if (fichier != null && !fichier.isEmpty()) {
            String fileName = fileStorageService.storeFile(fichier);
            publication.setCheminFichier(fileName);
        }

        // Association des chercheurs
        if (request.getChercheursIds() != null && !request.getChercheursIds().isEmpty()) {
            Set<Researcher> chercheurs = new HashSet<>(researcherRepository.findAllById(request.getChercheursIds()));
            publication.setChercheurs(chercheurs);
        }

        // Association des domaines
        if (request.getDomainesIds() != null && !request.getDomainesIds().isEmpty()) {
            Set<Domain> domaines = new HashSet<>(domainRepository.findAllById(request.getDomainesIds()));
            publication.setDomaines(domaines);
        }

        Publication saved = publicationRepository.save(publication);
        return convertToResponse(saved);
    }

    @Transactional
    public PublicationResponse updatePublication(Long id, PublicationRequest request, MultipartFile fichier) throws IOException {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publication non trouvée avec l'id: " + id));

        publication.setTitre(request.getTitre());
        publication.setResume(request.getResume());
        publication.setDatePublication(request.getDatePublication());
        publication.setDoi(request.getDoi());

        // Gestion du fichier : si nouveau fichier, supprimer l'ancien et enregistrer le nouveau
        if (fichier != null && !fichier.isEmpty()) {
            if (publication.getCheminFichier() != null) {
                fileStorageService.deleteFile(publication.getCheminFichier());
            }
            String fileName = fileStorageService.storeFile(fichier);
            publication.setCheminFichier(fileName);
        }

        // Mise à jour des chercheurs
        if (request.getChercheursIds() != null) {
            Set<Researcher> chercheurs = new HashSet<>(researcherRepository.findAllById(request.getChercheursIds()));
            publication.setChercheurs(chercheurs);
        } else {
            publication.getChercheurs().clear();
        }

        // Mise à jour des domaines
        if (request.getDomainesIds() != null) {
            Set<Domain> domaines = new HashSet<>(domainRepository.findAllById(request.getDomainesIds()));
            publication.setDomaines(domaines);
        } else {
            publication.getDomaines().clear();
        }

        Publication updated = publicationRepository.save(publication);
        return convertToResponse(updated);
    }

    @Transactional
    public void deletePublication(Long id) throws IOException {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publication non trouvée avec l'id: " + id));
        // Supprimer le fichier associé
        if (publication.getCheminFichier() != null) {
            fileStorageService.deleteFile(publication.getCheminFichier());
        }
        publicationRepository.delete(publication);
    }

    public ResponseEntity<Resource> downloadFile(Long id) throws IOException {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publication non trouvée"));
        if (publication.getCheminFichier() == null) {
            throw new RuntimeException("Aucun fichier associé à cette publication");
        }
        Resource resource = fileStorageService.loadFileAsResource(publication.getCheminFichier());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + publication.getCheminFichier() + "\"")
                .body(resource);
    }

    public PublicationResponse convertToResponse(Publication publication) {
        PublicationResponse response = new PublicationResponse();
        response.setId(publication.getId());
        response.setTitre(publication.getTitre());
        response.setResume(publication.getResume());
        response.setDatePublication(publication.getDatePublication());
        response.setDoi(publication.getDoi());
        response.setCheminFichier(publication.getCheminFichier());

        if (publication.getChercheurs() != null) {
            response.setChercheursIds(publication.getChercheurs().stream()
                    .map(Researcher::getId)
                    .collect(Collectors.toSet()));
            response.setChercheursNoms(publication.getChercheurs().stream()
                    .map(r -> r.getPrenom() + " " + r.getNom())
                    .collect(Collectors.toSet()));
        }

        if (publication.getDomaines() != null) {
            response.setDomainesIds(publication.getDomaines().stream()
                    .map(Domain::getId)
                    .collect(Collectors.toSet()));
            response.setDomainesNoms(publication.getDomaines().stream()
                    .map(Domain::getNom)
                    .collect(Collectors.toSet()));
        }

        return response;
    }
}