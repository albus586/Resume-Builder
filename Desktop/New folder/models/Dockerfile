# Use Python 3.10 as the base image
FROM python:3.10-slim

ENV DEBIAN_FRONTEND=noninteractive

# Set the working directory
WORKDIR /app

# Install system dependencies (including TeX Live for LaTeX compilation)
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    build-essential \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-latex-recommended \
    texlive-fonts-extra \
    curl \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install Python dependencies
COPY requirements.txt .
COPY llama_model_skills.gguf .
RUN pip install llama-cpp-python
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code - assuming all Python files are in the current directory
COPY . .

EXPOSE 8080

ENV FLASK_APP=app.py

# Run the application
CMD ["python", "app.py"]
