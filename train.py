import os
import zipfile
import requests
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from preprocessing import preprocess_text

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
UCI_ZIP_URL = "https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip"

def download_and_extract_uci():
    """
    Downloads and extracts the official UCI SMS Spam Collection dataset.
    Returns:
        filepath (str) or None if download fails.
    """
    os.makedirs(DATASET_DIR, exist_ok=True)
    zip_path = os.path.join(DATASET_DIR, "smsspamcollection.zip")
    extracted_file_path = os.path.join(DATASET_DIR, "SMSSpamCollection")
    
    # If already extracted, return it
    if os.path.exists(extracted_file_path):
        print("[INFO] Dataset already exists at:", extracted_file_path)
        return extracted_file_path
        
    print(f"[INFO] Fetching official SMS Spam Collection dataset from UCI URL: {UCI_ZIP_URL}")
    try:
        response = requests.get(UCI_ZIP_URL, timeout=15)
        if response.status_code == 200:
            with open(zip_path, "wb") as f:
                f.write(response.content)
            
            with zipfile.ZipFile(zip_path, "r") as zip_ref:
                zip_ref.extractall(DATASET_DIR)
                
            print("[SUCCESS] Dataset downloaded and extracted successfully.")
            return extracted_file_path
        else:
            print(f"[WARNING] Server returned status code {response.status_code}.")
            return None
    except Exception as e:
        print(f"[WARNING] Network request failed: {e}")
        return None

def generate_fallback_dataset():
    """
    Generates a rich, high-quality synthetic dataset of common Spam and Ham messages
    to ensure the training works offline or in case the UCI servers are down.
    """
    os.makedirs(DATASET_DIR, exist_ok=True)
    fallback_path = os.path.join(DATASET_DIR, "fallback_spam_dataset.csv")
    
    if os.path.exists(fallback_path):
        print("[INFO] Fallback dataset already exists at:", fallback_path)
        return fallback_path
        
    print("[INFO] Generating high-quality local fallback dataset...")
    
    # Base ham messages (casual, business, school, meetings)
    ham_messages = [
        "Hey, are we still meeting for lunch at 1 PM?",
        "Can you send me the slides for the machine learning presentation?",
        "I will reach the office in about 15 minutes. See you soon.",
        "Hi there, just wanted to check if you got my email yesterday.",
        "Sure, I can help you with the Python assignment tonight.",
        "Let's grab some coffee and talk about the project requirements.",
        "Call me back when you get a chance.",
        "The class starts at 9:00 AM in block C. Don't be late!",
        "Are you free for a call at 4 PM to discuss the feedback?",
        "Hey, did you watch the match last night? It was amazing!",
        "Don't forget to lock the door when you leave, thanks.",
        "Yes, I will bring the document to the meeting tomorrow morning.",
        "Sorry for the late reply, I was sleeping.",
        "Can you pick up some milk on your way home?",
        "I'm going to the library to study. Do you want to join?",
        "Hi, just confirming our appointment for next Tuesday.",
        "Hope you are feeling better today! Get well soon.",
        "Let me know if you need anything from the market.",
        "Are you home yet? Let me know when you arrive.",
        "We need to submit the report before Friday evening.",
        "The weather is nice today, let's go for a walk later.",
        "Thanks for the lovely dinner, had a great time.",
        "Hey, can you send me the address of the restaurant?",
        "I'll be working from home tomorrow due to the transit strike.",
        "I've completed the design draft. Let me know your thoughts.",
        "Tell mom I will be late for dinner.",
        "Could you please review this code snippet for me?",
        "Let's meet at the usual place after class.",
        "I received the package you sent. Thank you so much!",
        "Don't worry, we still have plenty of time before the deadline."
    ] * 4  # Repeat to make the dataset larger

    # Base spam messages (lotteries, bank alerts, vouchers, clicks, urgent updates)
    spam_messages = [
        "CONGRATULATIONS! You won a brand new free iPhone 15! Click this link now to claim!",
        "URGENT: Your bank account is temporarily locked. Verify your details here immediately: bit.ly/bank",
        "Get a $1000 Amazon Gift Card for FREE! Limited time offer. Claim your reward today!",
        "You have been selected for a cash prize of $50000. Send your account number to claim.",
        "FREE MOVIE TICKETS! Reply to this message with your details to receive your free passes.",
        "Exclusive deal: Save 80% on all luxury watches today. Visit our website now!",
        "Congratulations! Your phone number won $2,000,000 in our international lottery.",
        "Urgent Alert! Your mobile number has been selected. Click here now for your free bonus.",
        "Get rich quick! Earn $500 a day working from home. No experience needed. Sign up here.",
        "Guaranteed loan of up to $5000. No credit check required. Click to apply in minutes.",
        "WINNER! You won a free luxury holiday to Bahamas. Call 09061104276 to claim your prize.",
        "Hot deal! Double your cash investment in just 7 days. Reply YES for info.",
        "Your Netflix subscription has expired. Update your billing immediately at netflix-verify.com",
        "Congratulations, you have been awarded a free gift card. Tap here to retrieve it.",
        "URGENT: Click here to claim your outstanding tax refund of $425.99 from government portal.",
        "Congratulations! You are the selected customer of the week. Win $500 shopping voucher.",
        "Get unlimited free internet data today! Download our app from the link below.",
        "Urgent security alert: Unusual activity detected on your account. Verify identity now.",
        "Congratulations! You won a free flight ticket. Call this number to redeem.",
        "Last chance! Claim your 3 free months of Premium subscription by clicking this link."
    ] * 6  # Repeat to make the dataset larger
    
    # Create DataFrame
    data = []
    for msg in ham_messages:
        data.append({"label": "ham", "message": msg})
    for msg in spam_messages:
        data.append({"label": "spam", "message": msg})
        
    df = pd.DataFrame(data)
    df.to_csv(fallback_path, index=False)
    print(f"[SUCCESS] Fallback dataset created at {fallback_path} (Total samples: {len(df)})")
    return fallback_path

