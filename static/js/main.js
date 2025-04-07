document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin AJAX forms
    initAdminAjaxForms();

    // Initialize product image modal
    initProductImageModal();

    // Apply saved font size setting on page load
    applyFontSizeSetting();
    
    // Apply saved logo preference on page load
    applyLogoPreference();
    
    // Initialize font size buttons
    initFontSizeButtons();
    
    // Initialize logo selection buttons
    initLogoSelectionButtons();
    
    // Initialize product image modal
    initProductImageModal();
    
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

// Product image modal functionality
function initProductImageModal() {
    // Add modal to the page if it doesn't exist
    if (!document.getElementById('productImageModal')) {
        const modal = document.createElement('div');
        modal.id = 'productImageModal';
        modal.className = 'product-modal';
        modal.innerHTML = `
            <span class="modal-close">&times;</span>
            <img class="modal-content" id="modalProductImage">
            <div class="modal-product-info">
                <div class="modal-product-title" id="modalProductTitle"></div>
                <div class="modal-product-details" id="modalProductDetails"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const modal = document.getElementById('productImageModal');
    const modalImg = document.getElementById('modalProductImage');
    const modalTitle = document.getElementById('modalProductTitle');
    const modalDetails = document.getElementById('modalProductDetails');
    const closeBtn = document.querySelector('.modal-close');

    // Get all product image containers
    const productImgContainers = document.querySelectorAll('.product-img-container');
    
    productImgContainers.forEach(container => {
        container.addEventListener('click', function(e) {
            // Prevent click if this was a button or link click inside the container
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
                return;
            }
            
            // Find the image and product details
            const img = this.querySelector('.product-img');
            if (!img) return;
            
            // Get the parent product card
            const productCard = this.closest('.product-card');
            if (!productCard) return;
            
            // Get product details from the product card
            const productTitle = productCard.querySelector('.product-title');
            const productType = productCard.querySelector('.product-type');
            const productColor = productCard.querySelector('.product-color');
            const productSize = productCard.querySelector('.product-size');
            const productPrice = productCard.querySelector('.product-price');
            
            // Set modal content
            modalImg.src = img.src;
            
            // Set product title
            modalTitle.textContent = productTitle ? productTitle.textContent : '';
            
            // Clear previous details
            modalDetails.innerHTML = '';
            
            // Add details if they exist
            if (productType) {
                const typeSpan = document.createElement('span');
                typeSpan.innerHTML = `<strong>Type:</strong> ${productType.textContent}`;
                modalDetails.appendChild(typeSpan);
            }
            
            if (productColor) {
                const colorSpan = document.createElement('span');
                colorSpan.innerHTML = productColor.innerHTML;
                modalDetails.appendChild(colorSpan);
            }
            
            if (productSize) {
                const sizeSpan = document.createElement('span');
                sizeSpan.innerHTML = productSize.innerHTML;
                modalDetails.appendChild(sizeSpan);
            }
            
            if (productPrice) {
                const priceSpan = document.createElement('span');
                priceSpan.innerHTML = `<strong>Price:</strong> ${productPrice.textContent}`;
                modalDetails.appendChild(priceSpan);
            }
            
            // Display the modal
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent scrolling while modal is open
        });
    });
    
    // Close modal when clicking the close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside the image
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal when pressing ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
    
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Re-enable scrolling
    }
}

// Admin panel AJAX form submissions
function initAdminAjaxForms() {
    // Product update form AJAX submission
    const productForms = document.querySelectorAll('.ajax-form');
    productForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const productId = this.getAttribute('data-product-id');
            const statusMessage = this.closest('td').querySelector('.ajax-status-message');
            
            // Clear previous status messages
            statusMessage.textContent = '';
            statusMessage.className = 'alert mb-3';
            statusMessage.classList.add('d-block');
            statusMessage.textContent = 'Saving changes...';
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                statusMessage.textContent = data.message;
                
                if (data.success) {
                    statusMessage.classList.add('alert-success');
                    
                    // Update the product row with new data
                    setTimeout(() => {
                        const productRow = document.getElementById(`product-row-${productId}`);
                        if (productRow) {
                            // Update the product row cells with new data
                            const cells = productRow.querySelectorAll('td');
                            if (cells.length >= 6) {
                                cells[1].textContent = formData.get('type') || ''; // Type
                                cells[2].textContent = formData.get('color') || ''; // Color
                                cells[3].textContent = formData.get('size') || ''; // Size
                                cells[4].textContent = formData.get('price') || ''; // Price
                                cells[5].textContent = formData.has('featured') ? 'Yes' : 'No'; // Featured
                            }
                        }
                    }, 1000);
                } else {
                    statusMessage.classList.add('alert-danger');
                }
                
                // Auto-hide the message after 5 seconds
                setTimeout(() => {
                    statusMessage.classList.add('fade');
                    setTimeout(() => {
                        statusMessage.classList.remove('fade');
                        statusMessage.classList.add('d-none');
                    }, 500);
                }, 5000);
            })
            .catch(error => {
                console.error('Error:', error);
                statusMessage.textContent = 'An error occurred while saving changes.';
                statusMessage.classList.add('alert-danger');
            });
        });
    });
    
    // Image upload form AJAX submission
    const imageForms = document.querySelectorAll('.ajax-image-form');
    imageForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const productId = this.getAttribute('data-product-id');
            const statusMessage = this.closest('td').querySelector('.ajax-status-message');
            
            // Clear previous status messages
            statusMessage.textContent = '';
            statusMessage.className = 'alert mb-3';
            statusMessage.classList.add('d-block');
            statusMessage.textContent = 'Uploading image...';
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                statusMessage.textContent = data.message;
                
                if (data.success) {
                    statusMessage.classList.add('alert-success');
                    
                    // Update the image badge in the product row
                    setTimeout(() => {
                        const productRow = document.getElementById(`product-row-${productId}`);
                        if (productRow) {
                            const cells = productRow.querySelectorAll('td');
                            if (cells.length >= 7) {
                                const imageCell = cells[6]; // Image cell
                                imageCell.innerHTML = '<span class="badge bg-success">Uploaded</span>';
                            }
                        }
                    }, 1000);
                } else {
                    statusMessage.classList.add('alert-danger');
                }
                
                // Auto-hide the message after 5 seconds
                setTimeout(() => {
                    statusMessage.classList.add('fade');
                    setTimeout(() => {
                        statusMessage.classList.remove('fade');
                        statusMessage.classList.add('d-none');
                    }, 500);
                }, 5000);
            })
            .catch(error => {
                console.error('Error:', error);
                statusMessage.textContent = 'An error occurred while uploading the image.';
                statusMessage.classList.add('alert-danger');
            });
        });
    });
}
