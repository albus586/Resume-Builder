import subprocess
import os
import json
from dotenv import load_dotenv

from llama_cpp import Llama

from prompt_templates import LATEX_RESUME_TEMPLATE
import google.generativeai as genai

load_dotenv()

# Configure Gemini AI
gemini_api_key = os.environ['GEMINI_API_KEY']
genai.configure(api_key=gemini_api_key)
# model_gemini = genai.GenerativeModel('gemini-2.5-flash-preview-04-17')
model_gemini = genai.GenerativeModel('gemini-2.0-flash')
# model_gemini = genai.GenerativeModel('gemini-2.5-pro-exp-03-25')

# Path for the quantized Llama model 
    
model_kwargs = {
    "n_ctx":131072,    
    "n_threads":4,
}

model_path = "llama_model_skills.gguf"
# current_dir_path = os.getcwdb().decode('utf-8')  # Decode bytes to string
# full_model_path = os.path.join(current_dir_path, model_path.lstrip('\\/')) # Use os.path.join and remove leading slashes from model_path



def get_skills(job_description):

    input_prompt = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

    ### Instruction:
    Identify and list all relevant skills required for this job based on the job title, role, description, and responsibilities provided.

    ### Input:
    {}

    ### Response:
    {}"""

    query = """
    Job Title: {}
    Role: Market {}
    Job Description: {}
    Responsibilities: {}
    """

    query = query.format(job_description['job_title'], job_description['job_role'], job_description['job_description'], job_description['responsibilities'])
    prompt = input_prompt.format(query, "")

    llm = Llama(model_path=model_path, verbose=False, **model_kwargs)
    # llm = Llama(model_path=model_path, verbose=False, **model_kwargs)
                
    result = llm(
            prompt,
            max_tokens=64,
        )
        
    return result["choices"][0]["text"]


def generate_latex_file(job_description, profile=None, resume=None):
    
    skills = get_skills(job_description)
    # skills = "Data architecture design Database management systems Data modeling"

    prompt = """
    You are a professional resume writer tasked with creating a tailored LaTeX resume for a job application.

    # KEY SKILLS TO HIGHLIGHT (HIGHEST PRIORITY)
    {skills}

    # JOB DESCRIPTION (SECONDARY PRIORITY)
    {job_description}

    # USER PROFILE
    {profile}

    # CURRENT RESUME
    {resume}

    # INSTRUCTIONS
    1. Generate a complete LaTeX resume that prioritizes highlighting the KEY SKILLS listed above.
    2. Follow the exact LaTeX formatting and structure from the example below.
    3. FOLLOW THIS SPECIFIC SECTION ORDER: Personal Information, About, Education, Skills, Work Experience (if available), Projects, Courses
    4. For each project or experience, highlight connections to the required skills WITHOUT REPEATING THE EXACT SKILL PHRASES verbatim.
    5. Use synonyms, related terms, and contextual descriptions in Work Experience and Projects sections to showcase skills naturally rather than forcing the exact skill phrases repeatedly.
    6. If a section has no information available (like work experience), REMOVE that entire section from the LaTeX code.
    7. DO NOT fabricate or invent any information not included in the profile or resume.
    8. Keep the About section concise (2-3 lines maximum) and focused on relevant skills and experiences.
    9. Ensure the LaTeX code is complete and compilable.
    10. Format dates consistently throughout the document.
    11. Use subtle emphasis techniques like strategic content placement rather than repeatedly mentioning the exact skill phrases.
    12. Make the resume read naturally while still emphasizing relevant expertise.

    # VERY IMPORTANT INSTRUCTION
    13. If the text of resume contain % or & etc signs then precede them with \\(backslash) like \\& or \\%.
    14. AVOID VERBATIM REPETITION of the skill phrases - integrate them naturally into achievements and descriptions.

    # LATEX TEMPLATE TO FOLLOW
    {latex_template}

    # OUTPUT FORMAT
    Return ONLY the complete LaTeX code without explanations or markdown formatting.
    """

    # Replace placeholders with actual data
    prompt = prompt.format(
        job_description=json.dumps(job_description, indent=2),
        profile=json.dumps(profile, indent=2) if profile else "No profile information available",
        resume=json.dumps(resume, indent=2) if resume else "No resume information available",
        skills=skills,
        latex_template=LATEX_RESUME_TEMPLATE
    )

    response = model_gemini.generate_content(prompt)
    # print(response)

    # Extract just the LaTeX code from the response
    latex_code = response.text.strip()
    if latex_code.startswith("```latex"):
        latex_code = latex_code[8:]  # Remove the ```latex part
    if latex_code.endswith("```"):
        latex_code = latex_code[:-3]  # Remove the ending ``` part
    
    # Save the LaTeX code to a file
    with open("my_resume.tex", "w") as f:
        f.write(latex_code)
    
    return latex_code


def convert_tex_to_pdf(tex_file_path):
    """
    Compile LaTeX file to PDF using pdflatex
    """
    try:
        # Change working directory to the .tex file's directory
        original_dir = os.getcwd()
        target_dir = os.path.dirname(tex_file_path)
        if target_dir:
            os.chdir(target_dir)
        
        tex_file = os.path.basename(tex_file_path)
        
        # Run pdflatex twice to resolve references
        for _ in range(2):
            result = subprocess.run(
                ['pdflatex', '-interaction=nonstopmode', tex_file],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            if result.returncode != 0:
                print("Error during compilation:")
                print(result.stderr.decode())
                return False
        
        print(f"Successfully generated {tex_file.replace('.tex', '.pdf')}")

        # Clean auxiliary files (optional)
        base_name = os.path.splitext(tex_file)[0]
        for ext in ['.aux', '.log', '.out']:
            file_to_remove = f"{base_name}{ext}"
            if os.path.exists(file_to_remove):
                os.remove(file_to_remove)

        return True
        
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return False
    finally:
        os.chdir(original_dir)

if __name__ == "__main__":
    # Load job description from jd_format.json
    with open('test/jd_format.json', 'r') as jd_file:
        jd_format = json.load(jd_file)

    # # Load profile information from profile.json
    # with open('test/profile.json', 'r') as profile_file:
    #     profile = json.load(profile_file)

    # # Load resume information from resume.json
    # with open('test/resume.json', 'r') as resume_file:
    #     resume = json.load(resume_file)

    # latex_code = generate_latex_file(job_description=jd_format, profile=profile, resume=resume)

    # tex_file = "my_resume.tex"  # Change this path if needed
    # convert_tex_to_pdf(tex_file)

    skills = get_skills(job_description=jd_format)
    print(skills)