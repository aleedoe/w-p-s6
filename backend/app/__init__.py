from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from config import config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
socketio = SocketIO()

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    socketio.init_app(app, message_queue=app.config['SOCKETIO_MESSAGE_QUEUE'])
    
    # Register blueprints
    from .routes import admin_bp, reseller_bp
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(reseller_bp, url_prefix='/api/reseller')
    
    # Import models
    from .models import admin, reseller, product, stock, order, return_request, shipping
    
    # Import socket events
    from .controllers.socket_events import register_socket_events
    register_socket_events(socketio)
    
    return app