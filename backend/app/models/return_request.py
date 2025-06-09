from .. import db
from datetime import datetime

class ReturnRequest(db.Model):
    __tablename__ = 'return_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    reseller_id = db.Column(db.Integer, db.ForeignKey('resellers.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('order_requests.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected, processed
    request_date = db.Column(db.DateTime, default=datetime.utcnow)
    processed_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    def __repr__(self):
        return f'<ReturnRequest {self.id} by Reseller {self.reseller_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'reseller_id': self.reseller_id,
            'product_id': self.product_id,
            'order_id': self.order_id,
            'quantity': self.quantity,
            'reason': self.reason,
            'status': self.status,
            'request_date': self.request_date.isoformat() if self.request_date else None,
            'processed_date': self.processed_date.isoformat() if self.processed_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
