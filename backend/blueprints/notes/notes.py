from flask import Blueprint, request, jsonify, Response, stream_with_context

import datetime
from db import db
from ai import genAIModel
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from io import BytesIO
import PIL.Image
import uuid
import json

notes_blueprint = Blueprint('notes_blueprint', __name__, url_prefix='/notes')

@notes_blueprint.route('/main/', methods=['POST', 'GET'])
def notes_test():
    response = jsonify({"message": "Finance Blueprint"})
    return jsonify({"message": response})

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

@notes_blueprint.route('/update_title/<int:id>', methods=['PUT'])
def update_title(id):
    data = request.json
    title = data.get('title', '')
    
    try:
        updated_note = {
            'title': title,
            'updated_at': datetime.now().isoformat()
        }
        db.from_('notes').update(updated_note).eq('id', id).execute()
        return jsonify({'message': 'Title updated successfully', 'title': title})
    except Exception as e:
        print(f"Error updating title: {str(e)}")
        return jsonify({'error': 'Failed to update title'}), 500

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

@notes_blueprint.route('/<int:note_id>/attachments', methods=['GET'])
def get_attachments(note_id):
    try:
        attachments = db.from_('notes_attachments').select('*').eq('note_id', note_id).execute()
        return jsonify(attachments.data)
    except Exception as e:
        print(f"Error getting attachments: {str(e)}")
        return jsonify({'error': 'Failed to get attachments'}), 500

@notes_blueprint.route('/<int:note_id>/attachments', methods=['POST'])
async def add_attachment(note_id):
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # Read file content and get size
        file_content = file.read()
        file_size = len(file_content)
        # Generate path
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}-{filename}"
        file_path = f"{note_id}/{unique_filename}"

        # Upload directly to Supabase using bytes
        storage_response =  db.storage.from_("attachments").upload(
            file=file_content,
            path=file_path,
            file_options={
                "cache-control": "3600",
                "upsert": "false",
                "content-type": file.content_type
            }
        )

        # Get public URL
        file_url = db.storage.from_('attachments').get_public_url(file_path)
        print(file_url)
        # Create attachment record
        attachment = {
            'note_id': note_id,
            'filename': filename,
            'file_path': file_path,
            'url': file_url,
            'size': file_size,
            'content_type': file.content_type,
            'created_at': datetime.now().isoformat()
        }
        print(attachment)
        
        # Insert into database
        result = db.from_('notes_attachments').insert(attachment).execute()  
        print(result)
        return jsonify({
            'message': 'File uploaded successfully',
            'attachment': attachment
        })

    except Exception as e:
        print(f"Error uploading attachment: {str(e)}")
        return jsonify({'error': str(e)}), 500

@notes_blueprint.route('/<int:note_id>/attachments/<uuid:attachment_id>', methods=['DELETE'])
def delete_attachment(note_id, attachment_id):
    try:
        # Get attachment info
        attachment = db.from_('notes_attachments').select('*').eq('id', str(attachment_id)).single().execute()
        
        if not attachment.data:
            return jsonify({'error': 'Attachment not found'}), 404

        # Delete from storage
        db.storage.from_("attachments").remove(attachment.data['file_path'])
        
        # Delete from database
        db.from_('note_attachments').delete().eq('id', str(attachment_id)).execute()
        
        return jsonify({'message': 'Attachment deleted successfully'})

    except Exception as e:
        print(f"Error deleting attachment: {str(e)}")
        return jsonify({'error': 'Failed to delete attachment'}), 500

