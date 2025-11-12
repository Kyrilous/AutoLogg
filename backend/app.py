from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from functools import wraps
import firebase_admin
from firebase_admin import credentials, auth, initialize_app
import os
import json

app = Flask(__name__)
from flask_cors import CORS

CORS(app, supports_credentials=True, origins=[
    "https://auto-logg.vercel.app",
    "https://autologg.net",
    "https://www.autologg.net",
    "http://localhost:3000"
])



app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///maintenance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Initialize Firebase Admin (Local or Deployment)
if os.path.exists("serviceAccountKey.json"):
    print("Using local Firebase serviceAccountKey.json")
    cred = credentials.Certificate("serviceAccountKey.json")
    initialize_app(cred)
else:
    print("Using FIREBASE_CREDENTIALS from environment")
    cred_json = os.environ.get("FIREBASE_CREDENTIALS")
    if cred_json:
        service_account_info = json.loads(cred_json)
        cred = credentials.Certificate(service_account_info)
        initialize_app(cred)
    else:
        raise Exception("🔥 No Firebase credentials found! Add serviceAccountKey.json for local dev or set FIREBASE_CREDENTIALS for deployment.")





class MaintenanceRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_type = db.Column(db.String(100), nullable=False)
    mileage = db.Column(db.Integer, nullable=False)
    date = db.Column(db.String(10), nullable=False)
    user_id = db.Column(db.String(255), nullable=False)

# Create the database 
with app.app_context():
    db.create_all()




def verify_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        print("Authorization header received:", auth_header)
        if not auth_header:
            return jsonify({"error": "Unauthorized"}), 403

        try:
            token = auth_header.split(" ")[1]
            decoded_token = auth.verify_id_token(token)
            request.user_id = decoded_token["uid"]
        except Exception as e:
            print("Token verification failed:", e)
            return jsonify({"error": "Invalid token"}), 403

        return f(*args, **kwargs)  

    return decorated_function  



 # Endpoint to add records
@app.route('/add_record', methods=['POST'])
@verify_token
def add_record():
    data = request.json
    user_id = request.user_id
    print("📥 Received data:", data)  

    if not user_id or not data.get("serviceType") or not data.get("mileage") or not data.get("date"):
        return jsonify({"error": "Missing required fields."}), 400

    new_record = MaintenanceRecord(
        user_id=user_id,
        service_type=data['serviceType'], 
        mileage=data['mileage'], 
        date=data['date'],
    )

    db.session.add(new_record)
    db.session.commit()  

    return jsonify({
    "id": new_record.id,
    "user_id": new_record.user_id,
    "serviceType": new_record.service_type,
    "mileage": new_record.mileage,
    "date": new_record.date
})




# Endpoint to get all records
@app.route('/records', methods=['GET'])
@verify_token
def get_records():
    user_id = request.user_id  
    records = MaintenanceRecord.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": record.id,
        "service_type": record.service_type,
        "mileage": record.mileage,
        "date": record.date
    } for record in records])


@app.route('/records/<int:record_id>', methods=['DELETE'])
@verify_token
def delete_record(record_id):
    user_id = request.user_id  # Firebase user
    record = MaintenanceRecord.query.get(record_id)

    if not record:
        return jsonify({"message": "Record not found"}), 404

    if record.user_id != user_id:
        return jsonify({"message": "Unauthorized: You cannot delete this record"}), 403

    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "Record deleted successfully"}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))     