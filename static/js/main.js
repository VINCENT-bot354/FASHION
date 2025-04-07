document.addEventListener('DOMContentLoaded', function() {
    // Initialize product image modal
    initProductImageModal();

    // Apply saved font size setting on page load
    applyFontSizeSetting();
    
    // Initialize font size adjustment buttons
    initFontSizeButtons();
    
    // Initialize logo selection buttons
    initLogoSelectionButtons();
});

// Font size adjustment functionality
function initFontSizeButtons() {
    const fontSizeButtons = document.querySelectorAll('.font-size-btn');
    fontSizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const size = this.getAttribute('data-size');
            applyFontSize(size);
            updateFontSizeButtonStates(size);
            
            // Save preference to localStorage
            localStorage.setItem('preferredFontSize', size);
        });
    });
}

function updateFontSizeButtonStates(activeSize) {
    const fontSizeButtons = document.querySelectorAll('.font-size-btn');
    fontSizeButtons.forEach(button => {
        const buttonSize = button.getAttribute('data-size');
        if (buttonSize === activeSize) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function applyFontSizeSetting() {
    const savedSize = localStorage.getItem('preferredFontSize');
    if (savedSize) {
        applyFontSize(savedSize);
        updateFontSizeButtonStates(savedSize);
    }
}

function applyFontSize(size) {
    const html = document.documentElement;
    
    // Remove any existing font size classes
    html.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    
    // Add the selected font size class
    if (size) {
        html.classList.add(`font-size-${size}`);
    }
}

// Logo selection functionality
function initLogoSelectionButtons() {
    const logoButtons = document.querySelectorAll('.logo-selection-btn');
    logoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const logoNum = this.getAttribute('data-logo');
            applyLogo(logoNum);
            updateLogoButtonStates(logoNum);
            
            // Save preference to localStorage
            localStorage.setItem('preferredLogo', logoNum);
        });
    });
}

function updateLogoButtonStates(activeLogo) {
    const logoButtons = document.querySelectorAll('.logo-selection-btn');
    logoButtons.forEach(button => {
        const buttonLogo = button.getAttribute('data-logo');
        if (buttonLogo === activeLogo) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function applyLogoPreference() {
    const savedLogo = localStorage.getItem('preferredLogo');
    if (savedLogo) {
        applyLogo(savedLogo);
        updateLogoButtonStates(savedLogo);
    }
}

function applyLogo(logoNumber) {
    const logoContainer = document.querySelector('.site-logo');
    if (logoContainer) {
        const allLogos = logoContainer.querySelectorAll('.logo-variant');
        allLogos.forEach(logo => {
            logo.classList.add('d-none');
        });
        
        const selectedLogo = logoContainer.querySelector(`.logo-${logoNumber}`);
        if (selectedLogo) {
            selectedLogo.classList.remove('d-none');
        }
    }
}

// Product image modal functionality
function initProductImageModal() {
    const productImages = document.querySelectorAll('.product-image');
    const imageModal = document.getElementById('productImageModal');
    
    if (!imageModal) return;
    
    const modalImage = imageModal.querySelector('.modal-product-image');
    const modalTitle = imageModal.querySelector('.modal-title');
    const closeButtons = imageModal.querySelectorAll('[data-bs-dismiss="modal"]');
    
    productImages.forEach(img => {
        img.addEventListener('click', function() {
            const productName = this.getAttribute('data-product-name');
            const imageSrc = this.src;
            
            modalImage.src = imageSrc;
            modalTitle.textContent = productName;
            
            // Show the modal
            const modal = new bootstrap.Modal(imageModal);
            modal.show();
        });
    });
    
    function closeModal() {
        const modal = bootstrap.Modal.getInstance(imageModal);
        if (modal) {
            modal.hide();
        }
    }
    
    // Add keyboard event listener to close modal on Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && imageModal.classList.contains('show')) {
            closeModal();
        }
    });
    
    // Add click handlers for close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
}
