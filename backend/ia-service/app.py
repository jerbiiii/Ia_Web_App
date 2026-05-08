from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
from groq import Groq
import numpy as np
import os
import json

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────
# CONFIGURATION LLM (GROQ API)
# ─────────────────────────────────────────────

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

if not GROQ_API_KEY:
    if os.path.exists("groq_key.txt"):
        with open("groq_key.txt", "r") as f:
            GROQ_API_KEY = f.read().strip()
    else:
        print("ATTENTION : 'groq_key.txt' est manquant et GROQ_API_KEY n'est pas définie.")
        GROQ_API_KEY = "dummy_key_please_replace"

print(f"Clé Groq chargée : {'...' + GROQ_API_KEY[-4:] if GROQ_API_KEY and len(GROQ_API_KEY) > 4 else GROQ_API_KEY}")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

try:
    groq_client = Groq(api_key=GROQ_API_KEY)
except Exception as e:
    print(f"Erreur d'initialisation Groq : {e}")
    groq_client = None

# ─────────────────────────────────────────────
# CHARGEMENT MODÈLE EMBEDDING (BGE-M3)
# ─────────────────────────────────────────────

print("Chargement du modele BGE-M3...")
embedder = SentenceTransformer("BAAI/bge-m3")
print("Modele charge")

# ─────────────────────────────────────────────
# SYSTEM PROMPT MULTI-ACTEURS
# ─────────────────────────────────────────────

