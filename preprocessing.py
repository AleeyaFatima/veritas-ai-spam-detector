import re
import string

# Hardcoded common English stopwords for zero-dependency reliability
DEFAULT_STOPWORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd",
    'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers',
    'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
    'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if',
    'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
    'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
    'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
    'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should',
    "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't",
    'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't",
    'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't",
    'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"
}

def clean_text_step_by_step(text):
    """
    Cleans a text message and returns a dictionary with the raw state
    and intermediate steps, along with the final preprocessed output.
    """
    if not isinstance(text, str):
        text = ""
        
    steps = {
        "raw": text
    }
    
    # Step 1: Lowercase
    lowercased = text.lower()
    steps["lowercase"] = lowercased
    
    # Step 2: Remove Symbols (punctuation and non-alphanumeric chars, keeping spaces)
    # We will use regex to remove punctuation and symbols
    # Keep letters, numbers, and whitespace characters
    cleaned_symbols = re.sub(r'[^\w\s]', ' ', lowercased)
    # Replace multiple whitespace characters with a single space
    cleaned_symbols = re.sub(r'\s+', ' ', cleaned_symbols).strip()
    steps["no_symbols"] = cleaned_symbols
    
    # Step 3: Remove Stop Words
    words = cleaned_symbols.split()
    cleaned_words = [word for word in words if word not in DEFAULT_STOPWORDS]
    final_text = " ".join(cleaned_words)
    steps["no_stopwords"] = final_text
    
    return steps

def preprocess_text(text):
    """
    Convenience function that returns just the final clean string.
    """
    return clean_text_step_by_step(text)["no_stopwords"]
