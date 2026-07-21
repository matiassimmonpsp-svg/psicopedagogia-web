// tests/e2e/selectors.ts
// Centralized selectors — when UI text changes, update HERE only

export const SEL = {
  // Navigation
  nav: {
    logo: '[data-testid="nav-logo"]',
    catalog: 'a[href="/catalogo"]',
    home: 'a[href="/"]',
  },

  // Login
  login: {
    email: '[data-testid="login-email"]',
    password: '[data-testid="login-password"]',
    submit: '[data-testid="login-submit"]',
  },

  // Register
  register: {
    name: '[data-testid="register-name"]',
    email: '[data-testid="register-email"]',
    password: '[data-testid="register-password"]',
    submit: '[data-testid="register-submit"]',
  },

  // Resource Detail
  resource: {
    detail: '[data-testid="resource-detail"]',
    addToCart: '[data-testid="add-to-cart"]',
    downloadPdf: '[data-testid="download-pdf"]',
    downloadEditable: '[data-testid="download-editable"]',
    goToCart: '[data-testid="go-to-cart"]',
    priceSection: '[data-testid="price-section"]',
  },

  // Cart
  cart: {
    items: '[data-testid="cart-item"]',
    removeItem: '[data-testid="remove-cart-item"]',
    discountInput: '[data-testid="discount-input"]',
    applyDiscount: '[data-testid="apply-discount"]',
    removeDiscount: '[data-testid="remove-discount"]',
    goToCheckout: '[data-testid="go-to-checkout"]',
    empty: '[data-testid="cart-empty"]',
  },

  // Checkout
  checkout: {
    payButton: '[data-testid="pay-button"]',
    summary: '[data-testid="order-summary"]',
    discount: '[data-testid="checkout-discount"]',
    paymentMethod: (method: string) => `[data-testid="payment-${method}"]`,
  },

  // Catalog
  catalog: {
    courseFilters: '[data-testid="course-filters"]',
    areaFilters: '[data-testid="area-filters"]',
    typeFilters: '[data-testid="type-filters"]',
    priceFilters: '[data-testid="price-filters"]',
    resultsCount: '[data-testid="results-count"]',
    clearFilters: '[data-testid="clear-filters"]',
    resourceCards: '[data-testid="resource-card"]',
    resourceCard: (index: number) => `[data-testid="resource-card"]:nth-child(${index + 1})`,
  },

  // Search
  search: {
    sidebarInput: '[data-testid="search-sidebar-input"]',
    courseFilters: '[data-testid="search-course-filters"]',
    typeFilters: '[data-testid="search-type-filters"]',
    results: '[data-testid="search-results"]',
  },

  // Admin
  admin: {
    stats: '[data-testid="admin-stats"]',
    resourcesTable: '[data-testid="admin-resources-table"]',
    toggleActive: '[data-testid="toggle-active"]',
    deleteResource: '[data-testid="delete-resource"]',
  },

  // Resource Form (admin create)
  resourceForm: {
    courseSelect: '#course-select',
    areaSelect: '#area-select',
    subareaSelect: '#subarea-select',
    titleInput: '#resource-title',
    descriptionInput: '#resource-description',
  },

  // Common
  common: {
    skipNav: 'a[href="#main-content"]',
    mainContent: '#main-content',
    errorAlert: '.text-red-600',
    loadingSkeleton: '.animate-pulse',
  },
} as const
