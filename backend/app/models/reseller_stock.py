from . import db

class ResellerStock(db.Model):
    __tablename__ = 'reseller_stocks'
    
    id = db.Column(db.Integer, primary_key=True)
    reseller_id = db.Column(db.Integer, db.ForeignKey('resellers.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    last_updated = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    def __repr__(self):
        return f'<ResellerStock Reseller {self.reseller_id} Product {self.product_id}: {self.quantity}>'

    def to_dict(self):
        return {
            'id': self.id,
            'reseller_id': self.reseller_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }
