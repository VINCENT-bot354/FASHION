import os
import json
import logging
from datetime import datetime
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

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
PRODUCTS_FILE = 'products.json'
UPLOAD_FOLDER = 'static/images/products/'
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif'}
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = generate_password_hash('charaadmin123')  # Default password

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configure app
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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
    """Load products from the JSON file"""
    try:
        if os.path.exists(PRODUCTS_FILE):
            with open(PRODUCTS_FILE, 'r') as f:
                return json.load(f)
        else:
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
            
            products = []
            for name in product_names:
                products.append({
                    "name": name,
                    "type": "",
                    "color": "",
                    "size": "",
                    "price": "",
                    "featured": False
                })
                
            with open(PRODUCTS_FILE, 'w') as f:
                json.dump(products, f, indent=4)
                
            return products
    except Exception as e:
        logger.error(f"Error loading products: {e}")
        return []

def save_products(products):
    """Save products to the JSON file"""
    try:
        with open(PRODUCTS_FILE, 'w') as f:
            json.dump(products, f, indent=4)
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
    
    # Filter products if search query exists
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
    
    return render_template('products.html', products=filtered_products, search_query=search_query)

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
        
        if username == ADMIN_USERNAME and check_password_hash(ADMIN_PASSWORD, password):
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
    """Update product details"""
    product_name = request.form.get('name')
    product_type = request.form.get('type')
    product_color = request.form.get('color')
    product_size = request.form.get('size')
    product_price = request.form.get('price')
    product_featured = 'featured' in request.form
    
    products = get_products()
    
    # Find and update the product
    for product in products:
        if product['name'] == product_name:
            product['type'] = product_type
            product['color'] = product_color
            product['size'] = product_size
            product['price'] = product_price
            product['featured'] = product_featured
            break
    
    if save_products(products):
        flash('Product updated successfully', 'success')
    else:
        flash('Failed to update product', 'danger')
    
    return redirect(url_for('admin'))

@app.route('/admin/add_product', methods=['POST'])
@login_required
def add_product():
    """Add a new product"""
    product_name = request.form.get('name')
    
    if not product_name:
        flash('Product name is required', 'danger')
        return redirect(url_for('admin'))
    
    products = get_products()
    
    # Check if product already exists
    for product in products:
        if product['name'].lower() == product_name.lower():
            flash('Product with this name already exists', 'danger')
            return redirect(url_for('admin'))
    
    # Add new product
    new_product = {
        "name": product_name,
        "type": "",
        "color": "",
        "size": "",
        "price": "",
        "featured": False
    }
    
    products.append(new_product)
    
    if save_products(products):
        flash('Product added successfully', 'success')
    else:
        flash('Failed to add product', 'danger')
    
    return redirect(url_for('admin'))

@app.route('/admin/delete_product/<product_name>')
@login_required
def delete_product(product_name):
    """Delete a product"""
    products = get_products()
    
    # Remove product
    products = [p for p in products if p['name'] != product_name]
    
    if save_products(products):
        flash('Product deleted successfully', 'success')
    else:
        flash('Failed to delete product', 'danger')
    
    return redirect(url_for('admin'))

@app.route('/admin/upload_image/<product_name>', methods=['POST'])
@login_required
def upload_image(product_name):
    """Upload an image for a product"""
    if 'image' not in request.files:
        flash('No file part', 'danger')
        return redirect(url_for('admin'))
    
    file = request.files['image']
    
    if file.filename == '':
        flash('No selected file', 'danger')
        return redirect(url_for('admin'))
    
    if file and allowed_file(file.filename):
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
        flash('Image uploaded successfully', 'success')
    else:
        flash('Invalid file type. Only jpg, jpeg, png, and gif are allowed', 'danger')
    
    return redirect(url_for('admin'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
