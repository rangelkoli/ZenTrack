from flask import Blueprint, request, jsonify
import re
import bcrypt
import datetime
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt

finance_blueprint = Blueprint('finance_blueprint', __name__, url_prefix='/finance')

@finance_blueprint.route('/main', methods=['GET'])
def finance():
    response = jsonify({"message": "Finance Blueprint"})

    return response

