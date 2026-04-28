package tn.iatechnology.backend.repository;

import tn.iatechnology.backend.entity.Domain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface DomainRepository extends JpaRepository<Domain, Long> {
    List<Domain> findByNomContainingIgnoreCase(String nom);
    List<Domain> findByParentIsNull(); // pour récupérer les domaines racines

}