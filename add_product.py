@app.route('/admin/add_product', methods=['POST'])
@login_required
def add_product():
    """Add a new product with image if provided"""
    product_name = request.form.get('name')
    
    if not product_name:
        flash('Product name is required', 'danger')
        return redirect(url_for('admin'))
    
    try:
        # Check if product already exists
        existing_product = Product.query.filter_by(name=product_name).first()
        
        if existing_product:
            flash('Product with this name already exists', 'danger')
            return redirect(url_for('admin'))
        
        # Add new product
        new_product = Product(
            name=product_name,
            price=0.0,
            description="",
            category="",
            color="",
            size="",
            featured=False
        )
        
        db.session.add(new_product)
        
        # Handle image upload if provided
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '':
                if allowed_file(file.filename):
                    try:
                        # Get file extension
                        ext = file.filename.rsplit('.', 1)[1].lower()
                        
                        # Create filename based on product name
                        filename = f"{product_name.lower()}.{ext}"
                        
                        # Remove any existing images for this product (unlikely but just in case)
                        for old_ext in ALLOWED_EXTENSIONS:
                            old_file = os.path.join(app.config['UPLOAD_FOLDER'], f"{product_name.lower()}.{old_ext}")
                            if os.path.exists(old_file):
                                os.remove(old_file)
                        
                        # Save the new image
                        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                        
                        # Update the product's image path
                        image_path = f"/static/images/products/{filename}"
                        new_product.image_path = image_path
                        
                    except Exception as e:
                        logger.error(f"Error uploading image: {e}")
                        flash('Product added but image upload failed', 'warning')
                else:
                    flash('Product added but image has invalid type (only jpg, jpeg, png, and gif allowed)', 'warning')
        
        db.session.commit()
        flash('Product added successfully', 'success')
    except Exception as e:
        logger.error(f"Error adding product: {e}")
        db.session.rollback()
        flash('Failed to add product', 'danger')
    
    return redirect(url_for('admin'))
