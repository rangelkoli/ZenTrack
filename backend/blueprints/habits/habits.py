from flask import Blueprint, request, jsonify
from db import db
import datetime

habits_blueprint = Blueprint('habits_blueprint', __name__, url_prefix='/habits')

@habits_blueprint.route('/main/', methods=['POST', 'GET'])
def habits_test():
    response = jsonify({"message": "Habits Blueprint"})
    return response

@habits_blueprint.route('/get_habits/<user_id>', methods=['GET'])
def get_habits(user_id):
    habits = db.from_('habits').select().eq('user_id', user_id).execute()    
    return jsonify(habits.data)

@habits_blueprint.route('/update_habit/', methods=['POST'])
def update_habit():
    data = request.json
    updated_habits = data['habits']
    print(updated_habits)
    for habit in updated_habits:
        updated_habit = {
            'name': habit['name'],
            'days': habit['days'],
            'updated_at': datetime.datetime.now().isoformat()
        }
        db.from_('habits').update(updated_habit).eq('id', habit['id']).execute()

    return jsonify(updated_habit), 200


