import os
import json
import logging
from datetime import datetime
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from models import db, Product, AdminUser

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize the database with the app
db.init_app(app)

# Function to get image path for products
def check_image_exists(product_name):
    """Check if an image exists for the product"""
    for ext in ALLOWED_EXTENSIONS:
        image_path = f"{UPLOAD_FOLDER}{product_name.lower()}.{ext}"
        if os.path.exists(image_path):
            return f"/static/images/products/{product_name.lower()}.{ext}"
    return None

def get_product_image_path(product_name):
    """Get image path for a product or return placeholder"""
    image_path = check_image_exists(product_name)
    if image_path:
        return image_path
    return "/static/images/placeholder.svg"

# Add a context processor to make the current year and helper functions available to all templates
@app.context_processor
def inject_context():
    return {
        'current_year': datetime.now().year,
        'get_product_image_path': get_product_image_path
    }

# Constants
UPLOAD_FOLDER = 'static/images/products/'
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif'}
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = generate_password_hash('charaadmin123')  # Default password

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configure app
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize database tables and default admin user
with app.app_context():
    db.create_all()
    # Create default admin if not exists
    if not AdminUser.query.filter_by(username='admin').first():
        admin = AdminUser(username='admin', password_hash=ADMIN_PASSWORD)
        db.session.add(admin)
        db.session.commit()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

def get_products():
    """Load products from the database"""
    try:
        # Get all products from database
        products = Product.query.all()
        
        # If no products, initialize with default names
        if not products:
            # Create initial product list with the first 100 products
            product_names = ["Mara", "Willow", "Sahara", "Venus", "Amethysta", "Tanganyika", "Luma", "Topaz", 
                            "Mombasa", "Alpsa", "Magnolia", "Eartha", "Emberlyn", "Tana", "Skyra", "Onyx", 
                            "Rwenzori", "Camellia", "Gobi", "Maple", "Loire", "Storme", "Indigo", "Zambezi", 
                            "Everest", "Ebony", "Bora", "Neptune", "Oaklyn", "Rainah", "Acacia", "Flamea", 
                            "Quartzia", "Thames", "Kilima", "Dahlia", "Poppy", "Sequoia", "Marigold", "Saturn", 
                            "Aurora", "Ruby", "Coralyn", "Atacama", "Glacia", "Sandara", "Pacifica", "Naivasha", 
                            "Solana", "Lavender", "Sapphira", "Amazonia", "Violetta", "Kenya", "Savanna", 
                            "Jasmine", "Zodiac", "Maldives", "Nile", "Montana", "Kalahari", "Cedarlyn", "Riviera", 
                            "Sienna", "Juniper", "Zephyr", "Avalon", "Azura", "Tundra", "Lilac", "Jade", 
                            "Aspen", "Peridot", "Zion", "Pearl", "Ivory", "Victoria", "Amber", "Serengeti", 
                            "Wildebeest", "Opal", "Iris", "Sycamore", "Tigris", "Caspian", "Garnet", "Yosemite", 
                            "Terra", "Olympia", "Citrine", "Serena", "Aria", "Sahel", "Savannah", "Maya", 
                            "Lotus", "Amazon", "Calla", "Crimson", "Sierra", "Nova"]
            
            # Add products to database
            for name in product_names:
                product = Product(
                    name=name,
                    price=0.0,
                    description="",
                    category="",
                    color="",
                    size="",
                    featured=False
                )
                db.session.add(product)
            
            db.session.commit()
            products = Product.query.all()
        
        # Convert to dict format for compatibility with existing code
        return [product.to_dict() for product in products]
    except Exception as e:
        logger.error(f"Error loading products: {e}")
        return []

def save_product(product_data):
    """Save a single product to the database"""
    try:
        product = Product.query.filter_by(name=product_data['name']).first()
        
        if product:
            # Update existing product
            product.price = float(product_data.get('price', 0))
            product.description = product_data.get('description', '')
            product.category = product_data.get('type', '')  # Use 'type' as category for now
            product.color = product_data.get('color', '')
            product.size = product_data.get('size', '')
            product.featured = product_data.get('featured', False)
        else:
            # Create new product
            product = Product(
                name=product_data['name'],
                price=float(product_data.get('price', 0)),
                description=product_data.get('description', ''),
                category=product_data.get('type', ''),  # Use 'type' as category for now
                color=product_data.get('color', ''),
                size=product_data.get('size', ''),
                featured=product_data.get('featured', False)
            )
            db.session.add(product)
        
        db.session.commit()
        return True
    except Exception as e:
        logger.error(f"Error saving product: {e}")
        db.session.rollback()
        return False

def save_products(products):
    """Save all products to the database"""
    try:
        for product_data in products:
            save_product(product_data)
        return True
    except Exception as e:
        logger.error(f"Error saving products: {e}")
        return False


