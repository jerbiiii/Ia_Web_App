package tn.iatechnology.backend.service;

import tn.iatechnology.backend.dto.DomainDTO;
import tn.iatechnology.backend.entity.Domain;
import tn.iatechnology.backend.repository.DomainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DomainService {

    @Autowired
    private DomainRepository domainRepository;

    public List<DomainDTO> getAllDomains() {
        return domainRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DomainDTO> getRootDomains() {
        return domainRepository.findByParentIsNull().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DomainDTO getDomainById(Long id) {
        Domain domain = domainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Domaine non trouvé avec l'id: " + id));
        return convertToDTO(domain);
    }

    @Transactional
    public DomainDTO createDomain(DomainDTO dto) {
        Domain domain = new Domain();
        domain.setNom(dto.getNom());
        domain.setDescription(dto.getDescription());

        if (dto.getParentId() != null) {
            Domain parent = domainRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent non trouvé"));
            domain.setParent(parent);
        }

        Domain saved = domainRepository.save(domain);
        return convertToDTO(saved);
    }

    @Transactional
    public DomainDTO updateDomain(Long id, DomainDTO dto) {
        Domain domain = domainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Domaine non trouvé avec l'id: " + id));

        domain.setNom(dto.getNom());
        domain.setDescription(dto.getDescription());

        if (dto.getParentId() != null) {
            Domain parent = domainRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent non trouvé"));
            domain.setParent(parent);
        } else {
            domain.setParent(null);
        }

        Domain updated = domainRepository.save(domain);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteDomain(Long id) {
        // Supprimer également les enfants ? Par sécurité, on peut lever une exception s'il y a des enfants
        Domain domain = domainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Domaine non trouvé"));
        if (!domain.getEnfants().isEmpty()) {
            throw new RuntimeException("Impossible de supprimer un domaine qui a des sous-domaines");
        }
        domainRepository.deleteById(id);
    }

    public List<DomainDTO> searchDomains(String keyword) {
        List<Domain> domains = domainRepository.findByNomContainingIgnoreCase(keyword);
        return domains.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private DomainDTO convertToDTO(Domain domain) {
        DomainDTO dto = new DomainDTO();
        dto.setId(domain.getId());
        dto.setNom(domain.getNom());
        dto.setDescription(domain.getDescription());
        if (domain.getParent() != null) {
            dto.setParentId(domain.getParent().getId());
        }

        if (domain.getEnfants() != null && !domain.getEnfants().isEmpty()) {
            dto.setEnfants(domain.getEnfants().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }
}