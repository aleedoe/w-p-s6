from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
from config import config
from app.models import *
from flask_cors import CORS
from datetime import timedelta


migrate = Migrate()
jwt = JWTManager()
socketio = SocketIO(cors_allowed_origins=[
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "http://localhost:56136",
    "http://127.0.0.1:56136",
    ],
    engineio_logger=True,  # Untuk debugging
    logger=True
    )

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config.from_object(config[config_name])
    
    # Enable CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:57730", "http://127.0.0.1:57730"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Initialize extensions
    migrate.init_app(app, db)
    jwt.init_app(app)
    # Inisialisasi SocketIO dengan CORS
    socketio.init_app(app, 
                    cors_allowed_origins=["http://localhost:5173"],
                    message_queue=app.config['SOCKETIO_MESSAGE_QUEUE'])
    
    # Register blueprints
    from .routes import admin_bp, reseller_bp
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(reseller_bp, url_prefix='/api/reseller')
    
    # Import models
    from .models import admin, reseller, product, stock, order, return_request, shipping
    
    # Import socket events
    from .controllers.socket_events import register_socket_events
    register_socket_events(socketio)
    
    db.init_app(app)
    
    return app