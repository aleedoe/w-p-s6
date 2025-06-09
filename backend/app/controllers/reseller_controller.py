from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from ..models import Reseller, Product, Stock, OrderRequest, OrderDetail, ReturnRequest, ShippingInfo, ResellerStock, db
from .. import socketio
from datetime import datetime

def reseller_login():
    # Implementation for reseller login
    data = request.get_json()
    
    if Reseller.query.filter_by(email=data.get('email')).first():
        return jsonify({"msg": "Email already registered"}), 400
    
    reseller = Reseller(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        address=data['address']
    )
    reseller.set_password(data['password'])
    
    db.session.add(reseller)
    db.session.commit()
    
    return jsonify({"msg": "Reseller registered"}), 201

def reseller_register():
    # Implementation for reseller registration
    data = request.get_json()
    reseller = Reseller.query.filter_by(email=data.get('email')).first()
    
    if reseller and reseller.check_password(data.get('password')):
        access_token = create_access_token(identity={'id': reseller.id, 'role': 'reseller'})
        return jsonify(access_token=access_token), 200
    
    return jsonify({"msg": "Bad email or password"}), 401


@jwt_required()
def product_listing():
    current_user = get_jwt_identity()
    if current_user['role'] != 'reseller':
        return jsonify({'message': 'Unauthorized'}), 403
    
    products = Product.query.join(Stock).filter(Stock.quantity > 0).all()
    return jsonify([{
        'product': p.to_dict(),
        'stock': p.stocks[0].quantity if p.stocks else 0
    } for p in products])

@jwt_required()
def order_operations(order_id=None):
    current_user = get_jwt_identity()
    if current_user['role'] != 'reseller':
        return jsonify({'message': 'Unauthorized'}), 403
    
    if request.method == 'GET':
        if order_id:
            order = OrderRequest.query.filter_by(id=order_id, reseller_id=current_user['id']).first_or_404()
            details = OrderDetail.query.filter_by(order_id=order_id).all()
            return jsonify({
                'order': order.to_dict(),
                'details': [d.to_dict() for d in details]
            })
        else:
            orders = OrderRequest.query.filter_by(reseller_id=current_user['id']).all()
            return jsonify([o.to_dict() for o in orders])
    
    elif request.method == 'POST':
        data = request.get_json()
        products = data.get('products', [])
        
        if not products:
            return jsonify({'message': 'No products in order'}), 400
        
        # Calculate total amount
        total_amount = 0
        order_details = []
        
        for item in products:
            product = Product.query.get(item['product_id'])
            if not product:
                return jsonify({'message': f'Product {item["product_id"]} not found'}), 404
            
            stock = Stock.query.filter_by(product_id=item['product_id']).first()
            if not stock or stock.quantity < item['quantity']:
                return jsonify({'message': f'Insufficient stock for product {product.name}'}), 400
            
            subtotal = product.price * item['quantity']
            total_amount += subtotal
            
            order_details.append({
                'product_id': product.id,
                'quantity': item['quantity'],
                'unit_price': product.price,
                'subtotal': subtotal
            })
        
        # Create order
        order = OrderRequest(
            reseller_id=current_user['id'],
            total_amount=total_amount,
            notes=data.get('notes')
        )
        db.session.add(order)
        db.session.commit()
        
        # Create order details and update stock
        for detail in order_details:
            od = OrderDetail(
                order_id=order.id,
                product_id=detail['product_id'],
                quantity=detail['quantity'],
                unit_price=detail['unit_price'],
                subtotal=detail['subtotal']
            )
            db.session.add(od)
            
            # Deduct from stock (will be added back if order is rejected)
            stock = Stock.query.filter_by(product_id=detail['product_id']).first()
            stock.quantity -= detail['quantity']
        
        db.session.commit()
        
        # Emit socket event for new order
        socketio.emit('new_order', {
            'order_id': order.id,
            'reseller_id': order.reseller_id,
            'reseller_name': order.reseller.name,
            'total_amount': order.total_amount,
            'order_date': order.order_date.isoformat()
        }, namespace='/admin')
        
        return jsonify(order.to_dict()), 201

@jwt_required()
def return_operations():
    current_user = get_jwt_identity()
    if current_user['role'] != 'reseller':
        return jsonify({'message': 'Unauthorized'}), 403
    
    if request.method == 'GET':
        returns = ReturnRequest.query.filter_by(reseller_id=current_user['id']).all()
        return jsonify([r.to_dict() for r in returns])
    
    elif request.method == 'POST':
        data = request.get_json()
        
        # Check if order exists and belongs to reseller
        order = OrderRequest.query.filter_by(
            id=data['order_id'],
            reseller_id=current_user['id'],
            status='delivered'
        ).first_or_404()
        
        # Check if product exists in order
        order_detail = OrderDetail.query.filter_by(
            order_id=data['order_id'],
            product_id=data['product_id']
        ).first_or_404()
        
        # Check if reseller has enough stock
        reseller_stock = ResellerStock.query.filter_by(
            reseller_id=current_user['id'],
            product_id=data['product_id']
        ).first()
        
        if not reseller_stock or reseller_stock.quantity < data['quantity']:
            return jsonify({'message': 'Insufficient stock for return'}), 400
        
        # Create return request
        return_req = ReturnRequest(
            reseller_id=current_user['id'],
            product_id=data['product_id'],
            order_id=data['order_id'],
            quantity=data['quantity'],
            reason=data['reason']
        )
        db.session.add(return_req)
        db.session.commit()
        
        return jsonify(return_req.to_dict()), 201

@jwt_required()
def stock_management():
    current_user = get_jwt_identity()
    if current_user['role'] != 'reseller':
        return jsonify({'message': 'Unauthorized'}), 403
    
    stocks = ResellerStock.query.filter_by(reseller_id=current_user['id']).all()
    return jsonify([{
        'product': s.product.to_dict(),
        'quantity': s.quantity
    } for s in stocks])

@jwt_required()
def shipping_tracking(shipping_id=None):
    current_user = get_jwt_identity()
    if current_user['role'] != 'reseller':
        return jsonify({'message': 'Unauthorized'}), 403
    
    if request.method == 'GET':
        if shipping_id:
            shipping = ShippingInfo.query.filter_by(
                id=shipping_id,
                reseller_id=current_user['id']
            ).first_or_404()
            return jsonify(shipping.to_dict())
        else:
            shippings = ShippingInfo.query.filter_by(reseller_id=current_user['id']).all()
            return jsonify([s.to_dict() for s in shippings])
    
    elif request.method == 'PUT':
        shipping = ShippingInfo.query.filter_by(
            id=shipping_id,
            reseller_id=current_user['id']
        ).first_or_404()
        
        if shipping.status != 'delivered':
            return jsonify({'message': 'Shipping not yet delivered'}), 400
        
        # Validate delivery
        shipping.order.status = 'completed'
        shipping.actual_delivery = datetime.utcnow()
        db.session.commit()
        
        return jsonify(shipping.to_dict())