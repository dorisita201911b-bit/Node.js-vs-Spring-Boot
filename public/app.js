/**
 * StoreREST - Frontend Client Application
 * Interacts directly with the Node.js + Express API
 */

// Application State
const state = {
  products: [],
  filteredProducts: [],
  activeCategory: 'ALL',
  searchQuery: '',
  sortBy: 'id-asc',
  productToDelete: null
};

// DOM Elements
const el = {
  // Metrics
  metricTotalProducts: document.getElementById('metricTotalProducts'),
  metricTotalValue: document.getElementById('metricTotalValue'),
  metricTotalStock: document.getElementById('metricTotalStock'),
  metricAvgPrice: document.getElementById('metricAvgPrice'),

  // Search & Filters
  searchInput: document.getElementById('searchInput'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  categoryChips: document.getElementById('categoryChips'),
  sortSelect: document.getElementById('sortSelect'),

  // Catalog & States
  productsGrid: document.getElementById('productsGrid'),
  loadingState: document.getElementById('loadingState'),
  emptyState: document.getElementById('emptyState'),
  productCount: document.getElementById('productCount'),
  btnResetFilters: document.getElementById('btnResetFilters'),

  // Product Modal (Create/Edit)
  productModal: document.getElementById('productModal'),
  productForm: document.getElementById('productForm'),
  modalTitle: document.getElementById('modalTitle'),
  modalIconPreview: document.getElementById('modalIconPreview'),
  formProductId: document.getElementById('formProductId'),
  formNombre: document.getElementById('formNombre'),
  formPrecio: document.getElementById('formPrecio'),
  formStock: document.getElementById('formStock'),
  formCategoria: document.getElementById('formCategoria'),
  formIcono: document.getElementById('formIcono'),
  btnSaveText: document.getElementById('btnSaveText'),
  btnOpenCreateModal: document.getElementById('btnOpenCreateModal'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  btnCancelForm: document.getElementById('btnCancelForm'),

  // Delete Modal
  deleteModal: document.getElementById('deleteModal'),
  deleteProductName: document.getElementById('deleteProductName'),
  btnCancelDelete: document.getElementById('btnCancelDelete'),
  btnConfirmDelete: document.getElementById('btnConfirmDelete'),

  // API Explorer Modal
  apiModal: document.getElementById('apiModal'),
  btnOpenApiModal: document.getElementById('btnOpenApiModal'),
  btnCloseApiModal: document.getElementById('btnCloseApiModal'),
  btnCloseApiModalBottom: document.getElementById('btnCloseApiModalBottom'),
  rawJsonCode: document.getElementById('rawJsonCode'),
  btnCopyJson: document.getElementById('btnCopyJson'),
  btnRefreshJson: document.getElementById('btnRefreshJson'),

  // Toasts
  toastContainer: document.getElementById('toastContainer')
};

// ==========================================================================
// Initialization & Event Listeners
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadProducts();
});

function setupEventListeners() {
  // Search
  el.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    el.btnClearSearch.classList.toggle('hidden', state.searchQuery.length === 0);
    applyFilters();
  });

  el.btnClearSearch.addEventListener('click', () => {
    el.searchInput.value = '';
    state.searchQuery = '';
    el.btnClearSearch.classList.add('hidden');
    applyFilters();
  });

  // Category Chips
  el.categoryChips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    el.categoryChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.activeCategory = chip.dataset.category;
    applyFilters();
  });

  // Sorting
  el.sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    applyFilters();
  });

  // Reset Filters
  el.btnResetFilters.addEventListener('click', () => {
    el.searchInput.value = '';
    state.searchQuery = '';
    el.btnClearSearch.classList.add('hidden');
    state.activeCategory = 'ALL';
    el.categoryChips.querySelectorAll('.chip').forEach(c => {
      c.classList.toggle('active', c.dataset.category === 'ALL');
    });
    applyFilters();
  });

  // Product Modal Open/Close
  el.btnOpenCreateModal.addEventListener('click', () => openCreateModal());
  el.btnCloseModal.addEventListener('click', closeProductModal);
  el.btnCancelForm.addEventListener('click', closeProductModal);

  // Form Submit
  el.productForm.addEventListener('submit', handleFormSubmit);

  // Emoji Presets
  document.querySelectorAll('.btn-emoji').forEach(btn => {
    btn.addEventListener('click', () => {
      el.formIcono.value = btn.dataset.emoji;
      el.modalIconPreview.textContent = btn.dataset.emoji;
    });
  });

  el.formIcono.addEventListener('input', (e) => {
    el.modalIconPreview.textContent = e.target.value || '📦';
  });

  // Delete Modal Events
  el.btnCancelDelete.addEventListener('click', closeDeleteModal);
  el.btnConfirmDelete.addEventListener('click', confirmDeleteProduct);

  // API Explorer Modal
  el.btnOpenApiModal.addEventListener('click', openApiModal);
  el.btnCloseApiModal.addEventListener('click', closeApiModal);
  el.btnCloseApiModalBottom.addEventListener('click', closeApiModal);
  el.btnCopyJson.addEventListener('click', copyRawJson);
  el.btnRefreshJson.addEventListener('click', updateJsonViewer);

  // API Modal Tabs
  document.querySelectorAll('.api-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.api-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(tab.dataset.tab === 'liveJson' ? 'tabLiveJson' : 'tabEndpoints');
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Close modals on escape key or backdrop click
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeDeleteModal();
      closeApiModal();
    }
  });

  [el.productModal, el.deleteModal, el.apiModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
}

