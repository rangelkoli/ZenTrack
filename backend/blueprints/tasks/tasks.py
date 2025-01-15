from flask import Blueprint, request, jsonify
from db import db
import datetime

tasks_blueprint = Blueprint('tasks_blueprint', __name__, url_prefix='/tasks')

@tasks_blueprint.route('/main/', methods=['POST', 'GET'])
def tasks_test():
    response = jsonify({"message": "Tasks Blueprint"})
    return response


@tasks_blueprint.route('/get_tasks/<user_id>', methods=['GET'])
def get_tasks(user_id):
    tasks = db.from_('tasks').select().eq('user_id', user_id).execute()    
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