SYSTEM_PROMPT = """Tu es ARIA, l'assistant IA intelligent et officiel de la plateforme IA-Technology.
IA-Technology est une plateforme professionnelle de gestion et de diffusion des travaux scientifiques et publications de recherche en Intelligence Artificielle (NLP, Vision par ordinateur, Cybersécurité IA, et autres domaines émergents).

════════════════════════════════════════
ACTEURS ET LEURS DROITS D'ACCÈS
════════════════════════════════════════

🔴 ADMINISTRATEUR (role: ADMIN)
  Accès complet à toutes les fonctionnalités :
  - Gestion des chercheurs (ajouter, modifier, supprimer, consulter les profils)
  - Gestion des domaines scientifiques (créer, modifier, classifier)
  - Gestion des publications (ajouter, modifier, supprimer, uploader PDF/DOI)
  - Gestion des comptes utilisateurs (créer, supprimer, attribuer des rôles)
  - Accès aux statistiques et tableaux de bord

🟡 MODÉRATEUR (role: MODERATOR)
  Accès limité à la gestion du contenu éditorial :
  - Gestion de la page d'accueil (actualités, annonces, projets mis en avant)
  - Publication et modification des actualités
  - Mise en avant des projets récents
  ⚠️ PAS d'accès à : gestion des comptes, chercheurs, publications scientifiques

🟢 UTILISATEUR CONNECTÉ (role: USER)
  Accès aux fonctionnalités de recherche et consultation :
  - Inscription et gestion de son profil personnel
  - Recherche de publications (par domaine, nom de chercheur, mots-clés)
  - Consultation et TÉLÉCHARGEMENT des publications
  ⚠️ PAS d'accès à : fonctions d'administration ou de modération

⚪ VISITEUR (non connecté)
  Accès très limité :
  - Consultation de la page d'accueil uniquement
  - Consultation des publications sans téléchargement
  ⚠️ PAS d'accès à : recherche avancée, téléchargement, profil, administration

════════════════════════════════════════
FONCTIONNALITÉS DE L'APPLICATION
════════════════════════════════════════
- Centralisation des informations sur les chercheurs et publications scientifiques
- Recherche sémantique intelligente par domaine, chercheur, ou mots-clés
- Consultation et téléchargement de documents (PDF, DOI)
- Actualités et annonces sur les projets IA
- Interface responsive (desktop et mobile)
- Sécurité JWT avec gestion des rôles

════════════════════════════════════════
MODE QUESTIONNAIRE DE RECHERCHE PAR INTÉRÊTS
════════════════════════════════════════
⚠️ IMPORTANT : Si l'utilisateur donne déjà une requête TRÈS PRÉCISE (ex: "détection cancer", "robotique", ou donne un nom précis comme "Karim"), IGNORE CE QUESTIONNAIRE et lance immédiatement l'action SEARCH.
Ne lance ce questionnaire QUE SI la demande est VAGUE (ex: "Je cherche des publications", "Montre-moi des articles").

Lorsque la demande est vague, tu dois l'interroger ÉTAPE PAR ÉTAPE comme un formulaire intelligent (une seule question à la fois) :

ÉTAPE 1 - Domaine scientifique :
  "Dans quel domaine souhaitez-vous chercher ?
   • 🤖 NLP / Traitement du Langage Naturel
   • 👁️ Vision par ordinateur
   • 🔒 Cybersécurité basée sur l'IA
   • 📊 Machine Learning / Deep Learning
   • 🌐 Autre domaine (précisez)"

ÉTAPE 2 - Type de contenu :
  "Quel type de travaux recherchez-vous ?
   • 📄 Articles scientifiques
   • 🎓 Thèses / Mémoires
   • 🔬 Projets de recherche
   • 📚 Tous types"

ÉTAPE 3 - Période :
  "Avez-vous une préférence sur la période ?
   • 📅 Récent (2023-2025)
   • 📅 Dernières 5 ans (2020-2025)
   • 📅 Sans restriction"

ÉTAPE 4 - Mot-clé spécifique (optionnel) :
  "Avez-vous un mot-clé ou un nom de chercheur spécifique ? (ou tapez 'Non' pour ignorer)"

Après avoir collecté les informations, LANCE la recherche sémantique.

════════════════════════════════════════
RÈGLES DE COMPORTEMENT
════════════════════════════════════════
- Réponds TOUJOURS en français.
- Réponds UNIQUEMENT avec un JSON valide, sans texte hors JSON.
- Ne fabrique JAMAIS de publications ou de chercheurs inexistants.
- Utilise UNIQUEMENT les publications fournies dans le contexte.
- Si un utilisateur demande une action pour laquelle il n'a pas les droits, explique-lui poliment qu'il doit se connecter ou contacter l'administrateur.
- Sois professionnel, chaleureux et précis.
- Si le message de l'utilisateur n'est pas clair, est incompréhensible ou semble être du texte aléatoire, réponds poliment en disant que vous n'avez pas compris et proposez votre aide pour la recherche de publications.
- Si la question n'est pas liée à la plateforme, redirige poliment mais réponds brièvement.

════════════════════════════════════════
FORMAT DE RÉPONSE JSON STRICT
════════════════════════════════════════

1️⃣ Pour poser une question (questionnaire) :
{
  "action": "QUESTION",
  "step": <numéro_étape>,
  "reply": "Question posée à l'utilisateur... (ATTENTION: utilise STRICTEMENT des '\\n' pour les retours à la ligne afin que le JSON reste valide)"
}

2️⃣ Pour lancer une recherche sémantique :
{
  "action": "SEARCH",
  "query": "mots-clés optimisés pour la recherche",
  "reply": "Message professionnel annonçant que la recherche est lancée."
}

3️⃣ Pour une réponse informative (guide, aide, navigation) :
{
  "action": "CHAT",
  "reply": "Réponse claire, structurée et utile."
}

4️⃣ Pour un accès refusé (rôle insuffisant) :
{
  "action": "ACCESS_DENIED",
  "reply": "Message poli expliquant que cette fonctionnalité nécessite un rôle spécifique (connectez-vous ou contactez l'admin)."
}
"""

# ─────────────────────────────────────────────
# RECHERCHE SÉMANTIQUE
# ─────────────────────────────────────────────

def cosine_similarity(vec, matrix):
    vec_norm = vec / (np.linalg.norm(vec) + 1e-10)
    norms = np.linalg.norm(matrix, axis=1, keepdims=True) + 1e-10
    matrix_norm = matrix / norms
    return matrix_norm.dot(vec_norm)

