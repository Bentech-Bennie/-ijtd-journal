"""
IJTD Backend — Application Factory (complete, all fixes applied)
"""
import os
from datetime import datetime, timezone, timedelta
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_mail import Mail
from flask_jwt_extended import JWTManager
from flasgger import Swagger

db      = SQLAlchemy()
migrate = Migrate()
mail    = Mail()
jwt     = JWTManager()


def now_utc():
    return datetime.now(timezone.utc)


def create_app():
    app = Flask(__name__)

    # ── Config ─────────────────────────────────────────────────────────────
    app.config["SECRET_KEY"]     = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt-dev-secret")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"]  = timedelta(hours=int(os.getenv("JWT_ACCESS_HOURS", 8)))
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", 30)))

    app.config["SQLALCHEMY_DATABASE_URI"]        = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ijtd_db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"]      = {"pool_size": 10, "pool_recycle": 3600, "pool_pre_ping": True}

    app.config["UPLOAD_FOLDER"]      = os.path.join(os.path.dirname(__file__), os.getenv("UPLOAD_FOLDER", "uploads"))
    app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))

    # Email
    app.config["MAIL_SERVER"]         = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    app.config["MAIL_PORT"]           = int(os.getenv("MAIL_PORT", 587))
    app.config["MAIL_USE_TLS"]        = os.getenv("MAIL_USE_TLS", "True") == "True"
    app.config["MAIL_USERNAME"]       = os.getenv("MAIL_USERNAME", "")
    app.config["MAIL_PASSWORD"]       = os.getenv("MAIL_PASSWORD", "")
    app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER", "contact@ijtd.com")
    app.config["MAIL_SUPPRESS_SEND"]  = not bool(os.getenv("MAIL_USERNAME", ""))

    # ── Swagger ────────────────────────────────────────────────────────────
    Swagger(app, config={
        "headers": [], "specs_route": "/apidocs/", "swagger_ui": True,
        "specs": [{"endpoint": "apispec", "route": "/apispec.json",
                   "rule_filter": lambda rule: True, "model_filter": lambda tag: True}],
        "static_url_path": "/flasgger_static",
    }, template={
        "swagger": "2.0",
        "info": {"title": "IJTD API", "version": "1.0.0"},
        "basePath": "/api", "schemes": ["http", "https"],
        "securityDefinitions": {"BearerAuth": {"type": "apiKey", "in": "header", "name": "Authorization"}},
    })

    # ── Extensions ─────────────────────────────────────────────────────────
    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    jwt.init_app(app)

    # ── CORS Configuration ─────────────────────────────────────────────────
    CORS(app,
         origins=[
             os.getenv("FRONTEND_URL", "http://localhost:3000"),
             "http://localhost:3000",
             "http://localhost:5000",
             "http://127.0.0.1:3000",
             "http://127.0.0.1:5000",
             "https://ijtd-journal-platform.vercel.app",
             "https://ijtd-journal-platform.onrender.com",
         ],
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    )

    # ── CORS Headers for every response ────────────────────────────────────
    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get('Origin', '*')
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Requested-With,Accept'
        response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS,PATCH'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response

    # ── Handle OPTIONS preflight requests ──────────────────────────────────
    @app.before_request
    def handle_preflight():
        if request.method == 'OPTIONS':
            response = jsonify({'status': 'ok'})
            origin = request.headers.get('Origin', '*')
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Requested-With,Accept'
            response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS,PATCH'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Max-Age'] = '3600'
            return response

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # ── Blueprints ─────────────────────────────────────────────────────────
    from app.routes.articles    import articles_bp
    from app.routes.manuscripts import manuscripts_bp
    from app.routes.editorial   import editorial_bp
    from app.routes.join        import join_bp
    from app.routes.contact     import contact_bp
    from app.routes.volumes     import volumes_bp
    from app.routes.certificate import certificate_bp
    from app.routes.admin       import admin_bp
    from app.routes.files       import files_bp

    import sys as _sys
    _sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    from routes_auth import auth_bp

    app.register_blueprint(articles_bp,    url_prefix="/api/articles")
    app.register_blueprint(manuscripts_bp, url_prefix="/api/manuscripts")
    app.register_blueprint(editorial_bp,   url_prefix="/api/editorial-board")
    app.register_blueprint(join_bp,        url_prefix="/api/join")
    app.register_blueprint(contact_bp,     url_prefix="/api/contact")
    app.register_blueprint(volumes_bp,     url_prefix="/api/volumes")
    app.register_blueprint(certificate_bp, url_prefix="/api/certificate")
    app.register_blueprint(admin_bp,       url_prefix="/api/admin")
    app.register_blueprint(auth_bp,        url_prefix="/api/auth")
    app.register_blueprint(files_bp,       url_prefix="/api/files")

    # ── JWT error handlers ─────────────────────────────────────────────────
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Invalid token"}), 422

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Authorization token required"}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({"error": "Token has expired"}), 401

    @app.route("/")
    def index():
        return jsonify({"name": "IJTD API", "version": "1.0.0", "status": "running"})

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok", "timestamp": now_utc().isoformat()})

    return app