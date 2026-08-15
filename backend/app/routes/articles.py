"""
Articles Blueprint — /api/articles
"""
from flask import Blueprint, jsonify, request
from sqlalchemy import or_
from app import db
from app.models import Article, Issue, Volume

articles_bp = Blueprint("articles", __name__)


@articles_bp.route("", methods=["GET"])
def get_articles():
    """
    Get paginated list of articles
    ---
    tags:
      - Articles
    parameters:
      - name: page
        in: query
        type: integer
        description: Page number
        default: 1
      - name: per_page
        in: query
        type: integer
        description: Items per page
        default: 10
      - name: category
        in: query
        type: string
        description: Filter by category
      - name: subject
        in: query
        type: string
        description: Filter by subject/keyword
    responses:
      200:
        description: List of articles
        schema:
          type: object
          properties:
            articles:
              type: array
            total:
              type: integer
            pages:
              type: integer
            current_page:
              type: integer
    """
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    category = request.args.get("category")
    subject = request.args.get("subject")
    status = request.args.get("status", "published")

    q = Article.query.filter(Article.status == status)

    if category:
        q = q.filter(Article.category.ilike(f"%{category}%"))
    if subject:
        q = q.filter(Article.keywords.ilike(f"%{subject}%"))

    q = q.order_by(Article.published_at.desc())
    pagination = q.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "articles": [a.to_dict() for a in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": page,
    })


@articles_bp.route("/latest", methods=["GET"])
def get_latest():
    """
    Get latest published articles
    ---
    tags:
      - Articles
    parameters:
      - name: limit
        in: query
        type: integer
        description: Number of articles to return
        default: 5
        maximum: 20
    responses:
      200:
        description: Latest articles
        schema:
          type: array
          items:
            type: object
    """
    limit = request.args.get("limit", 5, type=int)
    articles = (
        Article.query
        .filter(Article.status == "published")
        .order_by(Article.published_at.desc())
        .limit(limit)
        .all()
    )
    return jsonify([a.to_dict() for a in articles])


@articles_bp.route("/current-issue", methods=["GET"])
def get_current_issue():
    """
    Get current issue with all its articles
    ---
    tags:
      - Articles
    responses:
      200:
        description: Current issue data
        schema:
          type: object
          properties:
            issue:
              type: object
            volume:
              type: object
            articles:
              type: array
    """
    latest_issue = (
        Issue.query
        .join(Article, Article.issue_id == Issue.id)
        .filter(Article.status == "published")
        .order_by(Volume.year.desc(), Issue.number.desc())
        .join(Volume, Volume.id == Issue.volume_id)
        .first()
    )
    if not latest_issue:
        return jsonify({"issue": None, "articles": []})

    articles = (
        Article.query
        .filter(Article.issue_id == latest_issue.id, Article.status == "published")
        .order_by(Article.published_at.desc())
        .all()
    )
    return jsonify({
        "issue": latest_issue.to_dict(),
        "volume": latest_issue.volume.to_dict() if latest_issue.volume else None,
        "articles": [a.to_dict() for a in articles],
    })


@articles_bp.route("/in-progress", methods=["GET"])
def get_in_progress():
    """
    Get accepted articles (in progress)
    ---
    tags:
      - Articles
    responses:
      200:
        description: List of accepted articles not yet published
    """
    articles = (
        Article.query
        .filter(Article.status == "accepted")
        .order_by(Article.updated_at.desc())
        .all()
    )
    return jsonify([a.to_dict() for a in articles])


@articles_bp.route("/search", methods=["GET"])
def search_articles():
    """
    Search articles by title, author, or keywords
    ---
    tags:
      - Articles
    parameters:
      - name: q
        in: query
        type: string
        required: true
        description: Search query
      - name: page
        in: query
        type: integer
        description: Page number
        default: 1
    responses:
      200:
        description: Search results
    """
    query = request.args.get("q", "").strip()
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    if not query:
        return jsonify({"articles": [], "total": 0, "pages": 0})

    q = Article.query.filter(
        Article.status == "published",
        or_(
            Article.title.ilike(f"%{query}%"),
            Article.authors.ilike(f"%{query}%"),
            Article.keywords.ilike(f"%{query}%"),
            Article.abstract.ilike(f"%{query}%"),
            Article.doi.ilike(f"%{query}%"),
        ),
    ).order_by(Article.published_at.desc())

    pagination = q.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "articles": [a.to_dict() for a in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": page,
        "query": query,
    })


@articles_bp.route("/<int:article_id>", methods=["GET"])
def get_article(article_id):
    """
    Get single article by ID
    ---
    tags:
      - Articles
    parameters:
      - name: article_id
        in: path
        type: integer
        required: true
        description: Article ID
    responses:
      200:
        description: Article details
      404:
        description: Article not found
    """
    article = Article.query.get_or_404(article_id)
    article.views += 1
    db.session.commit()
    return jsonify(article.to_dict(detail=True))


@articles_bp.route("/<int:article_id>/download", methods=["POST"])
def increment_download(article_id):
    """
    Increment download counter for article
    ---
    tags:
      - Articles
    parameters:
      - name: article_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Download count updated
        schema:
          type: object
          properties:
            downloads:
              type: integer
    """
    article = Article.query.get_or_404(article_id)
    article.downloads += 1
    db.session.commit()
    return jsonify({"downloads": article.downloads})