def search_publications(query, publications, top_k=5):
    if not publications or not query:
        return []
    texts = [f"{p.get('titre', '')}. {p.get('resume', '')}" for p in publications]
    q_emb = embedder.encode(query)
    p_embs = embedder.encode(texts)
    scores = cosine_similarity(q_emb, p_embs)
    results = [{**pub, "score": float(scores[i])} for i, pub in enumerate(publications)]
    results = [r for r in results if r["score"] > 0.25]
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]

def format_publications_for_prompt(publications):
    if not publications:
        return "Aucune publication disponible."
    lines = []
    for i, p in enumerate(publications[:30], 1):
        titre = p.get("titre", "Sans titre")
        resume = (p.get("resume") or "")[:180]
        annee = p.get("annee", "")
        lines.append(f"{i}. [{p.get('id')}] {titre} ({annee}) - {resume}")
    return "\n".join(lines)

# ─────────────────────────────────────────────
# APPEL GROQ API
# ─────────────────────────────────────────────

def call_groq(messages, system_with_context):
    full_messages = [{"role": "system", "content": system_with_context}] + messages
    try:
        if not GROQ_API_KEY or GROQ_API_KEY == "dummy_key_please_replace":
            return json.dumps({
                "action": "CHAT",
                "reply": "⚠️ La clé API Groq est manquante ou invalide. Veuillez configurer 'GROQ_API_KEY' ou créer le fichier 'groq_key.txt' pour activer ARIA."
            })
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=full_messages,
            temperature=0.2,
            max_tokens=400
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Erreur Groq : {e}")
        return json.dumps({
            "action": "CHAT",
            "reply": f"Désolé, j'ai rencontré une erreur technique lors de la communication avec l'IA : {str(e)}"
        })

def parse_llm_response(raw):
    try:
        return json.loads(raw, strict=False)
    except:
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            if start != -1 and end != 0:
                return json.loads(raw[start:end], strict=False)
            return {"action": "CHAT", "reply": "Erreur de format IA (JSON introuvable)."}
        except Exception as e:
            print(f"JSON Parse Error: {e} | Raw: {raw}")
            return {"action": "CHAT", "reply": "Erreur de format IA."}

# ─────────────────────────────────────────────
# CLASSIFICATION AUTOMATIQUE DES PUBLICATIONS
# ─────────────────────────────────────────────

DOMAINS_LABELS = {
    "NLP / Traitement du Langage Naturel": "natural language processing text classification sentiment analysis named entity recognition transformer BERT GPT language model machine translation",
    "Vision par ordinateur": "computer vision image recognition object detection convolutional neural network CNN image segmentation face recognition deep learning visual",
    "Cybersécurité basée sur l'IA": "cybersecurity intrusion detection anomaly detection malware network security threat intelligence adversarial attacks machine learning security",
    "Machine Learning / Deep Learning": "machine learning deep learning neural network supervised unsupervised reinforcement learning optimization gradient descent classification regression",
    "Traitement du signal": "signal processing audio speech recognition time series frequency domain feature extraction fourier transform",
    "Robotique et IA embarquée": "robotics autonomous systems embedded AI real-time control path planning reinforcement learning",
    "Systèmes de recommandation": "recommendation system collaborative filtering content-based filtering matrix factorization user behavior personalization",
    "Big Data et Analyse de données": "big data data analysis data mining clustering feature engineering dimensionality reduction statistical learning",
}

_domain_emb_cache = None

def get_cached_domain_embeddings():
    global _domain_emb_cache
    if _domain_emb_cache is None:
        print("Calcul des embeddings de domaines pour la classification...")
        labels = list(DOMAINS_LABELS.keys())
        descriptions = list(DOMAINS_LABELS.values())
        embs = embedder.encode(descriptions)
        _domain_emb_cache = list(zip(labels, embs))
        print(f"Embeddings calculés pour {len(labels)} domaines")
    return _domain_emb_cache