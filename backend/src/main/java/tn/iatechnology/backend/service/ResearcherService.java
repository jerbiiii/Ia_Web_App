package tn.iatechnology.backend.service;

import tn.iatechnology.backend.dto.ResearcherDTO;
import tn.iatechnology.backend.entity.Domain;
import tn.iatechnology.backend.entity.Researcher;
import tn.iatechnology.backend.entity.User;
import tn.iatechnology.backend.repository.DomainRepository;
import tn.iatechnology.backend.repository.ResearcherRepository;
import tn.iatechnology.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ResearcherService {

    @Autowired
    private ResearcherRepository researcherRepository;

    @Autowired
    private DomainRepository domainRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ResearcherDTO> getAllResearchers() {
        return researcherRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ResearcherDTO getResearcherById(Long id) {
        Researcher researcher = researcherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chercheur non trouvé avec l'id: " + id));
        return convertToDTO(researcher);
    }

    @Transactional
    public ResearcherDTO createResearcher(ResearcherDTO dto) {
        Researcher researcher = new Researcher();
        researcher.setNom(dto.getNom());
        researcher.setPrenom(dto.getPrenom());
        researcher.setEmail(dto.getEmail());
        researcher.setAffiliation(dto.getAffiliation());

        if (dto.getDomainePrincipalId() != null) {
            Domain domaine = domainRepository.findById(dto.getDomainePrincipalId())
                    .orElseThrow(() -> new RuntimeException("Domaine non trouvé"));
            researcher.setDomainePrincipal(domaine);
        }

        if (dto.getAutresDomainesIds() != null && !dto.getAutresDomainesIds().isEmpty()) {
            Set<Domain> autres = new HashSet<>(domainRepository.findAllById(dto.getAutresDomainesIds()));
            researcher.setAutresDomaines(autres);
        }

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            researcher.setUser(user);
        }

        Researcher saved = researcherRepository.save(researcher);
        return convertToDTO(saved);
    }

    @Transactional
    public ResearcherDTO updateResearcher(Long id, ResearcherDTO dto) {
        Researcher researcher = researcherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chercheur non trouvé avec l'id: " + id));

        researcher.setNom(dto.getNom());
        researcher.setPrenom(dto.getPrenom());
        researcher.setEmail(dto.getEmail());
        researcher.setAffiliation(dto.getAffiliation());

        if (dto.getDomainePrincipalId() != null) {
            Domain domaine = domainRepository.findById(dto.getDomainePrincipalId())
                    .orElseThrow(() -> new RuntimeException("Domaine non trouvé"));
            researcher.setDomainePrincipal(domaine);
        } else {
            researcher.setDomainePrincipal(null);
        }

        if (dto.getAutresDomainesIds() != null) {
            Set<Domain> autres = new HashSet<>(domainRepository.findAllById(dto.getAutresDomainesIds()));
            researcher.setAutresDomaines(autres);
        } else {
            researcher.getAutresDomaines().clear();
        }

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            researcher.setUser(user);
        } else {
            researcher.setUser(null);
        }

        Researcher updated = researcherRepository.save(researcher);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteResearcher(Long id) {
        researcherRepository.deleteById(id);
    }

    public List<ResearcherDTO> search(String nom, String prenom, String domaine) {
        List<Researcher> researchers;

        if (domaine != null && !domaine.isEmpty()) {
            // Recherche par domaine principal ou secondaire
            researchers = researcherRepository.findByDomainePrincipalNomIgnoreCase(domaine);
            researchers.addAll(researcherRepository.findByAutreDomaineNom(domaine));
        } else if (nom != null && !nom.isEmpty() && prenom != null && !prenom.isEmpty()) {
            researchers = researcherRepository.findByNomOrPrenom(nom, prenom);
        } else if (nom != null && !nom.isEmpty()) {
            researchers = researcherRepository.findByNomContainingIgnoreCase(nom);
        } else if (prenom != null && !prenom.isEmpty()) {
            researchers = researcherRepository.findByPrenomContainingIgnoreCase(prenom);
        } else {
            researchers = researcherRepository.findAll();
        }

        return researchers.stream()
                .map(this::convertToDTO)
                .distinct() // éviter les doublons si un chercheur a plusieurs domaines
                .collect(Collectors.toList());
    }

    public ResearcherDTO convertToDTO(Researcher researcher) {
        ResearcherDTO dto = new ResearcherDTO();
        dto.setId(researcher.getId());
        dto.setNom(researcher.getNom());
        dto.setPrenom(researcher.getPrenom());
        dto.setEmail(researcher.getEmail());
        dto.setAffiliation(researcher.getAffiliation());

        if (researcher.getDomainePrincipal() != null) {
            dto.setDomainePrincipalId(researcher.getDomainePrincipal().getId());
            dto.setDomainePrincipalNom(researcher.getDomainePrincipal().getNom());
        }

        if (researcher.getAutresDomaines() != null) {
            dto.setAutresDomainesIds(researcher.getAutresDomaines().stream()
                    .map(Domain::getId)
                    .collect(Collectors.toSet()));
        }

        if (researcher.getUser() != null) {
            dto.setUserId(researcher.getUser().getId());
        }

        return dto;
    }
    public ResearcherDTO getResearcherByUserId(Long userId) {
        Researcher researcher = researcherRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Chercheur non trouvé pour cet utilisateur"));
        return convertToDTO(researcher);
    }
}