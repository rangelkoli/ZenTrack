from flask import Flask, request, jsonify
from flask_cors import CORS,cross_origin
from datetime import datetime
from blueprints.notes.notes import notes_blueprint
from blueprints.users.users import auth_blueprint
from blueprints.tasks.tasks import tasks_blueprint
from blueprints.habits.habits import habits_blueprint
from models import Transaction
from extensions import db
from flask_supabase import Supabase
from mainapp import app
from flask_jwt_extended import JWTManager
from google import genai
from google.genai import types
import os

client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))

supabase_extension = Supabase(app)
app.register_blueprint(notes_blueprint, url_prefix='/notes')
app.register_blueprint(auth_blueprint, url_prefix='/auth')
app.register_blueprint(tasks_blueprint, url_prefix='/tasks')
app.register_blueprint(habits_blueprint, url_prefix='/habits')
app.config["JWT_SECRET_KEY"] = 'asdasddasdasd'
app.config['JWT_TOKEN_LOCATION'] = ['headers']
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "https://personal-dashboard-black.vercel.app/"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],

        "expose_headers":["Content-Type", "Authorization", "Access-Control-Allow-Origin"]
    }, 
},
origins=["http://localhost:5173", "https://personal-dashboard-black.vercel.app/"],
methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
expose_headers=["Content-Type", "Authorization", "Access-Control-Allow-Origin"]
)

jwt = JWTManager(app)

if __name__ == '__main__':
    db.init_app(app)
    with app.app_context():
        db.create_all()

    app.run(debug=True, port=5000, host='0.0.0.0')