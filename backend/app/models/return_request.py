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