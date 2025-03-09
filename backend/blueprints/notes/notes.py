from flask import Blueprint, request, jsonify, Response, stream_with_context
from db import db
from ai import genAIModel
import datetime
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from io import BytesIO
import PIL.Image
import uuid
import json
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin
import tempfile

notes_blueprint = Blueprint('notes_blueprint', __name__, url_prefix='/notes')

@notes_blueprint.route('/main/', methods=['POST', 'GET'])
@cross_origin()
def notes_test():
    response = jsonify({"message": "Finance Blueprint"})
    return jsonify({"message": response})

@notes_blueprint.route('/add_note/', methods=['POST'])
@cross_origin()
@jwt_required()
def add_note():
    user_id = get_jwt_identity()
    data = request.json
    print(data)
    new_note = {
        'title': data['title'],
        'note': data['content'],
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat(),
        'user_id': user_id
    }
    
    # Add folder_id if provided
    if 'folder_id' in data and data['folder_id']:
        new_note['folder_id'] = data['folder_id']
        
    db.from_('notes').insert(new_note).execute()
    return jsonify(new_note)

@notes_blueprint.route('/get_notes/', methods=['GET'])
@cross_origin()
@jwt_required()
def get_notes():
    id = get_jwt_identity()
    print(id)
    notes = db.from_('notes').select('*').eq('user_id', id).execute()
    print(notes.data)
    return jsonify(notes.data)

@notes_blueprint.route('/get_note/<uuid:id>', methods=['GET'])
@cross_origin()
@jwt_required()
def get_note(id):
    user_id = get_jwt_identity()
    print(id)
    note = db.from_('notes').select().eq('id', id).eq('user_id', user_id).execute()
    print(note.data)
    return jsonify(note.data)

@notes_blueprint.route('/update_note/<uuid:id>', methods=['PUT', 'POST'])
@cross_origin()
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

@notes_blueprint.route('/update_title/<uuid:id>', methods=['PUT'])
@cross_origin()
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
@cross_origin()
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
@cross_origin()
def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif','webp'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@notes_blueprint.route('/get_image/<string:filename>', methods=['GET'])
@cross_origin()
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
@cross_origin()
def get_attachments(note_id):
    try:
        attachments = db.from_('notes_attachments').select('*').eq('note_id', note_id).execute()
        return jsonify(attachments.data)
    except Exception as e:
        print(f"Error getting attachments: {str(e)}")
        return jsonify({'error': 'Failed to get attachments'}), 500

@notes_blueprint.route('/<int:note_id>/attachments', methods=['POST'])
@cross_origin()
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
@cross_origin()
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
@cross_origin()
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
            'error':  'Could not process AI response',
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

@notes_blueprint.route('/format_latex/', methods=['POST'])
@cross_origin()
def format_latex():
    data = request.json
    latex_content = data.get('equation', '')
    
    if not latex_content:
        return jsonify({'error': 'No LaTeX content provided'}), 400
        
    try:
        # Format the LaTeX content
        formatted_latex = format_latex_content(latex_content)
        
        return jsonify({
            'formatted': formatted_latex,
            'message': 'LaTeX formatted successfully'
        })
        
    except Exception as e:
        print(f"Error formatting LaTeX: {str(e)}")
        return jsonify({
            'error': 'Failed to format LaTeX',
            'details': str(e)
        }), 500

