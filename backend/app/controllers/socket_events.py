from flask_socketio import Namespace, emit
from flask_jwt_extended import jwt_required, get_jwt_identity

def register_socket_events(socketio):
    socketio.on_namespace(AdminNamespace('/admin'))
    socketio.on_namespace(ResellerNamespace('/reseller'))

class AdminNamespace(Namespace):
    def on_connect(self):
        print('Admin connected to socket')
    
    def on_disconnect(self):
        print('Admin disconnected from socket')
    
    @jwt_required()
    def on_join(self, data):
        identity = get_jwt_identity()
        if identity['role'] == 'admin':
            print(f'Admin {identity["id"]} joined admin namespace')
        else:
            self.disconnect()

class ResellerNamespace(Namespace):
    def on_connect(self):
        print('Reseller connected to socket')
    
    def on_disconnect(self):
        print('Reseller disconnected from socket')
    
    @jwt_required()
    def on_join(self, data):
        identity = get_jwt_identity()
        if identity['role'] == 'reseller':
            print(f'Reseller {identity["id"]} joined reseller namespace')
        else:
            self.disconnect()
    
    @jwt_required()
    def on_track_order(self, data):
        identity = get_jwt_identity()
        if identity['role'] != 'reseller':
            return
        
        # Send current order status to reseller
        order_id = data.get('order_id')
        # Implementation to fetch and send order status