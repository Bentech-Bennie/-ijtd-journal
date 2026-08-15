"""
Editorial Board Blueprint — /api/editorial-board
"""
from flask import Blueprint, jsonify
from app.models import EditorialMember

editorial_bp = Blueprint("editorial", __name__)

ROLE_ORDER = {
    "Editor-in-Chief": 0,
    "Co-Editor-in-Chief": 1,
    "Associate Editor": 2,
    "Editorial Board Member": 3,
}


@editorial_bp.route("", methods=["GET"])
def get_editorial_board():
    """
    Get editorial board members grouped by role
    ---
    tags:
      - Editorial Board
    responses:
      200:
        description: Editorial board members
        schema:
          type: array
          items:
            type: object
            properties:
              role:
                type: string
              members:
                type: array
    """
    members = EditorialMember.query.order_by(
        EditorialMember.display_order.asc(),
        EditorialMember.name.asc(),
    ).all()

    # Group by role
    grouped = {}
    for m in members:
        role = m.role
        if role not in grouped:
            grouped[role] = []
        grouped[role].append(m.to_dict())

    # Sort groups by role priority
    ordered = []
    for role in sorted(grouped.keys(), key=lambda r: ROLE_ORDER.get(r, 99)):
        ordered.append({"role": role, "members": grouped[role]})

    return jsonify(ordered)