@notes_blueprint.route('/format_latex_with_ai/', methods=['POST'])
@cross_origin()
def format_latex_with_ai():
    data = request.json
    latex_content = data.get('equation', '')
    
    if not latex_content:
        return jsonify({'error': 'No LaTeX content provided'}), 400
        
    try:
        prompt = f"""
        You are LaTeX formatting expert. Format and improve this LaTeX equation:
        {latex_content}

        Requirements:
        1. Output ONLY the formatted LaTeX code without explanations
        2. Ensure proper equation environments ($$ or \\begin{{equation}}, etc.)
        3. Add proper spacing around operators and relations
        4. Format fractions correctly with \\frac
        5. Format summations and integrals with proper limits
        6. Use proper mathematical notation and symbols
        7. Fix common LaTeX syntax mistakes
        8. Handle multi-line equations appropriately
        9. Format matrices and arrays properly
        10. Use proper subscripts and superscripts
        11. Replace text-based symbols with LaTeX commands
        12. Add proper delimiting brackets when needed
        13. Handle special functions correctly (sin, cos, log, etc.)
        14. Format Greek letters properly
        15. Handle limits, derivatives, and integrals professionally

        Common fixes to apply:
        - Replace 'x*y' with 'x \\cdot y' or 'xy'
        - Replace '2x' with '2\\cdot x' when needed
        - Use \\left( and \\right) for dynamic sizing
        - Use \\cdots for ellipsis
        - Format binomials with \\binom
        - Use proper spacing \\, \\: \\; \\quad \\qquad
        - Replace 'inf' with '\\infty'
        - Add \\limits when appropriate
        - Use \\displaystyle for better fraction display
        - Format piecewise functions with cases environment

        Examples:
        Input: "sum_(i=1)^n x_i"
        Output: "$$\\sum_{{i=1}}^{{n}} x_{{i}}$$"

        Input: "int_a^b f(x)dx"
        Output: "$$\\int_{{a}}^{{b}} f(x)\\,dx$$"

        Input: "f'(x) = lim_(h->0) (f(x+h)-f(x))/h"
        Output: "$$f'(x) = \\lim_{{h \\to 0}} \\frac{{f(x+h)-f(x)}}{{h}}$$"

        Format the given LaTeX equation to be perfectly formatted:
        """
        
        response = genAIModel.generate_content(prompt)
        formatted_latex = response.text.strip()
        print(formatted_latex)
        formatted_latex = (formatted_latex
                    .replace('```latex', '')
                    .replace('```', '')
                    )
        # Apply additional formatting for common edge cases
        # formatted_latex = format_latex_content(formatted_latex)
        
        # # Final cleanup pass
        # formatted_latex = cleanup_latex(formatted_latex)
        
        return jsonify({
            'formatted': formatted_latex,
            'message': 'LaTeX formatted successfully with AI'
        })
        
    except Exception as e:
        print(f"Error formatting LaTeX with AI: {str(e)}")
        return jsonify({
            'error': 'Failed to format LaTeX with AI',
            'details': str(e)
        }), 500

def cleanup_latex(latex: str) -> str:
    """Additional cleanup for LaTeX code after AI formatting"""
    
    # Remove any extra whitespace
    latex = ' '.join(latex.split())
    
    # Ensure proper equation environment
    if not any(env in latex for env in ['$$', r'\begin{equation}', r'\begin{align']):
        latex = f'$${latex}$$'
    
    # Fix spacing around operators
    operators = ['+', '-', '=', r'\times', r'\cdot', r'\div', r'\pm', r'\mp']
    for op in operators:
        latex = latex.replace(f' {op} ', f' {op} ')
    
    # Fix missing multiplication dots
    import re
    latex = re.sub(r'(\d)([a-zA-Z])', r'\1\cdot \2', latex)
    
    # Fix spacing in subscripts and superscripts
    latex = re.sub(r'_(\w)', r'_{\\!\\!\1}', latex)
    latex = re.sub(r'\^(\w)', r'^{\\!\\!\1}', latex)
    
    # Add proper sizing for parentheses
    latex = re.sub(r'\((.*?)\)', lambda m: r'\left(' + m.group(1) + r'\right)', latex)
    
    # Fix spacing in integrals
    latex = latex.replace(r'\int', r'\int\!')
    latex = latex.replace('dx', r'\,dx')
    
    # Ensure proper fraction spacing
    latex = latex.replace(r'\frac', r'\displaystyle\frac')
    
    # Fix limits in sums and integrals
    latex = latex.replace(r'\sum_', r'\sum\limits_')
    latex = latex.replace(r'\prod_', r'\prod\limits_')
    latex = latex.replace(r'\int_', r'\int\limits_')
    
    return latex

