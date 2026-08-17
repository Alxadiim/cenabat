/**
 * CENABAT - Système d'Administration
 * Gestion complète du catalogue de produits
 */

// === Gestion de l'authentification ===
let isAuthenticated = false;
let currentEditingProduct = null;

// Vérifier l'authentification au chargement
window.addEventListener('load', function() {
    const auth = sessionStorage.getItem('cenabat_admin_auth');
    const hasPassword = localStorage.getItem('cenabat_admin_password');

    if (!hasPassword) {
        localStorage.setItem('cenabat_admin_password', 'admin123');
    }

    if (auth !== 'true') {
        showLoginModal();
    } else {
        isAuthenticated = true;
        document.getElementById('admin-user').textContent = 'Admin Connecté';
    }

    loadProductsTable();
    setupFormListeners();
    setupLoginEnterHandler();
});

// === Firestore helpers ===
function isFirestoreReady() {
    return !!(window.firestore && typeof window.firestore.collection === 'function');
}

async function fetchProductsFromFirestore() {
    if (!isFirestoreReady()) return null;
    try {
        const snapshot = await window.firestore.collection('products').get();
        const docs = snapshot.docs.map(d => ({ id: parseInt(d.id, 10) || Number(d.id), ...d.data() }));
        return docs;
    } catch (e) {
        console.warn('Erreur lecture Firestore:', e);
        return null;
    }
}

async function saveProductsToFirestore(products) {
    if (!isFirestoreReady()) return;
    try {
        const batch = window.firestore.batch();
        const colRef = window.firestore.collection('products');
        products.forEach(p => {
            const ref = colRef.doc(String(p.id));
            batch.set(ref, { ...p });
        });
        await batch.commit();
        console.info('Produits sauvegardés dans Firestore.');
    } catch (e) {
        console.warn('Erreur écriture Firestore:', e);
    }
}

// === Authentification ===
function showLoginModal() {
    const modalEl = document.getElementById('loginModal');
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl, {
        backdrop: 'static',
        keyboard: false
    });
    modal.show();
}

function loginAdmin() {
    const password = document.getElementById('admin-password')?.value || '';
    const correctPassword = localStorage.getItem('cenabat_admin_password') || 'admin123';
    const errorEl = document.getElementById('login-error');

    if (password === correctPassword) {
        sessionStorage.setItem('cenabat_admin_auth', 'true');
        isAuthenticated = true;
        document.getElementById('admin-user').textContent = 'Admin Connecté';

        if (errorEl) errorEl.classList.add('d-none');
        const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (modal) modal.hide();
        document.getElementById('admin-password').value = '';
    } else {
        if (errorEl) errorEl.classList.remove('d-none');
    }
}

function requestPassword() {
    showLoginModal();
}

function logout() {
    sessionStorage.removeItem('cenabat_admin_auth');
    const loginInput = document.getElementById('admin-password');
    if (loginInput) loginInput.value = '';
    document.getElementById('admin-user').textContent = 'Admin';
    showLoginModal();
}

function setupLoginEnterHandler() {
    const input = document.getElementById('admin-password');
    if (!input) return;

    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            loginAdmin();
        }
    });
}

// === Gestion des onglets ===
function switchTab(tabName, clickedLink = null) {
    // Masquer tous les onglets
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('d-none');
    });

    // Désactiver tous les liens
    document.querySelectorAll('.admin-sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Afficher l'onglet sélectionné
    const tabElement = document.getElementById(tabName + '-tab');
    if (tabElement) {
        tabElement.classList.remove('d-none');
    }

    // Activer le lien si fourni
    if (clickedLink) {
        clickedLink.classList.add('active');
    }
}

