from flask_sqlalchemy import SQLAlchemy

# Inisialisasi database
db = SQLAlchemy()

from .admin import Admin
from .order import OrderRequest, OrderDetail  # Tambahkan OrderDetail di sini
from .product import Product
from .reseller_stock import ResellerStock
from .reseller import Reseller
from .return_request import ReturnRequest
from .shipping import ShippingInfo
from .stock import Stock