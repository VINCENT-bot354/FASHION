document.addEventListener('DOMContentLoaded', function() {
    // Apply saved font size setting on page load
    applyFontSizeSetting();
    
    // Apply saved logo preference on page load
    applyLogoPreference();
    
    // Initialize font size buttons
    initFontSizeButtons();
    
    // Initialize logo selection buttons
    initLogoSelectionButtons();
    
    // Initialize the search functionality
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            const searchInput = document.getElementById('searchInput');
            if (!searchInput.value.trim()) {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    // Add WhatsApp click tracking for analytics
    const orderButtons = document.querySelectorAll('.btn-order');
    orderButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-product-name');
            console.log(`Order clicked for product: ${productName}`);
            // You could add more advanced analytics tracking here
        });
    });

    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    // Admin product editing - show form when edit button is clicked
    const editButtons = document.querySelectorAll('.edit-product-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const productRow = document.getElementById(`product-row-${productId}`);
            const productForm = document.getElementById(`product-form-${productId}`);
            
            if (productRow && productForm) {
                productRow.classList.add('d-none');
                productForm.classList.remove('d-none');
            }
        });
    });

    // Admin product editing - cancel edit
    const cancelButtons = document.querySelectorAll('.cancel-edit-btn');
    cancelButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product-id');
            const productRow = document.getElementById(`product-row-${productId}`);
            const productForm = document.getElementById(`product-form-${productId}`);
            
            if (productRow && productForm) {
                productRow.classList.remove('d-none');
                productForm.classList.add('d-none');
            }
        });
    });

    // Preview image before upload
    const imageInputs = document.querySelectorAll('.product-image-input');
    imageInputs.forEach(input => {
        input.addEventListener('change', function() {
            const previewId = this.getAttribute('data-preview');
            const preview = document.getElementById(previewId);
            
            if (preview && this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    });

    // Flash message auto-close
    const flashMessages = document.querySelectorAll('.alert');
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.classList.add('fade');
            setTimeout(() => {
                message.remove();
            }, 500);
        }, 5000);
    });
});

// Font size settings functionality
function initFontSizeButtons() {
    const fontSizeButtons = document.querySelectorAll('.font-size-btn');
    
    // Add click event listeners to font size buttons
    fontSizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const size = this.getAttribute('data-size');
            
            // Save the chosen font size in localStorage
            localStorage.setItem('preferredFontSize', size);
            
            // Apply the new font size
            applyFontSize(size);
            
            // Update button active state
            updateFontSizeButtonStates(size);
        });
    });
    
    // Set initial active state based on saved preference or default
    const currentSize = localStorage.getItem('preferredFontSize') || 'medium';
    updateFontSizeButtonStates(currentSize);
}

function updateFontSizeButtonStates(activeSize) {
    const fontSizeButtons = document.querySelectorAll('.font-size-btn');
    
    fontSizeButtons.forEach(button => {
        const buttonSize = button.getAttribute('data-size');
        
        // Remove active class from all buttons
        button.classList.remove('btn-primary');
        button.classList.add('btn-outline-secondary');
        
        // Add active class to the selected button
        if (buttonSize === activeSize) {
            button.classList.remove('btn-outline-secondary');
            button.classList.add('btn-primary');
        }
    });
}

function applyFontSizeSetting() {
    const savedSize = localStorage.getItem('preferredFontSize');
    if (savedSize) {
        applyFontSize(savedSize);
    }
}

function applyFontSize(size) {
    // Remove any existing font size classes
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    
    // Add the selected font size class
    document.body.classList.add(`font-size-${size}`);
}

// Logo preference functionality
function initLogoSelectionButtons() {
    const logoButtons = document.querySelectorAll('.logo-selection-btn');
    
    // Add click event listeners to logo selection buttons
    logoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const logoNumber = this.getAttribute('data-logo');
            
            // Save the chosen logo in localStorage
            localStorage.setItem('preferredLogo', logoNumber);
            
            // Apply the new logo
            applyLogo(logoNumber);
            
            // Update button active state
            updateLogoButtonStates(logoNumber);
        });
    });
    
    // Set initial active state based on saved preference or default
    const currentLogo = localStorage.getItem('preferredLogo') || '';
    updateLogoButtonStates(currentLogo);
}

function updateLogoButtonStates(activeLogo) {
    const logoButtons = document.querySelectorAll('.logo-selection-btn');
    
    logoButtons.forEach(button => {
        const buttonLogo = button.getAttribute('data-logo');
        
        // Remove active class from all buttons
        button.classList.remove('btn-primary');
        button.classList.add('btn-outline-secondary');
        
        // Add active class to the selected button
        if (buttonLogo === activeLogo) {
            button.classList.remove('btn-outline-secondary');
            button.classList.add('btn-primary');
        }
    });
}

function applyLogoPreference() {
    const savedLogo = localStorage.getItem('preferredLogo');
    if (savedLogo) {
        applyLogo(savedLogo);
    }
}

function applyLogo(logoNumber) {
    const logoImg = document.getElementById('brand-logo');
    if (logoImg) {
        // Default logo has no number suffix
        let logoSrc = '/static/images/logo.svg';
        
        if (logoNumber && logoNumber !== '') {
            logoSrc = `/static/images/logo${logoNumber}.svg`;
        }
        
        logoImg.src = logoSrc;
    }
}
