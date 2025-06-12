from operator import or_
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, get_jwt
from ..models import Admin, Product, Stock, OrderRequest, OrderDetail, ReturnRequest, ShippingInfo, db, ResellerStock
from .. import socketio
from datetime import datetime

def admin_login():
    data = request.get_json()
    admin = Admin.query.filter_by(email=data.get('email')).first()
    
    if admin and admin.check_password(data.get('password')):
        access_token = create_access_token(identity=str(admin.id), additional_claims={'role': "admin"})
        return jsonify(access_token=access_token), 200
    
    return jsonify({"msg": "Bad email or password"}), 401

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
            page = request.args.get('page', default=1, type=int)
            limit = request.args.get('limit', default=10, type=int)
            search = request.args.get('search', type=str)

            query = Product.query

            if search:
                search_term = f"%{search.lower()}%"
                query = query.filter(Product.name.ilike(search_term))

            total = query.count()

            products = query.order_by(Product.id.desc()) \
                            .offset((page - 1) * limit) \
                            .limit(limit) \
                            .all()

            return jsonify({
                'products': [
                    {
                        **p.to_dict(),
                        'stock': p.stocks[0].to_dict() if p.stocks else None
                    } for p in products
                ],
                'total': total
            })


    
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
            quantity=data.get('stock', {}).get('quantity', 0),
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

        # Sinkronisasi update stock
        stock_data = data.get('stock')
        if stock_data and isinstance(stock_data, dict):
            stock = Stock.query.filter_by(product_id=product_id).first()
            if stock:
                stock.quantity = stock_data.get('quantity', stock.quantity)
                stock.last_restocked = datetime.utcnow()
            else:
                stock = Stock(
                    product_id=product_id,
                    quantity=stock_data.get('quantity', 0),
                    last_restocked=datetime.utcnow()
                )
                db.session.add(stock)

        db.session.commit()
        return jsonify(product.to_dict())

    
    elif request.method == 'DELETE':
        product = Product.query.get_or_404(product_id)

        # Cek apakah produk digunakan di order_details
        order_refs = db.session.query(OrderDetail).filter_by(product_id=product_id).first()
        if order_refs:
            return jsonify({'message': 'Cannot delete product. It is referenced in order details.'}), 400

        # Hapus stok terkait produk
        stock = Stock.query.filter_by(product_id=product_id).first()
        if stock:
            db.session.delete(stock)

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
            })
        else:
            status = request.args.get('status', 'pending')
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 10))
            search = request.args.get('search', '')

            query = OrderRequest.query

            if status:
                query = query.filter_by(status=status)

            if search:
                query = query.filter(OrderRequest.notes.ilike(f'%{search}%'))

            total = query.count()
            orders = query.offset((page - 1) * limit).limit(limit).all()

            return jsonify({
                'data': [o.to_dict() for o in orders],
                'meta': {
                    'total': total,
                    'page': page,
                    'limit': limit
                }
            })

    
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
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status', 'all')

        query = ShippingInfo.query
        
        if status != 'all':
            query = query.filter_by(status=status)
            
        if search:
            query = query.filter(
                or_(
                    ShippingInfo.tracking_number.ilike(f'%{search}%'),
                    ShippingInfo.order_id.ilike(f'%{search}%'),
                    ShippingInfo.carrier.ilike(f'%{search}%')
                )
            )
            
        paginated = query.paginate(page=page, per_page=limit, error_out=False)
        
        return jsonify({
            'shipments': [s.to_dict() for s in paginated.items],
            'total': paginated.total,
            'page': paginated.page,
            'per_page': paginated.per_page
        })
    
    elif request.method == 'PUT':
        data = request.get_json()
        
        # Validasi required fields
        if not data.get('shipping_id'):
            return jsonify({'message': 'Shipping ID is required'}), 400
        if not data.get('status'):
            return jsonify({'message': 'Status is required'}), 400

        shipping = ShippingInfo.query.get_or_404(data['shipping_id'])
        
        # Update semua field yang ada di request
        if 'status' in data:
            shipping.status = data['status']
            
            # Handle khusus status delivered
            if data['status'] == 'delivered':
                shipping.actual_delivery = datetime.utcnow()
                if shipping.order:
                    shipping.order.status = 'delivered'
        
        # Update field shipping info
        if 'tracking_number' in data:
            shipping.tracking_number = data['tracking_number']
        if 'carrier' in data:
            shipping.carrier = data['carrier']
        if 'notes' in data:
            shipping.notes = data['notes']
        if 'shipping_method' in data:
            shipping.shipping_method = data['shipping_method']
        if 'estimated_delivery' in data:
            try:
                shipping.estimated_delivery = datetime.fromisoformat(data['estimated_delivery'])
            except (ValueError, TypeError):
                return jsonify({'message': 'Invalid estimated_delivery format'}), 400

        db.session.commit()
        
        # Emit socket event
        socketio.emit('shipping_update', {
            'shipping_id': shipping.id,
            'order_id': shipping.order_id,
            'status': shipping.status,
            'reseller_id': shipping.reseller_id,
            'updated_at': shipping.updated_at.isoformat()
        }, namespace='/admin')
        
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