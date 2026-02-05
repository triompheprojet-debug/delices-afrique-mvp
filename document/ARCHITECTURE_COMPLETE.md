# ARCHITECTURE COMPLÈTE - DÉLICES D'AFRIQUE

## 📁 STRUCTURE COMPLÈTE DU PROJET

```
delices-afrique/
│
├── public/
│   ├── images/
│   │   ├── hero-pastry.jpg              [NOUVEAU - Image hero]
│   │   ├── default-supplier.jpg         [NOUVEAU - Image fournisseur par défaut]
│   │   └── logo.png                     [EXISTANT - À vérifier]
│   └── favicon.ico
│
├── src/
│   │
│   ├── main.jsx                         [EXISTANT - À vérifier]
│   ├── App.jsx                          [EXISTANT - À modifier]
│   ├── index.css                        [EXISTANT - À MODIFIER IMPORTANT]
│   ├── firebase.js                      [EXISTANT - À vérifier]
│   ├── config.js                        [EXISTANT - À vérifier]
│   │
│   ├── utils/                           [NOUVEAU DOSSIER]
│   │   ├── calculations.js              [NOUVEAU - Calculs partenaires]
│   │   ├── firebase-helpers.js          [NOUVEAU - Helpers Firebase]
│   │   ├── formatters.js                [NOUVEAU - Formatage données]
│   │   └── validators.js                [NOUVEAU - Validations]
│   │
│   ├── hooks/                           [NOUVEAU DOSSIER]
│   │   ├── useAuth.js                   [NOUVEAU - Hook authentification]
│   │   ├── usePartner.js                [NOUVEAU - Hook données partenaire]
│   │   ├── useSupplier.js               [NOUVEAU - Hook données fournisseur]
│   │   └── useConfig.js                 [NOUVEAU - Hook config globale]
│   │
│   ├── context/                         [EXISTANT DOSSIER]
│   │   ├── CartContext.jsx              [EXISTANT - À vérifier]
│   │   ├── ConfigContext.jsx            [EXISTANT - À MODIFIER]
│   │   └── AuthContext.jsx              [NOUVEAU - Contexte auth global]
│   │
│   ├── components/
│   │   │
│   │   ├── layout/                      [EXISTANT DOSSIER]
│   │   │   ├── AdminLayout.jsx          [EXISTANT - À vérifier]
│   │   │   ├── ClientLayout.jsx         [EXISTANT - À vérifier]
│   │   │   ├── PartnerLayout.jsx        [NOUVEAU - Layout partenaire]
│   │   │   └── SupplierLayout.jsx       [NOUVEAU - Layout fournisseur]
│   │   │
│   │   ├── client/                      [EXISTANT DOSSIER]
│   │   │   ├── CartDrawer.jsx           [EXISTANT - À vérifier]
│   │   │   ├── LocationPicker.jsx       [EXISTANT - À vérifier]
│   │   │   ├── ProductCard.jsx          [EXISTANT - À MODIFIER]
│   │   │   │
│   │   │   └── home/                    [NOUVEAU SOUS-DOSSIER]
│   │   │       ├── HeroSection.jsx      [NOUVEAU]
│   │   │       ├── ProductsSignature.jsx [NOUVEAU]
│   │   │       ├── TopPartners.jsx      [NOUVEAU]
│   │   │       ├── OurArtisans.jsx      [NOUVEAU]
│   │   │       ├── HowItWorks.jsx       [NOUVEAU]
│   │   │       ├── Testimonials.jsx     [NOUVEAU]
│   │   │       └── CTASection.jsx       [NOUVEAU]
│   │   │
│   │   ├── partner/                     [NOUVEAU DOSSIER]
│   │   │   ├── DashboardStats.jsx       [NOUVEAU - Stats dashboard]
│   │   │   ├── CodeShare.jsx            [NOUVEAU - Partage code]
│   │   │   ├── SalesHistory.jsx         [NOUVEAU - Historique ventes]
│   │   │   ├── EarningsCard.jsx         [NOUVEAU - Carte gains]
│   │   │   ├── LevelProgress.jsx        [NOUVEAU - Progression niveau]
│   │   │   └── WithdrawModal.jsx        [NOUVEAU - Modal retrait]
│   │   │
│   │   ├── supplier/                    [NOUVEAU DOSSIER]
│   │   │   ├── ProductForm.jsx          [NOUVEAU - Formulaire produit]
│   │   │   ├── OrderCard.jsx            [NOUVEAU - Carte commande]
│   │   │   ├── FinancialSummary.jsx     [NOUVEAU - Résumé financier]
│   │   │   └── BlockedAccountModal.jsx  [NOUVEAU - Modal compte bloqué]
│   │   │
│   │   ├── admin/                       [EXISTANT DOSSIER]
│   │   │   ├── ProtectedRoute.jsx       [EXISTANT - À vérifier]
│   │   │   ├── StatsCard.jsx            [NOUVEAU - Carte statistiques]
│   │   │   ├── PartnerTable.jsx         [NOUVEAU - Table partenaires]
│   │   │   ├── SupplierTable.jsx        [NOUVEAU - Table fournisseurs]
│   │   │   ├── OrdersTable.jsx          [NOUVEAU - Table commandes]
│   │   │   ├── ConfigRulesForm.jsx      [NOUVEAU - Formulaire règles]
│   │   │   └── ProductValidation.jsx    [NOUVEAU - Validation produits]
│   │   │
│   │   └── common/                      [NOUVEAU DOSSIER]
│   │       ├── LoadingSpinner.jsx       [NOUVEAU - Spinner chargement]
│   │       ├── EmptyState.jsx           [NOUVEAU - État vide]
│   │       ├── Button.jsx               [NOUVEAU - Bouton réutilisable]
│   │       ├── Input.jsx                [NOUVEAU - Input réutilisable]
│   │       └── Modal.jsx                [NOUVEAU - Modal réutilisable]
│   │
│   └── pages/
│       │
│       ├── client/                      [EXISTANT DOSSIER]
│       │   ├── Home.jsx                 [EXISTANT - À REFONDRE COMPLÈTEMENT]
│       │   ├── Menu.jsx                 [EXISTANT - À MODIFIER]
│       │   ├── About.jsx                [EXISTANT - À vérifier]
│       │   ├── Contact.jsx              [EXISTANT - À vérifier]
│       │   ├── Checkout.jsx             [EXISTANT - À MODIFIER (code partenaire)]
│       │   └── Confirmation.jsx         [EXISTANT - À vérifier]
│       │
│       ├── partner/                     [EXISTANT DOSSIER]
│       │   ├── PartnerLayout.jsx        [EXISTANT - À MODIFIER]
│       │   ├── PartnerRegister.jsx      [EXISTANT - À REFONDRE]
│       │   ├── PartnerLogin.jsx         [EXISTANT - À MODIFIER]
│       │   ├── PartnerDashboard.jsx     [EXISTANT - À REFONDRE]
│       │   ├── PartnerSales.jsx         [EXISTANT - À REFONDRE]
│       │   ├── PartnerWallet.jsx        [EXISTANT - À REFONDRE]
│       │   └── PartnerRules.jsx         [NOUVEAU - Page règles]
│       │
│       ├── supplier/                    [EXISTANT DOSSIER]
│       │   ├── SupplierLayout.jsx       [EXISTANT - À MODIFIER]
│       │   ├── SupplierLogin.jsx        [EXISTANT - À MODIFIER]
│       │   ├── SupplierDashboard.jsx    [EXISTANT - À REFONDRE]
│       │   ├── SupplierProducts.jsx     [EXISTANT - À REFONDRE]
│       │   ├── SupplierOrders.jsx       [EXISTANT - À REFONDRE]
│       │   ├── SupplierWallet.jsx       [EXISTANT - À REFONDRE]
│       │   └── SupplierRules.jsx        [EXISTANT - À AMÉLIORER]
│       │
│       └── admin/                       [EXISTANT DOSSIER]
│           ├── Login.jsx                [EXISTANT - À vérifier]
│           ├── Dashboard.jsx            [EXISTANT - À AMÉLIORER]
│           ├── Products.jsx             [EXISTANT - À AMÉLIORER]
│           ├── Orders.jsx               [EXISTANT - À REFONDRE]
│           ├── Partners.jsx             [EXISTANT - À REFONDRE]
│           ├── Suppliers.jsx            [EXISTANT - À REFONDRE]
│           └── Settings.jsx             [EXISTANT - À REFONDRE (règles config)]
│
├── .eslintrc.cjs                        [EXISTANT - À vérifier]
├── vite.config.js                       [EXISTANT - OK]
├── package.json                         [EXISTANT - OK]
└── README.md                            [EXISTANT/NOUVEAU - À créer/améliorer]
```

