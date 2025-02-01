from flask import Blueprint, request, jsonify

import datetime
from db import db
from ai import genAIModel
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from io import BytesIO
import PIL.Image

notes_blueprint = Blueprint('notes_blueprint', __name__, url_prefix='/notes')

@notes_blueprint.route('/main/', methods=['POST', 'GET'])
def notes_test():
    response = jsonify({"message": "Finance Blueprint"})
    res = genAIModel.generate_content("Explain a random story")
    return jsonify({"message": res})

@notes_blueprint.route('/add_note/', methods=['POST'])
def add_note():
    data = request.json
    print(data)
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
    print(data)
    updated_note = {
        'title': data['title'],
        'note': data['content'],
        'updated_at': datetime.now().isoformat()
    }
    db.from_('notes').update(updated_note).eq('id', id).execute()

    return jsonify(updated_note)

@notes_blueprint.route('/upload_image/', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    print(file)
    file_blob = BytesIO(file.read())
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        # Save the file to a temporary location
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, secure_filename(file.filename))
        file.save(temp_path)
        file.save("./temp.png")
        try:
            # Upload the file to the storage bucket
            response = db.storage.from_("cover_images").upload(
                file=temp_path,
                path=secure_filename(file.filename),
                file_options={"cache-control": "3600", 
                              "upsert": "false", 
                              "content-type": file.content_type
                              }
            )

            # Remove the temporary file
            os.remove(temp_path)
            print(response)

            return jsonify(response.text), 200
        except db.storage.utils.StorageException as e:
            return jsonify({"error": "Error"}), 400
    else:
        return jsonify({"error": "Unsupported file type"}), 400

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif','webp'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@notes_blueprint.route('/get_image/<string:filename>', methods=['GET'])
def get_image(filename):
    response = db.storage.from_("cover_images").list(path=filename).execute()
    return response.text, 200, {'Content-Type': response.headers['content-type']}


@notes_blueprint.route('/upload_file/', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    print(file)
    # Open the image file
    image_contents = file.read()

    # Open the image
    image = PIL.Image.open(BytesIO(image_contents))

    # Display the image in a new window
    image.show()

    file_blob = BytesIO(file.read())
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        # Save the file in the same folder
        file.save(secure_filename(file.filename))




        try:
            # Upload the file to the storage bucket
            response = db.storage.from_("attachments").upload(
                file=secure_filename(file.filename),
                path=secure_filename(file.filename),
                file_options={"cache-control": "3600", 
                              "upsert": "true", 
                              "content-type": file.content_type
                              }
            )

            # Remove the temporary file
            os.remove(secure_filename(file.filename))

            print(response)

            return jsonify(response.text), 200
        except db.storage.utils.StorageException as e:
            return jsonify({"error": "Error"}), 400
    else:
        return jsonify({"error": "Unsupported file type"}), 400