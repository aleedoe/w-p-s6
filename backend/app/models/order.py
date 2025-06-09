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

    def to_dict(self):
        return {
            'id': self.id,
            'reseller_id': self.reseller_id,
            'order_date': self.order_date.isoformat() if self.order_date else None,
            'status': self.status,
            'total_amount': self.total_amount,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'order_details': [detail.to_dict() for detail in self.order_details],
            'shipping': self.shipping.to_dict() if self.shipping else None
        }




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

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'subtotal': self.subtotal,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
