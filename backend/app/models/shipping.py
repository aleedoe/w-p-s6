from .. import db
from datetime import datetime

class ShippingInfo(db.Model):
    __tablename__ = 'shipping_info'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order_requests.id'), nullable=False)
    reseller_id = db.Column(db.Integer, db.ForeignKey('resellers.id'), nullable=False)
    shipping_method = db.Column(db.String(50), nullable=False)
    tracking_number = db.Column(db.String(100))
    shipping_date = db.Column(db.DateTime)
    estimated_delivery = db.Column(db.DateTime)
    actual_delivery = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='preparing')  # preparing, shipped, in_transit, delivered
    carrier = db.Column(db.String(50))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    def __repr__(self):
        return f'<ShippingInfo Order {self.order_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'reseller_id': self.reseller_id,
            'shipping_method': self.shipping_method,
            'tracking_number': self.tracking_number,
            'shipping_date': self.shipping_date.isoformat() if self.shipping_date else None,
            'estimated_delivery': self.estimated_delivery.isoformat() if self.estimated_delivery else None,
            'actual_delivery': self.actual_delivery.isoformat() if self.actual_delivery else None,
            'status': self.status,
            'carrier': self.carrier,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