// === Chargement et affichage des produits ===
function loadProductsTable() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    // Rendu initial depuis localStorage pour rapidité
    const localProducts = getProducts();

    if (!localProducts.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                    Aucun produit. Commencez par en ajouter un.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = localProducts.map(product => `
        <tr>
            <td>#${product.id}</td>
            <td><strong>${product.name}</strong></td>
            <td><span class="badge bg-info">${product.categoryLabel || getCategoryLabel(product.category)}</span></td>
            <td>${(product.description || '').substring(0, 30)}${(product.description || '').length > 30 ? '...' : ''}</td>
            <td>${product.price ? product.price + ' XOF' : '-'}</td>
            <td>
                <button class="btn btn-sm btn-warning btn-action" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Si Firestore est configuré, remplacer par les données serveur (sync)
    if (isFirestoreReady()) {
        fetchProductsFromFirestore().then(remote => {
            if (remote && remote.length) {
                saveProducts(remote);
                loadProductsTable();
            }
        });
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('search-product').value.toLowerCase();
    const rows = document.querySelectorAll('#products-table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// === Gestion du formulaire ===
function setupFormListeners() {
    const form = document.getElementById('product-form');
    if (form) {
        form.addEventListener('submit', saveProduct);
    }
}

function selectCategory(button) {
    // Désélectionner tous les boutons
    document.querySelectorAll('.category-option').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Sélectionner le bouton cliqué
    button.classList.add('active');
    document.getElementById('product-category').value = button.dataset.category;
}

function editProduct(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    currentEditingProduct = product;
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price || '';
    document.getElementById('product-icon').value = product.icon;
    
    // Sélectionner la catégorie
    document.querySelectorAll('.category-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === product.category) {
            btn.classList.add('active');
        }
    });
    document.getElementById('product-category').value = product.category;
    
    document.getElementById('form-title').textContent = 'Modifier le Produit';
    switchTab('add-product');
}

function saveProduct(e) {
    e.preventDefault();
    
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const description = document.getElementById('product-description').value;
    const price = document.getElementById('product-price').value;
    const icon = document.getElementById('product-icon').value;
    
    if (!name || !category || !description) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }
    
    const products = getProducts();
    
    if (id) {
        // Modification
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            products[index] = {
                ...products[index],
                name,
                category,
                categoryLabel: getCategoryLabel(category),
                description,
                price: price ? parseFloat(price) : 0,
                icon: icon || 'fa-box'
            };
        }
    } else {
        // Création
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        const categoryLabels = {
            fer: 'Fer à béton',
            carrelage: 'Carrelage',
            plomberie: 'Plomberie',
            electricite: 'Électricité',
            peinture: 'Peinture',
            menuiserie: 'Menuiserie'
        };
        
        products.push({
            id: newId,
            name,
            category,
            categoryLabel: categoryLabels[category],
            description,
            price: price ? parseFloat(price) : 0,
            icon: icon || 'fa-box'
        });
    }
    
    saveProducts(products);
    // Tentative d'envoi vers Firestore en arrière-plan
    if (isFirestoreReady()) {
        saveProductsToFirestore(products);
    }
    resetForm();
    loadProductsTable();
    
    alert(id ? 'Produit modifié avec succès!' : 'Produit ajouté avec succès!');
}

function resetForm() {
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('form-title').textContent = 'Ajouter un Nouveau Produit';
    document.querySelectorAll('.category-option').forEach(btn => btn.classList.remove('active'));
    currentEditingProduct = null;
}

function deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
        return;
    }
    
    let products = getProducts();
    products = products.filter(p => p.id !== productId);
    saveProducts(products);
    if (isFirestoreReady()) {
        saveProductsToFirestore(products);
    }
    loadProductsTable();
    alert('Produit supprimé!');
}

// === Édition rapide dans la modal ===
function openQuickEdit(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    currentEditingProduct = product;
    document.getElementById('modal-name').value = product.name;
    document.getElementById('modal-description').value = product.description;
    document.getElementById('modal-price').value = product.price || '';
    
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
}

function saveQuickEdit() {
    const products = getProducts();
    const index = products.findIndex(p => p.id === currentEditingProduct.id);
    
    if (index !== -1) {
        products[index] = {
            ...products[index],
            name: document.getElementById('modal-name').value,
            description: document.getElementById('modal-description').value,
            price: document.getElementById('modal-price').value ? parseFloat(document.getElementById('modal-price').value) : 0
        };
    }
    
    saveProducts(products);
    loadProductsTable();
    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
    alert('Produit mis à jour!');
}

// === Paramètres ===
function exportData() {
    const products = getProducts();
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cenabat_products_' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
}

function resetData() {
    if (!confirm('Êtes-vous sûr? Cela réinitialisera tous les produits à leurs valeurs par défaut.')) {
        return;
    }
    localStorage.removeItem('cenabat_products');
    location.reload();
}

function changePassword() {
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    const currentPassword = localStorage.getItem('cenabat_admin_password') || 'admin123';
    
    if (oldPassword !== currentPassword) {
        alert('L\'ancien mot de passe est incorrect.');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas.');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Le mot de passe doit avoir au moins 6 caractères.');
        return;
    }
    
    localStorage.setItem('cenabat_admin_password', newPassword);
    alert('Mot de passe changé avec succès!');
    
    document.getElementById('old-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

// === Utilitaires localStorage ===
function getProducts() {
    const stored = localStorage.getItem('cenabat_products');
    if (stored) {
        return JSON.parse(stored);
    }
    return getDefaultProducts();
}

function saveProducts(products) {
    localStorage.setItem('cenabat_products', JSON.stringify(products));
}

function getCategoryLabel(category) {
    const labels = {
        fer: 'Fer à béton',
        carrelage: 'Carrelage',
        plomberie: 'Plomberie',
        electricite: 'Électricité',
        peinture: 'Peinture',
        menuiserie: 'Menuiserie'
    };
    return labels[category] || category;
}

function getDefaultProducts() {
    return [
        {
            id: 1,
            name: "Fer à béton 6mm",
            category: "fer",
            categoryLabel: "Fer à béton",
            description: "Fer à béton haute résistance pour construction",
            price: 0,
            icon: "fa-grip-lines"
        },
        {
            id: 2,
            name: "Fer à béton 8mm",
            category: "fer",
            categoryLabel: "Fer à béton",
            description: "Fer à béton 8mm pour dallage et fondation",
            price: 0,
            icon: "fa-grip-lines"
        },
        {
            id: 3,
            name: "Fer à béton 10mm",
            category: "fer",
            categoryLabel: "Fer à béton",
            description: "Fer à béton 10mm pour structure porteuse",
            price: 0,
            icon: "fa-grip-lines"
        },
        {
            id: 4,
            name: "Fer à béton 12mm",
            category: "fer",
            categoryLabel: "Fer à béton",
            description: "Fer à béton 12mm haute résistance",
            price: 0,
            icon: "fa-grip-lines"
        },
        {
            id: 5,
            name: "Carrelage mural 20x20",
            category: "carrelage",
            categoryLabel: "Carrelage",
            description: "Carrelage mural blanc brillant",
            price: 0,
            icon: "fa-th"
        },
        {
            id: 6,
            name: "Carrelage sol 30x30",
            category: "carrelage",
            categoryLabel: "Carrelage",
            description: "Carrelage sol antidérapant gris",
            price: 0,
            icon: "fa-th"
        },
        {
            id: 7,
            name: "Carrelage faïence 15x15",
            category: "carrelage",
            categoryLabel: "Carrelage",
            description: "Carrelage faïence pour salle de bain",
            price: 0,
            icon: "fa-th"
        },
        {
            id: 8,
            name: "Carrelage extérieur 40x40",
            category: "carrelage",
            categoryLabel: "Carrelage",
            description: "Carrelage extérieur résistant gel",
            price: 0,
            icon: "fa-th"
        },
        {
            id: 9,
            name: "Robinetterie lavabo",
            category: "plomberie",
            categoryLabel: "Plomberie",
            description: "Robinetterie chrome pour lavabo",
            price: 0,
            icon: "fa-faucet"
        },
        {
            id: 10,
            name: "WC suspendu",
            category: "plomberie",
            categoryLabel: "Plomberie",
            description: "WC suspendu avec abattant",
            price: 0,
            icon: "fa-toilet"
        },
        {
            id: 11,
            name: "Receveur de douche",
            category: "plomberie",
            categoryLabel: "Plomberie",
            description: "Receveur de douche 80x80",
            price: 0,
            icon: "fa-shower"
        },
        {
            id: 12,
            name: "Ballon d'eau chaude",
            category: "plomberie",
            categoryLabel: "Plomberie",
            description: "Ballon eau chaude 100L",
            price: 0,
            icon: "fa-hot-water"
        },
        {
            id: 13,
            name: "Câble électrique 2.5mm²",
            category: "electricite",
            categoryLabel: "Électricité",
            description: "Câble électrique rigide 100m",
            price: 0,
            icon: "fa-bolt"
        },
        {
            id: 14,
            name: "Prise de courant",
            category: "electricite",
            categoryLabel: "Électricité",
            description: "Prise de courant encastrée",
            price: 0,
            icon: "fa-plug"
        },
        {
            id: 15,
            name: "Interrupteur va-et-vient",
            category: "electricite",
            categoryLabel: "Électricité",
            description: "Interrupteur va-et-vient",
            price: 0,
            icon: "fa-toggle-on"
        },
        {
            id: 16,
            name: "Tableau électrique",
            category: "electricite",
            categoryLabel: "Électricité",
            description: "Tableau électrique 2 rangées",
            price: 0,
            icon: "fa-box"
        },
        {
            id: 17,
            name: "Peinture vinylique 25L",
            category: "peinture",
            categoryLabel: "Peinture",
            description: "Peinture vinylique blanche",
            price: 0,
            icon: "fa-paint-roller"
        },
        {
            id: 18,
            name: "Peinture glycéro 20L",
            category: "peinture",
            categoryLabel: "Peinture",
            description: "Peinture glycéro satinée",
            price: 0,
            icon: "fa-paint-roller"
        },
        {
            id: 19,
            name: "Sous-couche universelle",
            category: "peinture",
            categoryLabel: "Peinture",
            description: "Sous-couche universelle 10L",
            price: 0,
            icon: "fa-fill-drip"
        },
        {
            id: 20,
            name: "Enduit de rebouchage",
            category: "peinture",
            categoryLabel: "Peinture",
            description: "Enduit de rebouchage 5kg",
            price: 0,
            icon: "fa-fill-drip"
        },
        {
            id: 21,
            name: "Porte intérieure",
            category: "menuiserie",
            categoryLabel: "Menuiserie",
            description: "Porte intérieure pré-peinte",
            price: 0,
            icon: "fa-door-closed"
        },
        {
            id: 22,
            name: "Fenêtre aluminium",
            category: "menuiserie",
            categoryLabel: "Menuiserie",
            description: "Fenêtre aluminium 120x120",
            price: 0,
            icon: "fa-window-maximize"
        },
        {
            id: 23,
            name: "Volet roulant",
            category: "menuiserie",
            categoryLabel: "Menuiserie",
            description: "Volet roulant PVC",
            price: 0,
            icon: "fa-blinds"
        },
        {
            id: 24,
            name: "Plinthe bois",
            category: "menuiserie",
            categoryLabel: "Menuiserie",
            description: "Plinthe bois massif 2m",
            price: 0,
            icon: "fa-ruler-horizontal"
        }
    ];
}
