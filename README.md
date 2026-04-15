# Finance Tracker API

A secure Django REST API for personal finance management with AI-powered insights.

## Features

- User authentication with JWT tokens
- Account, transaction, category, and budget management
- AI-powered financial insights using OpenAI GPT
- Secure production-ready configuration
- Comprehensive API documentation with Swagger
- SQL Server database support

## Quick Start

### Prerequisites

- Python 3.8+
- SQL Server with ODBC Driver 17
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd finance_tracker
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values
# Required: OPENAI_API_KEY, database settings, etc.
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Create a superuser:
```bash
python manage.py createsuperuser
```

7. Run the development server:
```bash
python manage.py runserver
```

## API Documentation

Once the server is running, visit:
- API Documentation: `http://localhost:8000/api/schema/swagger-ui/`
- ReDoc Documentation: `http://localhost:8000/api/schema/redoc/`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `SECRET_KEY` | Django secret key | Yes |
| `DEBUG` | Enable/disable debug mode | No (default: False) |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | Yes |
| `DB_NAME` | SQL Server database name | Yes |
| `DB_HOST` | SQL Server host | Yes |
| `DB_USER` | SQL Server username | No (uses Windows auth if empty) |
| `DB_PASSWORD` | SQL Server password | No |

## Security Features

- HTTPS enforcement
- Secure cookies
- CSRF protection
- CORS configuration
- Password validation
- Input sanitization

## API Endpoints

### Authentication
- `POST /api/register/` - User registration
- `POST /api/login/` - User login
- `POST /api/logout/` - User logout

### Finance Management
- `GET/POST /api/accounts/` - Account management
- `GET/POST /api/transactions/` - Transaction management
- `GET/POST /api/categories/` - Category management
- `GET/POST /api/budgets/` - Budget management

### AI Features
- `POST /api/chat/` - AI-powered financial insights

## Testing

Run the test suite:
```bash
python manage.py test
```

## Deployment

For production deployment:

1. Set `DEBUG = False`
2. Configure proper `ALLOWED_HOSTS`
3. Set up SSL/TLS certificates
4. Use environment variables for sensitive data
5. Configure a production-grade web server (nginx + gunicorn)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