def format_latex_content(content: str) -> str:
    """
    Format LaTeX content for proper rendering.
    
    Rules:
    1. Ensure proper equation environment
    2. Fix common syntax issues
    3. Add proper spacing
    4. Handle multi-line equations
    """
    # Remove extra whitespace and normalize line endings
    content = content.strip()
    
    # Handle common LaTeX formatting issues
    replacements = {
        # Fix spacing around operators
        '+': ' + ',
        '-': ' - ',
        '=': ' = ',
        
        # Fix fraction formatting
        'frac': '\\frac',
        
        # Fix sum/integral formatting
        'sum': '\\sum',
        'int': '\\int',
        
        # Fix subscript/superscript spacing
        '_': '_{',
        '^': '^{',
        
        # Fix common function names
        'sin': '\\sin',
        'cos': '\\cos',
        'tan': '\\tan',
        'log': '\\log',
        'ln': '\\ln',
        'lim': '\\lim',
        
        # Fix matrix environments
        'matrix': '\\matrix',
        'pmatrix': '\\pmatrix',
        'bmatrix': '\\bmatrix',
        
        # Fix Greek letters
        'alpha': '\\alpha',
        'beta': '\\beta',
        'gamma': '\\gamma',
        'delta': '\\delta',
        'theta': '\\theta',
        'pi': '\\pi',
        'sigma': '\\sigma',
        'omega': '\\omega',
        
        # Fix arrows and symbols
        '->': '\\rightarrow',
        '<-': '\\leftarrow',
        '<=': '\\leq',
        '>=': '\\geq',
        '!=': '\\neq',
        'inf': '\\infty',
    }
    
    # Apply replacements while preserving existing correct formatting
    formatted = content
    for old, new in replacements.items():
        if old not in ['_', '^']:  # Skip subscript/superscript for now
            # Only replace if not already in LaTeX format
            if not formatted.find(new) >= 0:
                formatted = formatted.replace(old, new)
    
    # Handle equation environments
    if not formatted.startswith('\\begin{equation}') and not formatted.startswith('$$'):
        # Check if it's a single-line equation
        if '\n' not in formatted:
            formatted = f'$${formatted}$$'
        else:
            # Multi-line equation
            formatted = '\\begin{align*}\n' + formatted + '\n\\end{align*}'
    
    # Handle subscripts and superscripts
    lines = formatted.split('\n')
    for i, line in enumerate(lines):
        # Find subscripts/superscripts without braces and add them
        for char in ['_', '^']:
            parts = line.split(char)
            for j in range(1, len(parts)):
                if parts[j] and parts[j][0] != '{':
                    # Add braces around single character or number
                    first_char = parts[j][0]
                    parts[j] = '{' + first_char + '}' + parts[j][1:]
            lines[i] = char.join(parts)
    
    formatted = '\n'.join(lines)
    
    # Ensure proper spacing around delimiters
    delimiters = ['\\left', '\\right', '\\big', '\\Big']
    for delimiter in delimiters:
        formatted = formatted.replace(delimiter, f' {delimiter} ')
    
    # Clean up multiple spaces
    formatted = ' '.join(formatted.split())
    
    # Handle special cases for matrices
    if '\\begin{matrix}' in formatted:
        formatted = formatted.replace('&', ' & ')
        formatted = formatted.replace('\\\\', '\\\\\n')
    
    # Restore proper line breaks for multi-line equations
    formatted = formatted.replace('\\\\', '\\\\\n')
    
    # Fix common mistakes with parentheses
    formatted = formatted.replace('( ', '(').replace(' )', ')')
    
    return formatted

# Folder related endpoints
@notes_blueprint.route('/folders/', methods=['GET'])
@cross_origin()
@jwt_required()
def get_folders():
    user_id = get_jwt_identity()
    folders = db.from_('note_folders').select('*').eq('user_id', user_id).execute()
    return jsonify(folders.data)

