import json
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# Load the dataset
with open("question_dataset.json", "r", encoding="utf-8") as f:
    dataset = json.load(f)

# Extract texts and labels
texts = [item['text'] for item in dataset]
labels = [item['label'] for item in dataset]

# Split the data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(texts, labels, test_size=0.3, random_state=42)

# Convert texts to feature vectors using CountVectorizer
vectorizer = CountVectorizer()
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# Train a classifier (Logistic Regression)
classifier = LogisticRegression(max_iter=1000)
classifier.fit(X_train_vec, y_train)

# Predict labels on the test set
y_pred = classifier.predict(X_test_vec)

# Evaluate the classifier
accuracy = accuracy_score(y_test, y_pred)
print(f"Classification Accuracy: {accuracy * 100:.2f}%")

# Example of making a prediction
sample_text = "i need 3rd question"  # Change this text to test
sample_vec = vectorizer.transform([sample_text])
predicted_label = classifier.predict(sample_vec)
print(f"Predicted label for '{sample_text}': {predicted_label[0]}")
