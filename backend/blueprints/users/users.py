from flask import Blueprint, request, jsonify
from db import db
import flask_bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
import re
from flask_cors import cross_origin

auth_blueprint = Blueprint('auth', __name__)

def validate_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def validate_password(password):
    return len(password) >= 6

@auth_blueprint.route('/register', methods=['POST'])
def signup():
    try:
        if not request.is_json:
            return jsonify({'error': 'Missing JSON in request'}), 422

        data = request.get_json()
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')
        name = data.get('name', '').strip()

        # Validate required fields
        if not all([email, password, name]):
            return jsonify({'error': 'All fields are required'}), 422

        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 422

        # Validate password strength
        if not validate_password(password):
            return jsonify({'error': 'Password must be at least 6 characters long'}), 422

        # Check if user exists
        existing_user = db.table('users').select('*').eq('email', email).execute()
        if existing_user.data:
            return jsonify({'error': 'User already exists'}), 409

        hashed_password = flask_bcrypt.generate_password_hash(password).decode('utf-8')
        
        new_user = db.table('users').insert({
            'email': email,
            'password': hashed_password,
            'name': name
        }).execute()

        if not new_user.data:
            return jsonify({'error': 'Failed to create user'}), 500

        return jsonify({
            'message': 'User created successfully',
            'user': {'email': email, 'name': name}
        }), 201

    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_blueprint.route('/login', methods=['POST'])
@cross_origin()
def login():
    try:
        if not request.is_json:
            return jsonify({'error': 'Missing JSON in request'}), 422

        data = request.get_json()
        print("Received login data:", data)  # Debug log
        
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')

        if not all([email, password]):
            return jsonify({'error': 'Email and password are required'}), 422

        # Debug log
        print(f"Attempting login for email: {email}")

        # Query the database for the user with exact email match
        user_result = db.table('users').select('*').eq('email', email).execute()
        print("Database query result:", user_result.data)  # Debug log

        if not user_result.data:
            print(f"No user found for email: {email}")  # Debug log
            return jsonify({'error': 'Invalid email or password'}), 401

        user = user_result.data[0]
        
        # Debug log for password verification
        print(f"Verifying password for user: {user['email']}")
        is_valid = flask_bcrypt.check_password_hash(user['password'], password)
        print(f"Password verification result: {is_valid}")  # Debug log

        if not is_valid:
            return jsonify({'error': 'Invalid email or password'}), 401

        access_token = create_access_token(
            identity=user['id'],
            additional_claims={
                'email': email,
                'name': user['name'],
                'user_id': user['id']
            },
            expires_delta=timedelta(days=7)
        )

        response_data = {
            'access_token': access_token,
            'user': {
                'email': email,
                'name': user['name'],
                'id': user['id']
            }
        }
        print("Successful login, returning:", response_data)  # Debug log
        return jsonify(response_data), 200

    except Exception as e:
        print(f"Login error: {str(e)}")  # Debug log
        import traceback
        traceback.print_exc()  # Print full stack trace
        return jsonify({'error': 'Internal server error'}), 500

@auth_blueprint.route('/get_user', methods=['GET'])
@jwt_required()
def get_user():
    try:
        # Get user identity from JWT
        id = get_jwt_identity()
        
        # Query user details from database
        user_result = db.table('users').select('*').eq('id', id).execute()
        
        if not user_result.data:
            return jsonify({'error': 'User not found'}), 404

        user = user_result.data[0]
        
        return jsonify({
            'user': {
                'email': user['email'],
                'name': user['name'],
                'id': user['id']
            }
        }), 200

    except Exception as e:
        print(f"Get user error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_blueprint.route('/validate_token', methods=['POST'])
@jwt_required()
def validate_token():
    try:
        current_user_email = get_jwt_identity()
        return jsonify({
            'valid': True,
            'email': current_user_email
        }), 200
    except Exception as e:
        return jsonify({
            'valid': False,
            'error': str(e)
        }), 401
