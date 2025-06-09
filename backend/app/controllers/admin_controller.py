from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, get_jwt
from ..models import Admin, Product, Stock, OrderRequest, OrderDetail, ReturnRequest, ShippingInfo, db, ResellerStock
from .. import socketio
from datetime import datetime

def admin_login():
    data = request.get_json()
    admin = Admin.query.filter_by(username=data.get('username')).first()
    
    if admin and admin.check_password(data.get('password')):
        access_token = create_access_token(identity=str(admin.id), additional_claims={'role': "admin"})
        return jsonify(access_token=access_token), 200
    
    return jsonify({"msg": "Bad username or password"}), 401

@jwt_required()
def product_management(product_id=None):
    claims = get_jwt()
    current_user_role = claims.get('role')

    if current_user_role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    if request.method == 'GET':
        if product_id:
            product = Product.query.get_or_404(product_id)
            stock = Stock.query.filter_by(product_id=product_id).first()
            return jsonify({
                'product': product.to_dict(),
                'stock': stock.to_dict() if stock else None
            })
        else:
            products = Product.query.all()
            return jsonify([p.to_dict() for p in products])
    
    elif request.method == 'POST':
        data = request.get_json()
        product = Product(
            name=data['name'],
            description=data.get('description'),
            category=data['category'],
            brand=data['brand'],
            model=data.get('model'),
            price=data['price'],
            image_url=data.get('image_url')
        )
        db.session.add(product)
        db.session.commit()
        
        # Add stock
        stock = Stock(
            product_id=product.id,
            quantity=data.get('quantity', 0),
            last_restocked=datetime.utcnow()
        )
        db.session.add(stock)
        db.session.commit()
        
        return jsonify(product.to_dict()), 201
    
    elif request.method == 'PUT':
        product = Product.query.get_or_404(product_id)
        data = request.get_json()
        
        product.name = data.get('name', product.name)
        product.description = data.get('description', product.description)
        product.category = data.get('category', product.category)
        product.brand = data.get('brand', product.brand)
        product.model = data.get('model', product.model)
        product.price = data.get('price', product.price)
        product.image_url = data.get('image_url', product.image_url)
        
        if 'quantity' in data:
            stock = Stock.query.filter_by(product_id=product_id).first()
            if stock:
                stock.quantity = data['quantity']
            else:
                stock = Stock(product_id=product_id, quantity=data['quantity'])
                db.session.add(stock)
        
        db.session.commit()
        return jsonify(product.to_dict())
    
    elif request.method == 'DELETE':
        product = Product.query.get_or_404(product_id)
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted'}), 200

@jwt_required()
def order_management(order_id=None):
    claims = get_jwt()
    current_user_role = claims.get('role')

    if current_user_role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    if request.method == 'GET':
        if order_id:
            order = OrderRequest.query.get_or_404(order_id)
            details = OrderDetail.query.filter_by(order_id=order_id).all()
            return jsonify({
                'order': order.to_dict(),
                'details': [d.to_dict() for d in details]
            })
        else:
            status = request.args.get('status', 'pending')
            orders = OrderRequest.query.filter_by(status=status).all()
            return jsonify([o.to_dict() for o in orders])
    
    elif request.method == 'PUT':
        order = OrderRequest.query.get_or_404(order_id)
        data = request.get_json()
        
        if 'status' in data:
            order.status = data['status']
            
            # Emit socket event when order status changes
            if data['status'] in ['approved', 'rejected']:
                socketio.emit('order_updated', {
                    'order_id': order.id,
                    'status': order.status,
                    'reseller_id': order.reseller_id
                }, namespace='/admin')
        
        db.session.commit()
        return jsonify(order.to_dict())

@jwt_required()
def shipping_management():
    claims = get_jwt()
    current_user_role = claims.get('role')

    if current_user_role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    if request.method == 'GET':
        status = request.args.get('status', 'preparing')
        shippings = ShippingInfo.query.filter_by(status=status).all()
        return jsonify([s.to_dict() for s in shippings])
    
    elif request.method == 'PUT':
        data = request.get_json()
        shipping_id = data.get('shipping_id')
        shipping = ShippingInfo.query.get_or_404(shipping_id)
        
        if 'status' in data:
            shipping.status = data['status']
            
            # Update order status if shipping is delivered
            if data['status'] == 'delivered':
                shipping.order.status = 'delivered'
                shipping.actual_delivery = datetime.utcnow()
                
                # Update reseller stock
                order_details = OrderDetail.query.filter_by(order_id=shipping.order_id).all()
                for detail in order_details:
                    reseller_stock = ResellerStock.query.filter_by(
                        reseller_id=shipping.reseller_id,
                        product_id=detail.product_id
                    ).first()
                    
                    if reseller_stock:
                        reseller_stock.quantity += detail.quantity
                    else:
                        reseller_stock = ResellerStock(
                            reseller_id=shipping.reseller_id,
                            product_id=detail.product_id,
                            quantity=detail.quantity
                        )
                        db.session.add(reseller_stock)
                
                # Emit socket event
                socketio.emit('shipping_update', {
                    'order_id': shipping.order_id,
                    'status': 'delivered',
                    'reseller_id': shipping.reseller_id
                }, namespace='/reseller')
        
        db.session.commit()
        return jsonify(shipping.to_dict())

@jwt_required()
def return_management():
    claims = get_jwt()
    current_user_role = claims.get('role')

    if current_user_role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    if request.method == 'GET':
        status = request.args.get('status', 'pending')
        returns = ReturnRequest.query.filter_by(status=status).all()
        return jsonify([r.to_dict() for r in returns])
    
    elif request.method == 'PUT':
        data = request.get_json()
        return_id = data.get('return_id')
        return_req = ReturnRequest.query.get_or_404(return_id)
        
        if 'status' in data:
            return_req.status = data['status']
            return_req.processed_date = datetime.utcnow()
            
            if data['status'] == 'approved':
                # Deduct from reseller stock
                reseller_stock = ResellerStock.query.filter_by(
                    reseller_id=return_req.reseller_id,
                    product_id=return_req.product_id
                ).first()
                
                if reseller_stock:
                    reseller_stock.quantity -= return_req.quantity
                    if reseller_stock.quantity < 0:
                        reseller_stock.quantity = 0
                
                # Add back to warehouse stock
                warehouse_stock = Stock.query.filter_by(product_id=return_req.product_id).first()
                if warehouse_stock:
                    warehouse_stock.quantity += return_req.quantity
            
            # Emit socket event
            socketio.emit('return_status', {
                'return_id': return_req.id,
                'status': return_req.status,
                'reseller_id': return_req.reseller_id
            }, namespace='/reseller')
        
        db.session.commit()
        return jsonify(return_req.to_dict())