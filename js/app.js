/**
 * CENABAT SARL - Application de Devis
 * Gestion du catalogue de produits et du panier de devis
 */

// === Chargement des produits depuis localStorage ===
function getProducts() {
    const stored = localStorage.getItem('cenabat_products');
    if (stored) {
        return JSON.parse(stored);
    }
    return getDefaultProducts();
}

// Si Firestore est disponible, récupérer les produits distante et mettre à jour l'UI
async function syncProductsFromFirestoreIfAvailable(renderCallback) {
    if (!window.firestore) return;
    try {
        const snapshot = await window.firestore.collection('products').get();
        const docs = snapshot.docs.map(d => ({ id: parseInt(d.id, 10) || Number(d.id), ...d.data() }));
        if (docs && docs.length) {
            localStorage.setItem('cenabat_products', JSON.stringify(docs));
            if (typeof renderCallback === 'function') renderCallback();
        }
    } catch (e) {
        console.warn('Erreur sync Firestore:', e);
    }
}

// === Produits par défaut ===
function getDefaultProducts() {
    return [
        // Fer à béton
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
        // Carrelage
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
        // Plomberie / Sanitaire
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
        // Électricité
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
        // Peinture
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
        // Menuiserie
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

let products = getProducts();
        category: "menuiserie",
        categoryLabel: "Menuiserie",
        description: "Plinthe bois massif 2m",
        icon: "fa-ruler-horizontal"
    }
];

// === État du panier de devis ===
let cart = [];

// === Initialisation ===
document.addEventListener('DOMContentLoaded', function() {
    renderProducts('all');
    setupCategoryFilters();
    setupDevisForm();
    setupCartButtons();
    // Synchroniser depuis Firestore si disponible
    syncProductsFromFirestoreIfAvailable(() => renderProducts(document.querySelector('.category-filters .active')?.dataset.category || 'all'));
});

// === Rendu des produits ===
function renderProducts(category) {
    const grid = document.getElementById('products-grid');
    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(p => p.category === category);
    
    grid.innerHTML = filteredProducts.map(product => `
        <div class="col-md-6 col-lg-4">
            <div class="product-card" data-category="${product.category}">
                <div class="product-image">
                    <i class="fas ${product.icon}"></i>
                    <span class="product-category-badge">${product.categoryLabel}</span>
                </div>
                <div class="product-body">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-quantity">
                        <label for="qty-${product.id}">Quantité:</label>
                        <input type="number" id="qty-${product.id}" class="quantity-input" 
                               value="1" min="1" max="1000">
                    </div>
                    <button class="btn-add-devis" onclick="addToCart(${product.id})">
                        <i class="fas fa-plus"></i>
                        Ajouter au devis
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// === Filtres par catégorie ===
function setupCategoryFilters() {
    const buttons = document.querySelectorAll('.category-filters .btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Retirer la classe active de tous les boutons
            buttons.forEach(b => b.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            // Filtrer les produits
            const category = this.dataset.category;
            renderProducts(category);
        });
    });
}

// === Gestion du panier ===
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = parseInt(quantityInput.value) || 1;
    
    // Vérifier si le produit existe déjà dans le panier
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    // Mise à jour de l'interface
    updateCartUI();
    
    // Feedback visuel
    const btn = event.target.closest('.btn-add-devis');
    if (btn) {
        btn.classList.add('added');
        btn.innerHTML = '<i class="fas fa-check"></i> Ajouté au devis';
        
        setTimeout(() => {
            btn.classList.remove('added');
            btn.innerHTML = '<i class="fas fa-plus"></i> Ajouter au devis';
        }, 2000);
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateCartUI() {
    // Mettre à jour le badge
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Mettre à jour le contenu du modal
    const cartItems = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <p class="text-center text-muted py-5">
                <i class="fas fa-shopping-cart fa-3x mb-3 d-block"></i>
                Votre devis est vide
            </p>
        `;
        cartSummary.classList.add('d-none');
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-icon">
                    <i class="fas ${item.icon}"></i>
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-quantity">Quantité: ${item.quantity}</div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        cartSummary.classList.remove('d-none');
        cartTotal.textContent = totalItems;
    }
}

// === Configuration des boutons du panier ===
function setupCartButtons() {
    const validateBtn = document.getElementById('validate-devis');
    
    if (validateBtn) {
        validateBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('Votre devis est vide. Ajoutez des produits avant de valider.');
                return;
            }
            
            // Rediriger vers la page de contact
            window.location.href = 'contact.html';
        });
    }
}

// === Formulaire de devis ===
function setupDevisForm() {
    const form = document.getElementById('devis-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (cart.length === 0) {
                alert('Veuillez d\'abord ajouter des produits à votre devis.');
                return;
            }
            
            // Collecter les données du formulaire
            const formData = new FormData(form);
            const devisData = {
                client: {
                    nom: formData.get('nom'),
                    telephone: formData.get('telephone'),
                    adresse: formData.get('adresse'),
                    modeRetrait: form.querySelector('input[name="modeRetrait"]:checked').value,
                    message: formData.get('message')
                },
                produits: cart,
                totalArticles: cart.reduce((sum, item) => sum + item.quantity, 0)
            };
            
            // Log pour le débogage (à remplacer par un appel API réel)
            console.log('Données du devis:', devisData);
            
            // Afficher le modal de confirmation
            const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
            confirmModal.show();
            
            // Vider le panier après l'envoi
            cart = [];
            updateCartUI();
            
            // Réinitialiser le formulaire
            form.reset();
        });
    }
}

// === Fonctions utilitaires ===
function getCategoryIcon(category) {
    const icons = {
        fer: 'fa-grip-lines',
        carrelage: 'fa-th',
        plomberie: 'fa-faucet',
        electricite: 'fa-bolt',
        peinture: 'fa-paint-roller',
        menuiserie: 'fa-door-open'
    };
    return icons[category] || 'fa-box';
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

// Export pour utilisation globale
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;