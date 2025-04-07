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
                                
                                // Update the image status if an image was uploaded
                                if (data.image_path && cells[6]) {
                                    cells[6].innerHTML = '<span class="badge bg-success">Uploaded</span>';
                                }
                            }
                        }
                        
                        // Update image preview if path was returned
                        if (data.image_path) {
                            const preview = document.getElementById(`image-preview-${productId}`);
                            if (preview) {
                                preview.src = data.image_path;
                                preview.style.display = 'block';
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
});
