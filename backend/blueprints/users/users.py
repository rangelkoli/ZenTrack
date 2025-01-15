from flask import Blueprint, request, jsonify
from supabase import create_client
from db import db
import flask_bcrypt
from flask_jwt_extended import  create_access_token, jwt_required, get_jwt_identity

# Create a blueprint for authentication
auth_blueprint = Blueprint('auth', __name__)

@auth_blueprint.route('/register', methods=['POST'])
def signup():
    # Get the user's email and password from the request
    email = request.json.get('email')
    password = request.json.get('password')
    name = request.json.get('name')
    print(email, password, name)
    # Hash the user's password
    hashed_password = flask_bcrypt.generate_password_hash(password).decode('utf-8')
    print(hashed_password)
    # Check if the user already exists
    user = db.table('users').select().eq('email', email).execute()
    print(user)
    if user.data:
        return jsonify({'error': 'User already exists'})
    
    # Sign up the user using Supabase
    res = db.table('users').insert({
        'email': email,
        'password': hashed_password,
        'username': name
    }).execute()


    print(res)
    # Create a response
    if res:
        response = {
            'message': 'User created successfully'
        }
    else:
        response = {
            'error': 'Failed to create user'
        }
   
    # Return the response as JSON
    return jsonify(response)



@auth_blueprint.route('/login', methods=['POST'])
def login():
    # Get the user's email and password from the request
    email = request.json.get('email')
    email = email.lower()
    email = email.strip()
    email = email.replace(" ", "")
    password = request.json.get('password')
    print(email, password)
    
    # Query the database for the user
    user = db.from_('users').select().execute()
    print(user)
    # Check if the user exists

    if not user.data:
        return jsonify({'error': 'User does not exist'}), 404
    
    # Get the user's hashed password
    hashed_password = user.data[0]['password']
    
    # Check if the password is correct
    if not flask_bcrypt.check_password_hash(hashed_password, password):
        return jsonify({'error': 'Invalid password'})
    
    # Create an access token
    access_token = create_access_token(
        identity=email,
        additional_claims={'email': email, 'name': user.data[0]['username']}
    )
    
    # Create a response
    response = {
        'access_token': access_token,
        'user': {
            'email': email,
            'name': user.data[0]['username']

        }
    }
    
    # Return the response as JSON
    return jsonify(response)

@auth_blueprint.route('/logout', methods=['POST'])
def logout():
    # Get the user's access token from the request
    access_token = request.json.get('access_token')

    # Log out the user using Supabase
    response = db.auth.sign_out(access_token)

    # Return the response as JSON
    return jsonify(response)

@auth_blueprint.route('/get_user', methods=['POST'])
@jwt_required()
def get_user():
    try:
        # Log the incoming request
        print('Request JSON:', request.json)
        print('Authorization Header:', request.headers.get('Authorization'))

        # Extract access token from the request
        access_token = request.json.get('access_token')
        if not access_token:
            return jsonify({"error": "access_token missing"}), 400

        # Extract the email from JWT
        email = get_jwt_identity()
        print('JWT Email:', email)

        # Query the database for user information
        user_query = db.table('users').select().eq('email', email).execute()
        user = user_query.data[0] if user_query.data else None

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Build the response
        response = {
            'user': {
                'email': email,
                'name': user['username'],
            }
        }
        return jsonify(response), 200

    except Exception as e:
        print('Error occurred:', str(e))
        return jsonify({"error": "Internal server error"}), 500
