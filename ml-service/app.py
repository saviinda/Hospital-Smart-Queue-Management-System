from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import mysql.connector
from datetime import datetime
import joblib
import os

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'sdlove01',  # 🔴 match Spring Boot DB password
    'database': 'hospital_queue_db'
}

def train_model(department_id):
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT 
                HOUR(booking_time) AS hour,
                DAYOFWEEK(booking_time) AS day_of_week,
                COUNT(*) AS tokens_count,
                AVG(actual_wait_time) AS avg_wait_time
            FROM tokens
            WHERE department_id = %s
              AND actual_wait_time IS NOT NULL
              AND status = 'COMPLETED'
            GROUP BY DATE(booking_time), hour, day_of_week
        """

        cursor.execute(query, (department_id,))
        data = cursor.fetchall()

        if len(data) < 10:
            return None

        df = pd.DataFrame(data)
        X = df[['hour', 'day_of_week', 'tokens_count']]
        y = df['avg_wait_time']

        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)

        os.makedirs('models', exist_ok=True)
        joblib.dump(model, f'models/dept_{department_id}.pkl')

        return model

    except Exception as e:
        print("Training error:", e)
        return None
    finally:
        cursor.close()
        conn.close()

@app.route('/predict', methods=['POST'])
def predict_wait_time():
    data = request.json
    department_id = data.get('department_id')

    model_path = f'models/dept_{department_id}.pkl'

    if os.path.exists(model_path):
        model = joblib.load(model_path)
    else:
        model = train_model(department_id)
        if model is None:
            return jsonify({'estimated_wait_time': 30})

    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*) FROM tokens
        WHERE department_id = %s AND status = 'WAITING'
    """, (department_id,))

    queue_length = cursor.fetchone()[0]

    now = datetime.now()
    features = np.array([[now.hour, now.weekday() + 1, queue_length]])
    predicted = model.predict(features)[0]

    cursor.close()
    conn.close()

    return jsonify({
        'estimated_wait_time': int(predicted),
        'queue_length': queue_length
    })

@app.route('/retrain/<int:department_id>', methods=['POST'])
def retrain(department_id):
    model = train_model(department_id)
    if model:
        return jsonify({'message': 'Model retrained'})
    return jsonify({'error': 'Not enough data'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
