# Flask Multi-Route Application

A Flask web application demonstrating multiple routes with unique functionality.

## Features

- **Home Page**: Overview of the application
- **About Page**: Information about the project
- **Weather Forecast**: Simulated weather data for different cities
- **Calculator**: Simple arithmetic calculator
- **Todo List**: Task management with CRUD operations
- **Random Quote**: Displays inspirational quotes randomly
- **Time Service**: Displays current time and date

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run the application:
   ```
   python app.py
   ```

## Project Structure

```
.
├── app.py                  # Main Flask application file
├── requirements.txt        # Python dependencies
├── static/                 # Static files directory
│   └── css/
│       └── style.css       # Custom CSS styles
└── templates/              # HTML templates
    ├── about.html
    ├── base.html
    ├── calculator.html
    ├── home.html
    ├── quote.html
    ├── time.html
    ├── todos.html
    └── weather.html
```

## Technologies Used

- **Flask**: Web framework for building the application
- **Jinja2**: Templating engine
- **Bootstrap 5**: Frontend CSS framework
- **JavaScript**: Client-side functionality

## License

MIT
