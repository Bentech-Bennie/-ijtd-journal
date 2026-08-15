# app/routes/__init__.py
from .articles import articles_bp
from .manuscripts import manuscripts_bp
from .editorial import editorial_bp
from .join import join_bp
from .contact import contact_bp
from .volumes import volumes_bp

__all__ = [
    'articles_bp',
    'manuscripts_bp',
    'editorial_bp',
    'join_bp',
    'contact_bp',
    'volumes_bp'
]