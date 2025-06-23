from flask import Blueprint
from .controllers.admin_controller import (
    admin_login, 
    product_management,
    order_management,
    shipping_management,
    return_management
)
from .controllers.reseller_controller import (
    reseller_login,
    reseller_register,
    product_listing,
    order_operations,
    return_operations,
    stock_management,
    shipping_tracking
)

admin_bp = Blueprint('admin', __name__)
reseller_bp = Blueprint('reseller', __name__)

# Admin routes
admin_bp.route('/login', methods=['POST'])(admin_login)
admin_bp.route('/products', methods=['GET', 'POST'])(product_management)
admin_bp.route('/products/<int:product_id>', methods=['GET', 'PUT', 'DELETE'])(product_management)
admin_bp.route('/orders', methods=['GET'])(order_management)
admin_bp.route('/orders/<int:order_id>', methods=['GET', 'PUT'])(order_management)
admin_bp.route('/shipping', methods=['GET', 'PUT'])(shipping_management)
admin_bp.route('/returns', methods=['GET', 'PUT'])(return_management)

# Reseller routes
reseller_bp.route('/login', methods=['POST'])(reseller_login)
reseller_bp.route('/register', methods=['POST'])(reseller_register)
reseller_bp.route('/products', methods=['GET'])(product_listing)
reseller_bp.route('/orders', methods=['GET', 'POST'])(order_operations)
reseller_bp.route('/orders/<int:order_id>', methods=['GET'])(order_operations)
reseller_bp.route('/returns', methods=['GET', 'POST'])(return_operations)
reseller_bp.route('/returns/returnable-orders', methods=['GET'])(return_operations)
reseller_bp.route('/stock', methods=['GET'])(stock_management)
reseller_bp.route('/shipping', methods=['GET'])(shipping_tracking)
reseller_bp.route('/shipping/<int:shipping_id>/validate', methods=['PUT'])(shipping_tracking)