@app.route('/')
def index():
    """Home page with featured products"""
    products = get_products()
    featured_products = [p for p in products if p.get('featured', False) and p.get('type') and p.get('price')]
    
    # If no products are marked as featured, use the first 6 completed products
    if not featured_products:
        featured_products = [p for p in products if p.get('type') and p.get('price')][:6]
    
    # Get at most 6 featured products
    featured_products = featured_products[:6]
    
    # Add image paths
    for product in featured_products:
        product['image_path'] = get_product_image_path(product['name'])
    
    return render_template('index.html', featured_products=featured_products)

@app.route('/products')
def products():
    """Products page with all products"""
    all_products = get_products()
    search_query = request.args.get('search', '').lower()
    category = request.args.get('category', 'all').lower()
    
    # First filter by category if specified
    if category != 'all':
        category_mapping = {
            'clothes': ['dress', 'shirt', 'pants', 'top', 'skirt', 'suit', 'jacket', 'trouser', 'sweatshirt', 'sweater', 'blouse', 'hoodie', 'coat'],
            'shoes': ['shoe', 'boot', 'sandal', 'heel', 'sneaker', 'loafer', 'flat', 'slipper', 'oxford', 'derby'],
            'perfumes': ['perfume', 'fragrance', 'cologne', 'scent', 'eau de toilette', 'eau de parfum', 'spray'],
        }
        
        category_keywords = category_mapping.get(category, [])
        category_products = []
        
        for product in all_products:
            product_type = product.get('type', '').lower()
            if any(keyword in product_type for keyword in category_keywords):
                category_products.append(product)
        
        all_products = category_products
    
    # Then filter by search if provided
    if search_query:
        filtered_products = []
        for product in all_products:
            # Only include products that have at least a name and match the search query
            if (product.get('name', '').lower().find(search_query) != -1 or
                product.get('type', '').lower().find(search_query) != -1 or
                product.get('color', '').lower().find(search_query) != -1 or
                product.get('size', '').lower().find(search_query) != -1):
                filtered_products.append(product)
    else:
        filtered_products = all_products
    
    # Add image paths
    for product in filtered_products:
        product['image_path'] = get_product_image_path(product['name'])
    
    return render_template('products.html', products=filtered_products, search_query=search_query, selected_category=category)

@app.route('/about')
def about():
    """About page"""
    return render_template('about.html')

@app.route('/contact')
def contact():
    """Contact page"""
    return render_template('contact.html')

@app.route('/learn')
def learn():
    """Learn page with guides"""
    return render_template('learn.html')

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Admin login page"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        admin = AdminUser.query.filter_by(username=username).first()
        
        if admin and check_password_hash(admin.password_hash, password):
            session['admin_logged_in'] = True
            return redirect(url_for('admin'))
        else:
            flash('Invalid username or password', 'danger')
    
    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    """Admin logout"""
    session.pop('admin_logged_in', None)
    return redirect(url_for('index'))

@app.route('/admin')
@login_required
def admin():
    """Admin panel to manage products"""
    products = get_products()
    return render_template('admin.html', products=products)

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
    
    return redirect(url_for('admin'))

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

@app.route('/admin/delete_product/<product_name>')
@login_required
def delete_product(product_name):
    """Delete a product"""
    try:
        product = Product.query.filter_by(name=product_name).first()
        
        if product:
            db.session.delete(product)
            db.session.commit()
            flash('Product deleted successfully', 'success')
        else:
            flash('Product not found', 'danger')
    except Exception as e:
        logger.error(f"Error deleting product: {e}")
        db.session.rollback()
        flash('Failed to delete product', 'danger')
    
    return redirect(url_for('admin'))

@app.route('/admin/upload_image/<product_name>', methods=['POST'])
@login_required
def upload_image(product_name):
    """Upload an image for a product"""
    success = False
    message = ""
    image_path = ""
    
    if 'image' not in request.files:
        message = 'No file part'
        flash(message, 'danger')
        return redirect(url_for('admin'))
    
    file = request.files['image']
    
    if file.filename == '':
        message = 'No selected file'
        flash(message, 'danger')
        return redirect(url_for('admin'))
    
    if file and allowed_file(file.filename):
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
            
            # Update the product's image path in the database
            product = Product.query.filter_by(name=product_name).first()
            if product:
                image_path = f"/static/images/products/{filename}"
                product.image_path = image_path
                db.session.commit()
            
            success = True
            message = 'Image uploaded successfully'
            flash(message, 'success')
        except Exception as e:
            logger.error(f"Error uploading image: {e}")
            db.session.rollback()
            message = 'Failed to upload image'
            flash(message, 'danger')
    else:
        message = 'Invalid file type. Only jpg, jpeg, png, and gif are allowed'
        flash(message, 'danger')
    
    
    return redirect(url_for('admin'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