def main():
    print("="*60)
    print("AI-Based Spam and Ham Message Detection System - Training")
    print("="*60)
    
    # 1. Dataset Collection
    dataset_path = download_and_extract_uci()
    is_uci = True
    
    if dataset_path is None:
        print("[WARNING] Could not load official dataset. Falling back to local dataset.")
        dataset_path = generate_fallback_dataset()
        is_uci = False
        
    # 2. Load dataset into Pandas DataFrame
    print("[INFO] Loading dataset...")
    if is_uci:
        # UCI dataset is a TSV without a header
        df = pd.read_csv(dataset_path, sep="\t", names=["label", "message"], encoding="utf-8")
    else:
        # Fallback dataset is a standard CSV with headers
        df = pd.read_csv(dataset_path)
        
    print(f"[INFO] Dataset Shape: {df.shape}")
    print(f"[INFO] Class Distribution:\n{df['label'].value_counts()}")
    
    # Fill any empty cells
    df["message"] = df["message"].fillna("")
    
    # 3. Data Preprocessing
    print("[INFO] Preprocessing text messages (lowercasing, symbol removal, stopwords filtering)...")
    df["clean_message"] = df["message"].apply(preprocess_text)
    
    # Remove rows that ended up completely empty after preprocessing
    df = df[df["clean_message"].str.strip() != ""]
    
    # 4. Feature Extraction (TF-IDF)
    print("[INFO] Extracting TF-IDF features (translating words to numbers)...")
    vectorizer = TfidfVectorizer(max_features=5000)
    X = vectorizer.fit_transform(df["clean_message"])
    y = df["label"]
    
    # 5. Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    print(f"[INFO] Training set size: {X_train.shape[0]} | Testing set size: {X_test.shape[0]}")
    
    # 6. Train Naive Bayes Classifier
    print("[INFO] Training Multinomial Naive Bayes Model...")
    model = MultinomialNB()
    model.fit(X_train, y_train)
    
    # 7. Model Evaluation
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print("\n" + "="*40)
    print("TRAINING METRICS")
    print("="*40)
    print(f"Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("="*40 + "\n")
    
    # Save the vectorizer and model to pickle files in the script folder
    model_path = os.path.join(BASE_DIR, "spam_model.pkl")
    vectorizer_path = os.path.join(BASE_DIR, "vectorizer.pkl")
    
    print("[INFO] Saving trained model to:", model_path)
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
        
    print("[INFO] Saving TF-IDF vectorizer to:", vectorizer_path)
    with open(vectorizer_path, "wb") as f:
        pickle.dump(vectorizer, f)
        
    print("[SUCCESS] Training pipeline completed successfully!")

if __name__ == "__main__":
    main()