// ==========================================================================
// API Communication (CRUD)
// ==========================================================================

async function loadProducts() {
  try {
    el.loadingState.classList.remove('hidden');
    el.emptyState.classList.add('hidden');
    el.productsGrid.innerHTML = '';

    const response = await fetch('/productos');
    if (!response.ok) throw new Error('Error al consultar productos');

    const data = await response.json();
    state.products = data;
    updateMetrics();
    applyFilters();
  } catch (err) {
    console.error('Error cargando productos:', err);
    showToast(`Error al cargar productos: ${err.message}`, 'error');
  } finally {
    el.loadingState.classList.add('hidden');
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const id = el.formProductId.value;
  const isEditing = Boolean(id);

  const productData = {
    nombre: el.formNombre.value.trim(),
    precio: parseFloat(el.formPrecio.value),
    stock: parseInt(el.formStock.value, 10),
    categoria: el.formCategoria.value,
    icono: el.formIcono.value.trim() || '📦'
  };

  try {
    el.btnSaveText.textContent = isEditing ? 'Guardando...' : 'Creando...';

    const url = isEditing ? `/productos/${id}` : '/productos';
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.mensaje || 'Error en la petición');
    }

    const savedProduct = await response.json();
    closeProductModal();
    showToast(
      isEditing 
        ? `✅ "${savedProduct.nombre}" actualizado correctamente` 
        : `✨ "${savedProduct.nombre}" agregado con éxito`,
      'success'
    );

    await loadProducts();
  } catch (err) {
    console.error('Error al guardar producto:', err);
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    el.btnSaveText.textContent = isEditing ? 'Guardar Cambios' : 'Guardar Producto';
  }
}

