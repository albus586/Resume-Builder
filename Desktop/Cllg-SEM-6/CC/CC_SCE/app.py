from flask import Flask, render_template, request, jsonify, redirect, url_for
import random
import json
from datetime import datetime

app = Flask(__name__)

# Sample data for demonstration
todos = [
    {"id": 1, "task": "Learn Flask", "completed": False},
    {"id": 2, "task": "Build an API", "completed": False},
    {"id": 3, "task": "Deploy application", "completed": False}
]

quotes = [
    "Life is what happens when you're busy making other plans. — John Lennon",
    "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
    "The only way to do great work is to love what you do. — Steve Jobs",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. — Winston Churchill",
    "The best way to predict the future is to create it. — Peter Drucker"
]

# Make now() function available in templates
@app.context_processor
def utility_processor():
    def now():
        return datetime.now()
    return dict(now=now)

# Home route
@app.route('/')
def home():
    return render_template('home.html', title="Flask Multi-Route App")

# About route
@app.route('/about')
def about():
    return render_template('about.html', title="About Us")

# Weather simulation route
@app.route('/weather')
def weather():
    cities = {
        'New York': {'temp': random.randint(10, 32), 'condition': random.choice(['Sunny', 'Cloudy', 'Rainy', 'Snowy'])},
        'London': {'temp': random.randint(5, 25), 'condition': random.choice(['Sunny', 'Cloudy', 'Rainy', 'Foggy'])},
        'Tokyo': {'temp': random.randint(15, 35), 'condition': random.choice(['Sunny', 'Cloudy', 'Rainy', 'Stormy'])},
        'Sydney': {'temp': random.randint(20, 40), 'condition': random.choice(['Sunny', 'Cloudy', 'Rainy', 'Windy'])}
    }
    return render_template('weather.html', title="Weather Forecast", cities=cities)

# Calculator route
@app.route('/calculator', methods=['GET', 'POST'])
def calculator():
    result = None
    if request.method == 'POST':
        num1 = float(request.form.get('num1', 0))
        num2 = float(request.form.get('num2', 0))
        operation = request.form.get('operation', 'add')
        
        if operation == 'add':
            result = num1 + num2
        elif operation == 'subtract':
            result = num1 - num2
        elif operation == 'multiply':
            result = num1 * num2
        elif operation == 'divide':
            if num2 != 0:
                result = num1 / num2
            else:
                result = "Error: Division by zero"
    
    return render_template('calculator.html', title="Calculator", result=result)

# Todo List API routes
@app.route('/api/todos', methods=['GET', 'POST'])
def handle_todos():
    if request.method == 'GET':
        return jsonify(todos)
    
    if request.method == 'POST':
        data = request.get_json()
        new_todo = {
            "id": len(todos) + 1,
            "task": data.get('task', ''),
            "completed": False
        }
        todos.append(new_todo)
        return jsonify(new_todo), 201

# Single todo API routes for delete functionality
@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def handle_todo(todo_id):
    global todos
    if request.method == 'DELETE':
        todos = [todo for todo in todos if todo['id'] != todo_id]
        return '', 204

# Todo List web interface
@app.route('/todos')
def todo_list():
    return render_template('todos.html', title="Todo List", todos=todos)

# Random quote generator
@app.route('/quote')
def random_quote():
    quote = random.choice(quotes)
    return render_template('quote.html', title="Random Quote", quote=quote)

# Time service route
@app.route('/time')
def time_service():
    current_time = datetime.now().strftime("%H:%M:%S")
    current_date = datetime.now().strftime("%Y-%m-%d")
    return render_template('time.html', title="Current Time", time=current_time, date=current_date)

if __name__ == '__main__':
    app.run(debug=True)