---

## 📊 RÉCAPITULATIF PAR STATUT

### ✅ FICHIERS OK (À VÉRIFIER)
- `vite.config.js` ✅ (déjà configuré avec Tailwind 4)
- `package.json` ✅ (toutes les dépendances présentes)
- Fichiers de configuration de base

### 🔧 FICHIERS EXISTANTS À MODIFIER

#### CRITIQUE (modifications importantes)
1. `src/index.css` - **PRIORITÉ 1** (Tailwind 4 + variables)
2. `src/pages/client/Home.jsx` - **PRIORITÉ 1** (refonte complète)
3. `src/context/ConfigContext.jsx` - **PRIORITÉ 2** (logique partenaires)
4. `src/pages/client/Checkout.jsx` - **PRIORITÉ 2** (ajout code partenaire)
5. `src/components/client/ProductCard.jsx` - **PRIORITÉ 3** (améliorer design)

#### IMPORTANT (améliorer/compléter)
6. `src/pages/partner/PartnerDashboard.jsx` - Refondre
7. `src/pages/partner/PartnerRegister.jsx` - Refondre
8. `src/pages/partner/PartnerSales.jsx` - Refondre
9. `src/pages/partner/PartnerWallet.jsx` - Refondre
10. `src/pages/supplier/SupplierDashboard.jsx` - Refondre
11. `src/pages/supplier/SupplierProducts.jsx` - Refondre
12. `src/pages/supplier/SupplierOrders.jsx` - Refondre
13. `src/pages/admin/Dashboard.jsx` - Améliorer
14. `src/pages/admin/Orders.jsx` - Refondre
15. `src/pages/admin/Partners.jsx` - Refondre
16. `src/pages/admin/Suppliers.jsx` - Refondre
17. `src/pages/admin/Settings.jsx` - Refondre

