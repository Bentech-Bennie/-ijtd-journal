# IJTD Backend API

International Journal of Transformative Development - Backend API Service

## 🚀 Tech Stack

- **Framework**: Flask 3.0.3
- **Database**: PostgreSQL / SQLite
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **PDF Generation**: ReportLab

## 📋 Prerequisites

- Python 3.11+
- PostgreSQL (optional, can use SQLite)
- pip

## 🔧 Installation

```bash
# Clone repository
git clone <your-repo-url>
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Seed database
python seed.py

# Run server
python run.py