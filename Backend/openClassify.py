from transformers import BertTokenizer, BertForSequenceClassification
from transformers import Trainer, TrainingArguments
from datasets import Dataset
import pandas as pd
from sklearn.preprocessing import LabelEncoder

# Load custom dataset from JSON file
dataset_path = "D:/Project/Backend/question_dataset.json"
data = pd.read_json(dataset_path)

# Adjust labels to start from 0 (subtract 1 from each label)
data['label'] = data['label'] - 1

# Convert the dataset into Hugging Face Dataset format
dataset = Dataset.from_pandas(data)

# Check if dataset has 'text' and 'label' columns (adjust if necessary)
print(dataset[0])

# Load pretrained tokenizer and model
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
num_labels = len(data['label'].unique())  # Get the number of unique labels
model = BertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=num_labels)

# Tokenize the dataset
def tokenize_function(examples):
    return tokenizer(examples['text'], padding='max_length', truncation=True)

tokenized_datasets = dataset.map(tokenize_function, batched=True)

# Split dataset into train and test (if not already split)
train_size = int(0.8 * len(tokenized_datasets))  # 80% for training
train_dataset = tokenized_datasets.select(range(train_size))
test_dataset = tokenized_datasets.select(range(train_size, len(tokenized_datasets)))

# Define training arguments
training_args = TrainingArguments(
    output_dir='./results',          # output directory
    evaluation_strategy="epoch",     # evaluation strategy to adopt during training
    per_device_train_batch_size=16,  # batch size for training
    per_device_eval_batch_size=64,   # batch size for evaluation
    num_train_epochs=3,              # number of training epochs
    weight_decay=0.01,               # strength of weight decay
)

# Initialize Trainer
trainer = Trainer(
    model=model,                         # the pretrained model
    args=training_args,                  # training arguments
    train_dataset=train_dataset,         # training dataset
    eval_dataset=test_dataset,           # evaluation dataset
)

# Train the model
trainer.train()

# Evaluate the model
results = trainer.evaluate()
print(results)
