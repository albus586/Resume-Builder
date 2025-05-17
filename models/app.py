from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import base64
import json
import PyPDF2
import pathlib
import google.generativeai as genai
from groq import Groq
from convert_latex import generate_latex_file, convert_tex_to_pdf
from Skill_fetching import clean_json_string
from prompt_templates import ATS_PROMPT_TEMPLATE

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Gemini
gemini_api_key = os.environ['GEMINI_API_KEY']
genai.configure(api_key=gemini_api_key)
model_gemini = genai.GenerativeModel('gemini-2.5-flash-preview-04-17')

# Initialize Groq client
groq_api_key = os.environ['GROQ_API_KEY']
groq_client = Groq(api_key=groq_api_key)

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

        # Generate structured resume data using Gemini
        prompt = f"""
        Parse this resume and extract information in the following JSON format. Only return the JSON, no other text:
        {{
            "courses": [],
            "education": [
                {{
                    "degree": "",
                    "university": "",
                    "location": "",
                    "startYear": "",
                    "endYear": ""
                }}
            ],
            "personalInfo": {{
                "name": "",
                "email": "",
                "phone": "",
                "location": "",
                "linkedin": "",
                "github": ""
            }},
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
            "workExperience": [
                {{
                    "jobTitle": "",
                    "companyName": "",
                    "location": "",
                    "startDate": "",
                    "endDate": "",
                    "responsibilities": []
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

@app.route('/generate_resume', methods=['POST'])
def generate_resume():
    try:
        # Get data from request
        data = request.get_json()
        # Remove profilePhoto from profile if it exists
        if 'profile' in data and 'profilePhoto' in data['profile']:
            del data['profile']['profilePhoto']
        # # print("Received data:", data)  # Debugging line
        # if 'profile' in data:
        #     print("Profile keys:", list(data['profile'].keys()))

        # Extract job details, profile, and resume information
        job_details = data.get('jobDetails')
        profile = data.get('profile')
        resume = data.get('resume')
        
        # Validate required data
        if not job_details:
            return jsonify({"error": "Job details are required"}), 400
        
        # Generate LaTeX code
        latex_code = generate_latex_file(job_description=job_details, profile=profile, resume=resume)
        
        # Save LaTeX to file
        tex_file_path = "my_resume.tex"
        with open(tex_file_path, "w") as f:
            f.write(latex_code)
        
        # Convert to PDF
        if convert_tex_to_pdf(tex_file_path):
            # Read the generated PDF
            pdf_path = tex_file_path.replace('.tex', '.pdf')
            with open(pdf_path, 'rb') as pdf_file:
                pdf_data = base64.b64encode(pdf_file.read()).decode('utf-8')
            
            # Return both PDF and LaTeX code
            return jsonify({
                "pdf": pdf_data,
                "latex_code": latex_code
            })
        else:
            return jsonify({"error": "Failed to generate PDF"}), 500
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/process', methods=['POST'])
def process_query():
    try:
        if 'image' not in request.files:
            return jsonify({
                'error': 'No image file provided'
            }), 400
        
        image_file = request.files['image']
        query = request.form.get('query', 'Please analyze this image')
        
        # Process image and generate response
        image_data = image_file.read()
        
        response = model_gemini.generate_content([
            {"mime_type": image_file.content_type, "data": image_data},
            query.strip()
        ])

        return jsonify({
            'response': response.text,
            'status': 'success'
        })

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

def preprocess_latex_code(latex_code: str) -> str:
    """Clean and validate LaTeX code before compilation."""
    try:
        # Remove backticks and latex markers that might come from the AI
        latex_code = latex_code.replace('```latex', '').replace('```', '').strip()
        
        # Basic validation checks
        if not latex_code.startswith('\\documentclass'):
            return None
            
        if '\\begin{document}' not in latex_code or '\\end{document}' not in latex_code:
            return None
            
        # Fix common LaTeX issues
        latex_code = latex_code.replace('``', '"').replace("''", '"')
        latex_code = latex_code.replace('...', '\\ldots')
        
        # Ensure proper line endings
        latex_code = latex_code.replace('\r\n', '\n')
        
        return latex_code
    except Exception as e:
        return None

@app.route('/modify-resume', methods=['POST'])
def modify_resume():
    try:
        data = request.get_json()
        query = data.get('query')
        latex_code = data.get('latexCode')
        
        if not query or not latex_code:
            return jsonify({
                'error': 'Query and LaTeX code are required',
                'status': 'error'
            }), 400

        # Create prompt for Gemini with specific LaTeX requirements
        prompt = f"""
        As a LaTeX expert, modify this resume according to: "{query}"
        
        Requirements:
        1. Preserve all document structure and package imports
        2. Keep all existing formatting commands and environments
        3. Maintain document class and style definitions
        4. Only modify content as requested, not the structure
        5. Ensure all environments are properly closed
        6. Return complete, compilable LaTeX code
        7. Keep all necessary package imports
        8. Preserve any custom commands or definitions
        
        Original LaTeX code:
        {latex_code}
        """

        # Generate modified LaTeX using Gemini
        response = model_gemini.generate_content(prompt)
        modified_latex = response.text.strip()
        
        # Preprocess and validate LaTeX code
        processed_latex = preprocess_latex_code(modified_latex)
        if not processed_latex:
            raise Exception("Generated LaTeX code is invalid or incomplete")
        
        # Create a temporary directory for compilation
        import tempfile
        import shutil
        
        temp_dir = tempfile.mkdtemp()
        temp_tex_path = os.path.join(temp_dir, "temp_modified.tex")
        
        try:
            # Save LaTeX to temp file
            with open(temp_tex_path, "w", encoding='utf-8') as f:
                f.write(processed_latex)
            
            # Compile LaTeX with enhanced error handling
            success = False
            compile_output = ""
            for attempt in range(2):  # Try twice
                try:
                    import subprocess
                    process = subprocess.run(
                        ['pdflatex', '-interaction=nonstopmode', temp_tex_path],
                        cwd=temp_dir,
                        capture_output=True,
                        text=True,
                        timeout=30
                    )
                    compile_output = process.stdout + "\n" + process.stderr
                    if process.returncode == 0:
                        success = True
                        break
                except Exception as e:
                    compile_output += f"\nError: {str(e)}"

            if not success:
                raise Exception(f"LaTeX compilation failed: {compile_output}")

            # Verify PDF was generated
            pdf_path = temp_tex_path.replace('.tex', '.pdf')
            if not os.path.exists(pdf_path):
                raise Exception("PDF file was not generated")

            # Read the generated PDF
            with open(pdf_path, 'rb') as pdf_file:
                pdf_data = base64.b64encode(pdf_file.read()).decode('utf-8')
            
            return jsonify({
                'status': 'success',
                'pdf': pdf_data,
                'latex_code': processed_latex
            })
                
        finally:
            # Clean up temp directory
            try:
                shutil.rmtree(temp_dir)
            except Exception as e:
                # Consider how to handle this error if logging is removed
                pass

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/calculate-ats-score', methods=['POST'])
def calculate_ats_score():
    try:
        # Get data from request
        data = request.get_json()
        print("Received data for ATS scoring:", data)
        
        # Extract job details and LaTeX code
        job_details = data.get('job_details')
        latex_code = data.get('latexCode')
        
        print(f"Job details type: {type(job_details)}, LaTeX code length: {len(latex_code) if latex_code else 'None'}")
        
        # Validate required data
        if not job_details:
            print("Error: Missing job details")
            return jsonify({"error": "Job details are required"}), 400
        if not latex_code:
            print("Error: Missing LaTeX code")
            return jsonify({"error": "Resume LaTeX code is required"}), 400
        
        # Format the ATS prompt template with job details and resume
        try:
            # Ensure job_details is a string
            if isinstance(job_details, dict):
                # Convert job details dictionary to a formatted string
                job_details_str = "\n".join([f"{k}: {v}" for k, v in job_details.items()])
            else:
                job_details_str = str(job_details)
            
            # Now create the prompt with the string representation
            prompt = ATS_PROMPT_TEMPLATE.format(
                job_description=job_details_str,
                resume=latex_code
            )
            print("Successfully created prompt template")
        except Exception as format_error:
            print(f"Error formatting prompt template: {format_error}")
            return jsonify({
                "error": f"Error formatting prompt: {str(format_error)}",
                "status": "error"
            }), 500
        
        # Call Groq API to generate the ATS score
        try:
            print("Calling Groq API...")
            completion = groq_client.chat.completions.create(
                model="meta-llama/llama-4-maverick-17b-128e-instruct",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_completion_tokens=4000,
                top_p=1,
                stream=False,
                response_format={"type": "json_object"},
                stop=None,
            )
            print("Groq API call successful")
        except Exception as api_error:
            print(f"Error calling Groq API: {api_error}")
            return jsonify({
                "error": f"API error: {str(api_error)}",
                "status": "error"
            }), 500
        
        # Extract the response
        response_content = completion.choices[0].message.content
        print(f"Received response content: {response_content[:100]}...")  # Print first 100 chars
        
        # Attempt to parse the JSON response
        try:
            ats_score_data = json.loads(response_content)
            print("Successfully parsed JSON response")
            print(f"ATS score data structure: {list(ats_score_data.keys())}")
            return jsonify({
                "status": "success",
                "ats_score": ats_score_data
            })
        except json.JSONDecodeError as json_error:
            print(f"JSON parse error: {json_error}, raw content: {response_content[:200]}...")
            return jsonify({
                "error": "Failed to parse ATS score response",
                "raw_response": response_content,
                "status": "error"
            }), 500
            
    except Exception as e:
        print(f"Unexpected error in calculate_ats_score: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)