@notes_blueprint.route('/format_with_ai/', methods=['POST'])
def format_with_ai():
    data = request.json
    blocks = data.get('blocks', [])
    
    def generate():
        prompt = """
        You are a helpful assistant which formats and styles the text content of a note editor. The editor content is provided as an array of block objects. You will format and style the text content of each block while keeping all other properties unchanged.

        **Schema:**

        The BlockNote editor content schema consists of an array of block objects. Each block has a `type`, `props`, `content`, and `children` property.

        **Available Block Types:**

        *   `paragraph`: A standard text paragraph. `content` is an array of InlineContent.
            *   `props`:
                *   `textColor`: (string, optional, default: "default") Color of the text.
                *   `backgroundColor`: (string, optional, default: "default") Background color of the block.
                *   `textAlignment`: (string, optional, default: "left") Alignment of the text ("left", "center", "right", "justify").
        *   `heading`: A heading or title block.  `content` is an array of InlineContent.
            *   `props`:
                *   `textColor`: (string, optional, default: "default") Color of the text.
                *   `backgroundColor`: (string, optional, default: "default") Background color of the block.
                *   `textAlignment`: (string, optional, default: "left") Alignment of the text ("left", "center", "right").
                *   `level`: (number, optional, default: 1) Heading level (1, 2, 3).
        *   `bulletListItem`: An item in an unordered list.  `content` is an array of InlineContent.
            *   `props`:
                *   `textColor`: (string, optional, default: "default") Color of the text.
                *   `backgroundColor`: (string, optional, default: "default") Background color of the block.
                *   `textAlignment`: (string, optional, default: "left") Alignment of the text ("left", "center", "right").
        *   `numberedListItem`: An item in an ordered list. `content` is an array of InlineContent.
            *   `props`:
                *   `textColor`: (string, optional, default: "default") Color of the text.
                *   `backgroundColor`: (string, optional, default: "default") Background color of the block.
                *   `textAlignment`: (string, optional, default: "left") Alignment of the text ("left", "center", "right").
        *	`checkListItem`: An item in the check list. `content` is an array of InlineContent.
            *   `props`:
                *   `textColor`: (string, optional, default: "default") Color of the text.
                *   `backgroundColor`: (string, optional, default: "default") Background color of the block.
                *   `textAlignment`: (string, optional, default: "left") Alignment of the text ("left", "center", "right").
        *   `codeBlock`: To display the code with select box option for the code. `content` is a string
            *   `props`:
                *   `textColor`: (string, optional, default: "default") Color of the text.
                *   `backgroundColor`: (string, optional, default: "default") Background color of the block.
                *   `textAlignment`: (string, optional, default: "left") Alignment of the text ("left", "center", "right").
                *   `language`: (string, optional, default: "text") type of the language
        *   `table`: To display the grid cells
            *   `props`:
                *   `textColor`: (string, optional, default: "default") Color of the text.
                *   `backgroundColor`: (string, optional, default: "default") Background color of the block.
                *   `textAlignment`: (string, optional, default: "left") Alignment of the text ("left", "center", "right").
        *   `file`: To add files
            *   `props`:
                *   `textColor`: (string, optional, default: "default") Color of the text.
                *   `backgroundColor`: (string, optional, default: "default") Background color of the block.
                *   `textAlignment`: (string, optional, default: "left") Alignment of the text ("left", "center", "right").
        *   `image`: To add image from the URL
            *   `props`:
                *   `textColor`: (string, optional, default: "default") Color of the text.
                *   `backgroundColor`: (string, optional, default: "default") Background color of the block.
                *   `textAlignment`: (string, optional, default: "left") Alignment of the text ("left", "center", "right").
                *    `url`: (string) URL of the image.
                *    `caption`: (string) Image caption text.
                *    `previewWidth`: (number, optional, default: 512) Width for preview display.
        *   `video`: To add video from the URL
            *   `props`:
                *   `textColor`: (string, optional, default: "default") Color of the text.
                *   `backgroundColor`: (string, optional, default: "default") Background color of the block.
                *   `textAlignment`: (string, optional, default: "left") Alignment of the text ("left", "center", "right").
                *    `url`: (string) URL of the video.
                *    `caption`: (string) Video caption text.
        *   `audio`: To add audio from the URL
            *   `props`:
                *   `textColor`: (string, optional, default: "default") Color of the text.
                *   `backgroundColor`: (string, optional, default: "default") Background color of the block.
                *   `textAlignment`: (string, optional, default: "left") Alignment of the text ("left", "center", "right").
                *    `url`: (string) URL of the audio.
                *    `caption`: (string) Audio caption text.

        **Available Inline Content Types:**

        *   `text`: Styled text fragments.
            *   `type`: "text"
            *   `text`: (string) The text content.
            *   `styles`: (object)  Formatting styles:
                *   `bold`: (boolean, optional)
                *   `italic`: (boolean, optional)
                *   `underline`: (boolean, optional)
                *   `textColor`: (string, optional)
                *   `backgroundColor`: (string, optional)
        *   `link`: A hyperlink.
            *   `type`: "link"
            *   `content`: (array of StyledText) Text to be displayed as the link.
            *   `href`: (string) The URL the link points to.

        Output Example:
[{"id":"3fc7af18-dfb4-4b21-8530-0866adaa4f24","type":"heading","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"Lean just beyond your edge","styles":{}}],"children":[]},{"id":"9f4632df-1cb9-451d-89bb-1d2d4ac4b7fe","type":"bulletListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Fear of Fear may lead you to hang back, living a lesser life than you are capable of.","styles":{}}],"children":[]},{"id":"97c88959-c570-409c-b999-cfea835cff0a","type":"bulletListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"By leaning just over the edge, you ","styles":{}},{"type":"text","text":"challenge your limits compassionately","styles":{"textColor":"orange"}},{"type":"text","text":" without trying to escape the feeling of fear itself","styles":{}}],"children":[]},{"id":"364a0f14-e2ca-4a30-8fa0-5dcd091e7101","type":"bulletListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Own your fears and lean just beyond it, in every aspect of your life, starting now. ","styles":{}}],"children":[]}] 

        Format and enhance the following blocks while maintaining the exact JSON structure.
        You must:
        1. Keep the id the same, but change the props, and styles to enhance the styling
        2. Only output a valid JSON array
        3. Do not include any explanation text or markdown formatting
        4. Ensure the response starts with '[' and ends with ']'
        5. Keep the same block types but enhance their styling
        6. Ensure to use only the available block types and inline content types
        7. Ensure to use only the available props and styles
        8. Ensure to use only the available colors
        9. Ensure to use only the available text alignments
        10. Ensure to use only the available heading levels
        11. Ensure to use only the available list item types
        12. Ensure to use only the available code block languages
        13. Can partially format the text content of each block like bold, italic, underline, strikethrough, textColor, backgroundColor
        Example of partially formatting the text content of each block:
        Input:
        {"id":"3d6e6637-cb29-4a18-af81-4b93b6aa2366","type":"heading","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"Don't get lost in the Tasks and Duties","styles":{}}],"children":[]},{"id":"936d64c8-d5b6-407e-bccd-0fcfb5ff77bd","type":"bulletListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Whatever the specifics of a man's purpose, he must always refresh the transcendental element of his life through regular meditation and retreat","styles":{}}],"children":[]},{"id":"e4979aec-6597-4222-80ce-9e9180dd7aae","type":"bulletListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Tasks are important, but no amount of duties adds up to love, freedom, or full consciousness. You cannot do enough, nor can you do the right things, so that you will finally feel complete","styles":{}}],"children":[]}
        Can be formatted to:
        {"id":"3d6e6637-cb29-4a18-af81-4b93b6aa2366","type":"heading","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left","level":2},"content":[{"type":"text","text":"Don't get lost in the Tasks and Duties","styles":{}}],"children":[]},{"id":"936d64c8-d5b6-407e-bccd-0fcfb5ff77bd","type":"bulletListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Whatever the specifics of a man's purpose, he must always ","styles":{}},{"type":"text","text":"refresh the transcendental element","styles":{"textColor":"orange"}},{"type":"text","text":" of his life through regular meditation and retreat","styles":{}}],"children":[]},{"id":"e4979aec-6597-4222-80ce-9e9180dd7aae","type":"bulletListItem","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[{"type":"text","text":"Tasks are important, but no amount of duties adds up to ","styles":{}},{"type":"text","text":"love, freedom, or full consciousness","styles":{"textColor":"orange"}},{"type":"text","text":". ","styles":{}},{"type":"text","text":"You cannot do enough, nor can you do the right things","styles":{"textColor":"blue"}},{"type":"text","text":", so that you will finally feel complete","styles":{}}],"children":[]},{"id":"b5de8706-307c-4313-afcb-40351ff22de5","type":"paragraph","props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},"content":[],"children":[]}

        Blocks to format and enhance:
        
        """ + str(blocks)
        
        response = genAIModel.generate_content(prompt, stream=True)
        accumulated_text = ""
        
        for chunk in response:
            accumulated_text += chunk.text
            print(accumulated_text)
            try:
                # Clean up the response text - remove markdown formatting
                cleaned_text = (accumulated_text
                    .replace('```json', '')
                    .replace('```', '')
                    .strip())
                
                if cleaned_text.startswith('[') and cleaned_text.endswith(']'):
                    try:
                        formatted_blocks = json.loads(cleaned_text)
                        
                        # Validate block structure
                        if (isinstance(formatted_blocks, list) and 
                            all(isinstance(block, dict) and 
                                all(key in block for key in ['id', 'type', 'props', 'content'])
                                for block in formatted_blocks)):
                            
                            # Update block IDs
                            for block in formatted_blocks:
                                block_content = ''.join(
                                    item['text'] for item in block.get('content', [])
                                    if isinstance(item, dict) and 'text' in item
                                )
                                block['id'] = str(uuid.uuid4())
                            
                            print("Valid formatted blocks found")
                            yield f"data: {json.dumps({'formatted_blocks': formatted_blocks})}\n\n"
                            return
                            
                    except json.JSONDecodeError as e:
                        print(f"JSON parsing error: {e}")
                        continue
                        
            except Exception as e:
                print(f"Processing error: {str(e)}")
                continue

        # If we get here, send error
        error_msg = {
            'error': 'Could not process AI response',
            'debug': accumulated_text[:200]  # First 200 chars for debugging
        }
        yield f"data: {json.dumps(error_msg)}\n\n"

    response = Response(
        stream_with_context(generate()),
        mimetype='text/event-stream'
    )
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Cache-Control', 'no-cache')
    response.headers.add('Content-Type', 'text/event-stream')
    
    return response