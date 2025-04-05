document.addEventListener('DOMContentLoaded', function() {
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
