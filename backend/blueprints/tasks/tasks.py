from flask import Blueprint, request, jsonify
from db import db
import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity

tasks_blueprint = Blueprint('tasks_blueprint', __name__, url_prefix='/tasks')

@tasks_blueprint.route('/main/', methods=['POST', 'GET'])
def tasks_test():
    response = jsonify({"message": "Tasks Blueprint"})
    return response


@tasks_blueprint.route('/get_tasks/<user_id>', methods=['GET'])
def get_tasks(user_id):
    tasks = db.from_('tasks').select().eq('user_id', user_id).execute()    
    print(tasks.data)
    return jsonify(tasks.data)


@tasks_blueprint.route('/update_task/', methods=['POST'])
def update_task():
    data = request.json
    updated_task = {
        'task': data['task'],
        'completed': data['completed'],
        'updated_at': datetime.now().isoformat()
    }
    db.from_('tasks').update(updated_task).eq('id', data['id']).execute()
    return jsonify(updated_task)

@tasks_blueprint.route('/create_task', methods=['POST'])
@jwt_required()
def add_task():
    user_id = get_jwt_identity()
    data = request.json
    new_task = {
        'title': data['title'],
        'user_id': user_id,
        'description': data.get('description'),
        'category': data.get('category'),
        'priority': data.get('priority'),
        'completed': False,
        'duedate': data.get('dueDate'),
        'createdat': datetime.datetime.now().isoformat(),
        'updatedat': datetime.datetime.now().isoformat()
    }
    db.from_('tasks').insert(new_task).execute()
    return jsonify(new_task)