async function confirmDeleteProduct() {
  if (!state.productToDelete) return;

  const { id, nombre } = state.productToDelete;

  try {
    el.btnConfirmDelete.textContent = 'Eliminando...';

    const response = await fetch(`/productos/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.mensaje || 'No se pudo eliminar el producto');
    }

    closeDeleteModal();
    showToast(`🗑️ Producto "${nombre}" eliminado del servidor`, 'info');
    await loadProducts();
  } catch (err) {
    console.error('Error al eliminar:', err);
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    el.btnConfirmDelete.textContent = 'Sí, Eliminar';
    state.productToDelete = null;
  }
}

// ==========================================================================
// Filtering, Sorting & Rendering
// ==========================================================================

function applyFilters() {
  let list = [...state.products];

  // Filter by category
  if (state.activeCategory !== 'ALL') {
    list = list.filter(p => p.categoria === state.activeCategory);
  }

  // Filter by search query
  if (state.searchQuery) {
    const q = state.searchQuery;
    list = list.filter(p => 
      (p.nombre && p.nombre.toLowerCase().includes(q)) ||
      (p.categoria && p.categoria.toLowerCase().includes(q)) ||
      String(p.id).includes(q)
    );
  }

  // Sorting
  switch (state.sortBy) {
    case 'id-asc':
      list.sort((a, b) => a.id - b.id);
      break;
    case 'id-desc':
      list.sort((a, b) => b.id - a.id);
      break;
    case 'price-asc':
      list.sort((a, b) => a.precio - b.precio);
      break;
    case 'price-desc':
      list.sort((a, b) => b.precio - a.precio);
      break;
    case 'stock-desc':
      list.sort((a, b) => b.stock - a.stock);
      break;
    case 'name-asc':
      list.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
      break;
  }

  state.filteredProducts = list;
  renderGrid();
}

function renderGrid() {
  el.productsGrid.innerHTML = '';
  el.productCount.textContent = `${state.filteredProducts.length} de ${state.products.length} productos`;

  if (state.filteredProducts.length === 0) {
    el.emptyState.classList.remove('hidden');
    return;
  }

  el.emptyState.classList.add('hidden');

  const fragment = document.createDocumentFragment();

  state.filteredProducts.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';

    // Stock Status
    let stockClass = 'in-stock';
    let stockLabel = `${product.stock} disponibles`;

    if (product.stock === 0) {
      stockClass = 'out-of-stock';
      stockLabel = 'Agotado';
    } else if (product.stock < 10) {
      stockClass = 'low-stock';
      stockLabel = `${product.stock} unidades (Bajo)`;
    }

    const formattedPrice = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(product.precio);

    card.innerHTML = `
      <div class="product-top">
        <div class="product-avatar">${product.icono || '📦'}</div>
        <div class="product-meta-badges">
          <span class="badge-id">#ID ${product.id}</span>
          <span class="badge-category">${product.categoria || 'General'}</span>
        </div>
      </div>

      <div class="product-body">
        <h3 class="product-name">${escapeHtml(product.nombre)}</h3>
        <div class="product-pricing-stock">
          <span class="product-price">${formattedPrice}</span>
          <span class="stock-indicator ${stockClass}">
            <span class="stock-dot"></span>
            ${stockLabel}
          </span>
        </div>
      </div>

      <div class="product-actions">
        <button class="btn-card btn-edit" data-id="${product.id}">
          <span>✏️</span> Editar
        </button>
        <button class="btn-card btn-delete" data-id="${product.id}">
          <span>🗑️</span> Eliminar
        </button>
      </div>
    `;

    // Event listeners on card buttons
    card.querySelector('.btn-edit').addEventListener('click', () => openEditModal(product));
    card.querySelector('.btn-delete').addEventListener('click', () => openDeleteModal(product));

    fragment.appendChild(card);
  });

  el.productsGrid.appendChild(fragment);
}

function updateMetrics() {
  const totalCount = state.products.length;
  const totalStock = state.products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const totalValue = state.products.reduce((acc, p) => acc + ((Number(p.precio) || 0) * (Number(p.stock) || 0)), 0);
  const avgPrice = totalCount > 0 ? (state.products.reduce((acc, p) => acc + (Number(p.precio) || 0), 0) / totalCount) : 0;

  el.metricTotalProducts.textContent = totalCount;
  el.metricTotalStock.textContent = totalStock.toLocaleString('es-CO');

  el.metricTotalValue.textContent = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(totalValue);

  el.metricAvgPrice.textContent = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 1
  }).format(avgPrice);
}

// ==========================================================================
// Modals & UI Helpers
// ==========================================================================

function openCreateModal() {
  el.productForm.reset();
  el.formProductId.value = '';
  el.modalTitle.textContent = 'Nuevo Producto';
  el.modalIconPreview.textContent = '📦';
  el.formIcono.value = '📦';
  el.btnSaveText.textContent = 'Guardar Producto';
  el.productModal.classList.remove('hidden');
  el.formNombre.focus();
}

function openEditModal(product) {
  el.formProductId.value = product.id;
  el.formNombre.value = product.nombre || '';
  el.formPrecio.value = product.precio || '';
  el.formStock.value = product.stock || '';
  el.formCategoria.value = product.categoria || 'General';
  el.formIcono.value = product.icono || '📦';
  el.modalIconPreview.textContent = product.icono || '📦';

  el.modalTitle.textContent = `Editar Producto #${product.id}`;
  el.btnSaveText.textContent = 'Guardar Cambios';
  el.productModal.classList.remove('hidden');
  el.formNombre.focus();
}

function closeProductModal() {
  el.productModal.classList.add('hidden');
}

function openDeleteModal(product) {
  state.productToDelete = product;
  el.deleteProductName.textContent = `"${product.nombre}" (ID: ${product.id})`;
  el.deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  el.deleteModal.classList.add('hidden');
  state.productToDelete = null;
}

function openApiModal() {
  updateJsonViewer();
  el.apiModal.classList.remove('hidden');
}

function closeApiModal() {
  el.apiModal.classList.add('hidden');
}

function updateJsonViewer() {
  el.rawJsonCode.textContent = JSON.stringify(state.products, null, 2);
}

async function copyRawJson() {
  try {
    await navigator.clipboard.writeText(JSON.stringify(state.products, null, 2));
    showToast('📋 JSON copiado al portapapeles', 'info');
  } catch (err) {
    showToast('No se pudo copiar automáticamente', 'error');
  }
}

// ==========================================================================
// Toast Notification System
// ==========================================================================

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;

  el.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