### 🆕 NOUVEAUX FICHIERS À CRÉER

#### UTILS (7 fichiers)
1. `src/utils/calculations.js`
2. `src/utils/firebase-helpers.js`
3. `src/utils/formatters.js`
4. `src/utils/validators.js`

#### HOOKS (4 fichiers)
5. `src/hooks/useAuth.js`
6. `src/hooks/usePartner.js`
7. `src/hooks/useSupplier.js`
8. `src/hooks/useConfig.js`

#### CONTEXT (1 fichier)
9. `src/context/AuthContext.jsx`

#### COMPONENTS - HOME (7 fichiers)
10. `src/components/client/home/HeroSection.jsx`
11. `src/components/client/home/ProductsSignature.jsx`
12. `src/components/client/home/TopPartners.jsx`
13. `src/components/client/home/OurArtisans.jsx`
14. `src/components/client/home/HowItWorks.jsx`
15. `src/components/client/home/Testimonials.jsx`
16. `src/components/client/home/CTASection.jsx`

#### COMPONENTS - PARTNER (6 fichiers)
17. `src/components/partner/DashboardStats.jsx`
18. `src/components/partner/CodeShare.jsx`
19. `src/components/partner/SalesHistory.jsx`
20. `src/components/partner/EarningsCard.jsx`
21. `src/components/partner/LevelProgress.jsx`
22. `src/components/partner/WithdrawModal.jsx`

#### COMPONENTS - SUPPLIER (4 fichiers)
23. `src/components/supplier/ProductForm.jsx`
24. `src/components/supplier/OrderCard.jsx`
25. `src/components/supplier/FinancialSummary.jsx`
26. `src/components/supplier/BlockedAccountModal.jsx`

#### COMPONENTS - ADMIN (6 fichiers)
27. `src/components/admin/StatsCard.jsx`
28. `src/components/admin/PartnerTable.jsx`
29. `src/components/admin/SupplierTable.jsx`
30. `src/components/admin/OrdersTable.jsx`
31. `src/components/admin/ConfigRulesForm.jsx`
32. `src/components/admin/ProductValidation.jsx`

#### COMPONENTS - COMMON (5 fichiers)
33. `src/components/common/LoadingSpinner.jsx`
34. `src/components/common/EmptyState.jsx`
35. `src/components/common/Button.jsx`
36. `src/components/common/Input.jsx`
37. `src/components/common/Modal.jsx`

#### LAYOUTS (2 fichiers)
38. `src/components/layout/PartnerLayout.jsx`
39. `src/components/layout/SupplierLayout.jsx`

#### PAGES (1 fichier)
40. `src/pages/partner/PartnerRules.jsx`

**TOTAL : 40 NOUVEAUX FICHIERS À CRÉER**

---

## 🎯 ORDRE D'EXÉCUTION RECOMMANDÉ

### PHASE 1 : FONDATIONS (Critique)
1. Modifier `src/index.css` (Tailwind 4 + variables)
2. Créer tous les fichiers `utils/` (4 fichiers)
3. Créer tous les fichiers `hooks/` (4 fichiers)
4. Créer `src/context/AuthContext.jsx`
5. Modifier `src/context/ConfigContext.jsx`

### PHASE 2 : COMPOSANTS COMMUNS
6. Créer tous les fichiers `components/common/` (5 fichiers)

### PHASE 3 : PAGE D'ACCUEIL
7. Créer tous les fichiers `components/client/home/` (7 fichiers)
8. Refondre `src/pages/client/Home.jsx`

### PHASE 4 : SYSTÈME PARTENAIRES
9. Créer tous les fichiers `components/partner/` (6 fichiers)
10. Refondre toutes les pages `pages/partner/` (6 fichiers)

### PHASE 5 : ESPACE FOURNISSEUR
11. Créer tous les fichiers `components/supplier/` (4 fichiers)
12. Refondre toutes les pages `pages/supplier/` (6 fichiers)

### PHASE 6 : ADMIN
13. Créer tous les fichiers `components/admin/` (6 fichiers)
14. Refondre toutes les pages `pages/admin/` (6 fichiers)

### PHASE 7 : CHECKOUT & INTÉGRATION
15. Modifier `src/pages/client/Checkout.jsx`
16. Modifier `src/components/client/ProductCard.jsx`
17. Tests & corrections

---

## 📝 PROCHAINE ÉTAPE

Veux-tu que je :
1. **Crée TOUS les fichiers vides** (structure complète) ?
2. **Commence par les fichiers existants** (pour que je voie leur contenu) ?
3. **Autre approche** ?

Dis-moi ce que tu préfères ! 🚀
