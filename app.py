from flask import Flask, render_template, request, jsonify
import os
from preprocessing import clean_text_step_by_step
from model import SpamDetectorModel

app = Flask(__name__, template_folder="templates", static_folder="static")

# Initialize and load model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
detector = SpamDetectorModel(model_dir=BASE_DIR)

try:
    detector.load_model()
    print("[SUCCESS] Naive Bayes Model and Vectorizer loaded successfully.")
except Exception as e:
    print(f"[ERROR] Failed to load model files: {e}")

@app.route("/")
def index():
    """
    Serves the main HTML5 dashboard page.
    """
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    """
    API Endpoint: Accepts a JSON request body with a message string,
    cleans the text, runs vectorization and classification,
    and returns prediction metrics and pipeline steps.
    """
    data = request.get_json()
    
    if not data or "message" not in data:
        return jsonify({"error": "Invalid request. Please provide a 'message' field in JSON."}), 400
        
    message = data["message"]
    
    if not message.strip():
        return jsonify({
            "label": "Ham",
            "confidence": 0.50,
            "tfidf_scores": {},
            "steps": {
                "raw": "",
                "lowercase": "",
                "no_symbols": "",
                "no_stopwords": ""
            }
        })
        
    try:
        # 1. Run classifier
        label, confidence, tfidf_scores = detector.predict(message)
        
        # 2. Get intermediate NLP steps
        steps = clean_text_step_by_step(message)
        
        return jsonify({
            "label": label,
            "confidence": confidence,
            "tfidf_scores": tfidf_scores,
            "steps": steps
        })
    except Exception as e:
        return jsonify({"error": f"Internal prediction failure: {str(e)}"}), 500

@app.route("/refine", methods=["POST"])
def refine():
    """
    API Endpoint: Accepts a JSON request body with a message string and a label,
    adds the sample to the training cache, re-fits the Naive Bayes model in real-time,
    and returns updated telemetry metrics.
    """
    data = request.get_json()
    
    if not data or "message" not in data or "label" not in data:
        return jsonify({"error": "Invalid request. Please provide 'message' and 'label' in JSON."}), 400
        
    message = data["message"]
    label = data["label"]
    
    if not message.strip():
        return jsonify({"error": "Message content cannot be blank."}), 400
        
    if label.lower() not in ["spam", "ham"]:
        return jsonify({"error": "Label must be either 'spam' or 'ham'."}), 400
        
    try:
        results = detector.refine_model(message, label)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": f"Model refinement failure: {str(e)}"}), 500

if __name__ == "__main__":
    print("[INFO] Starting Flask Server on http://localhost:5000...")
    app.run(debug=True, use_reloader=False, host="0.0.0.0", port=5000)
