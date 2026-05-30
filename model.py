import os
import pickle
import pandas as pd
from preprocessing import preprocess_text
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

class SpamDetectorModel:
    def __init__(self, model_dir="."):
        self.model_dir = model_dir
        self.model_path = os.path.join(model_dir, "spam_model.pkl")
        self.vectorizer_path = os.path.join(model_dir, "vectorizer.pkl")
        self.model = None
        self.vectorizer = None

    def load_model(self):
        """
        Loads the trained Naive Bayes model and the TF-IDF vectorizer from pickle files.
        """
        if not os.path.exists(self.model_path) or not os.path.exists(self.vectorizer_path):
            raise FileNotFoundError("Model or Vectorizer pickle files are missing. Please run train.py first.")
            
        with open(self.model_path, "rb") as f:
            self.model = pickle.load(f)
            
        with open(self.vectorizer_path, "rb") as f:
            self.vectorizer = pickle.load(f)

    def predict(self, raw_message):
        """
        Preprocesses a raw message, translates it into numerical TF-IDF features,
        and uses the Naive Bayes model to predict whether it is Spam or Ham.
        
        Returns:
            label (str): 'Spam' or 'Ham'
            confidence (float): Probability of the predicted class (0.0 to 1.0)
            tfidf_features (dict): A dictionary of words present in the message and their TF-IDF values
        """
        if self.model is None or self.vectorizer is None:
            self.load_model()
            
        # 1. Clean the raw text
        cleaned_text = preprocess_text(raw_message)
        
        # If the preprocessed text is empty, handle it gracefully
        if not cleaned_text.strip():
            return "Ham", 0.50, {}
            
        # 2. Transform text to numeric features using the loaded vectorizer
        tfidf_vector = self.vectorizer.transform([cleaned_text])
        
        # 3. Predict the label using Naive Bayes
        prediction = self.model.predict(tfidf_vector)[0]  # E.g., 'spam' or 'ham'
        
        # 4. Predict probabilities (confidence)
        probabilities = self.model.predict_proba(tfidf_vector)[0]
        class_labels = self.model.classes_  # Array of classes, usually ['ham', 'spam'] or ['Ham', 'Spam']
        
        # Map output label and confidence
        label_index = list(class_labels).index(prediction)
        confidence = float(probabilities[label_index])
        
        # Map feature scores for the words present in this message
        feature_names = self.vectorizer.get_feature_names_out()
        dense_vector = tfidf_vector.todense().tolist()[0]
        
        # Find features with positive TF-IDF values for this message
        tfidf_features = {}
        words_in_msg = cleaned_text.split()
        for word in set(words_in_msg):
            if word in self.vectorizer.vocabulary_:
                idx = self.vectorizer.vocabulary_[word]
                score = dense_vector[idx]
                if score > 0:
                    tfidf_features[word] = round(score, 4)
                    
        # Normalize/clean label representation
        display_label = "Spam" if prediction.lower() == "spam" else "Ham"
        
        return display_label, confidence, tfidf_features

    def refine_model(self, raw_message, label):
        """
        Active Learning Feature:
        1. Appends the custom message and label to a user feedback CSV file.
        2. Merges this new custom data with the original training base.
        3. Re-trains the TfidfVectorizer and MultinomialNB classifier in real-time.
        4. Updates in-memory variables and saves updated model pickles for persistent state.
        """
        dataset_dir = os.path.join(self.model_dir, "dataset")
        os.makedirs(dataset_dir, exist_ok=True)
        custom_csv_path = os.path.join(dataset_dir, "custom_user_samples.csv")

        # Clean the input message first
        cleaned_msg = preprocess_text(raw_message)
        if not cleaned_msg.strip():
            raise ValueError("Input message contains only empty stop-words or symbols.")

        # Save to custom CSV
        new_row = pd.DataFrame([{"label": label.lower(), "message": raw_message, "clean_message": cleaned_msg}])
        if os.path.exists(custom_csv_path):
            new_row.to_csv(custom_csv_path, mode="a", header=False, index=False)
        else:
            new_row.to_csv(custom_csv_path, index=False)

        # Determine original dataset source
        original_uci_path = os.path.join(dataset_dir, "SMSSpamCollection")
        fallback_path = os.path.join(dataset_dir, "fallback_spam_dataset.csv")

        if os.path.exists(original_uci_path):
            df = pd.read_csv(original_uci_path, sep="\t", names=["label", "message"], encoding="utf-8")
            df["clean_message"] = df["message"].astype(str).apply(preprocess_text)
        elif os.path.exists(fallback_path):
            df = pd.read_csv(fallback_path)
            if "clean_message" not in df.columns:
                df["clean_message"] = df["message"].astype(str).apply(preprocess_text)
        else:
            # Create a base skeleton if nothing exists yet
            df = pd.DataFrame(columns=["label", "message", "clean_message"])

        # Load all custom user samples accumulated so far
        if os.path.exists(custom_csv_path):
            custom_df = pd.read_csv(custom_csv_path)
            df = pd.concat([df, custom_df], ignore_index=True)

        # Remove empty rows
        df = df[df["clean_message"].astype(str).str.strip() != ""]

        # Run Real-Time Vectorization and Training
        vectorizer = TfidfVectorizer(max_features=5000)
        X = vectorizer.fit_transform(df["clean_message"])
        y = df["label"].str.lower()

        model = MultinomialNB()
        model.fit(X, y)

        # Update in-memory models
        self.vectorizer = vectorizer
        self.model = model

        # Persist updated models to pickle files
        with open(self.model_path, "wb") as f:
            pickle.dump(self.model, f)
            
        with open(self.vectorizer_path, "wb") as f:
            pickle.dump(self.vectorizer, f)

        total_samples = len(df)
        vocabulary_size = len(vectorizer.vocabulary_)

        return {
            "status": "success",
            "vocabulary_size": vocabulary_size,
            "total_samples": total_samples,
            "custom_samples_count": len(pd.read_csv(custom_csv_path)) if os.path.exists(custom_csv_path) else 0
        }
