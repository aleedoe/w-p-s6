from .. import db
from datetime import datetime

class OrderRequest(db.Model):
    __tablename__ = 'order_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    reseller_id = db.Column(db.Integer, db.ForeignKey('resellers.id'), nullable=False)
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected, shipped, delivered
    total_amount = db.Column(db.Float)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    # Relationships
    order_details = db.relationship('OrderDetail', backref='order', lazy=True)
    shipping = db.relationship('ShippingInfo', backref='order', uselist=False, lazy=True)
    
    def __repr__(self):
        return f'<OrderRequest {self.id} by Reseller {self.reseller_id}>'

class OrderDetail(db.Model):
    __tablename__ = 'order_details'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order_requests.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    def __repr__(self):
        return f'<OrderDetail Order {self.order_id} Product {self.product_id}>'