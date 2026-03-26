## 📝 Description

Description claire et concise des changements apportés.

## 🔗 Ticket Lié

Closes #XXX

## 🎯 Type de Changement

- [ ] 🚀 Feature (nouvelle fonctionnalité)
- [ ] 🐛 Bug fix (correction)
- [ ] ♻️ Refactoring (sans changement de comportement)
- [ ] 📚 Documentation
- [ ] 🧪 Tests
- [ ] 🔧 Configuration / Chore

## 🧪 Tests

### Tests Ajoutés/Modifiés

- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Tests E2E

### Vérifications Locales

```bash
# Tests passés
bun run test

# Lint OK
bun run lint

# TypeScript OK
bun run typecheck

# Build OK
bun run build
```

## 📸 Captures d'Écran (si applicable)

### Avant

[Screenshot avant]

### Après

[Screenshot après]

## 📋 Checklist

### Auteur

- [ ] Code testé localement
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Pas de secrets/credentials exposés
- [ ] Branch à jour avec develop
- [ ] Commits suivent la convention

### Reviewer

- [ ] Code review effectué
- [ ] Architecture/Design validé
- [ ] Tests pertinents
- [ ] Pas de problème de sécurité
- [ ] Performance acceptable

## 🚀 Instructions de Déploiement

Instructions spéciales pour le déploiement (migrations DB, variables d'env, etc.) :

```bash
# Commandes de déploiement si nécessaires
```

## ⚠️ Breaking Changes

Cette PR introduit-elle des breaking changes ?

- [ ] Non
- [ ] Oui (décrire ci-dessous)

### Breaking Changes Description

Si oui, décrire les changements et la procédure de migration.

## 📊 Impact Performance

- [ ] Pas d'impact
- [ ] Amélioration
- [ ] Risque de dégradation (justifier)

### Métriques

| Métrique | Avant | Après |
|----------|-------|-------|
| Temps de réponse | | |
| Taille bundle | | |
| Requêtes DB | | |

## 🔒 Sécurité

Cette PR touche-t-elle à la sécurité ?

- [ ] Non concerné
- [ ] Module de sécurité modifié
- [ ] Nouveau endpoint API
- [ ] Traitement de données sensibles

### Review Sécurité

Si applicable, décrire les implications de sécurité et les mesures prises.

---

**Review Guidelines:**
1. Vérifier que les tests passent en CI
2. Tester manuellement les changements
3. Valider l'architecture
4. Approuver avec commentaire si nécessaire
