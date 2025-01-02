from flask import Blueprint, request, jsonify
import re

import datetime
from db import db

from ai import genAIModel
from datetime import datetime


notes_blueprint = Blueprint('notes_blueprint', __name__, url_prefix='/notes')

@notes_blueprint.route('/main/', methods=['POST', 'GET'])
def notes_test():
    response = jsonify({"message": "Finance Blueprint"})
    res = genAIModel.generate_content("Explain a random story")
    return jsonify({"message": res})

@notes_blueprint.route('/add_note/', methods=['POST'])
def add_note():
    data = request.json
    new_note = {
        'title': data['title'],
        'note': data['content'],
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat(),
        'user_id': 1
    }
    db.from_('notes').insert(new_note).execute()
    return jsonify(new_note)

@notes_blueprint.route('/get_notes/', methods=['GET'])
def get_notes():
    notes = db.from_('notes').select().execute()
    return jsonify(notes.data)


@notes_blueprint.route('/get_note/<int:id>', methods=['GET'])
def get_note(id):
    note = db.from_('notes').select().eq('id', id).execute()
    return jsonify(note.data)

@notes_blueprint.route('/update_note/<int:id>', methods=['PUT', 'POST'])
def update_note(id):
    data = request.json
    updated_note = {
        'title': data['title'],
        'note': data['content'],
        'updated_at': datetime.now().isoformat()
    }
    db.from_('notes').update(updated_note).eq('id', id).execute()
    return jsonify(updated_note)

