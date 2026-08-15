from dotenv import load_dotenv
load_dotenv()

from app import create_app

app = create_app()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 IJTD Backend Server Starting...")
    print("="*60)
    print("\n📍 Server running at: http://localhost:5000")
    print("📚 Swagger UI: http://localhost:5000/apidocs/")
    print("💚 Health Check: http://localhost:5000/api/health")
    print("\n" + "="*60 + "\n")
    
    app.run(debug=True, host="0.0.0.0", port=5000)