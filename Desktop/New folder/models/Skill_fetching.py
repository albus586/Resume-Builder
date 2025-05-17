from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
import re
import google.generativeai as genai
import PyPDF2
import pathlib
import os
import json

app = Flask(__name__)
# Update CORS configuration to be more permissive
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configure Gemini AI
genai.configure(api_key="AIzaSyAFCHmz7n8PVvM2fjd3KVd1FBv5kPCIyQk")
model_gemini = genai.GenerativeModel('gemini-2.0-flash')

def clean_json_string(text):
    # Find the first { and last } to extract just the JSON part
    start = text.find('{')
    end = text.rfind('}') + 1
    if start != -1 and end != 0:
        json_str = text[start:end]
        # Remove any markdown formatting that might be present
        json_str = re.sub(r'```json|```', '', json_str)
        return json_str.strip()
    return None
# Paths
CSV_FILE_PATH = 'train.csv'
FAISS_INDEX_PATH = 'faiss_index.bin'
EMBEDDINGS_NPY_PATH = 'embeddings.npy'

# 1. Load CSV (for accessing skills later)
df = pd.read_csv(CSV_FILE_PATH)

# 2. Load FAISS index
index = faiss.read_index(FAISS_INDEX_PATH)

# 3. Load model
model = SentenceTransformer('all-MiniLM-L6-v2')

def split_skills(text):
    """Splits a string of skills into a list of individual skills."""

    # Remove "ex" part
    text = re.sub(r'\bex\b', '', text, flags=re.IGNORECASE)

    # Split based on capital letters and commas
    skills = re.findall(r'[A-Z][a-z]+(?:\s+[a-z]+)*|[A-Z]+', text)

    return skills

@app.route('/get_skills', methods=['POST', 'OPTIONS'])
def get_skills():
    # Handle preflight requests
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({
                "status": "error",
                "message": "No text provided",
                "skills": []
            }), 400
            
        user_input = data['text']
        
        # Encode user input
        query_embedding = model.encode([user_input]).astype('float32')
        
        # Search FAISS index
        k = 1  # Top result
        distances, indices = index.search(query_embedding, k)
        
        # Collect skills from matched rows
        skills_list = []
        for idx in indices[0]:
            if idx < len(df):  # Check if valid index
                skills = df.iloc[idx]['skills']
                skills_list.append(skills)
        
        # Process skills
        result = []
        for skills_text in skills_list:
            individual_skills = split_skills(skills_text)
            result.extend(individual_skills)
        
        return jsonify({
            "status": "success",
            "message": "Skills fetched successfully",
            "input": user_input,
            "skills": result
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "skills": []
        }), 500

RESUME_TEMPLATE = {
    "personal_details": {
        "full_name": "", "username": "", "phone_number": "", "email_address": "",
        "linkedin_profile": "", "github_profile": "",
        "current_location": {"city": "", "state": "", "country": ""}
    },
    "career_objective": "",
    "education": [{
        "degree": "", "university": "", "location": "",
        "start_year": "", "end_year": ""
    }],
    "technical_skills": {
        "programming_languages": [], "frameworks_libraries": [],
        "tools_softwares": [], "cloud_platforms": [], "databases": []
    },
    "work_experience": [{
        "job_title": "", "company_name": "", "location": "",
        "start_date": "", "end_date": "", "responsibilities": []
    }],
    "projects": [{
        "project_title": "", "short_description": "",
        "technologies_used": [], "project_link": ""
    }],
    "certifications_courses": [{
        "course_name": "", "issuing_organization": "",
        "completion_date": ""
    }],
    "research_publications": [{
        "title": "", "published_in": "", "date_of_publication": ""
    }],
    "achievements_awards": [{
        "title": "", "awarding_organization": "", "date": ""
    }]
}

PROMPT_TEMPLATE = """
Analyze the following resume text and extract information into a structured JSON format.
If any field is not found in the text, fill it with "NA".
Use the following rules:
1. Extract all dates in MM/YYYY format
2. Convert all text to proper case
3. For arrays, if no data is found, use empty array []
4. Ensure all string fields have a value (either extracted data or "NA")
5. Format the output exactly like the template below, filling in the values:

{template}

Resume Text:
{text}

Provide only the JSON output, no other text.
"""

@app.route('/get_pdf', methods=['POST'])
def process_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'File must be a PDF'}), 400
    
    try:
        # Save uploaded file temporarily
        temp_path = pathlib.Path('temp.pdf')
        file.save(temp_path)
        
        # Extract text from PDF
        pdf_reader = PyPDF2.PdfReader(temp_path)
        text_content = ""
        for page in pdf_reader.pages:
            text_content += page.extract_text()
        
        # Generate JSON using extracted text
        prompt = PROMPT_TEMPLATE.format(
            template=RESUME_TEMPLATE,
            text=text_content
        )
        response = model_gemini.generate_content(prompt)
        
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        # Clean the response text by removing the markdown code block indicators
        clean_response = response.text.replace('```json\n', '').replace('\n```', '')
        
        return jsonify({
            'status': 'success',
            'resume_data': clean_response
        })
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Invalid file format. Please upload a PDF file.'}), 400
    
    try:
        # Save uploaded file temporarily
        temp_path = pathlib.Path('temp.pdf')
        file.save(temp_path)
        
        # Extract text from PDF
        text_content = ""
        try:
            pdf_reader = PyPDF2.PdfReader(temp_path)
            for page in pdf_reader.pages:
                text_content += page.extract_text()
        except Exception as e:
            return jsonify({'error': f'Error reading PDF: {str(e)}'}), 500
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
        if not text_content.strip():
            return jsonify({'error': 'No text content found in PDF'}), 400

        # Generate prompt for Gemini
        prompt = f"""
        Parse this resume and extract information in the following JSON format. Only return the JSON, no other text:
        {{
            "personalInfo": {{
                "name": "",
                "email": "",
                "phone": "",
                "location": "",
                "linkedin": "",
                "github": ""
            }},
            "education": [
                {{
                    "degree": "",
                    "university": "",
                    "location": "",
                    "startYear": "",
                    "endYear": ""
                }}
            ],
            "workExperience": [
                {{
                    "jobTitle": "",
                    "companyName": "",
                    "location": "",
                    "startDate": "",
                    "endDate": "",
                    "responsibilities": []
                }}
            ],
            "projects": [
                {{
                    "projectTitle": "",
                    "shortDescription": "",
                    "technologiesUsed": []
                }}
            ],
            "skills": {{
                "programmingLanguages": [],
                "frameworks": [],
                "tools": [],
                "databases": []
            }},
            "courses": [
                {{
                    "name": "",
                    "issuer": "",
                    "date": ""
                }}
            ]
        }}

        Resume Text:
        {text_content}
        """

        # Generate response using Gemini
        response = model_gemini.generate_content(prompt)
        response_text = response.text
        
        # Clean and parse the JSON response
        json_str = clean_json_string(response_text)
        if not json_str:
            return jsonify({'error': 'Failed to get valid JSON response from AI'}), 500
            
        try:
            resume_data = json.loads(json_str)
            return jsonify(resume_data)
        except json.JSONDecodeError as e:
            return jsonify({
                'error': f'Failed to parse AI response as JSON: {str(e)}',
                'response': response_text
            }), 500
            
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='127.0.0.1')
