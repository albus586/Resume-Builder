from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import logging
import base64
import io

app = Flask(__name__)
CORS(app)  # Enable CORS

# Initialize Gemini
genai.configure(api_key="AIzaSyAFCHmz7n8PVvM2fjd3KVd1FBv5kPCIyQk")
model_gemini = genai.GenerativeModel('gemini-2.5-flash-preview-04-17')

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.route('/process', methods=['POST'])
def process_query():
    try:
        logger.debug("Processing new request")
        logger.debug(f"Files received: {request.files}")
        logger.debug(f"Form data: {request.form}")

        if 'image' not in request.files:
            return jsonify({
                'error': 'No image file provided'
            }), 400
        
        image_file = request.files['image']
        query = request.form.get('query', 'Please analyze this image')
        
        # Process image and generate response
        image_data = image_file.read()
        
        # Log the image size for debugging
        logger.debug(f"Image size received: {len(image_data)} bytes")
        
        response = model_gemini.generate_content([
            {"mime_type": image_file.content_type, "data": image_data},
            query.strip()
        ])

        return jsonify({
            'response': response.text,
            'status': 'success'
        })

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
