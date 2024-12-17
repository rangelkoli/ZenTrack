from flask import Blueprint, request, jsonify
import re
import bcrypt
import datetime
from extensions import db
from models import Note

notes_blueprint = Blueprint('notes_blueprint', __name__, url_prefix='/notes')

@notes_blueprint.route('/main/', methods=['POST', 'GET'])
def notes_test():
    response = jsonify({"message": "Finance Blueprint"})
    return response

@notes_blueprint.route('/add_note/', methods=['POST'])
def add_note():
    data = request.json
   
    new_note = Note(
        title=data['title'],
        content=data['content'],
        
        last_updated=datetime.datetime.now()
    )
    db.session.add(new_note)
    db.session.commit()
    return jsonify(new_note.to_dict()), 201

@notes_blueprint.route('/get_notes/', methods=['GET'])
def get_notes():
    notes = Note.query.order_by(Note.last_updated.desc()).all()
    notes = sorted(notes, key=lambda x: x.last_updated, reverse=True)
    print(len(notes))
    return jsonify([note.to_dict() for note in notes])

@notes_blueprint.route('/get_note/<int:id>', methods=['GET'])
def get_note(id):
    note = Note.query.get_or_404(id)
    return jsonify(note.to_dict())

@notes_blueprint.route('/update_note/<int:id>', methods=['PUT', 'POST'])
def update_note(id):
    note = Note.query.get_or_404(id)
    data = request.json
    note.title = data['title']
    note.content = data['content']
    note.last_updated = datetime.datetime.now()
    db.session.commit()
    return jsonify(note.to_dict())

