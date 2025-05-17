LATEX_RESUME_TEMPLATE = r"""
%---- Required Packages and Functions ----
\documentclass[a4paper,12pt]{article} % increased base font size
\usepackage{latexsym}
\usepackage{xcolor}
\usepackage{float}
\usepackage{ragged2e}
\usepackage[empty]{fullpage}
\usepackage{wrapfig}
\usepackage{lipsum}
\usepackage{tabularx}
\usepackage{titlesec}
\usepackage{geometry}
\usepackage{marvosym}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage{fontawesome5}
\usepackage{multicol}
\usepackage{graphicx}
\usepackage[T1]{fontenc}  % ensure proper hyphenation and accent handling

\setlength{\multicolsep}{0pt} 
\pagestyle{fancy}
\fancyhf{} % clear all header and footer fields
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}
\geometry{left=1.4cm, top=0.6cm, right=1.2cm, bottom=0.8cm} % tighter margins

%-------------------------
% Custom colors and boxes
\usepackage[most]{tcolorbox}
\tcbset{
  frame code={},
  center title,
  left=0pt,
  right=0pt,
  top=0pt,
  bottom=0pt,
  colback=gray!20,
  colframe=white,
  width=\dimexpr\textwidth\relax,
  boxsep=3pt,
  arc=0pt,outer arc=0pt,
}

\urlstyle{same}
\raggedright
\setlength{\tabcolsep}{0in}

% Sections formatting
\titleformat{\section}{
  \vspace{-10pt}\scshape\raggedright\Large
}{}{0em}{}[\color{black}\titlerule\vspace{-5pt}]

%-------------------------
% Custom commands
\newcommand{\resumeItem}[2]{%
  \item{\textbf{#1}{\hspace{0.5mm}#2}}%
}

\newcommand{\resumePOR}[3]{%
  \vspace{0.5mm}\item
  \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & \textit{\small{#3}} \\
      \textit{\small{#2}} & \\
  \end{tabular*}
  \vspace{-20pt}
}

\newcommand{\resumeSubheading}[4]{%
  \vspace{0.5mm}\item
  \begin{tabular*}{0.98\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & \textit{\small{#4}} \\
      \textit{\small{#2}} & \\
  \end{tabular*}
  \vspace{-1.5mm}
}

% Updated project macro: title, date, description bullets, tech stack italic below
\newcommand{\resumeProject}[4]{%
  \vspace{0.5mm}\item
  {\textbf{#1}}\hfill {\itshape #2}\\
  \noindent{\itshape #4}\\
  \vspace{-1mm}
  \begin{itemize}[leftmargin=3ex,noitemsep,label=--]
    #3 % description items
  \end{itemize}
  \vspace{-1.5mm}
}

% Remove default bullets for section lists
\renewcommand{\labelitemi}{}
\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=*,labelsep=0mm,label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}\vspace{1mm}}

% Responsibility bullets formatting
\newcommand{\resumeItemListStart}{\begin{itemize}[leftmargin=3ex,noitemsep,label=--]}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-1mm}}

%-------------------------
% Custom columns
\usepackage{array}
\newcolumntype{L}{>{\raggedright\arraybackslash}X}
\newcolumntype{R}{>{\raggedleft\arraybackslash}X}

%%%%%%  DEFINE USER INFO %%%%%%%%%%%
\newcommand{\name}{John Doe}
\newcommand{\phone}{+1-555-1234}
\newcommand{\emaila}{john.doe@example.com}
\newcommand{\location}{San Francisco, CA}
\newcommand{\linkedin}{https://linkedin.com/in/johndoe}
\newcommand{\github}{https://github.com/johndoe}

\begin{document}
\fontfamily{cmr}\selectfont  % switch to default Computer Modern Roman

%----------HEADING-----------------
\begin{center}
  {\LARGE \textbf{\name}}\\[0.3em]
  \faPhone\ \phone \quad
  \faEnvelope\ \href{mailto:\emaila}{\emaila} \quad
  \faLocationArrow\ \location \\
  \faGithub\ \href{\github}{GitHub} \quad
  \faLinkedin\ \href{\linkedin}{LinkedIn}
\end{center}

%-----------ABOUT-----------------
\section{About}
\small A passionate software engineer with a background in cybersecurity and data science. Skilled in developing scalable web applications and cloud solutions, with a strong focus on security best practices. Adept at collaborating in cross-functional teams and continuously learning emerging technologies.\vspace{-2mm}

%-----------EDUCATION-----------
\section{Education}
\resumeSubHeadingListStart
  \resumeSubheading{Bachelor of Technology in Computer Science (Cyber Security)}{Shri Ramdeobaba College of Engineering and Management}{Nagpur, India}{2020--2024}
  \resumeSubheading{Master of Science in Data Science}{Stanford University}{Stanford, CA}{2025--2027}
\resumeSubHeadingListEnd

%-----------WORK EXPERIENCE-----------------
\section{Work Experience}
\resumeSubHeadingListStart
  \resumeSubheading{Software Engineer}{Infosys}{Bangalore, India}{July 2024--Present}
    \resumeItemListStart
      \item Designed and implemented REST APIs using Node.js and Express.
      \item Optimized database queries, reducing response times by 30%.
    \resumeItemListEnd
  \resumeSubheading{Summer Intern}{Google}{Mountain View, CA}{June 2023--August 2023}
    \resumeItemListStart
      \item Developed a prototype feature in Google Maps for enhanced route planning.
      \item Wrote comprehensive unit tests in Python, achieving 90% coverage.
    \resumeItemListEnd
\resumeSubHeadingListEnd

%-----------PROJECTS-----------------
\section{Projects}
\resumeSubHeadingListStart
  \resumeProject{Web Based Facial Authentication (Liveness Detection)}{2023}{\item Facilitated secure user logins with live detection techniques via a Chrome extension.}{Python, ReactJS, Bootstrap}
  \resumeProject{Realtime Chat App}{2022}{\item Built a real-time chat application using Firebase for authentication and data storage.}{ReactJS, Firebase, Bootstrap}
  \resumeProject{COVID-19 Tracker}{2021}{\item Created a dashboard with live API data and Google Maps integration to track cases worldwide.}{JavaScript, HTML/CSS, APIs}
\resumeSubHeadingListEnd

%-----------TECHNICAL SKILLS-----------------
\section{Technical Skills}
\begin{itemize}[leftmargin=0.05in, label={}]
  \item{\small
    \textbf{Languages}{: C/C++, Python, JavaScript} \\
    \textbf{Frameworks}{: ReactJS, Django} \\
    \textbf{Tools}{: Git, Docker, VSCode} \\
    \textbf{Databases}{: MongoDB, MySQL}
  }
\end{itemize}

%-----------COURSES-----------------
\section{Courses}
\resumeSubHeadingListStart
  \resumePOR{Machine Learning}{Coursera}{June 2022}
  \resumePOR{AWS Certified Cloud Practitioner}{Amazon Web Services}{March 2023}
\resumeSubHeadingListEnd

\end{document}
"""

