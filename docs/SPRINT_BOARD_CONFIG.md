# DataSphere Innovation - Sprint Board Configuration
# GitHub Projects Configuration

## Board Structure

### Columns (Swimlanes)

| Column | Description | WIP Limit |
|--------|-------------|-----------|
| 📋 **Backlog** | Tickets prêts à être pris | - |
| 🎯 **Sprint Backlog** | Sélectionnés pour ce sprint | 20 |
| 🔄 **En Progrès** | Actuellement développés | 3/dev |
| 👀 **Code Review** | En attente de review | 5 |
| 🧪 **QA/Testing** | En validation | 5 |
| ✅ **Done** | Terminés ce sprint | - |
| 🚫 **Blocked** | En attente externe | 3 |

### Automated Workflows

```yaml
# .github/workflows/project-automation.yml
name: Project Board Automation

on:
  issues:
    types: [assigned, labeled]
  pull_request:
    types: [opened, review_requested, closed]

jobs:
  automate-project-columns:
    runs-on: ubuntu-latest
    steps:
      - name: Move to In Progress
        if: github.event.action == 'assigned'
        uses: alex-page/github-project-automation-plus@v0.8.1
        with:
          project: DataSphere Innovation
          column: En Progrès
          repo-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Move to Code Review
        if: github.event.action == 'review_requested'
        uses: alex-page/github-project-automation-plus@v0.8.1
        with:
          project: DataSphere Innovation
          column: Code Review
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

---

## Sprint Velocity Tracking

### Historical Velocity

| Sprint | Story Points | Team Size | Velocity/Dev |
|--------|-------------|-----------|--------------|
| S1 | 34 | 4 | 8.5 |
| S2 | 40 | 4 | 10.0 |
| S3 | 38 | 5 | 7.6 |
| S4 | 45 | 5 | 9.0 |
| **Average** | **39** | **4.5** | **8.8** |

### Estimation Guide

| Story Points | Effort | Examples |
|--------------|--------|----------|
| 1 | Trivial | Fix typo, add log |
| 2 | Small | Add validation, simple component |
| 3 | Medium | New API endpoint, small feature |
| 5 | Large | Complex feature, integration |
| 8 | X-Large | Major feature, refactoring |
| 13 | Epic | Should be split |

---

## Definition of Ready Checklist

```markdown
## Definition of Ready

- [ ] User story format utilisé
- [ ] Critères d'acceptation définis
- [ ] Pas de dépendances bloquantes
- [ ] Estimation effectuée (Planning Poker)
- [ ] Design/mockups disponibles si UI
- [ ] Tests d'acceptation identifiés
- [ ] Tech Lead validé
```

---

## Definition of Done Checklist

```markdown
## Definition of Done

### Développement
- [ ] Code implémenté
- [ ] Suivi des conventions
- [ ] Pas de code commenté
- [ ] Pas de TODO non tracé

### Tests
- [ ] Tests unitaires (≥80% coverage)
- [ ] Tests intégration si API
- [ ] Tests E2E si parcours critique
- [ ] Tous tests passent

### Qualité
- [ ] Lint sans erreurs
- [ ] TypeScript sans erreurs
- [ ] Code review approuvé (2 reviewers)
- [ ] Pas de dettes techniques

### Documentation
- [ ] JSDoc pour nouvelles fonctions
- [ ] README mis à jour si nécessaire
- [ ] API documentée si nouvel endpoint

### Déploiement
- [ ] Staging validé
- [ ] Pas de régression
- [ ] Monitoring en place
```

---

## Sprint Ceremonies Schedule

```yaml
sprint_schedule:
  daily_standup:
    time: "09:30"
    duration: "15min"
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"]
    
  sprint_planning:
    time: "14:00"
    duration: "60min"
    day: "Monday (Sprint Start)"
    
  backlog_grooming:
    time: "14:00"
    duration: "45min"
    day: "Wednesday (Sprint 1)"
    
  sprint_review:
    time: "15:00"
    duration: "60min"
    day: "Friday (Sprint End)"
    
  retrospective:
    time: "16:30"
    duration: "45min"
    day: "Friday (Sprint End)"
```

---

## Risk Management

### Sprint Risk Matrix

| Risk | Probability | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Scope creep | High | Medium | Strict change control | Tech Lead |
| Dependencies | Medium | High | Early identification | All |
| Resource availability | Medium | High | Buffer 20% | PM |
| Technical debt | Medium | Medium | Allocate capacity | Tech Lead |

### Escalation Path

```
Developer → Tech Lead → Engineering Manager → CTO
```

---

## Metrics Dashboard

### Sprint Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Velocity | 35-45 SP | Story points completed |
| Sprint Burndown | Linear | Daily remaining SP |
| Code Coverage | ≥80% | Jest coverage report |
| Bug Escape Rate | <5% | Bugs found post-release |
| Cycle Time | <3 days | In Progress to Done |
| Lead Time | <7 days | Backlog to Done |

### Quality Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Build Success Rate | >95% | <90% |
| Test Pass Rate | >99% | <95% |
| Code Review Time | <24h | >48h |
| Open PR Age | <3 days | >7 days |

---

## Team Capacity Planning

### Per Sprint (2 weeks)

| Role | Availability | Capacity |
|------|-------------|----------|
| Backend Dev | 80% | 8 days |
| Frontend Dev | 80% | 8 days |
| DevOps | 50% | 5 days |
| QA | 50% | 5 days |

### Holiday/PTE Buffer

- **Buffer recommandé**: 15% du capacity
- **Vacances été**: Prévoir -20% capacity Juillet-Août
- **Fêtes**: Prévoir -30% capacity Décembre

---

## Continuous Improvement

### Retrospective Action Items Template

```markdown
## Actions from Sprint XX

### Keep Doing ✅
1. [What went well]

### Start Doing 🆕
1. [New practice to try]
   - Owner: @xxx
   - Due: Sprint XX

### Stop Doing 🛑
1. [Practice to discontinue]
   - Reason: [Why]

### Action Items
| Action | Owner | Due | Status |
|--------|-------|-----|--------|
| | | | |
```

---

*Configuration version: 1.0*
*Last updated: January 2025*
