@app.route('/admin/update_product', methods=['POST'])
@login_required
def update_product():
    """Update product details and image if provided"""
    product_name = request.form.get('name')
    product_type = request.form.get('type')
    product_color = request.form.get('color')
    product_size = request.form.get('size')
    product_price = request.form.get('price')
    product_featured = 'featured' in request.form
    
    success = False
    message = ""
    image_path = ""
    
    try:
        product = Product.query.filter_by(name=product_name).first()
        
        if product:
            # Update basic product information
            product.category = product_type
            product.color = product_color
            product.size = product_size
            product.price = float(product_price) if product_price else 0
            product.featured = product_featured
            
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
                            
                            # Remove any existing images for this product
                            for old_ext in ALLOWED_EXTENSIONS:
                                old_file = os.path.join(app.config['UPLOAD_FOLDER'], f"{product_name.lower()}.{old_ext}")
                                if os.path.exists(old_file):
                                    os.remove(old_file)
                            
                            # Save the new image
                            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                            
                            # Update the product's image path
                            image_path = f"/static/images/products/{filename}"
                            product.image_path = image_path
                            
                            message = 'Product and image updated successfully'
                        except Exception as e:
                            logger.error(f"Error uploading image: {e}")
                            message = 'Product updated but image upload failed'
                    else:
                        message = 'Product updated but image has invalid type (only jpg, jpeg, png, and gif allowed)'
                else:
                    message = 'Product updated successfully'
            else:
                message = 'Product updated successfully'
                
            # Commit changes to database
            db.session.commit()
            success = True
            flash(message, 'success')
        else:
            message = 'Product not found'
            flash(message, 'danger')
    except Exception as e:
        logger.error(f"Error updating product: {e}")
        db.session.rollback()
        message = 'An error occurred while updating the product'
        flash(message, 'danger')
    
    # Return JSON response for AJAX requests
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return {
            'success': success, 
            'message': message,
            'image_path': image_path
        }
    
    return redirect(url_for('admin'))