ATS_PROMPT_TEMPLATE = """
You are an expert ATS (Applicant Tracking System) resume analyzer. Your task is to score a resume in LaTeX format against the following job description:

{job_description}

INSTRUCTIONS:
1. Ignore LaTeX formatting and focus only on extracting the relevant content from the resume.
2. Score the resume on a 100-point scale using the criteria below.
3. Provide your scores in JSON format as specified at the end.

SCORING CRITERIA:

1. Keyword Match (30 points)
   - Extract all required skills, technologies, and key phrases from the job description.
   - Count how many unique job description keywords appear in the resume (exact matches or close synonyms).
   - Score = (matched keywords / total job description keywords) × 30

2. Work Experience (25 points)
   a) Title & Years (10 points)
      - Award full points if candidate's current/most recent title matches one in the job description.
      - Add 5 points if total years of relevant experience meets or exceeds requirements.
   b) Bullet Relevance (15 points)
      - Identify experience bullets that address core job requirements.
      - Score = (relevant bullets / total experience bullets) × 15

3. Technical Skills (20 points)
   - Identify required technical skills (R) and optional/nice-to-have skills (O) from the job description.
   - Calculate: Score = (matched_required_skills/total_required_skills)×16 + (matched_optional_skills/total_optional_skills)×4

4. Education & Certifications (10 points)
   - Degree level: 5 points if meets or exceeds minimum requirements, else 0.
   - Relevant certifications/courses: 1-5 points based on matches to desired qualifications.

5. Projects & Achievements (10 points)
   - Evaluate projects based on relevance to job requirements.
   - A project is "highly relevant" if it demonstrates ≥2 core job technologies or domains.
   - Score = (highly_relevant_projects / total_projects) × 10

6. Soft Skills & Summary (5 points)
   - Extract 3-5 key soft skills from the job description.
   - Evaluate how well the resume's summary and language reflect these skills.
   - Score = (matched_soft_skills / required_soft_skills) × 5

RESUME:

{resume}

OUTPUT INSTRUCTIONS:
Return only a JSON object with the following structure:
{{
  "keyword_match": [score],
  "work_experience": [score],
  "technical_skills": [score],
  "education_certifications": [score],
  "projects_achievements": [score],
  "soft_skills_summary": [score],
  "total_score": [sum of all scores]
}}

Verify that the sum of individual scores matches the total score. Round all scores to one decimal place.
"""