@notes_blueprint.route('/folders/', methods=['POST'])
@cross_origin()
@jwt_required()
def create_folder():
    user_id = get_jwt_identity()
    data = request.json
    
    new_folder = {
        'name': data['name'],
        'user_id': user_id,
        'created_at': datetime.now().isoformat(),
    }
    
    # Add color if provided
    if 'color' in data:
        new_folder['color'] = data['color']
        
    result = db.from_('note_folders').insert(new_folder).execute()
    
    # Get the created folder with ID
    if result.data:
        folder_id = result.data[0]['id']
        folder = db.from_('note_folders').select('*').eq('id', folder_id).single().execute()
        return jsonify(folder.data)
    
    return jsonify(new_folder)

@notes_blueprint.route('/folders/<uuid:folder_id>', methods=['PUT'])
@cross_origin()
@jwt_required()
def update_folder(folder_id):
    user_id = get_jwt_identity()
    data = request.json
    
    # First check if the folder belongs to the user
    folder = db.from_('note_folders').select('*').eq('id', folder_id).eq('user_id', user_id).single().execute()
    
    if not folder.data:
        return jsonify({'error': 'Folder not found or access denied'}), 404
    
    updates = {}
    if 'name' in data:
        updates['name'] = data['name']
    if 'color' in data:
        updates['color'] = data['color']
        
    if updates:
        updates['updated_at'] = datetime.now().isoformat()
        db.from_('note_folders').update(updates).eq('id', folder_id).execute()
        
    # Get updated folder
    updated_folder = db.from_('note_folders').select('*').eq('id', folder_id).single().execute()
    return jsonify(updated_folder.data)

@notes_blueprint.route('/folders/<uuid:folder_id>', methods=['DELETE'])
@cross_origin()
@jwt_required()
def delete_folder(folder_id):
    user_id = get_jwt_identity()
    
    # First check if the folder belongs to the user
    folder = db.from_('note_folders').select('*').eq('id', folder_id).eq('user_id', user_id).single().execute()
    
    if not folder.data:
        return jsonify({'error': 'Folder not found or access denied'}), 404
    
    # Delete the folder
    db.from_('note_folders').delete().eq('id', folder_id).execute()
    
    # Update notes that were in this folder (set folder_id to null)
    db.from_('notes').update({'folder_id': None}).eq('folder_id', folder_id).execute()
    
    return jsonify({'message': 'Folder deleted successfully'})

@notes_blueprint.route('/notes/<uuid:note_id>/move', methods=['PUT'])
@cross_origin()
@jwt_required()
def move_note(note_id):
    user_id = get_jwt_identity()
    data = request.json
    folder_id = data.get('folder_id')
    
    # First check if the note belongs to the user
    note = db.from_('notes').select('*').eq('id', note_id).eq('user_id', user_id).single().execute()
    
    if not note.data:
        return jsonify({'error': 'Note not found or access denied'}), 404
    
    # If folder_id is provided, check if it exists
    if folder_id:
        folder = db.from_('note_folders').select('*').eq('id', folder_id).eq('user_id', user_id).single().execute()
        
        if not folder.data:
            return jsonify({'error': 'Folder not found or access denied'}), 404
    
    # Update the note's folder
    update_data = {
        'folder_id': folder_id,
        'updated_at': datetime.now().isoformat()
    }
    
    db.from_('notes').update(update_data).eq('id', note_id).execute()
    
    # Get updated note
    updated_note = db.from_('notes').select('*').eq('id', note_id).single().execute()
    return jsonify(updated_note.data)

@notes_blueprint.route('/delete_note/<uuid:note_id>', methods=['DELETE'])
@cross_origin()
@jwt_required()
def delete_note(note_id):
    user_id = get_jwt_identity()
    
    # First check if the note belongs to the user
    note = db.from_('notes').select('*').eq('id', note_id).eq('user_id', user_id).single().execute()
    
    if not note.data:
        return jsonify({'error': 'Note not found or access denied'}), 404
    
    # Delete the note
    db.from_('notes').delete().eq('id', note_id).execute()
    
    return jsonify({'message': 'Note deleted successfully'})