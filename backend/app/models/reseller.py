from . import db
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash

class Reseller(db.Model):
    __tablename__ = 'resellers'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    # Relationships
    orders = db.relationship('OrderRequest', backref='reseller', lazy=True)
    returns = db.relationship('ReturnRequest', backref='reseller', lazy=True)
    stocks = db.relationship('ResellerStock', backref='reseller', lazy=True)
    shippings = db.relationship('ShippingInfo', backref='reseller', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def generate_auth_token(self):
        return create_access_token(identity={'id': self.id, 'role': 'reseller'})
    
    def __repr__(self):
        return f'<Reseller {self.username}>'