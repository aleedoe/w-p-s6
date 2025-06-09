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