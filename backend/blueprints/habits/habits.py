from flask import Blueprint, request, jsonify
from db import db
import datetime
import json
from typing import List, Dict
import asyncio
from concurrent.futures import ThreadPoolExecutor

habits_blueprint = Blueprint('habits_blueprint', __name__, url_prefix='/habits')

@habits_blueprint.route('/main/', methods=['POST', 'GET'])
def habits_test():
    response = jsonify({"message": "Habits Blueprint"})
    return response

@habits_blueprint.route('/get_habits/<user_id>', methods=['GET'])
def get_habits(user_id):
    try:
        # Add index on user_id if not exists
        # CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);
        
        # Only select necessary fields and add caching if needed
        habits = db.from_('habits')\
            .select('id, name, days, month, year')\
            .eq('user_id', user_id)\
            .order('created_at')\
            .execute()
        
        return jsonify(habits.data), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@habits_blueprint.route('/get_habits/<user_id>/<month>/<year>', methods=['GET'])
def get_habits_by_month(user_id, month, year):
    try:
        habits = db.from_('habits')\
            .select('id, name, days, month, year')\
            .eq('user_id', user_id)\
            .eq('month', month)\
            .eq('year', year)\
            .order('created_at')\
            .execute()
        
        return jsonify(habits.data), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@habits_blueprint.route('/update_habit/', methods=['POST'])
def update_habit():
    data = request.json
    updated_habits = data['habits']
    
    # Batch update all habits in a single query
    updates = []
    for habit in updated_habits:
        updates.append({
            'id': habit['id'],
            'name': habit['name'],
            'days': habit['days'],
            'updated_at': datetime.datetime.now().isoformat()
        })
    
    if updates:
        try:
            # Use upsert for better performance
            db.from_('habits').upsert(updates).execute()
            return jsonify({"status": "success"}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
    
    return jsonify({"status": "success"}), 200

@habits_blueprint.route('/add_habit/', methods=['POST'])
def add_habit():
    data = request.json
    new_habit = {
        'name': data['name'],
        'days': [0] * 32,  # Initialize with zeros for all days
        'user_id': data['user_id'],
        'month': data['month'],
        'year': data['year'],
        'created_at': datetime.datetime.now().isoformat(),
        'updated_at': datetime.datetime.now().isoformat()
    }
    db.from_('habits').insert([new_habit]).execute()
    return jsonify(new_habit), 201