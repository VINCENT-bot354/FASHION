// Admin panel functionality

document.addEventListener('DOMContentLoaded', function() {
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

    // We're not preventing form submission, so forms will submit normally
    // and reload the page automatically
});
