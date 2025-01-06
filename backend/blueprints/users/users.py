from flask import Blueprint, request, jsonify
from supabase import create_client
from db import db
import flask_bcrypt
from flask_jwt_extended import JWTManager, create_access_token

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
    password = request.json.get('password')
    print(email, password)
    
    # Check if the user exists
    user = db.table('users').select().eq('email', email).execute()
    print(user)
    if not user.data:
        return jsonify({'error': 'User does not exist'})
    
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


@auth_blueprint.route('/get_user', methods=['GET'])

def get_user():
    # Get the user's access token from the request
    access_token = request.headers.get('Authorization')
    access_token = access_token.split(' ')[1]
    access_token = access_token.split('"')[1]
    access_token = access_token.split('"')[0]
    print(access_token)
    # Get the user's email from the access token


