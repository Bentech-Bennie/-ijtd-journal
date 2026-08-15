"""
Volumes Blueprint — /api/volumes
"""
from flask import Blueprint, jsonify
from app.models import Volume, Issue, Article

volumes_bp = Blueprint("volumes", __name__)


@volumes_bp.route("", methods=["GET"])
def get_volumes():
    """
    Get all volumes
    ---
    tags:
      - Volumes
    responses:
      200:
        description: List of all volumes with their issues
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              number:
                type: integer
              year:
                type: integer
              issues:
                type: array
    """
    volumes = Volume.query.order_by(Volume.number.asc()).all()
    result = []
    for vol in volumes:
        vol_data = vol.to_dict()
        # Add article count per issue
        for issue_data in vol_data["issues"]:
            count = Article.query.filter(
                Article.issue_id == issue_data["id"],
                Article.status == "published",
            ).count()
            issue_data["article_count"] = count
        result.append(vol_data)
    return jsonify(result)


@volumes_bp.route("/<int:volume_number>/issues/<int:issue_number>", methods=["GET"])
def get_issue_articles(volume_number, issue_number):
    """
    Get specific issue with its articles
    ---
    tags:
      - Volumes
    parameters:
      - name: volume_number
        in: path
        type: integer
        required: true
        description: Volume number
      - name: issue_number
        in: path
        type: integer
        required: true
        description: Issue number
    responses:
      200:
        description: Issue details with articles
      404:
        description: Volume or issue not found
    """
    volume = Volume.query.filter_by(number=volume_number).first_or_404()
    issue = Issue.query.filter_by(volume_id=volume.id, number=issue_number).first_or_404()
    articles = (
        Article.query
        .filter_by(issue_id=issue.id, status="published")
        .order_by(Article.published_at.desc())
        .all()
    )
    return jsonify({
        "volume": volume.to_dict(),
        "issue": issue.to_dict(),
        "articles": [a.to_dict() for a in articles],
    })