### 🎙️ Audio Transcription Web Application

---

A full-stack web app for uploading and transcribing audio with speaker diarization, powered by AWS Transcribe & FastAPI 🚀

📑 Table of Contents

- 👁️ Overview

- ✨ Features

- 🏗️ Architecture

- 🛠️ Tech Stack

- ⚙️ Setup and Installation

- 🚀 Usage

- 🔗 API Endpoints

- 📂 Folder Structure

- ❓ Troubleshooting & FAQ

- 📬 Contact

---

### 👁️ Overview

This app lets users upload audio 🎧 files, then asynchronously transcribes it with speaker labels 🗣️, using AWS Transcribe and FastAPI backend.

✨ Features

📂 Upload audio files via drag-n-drop or file selector

📊 Upload progress bar and real-time status updates

💬 Chat-style transcript display with timestamps and speaker labels

⚡ FastAPI backend for performance and scalability

☁️ AWS S3 for audio storage and transcription results

---

### 🏗️ Architecture

```
User (Browser)
   ⇩ Uploads audio or records live audio
Frontend (HTML/CSS/JS)
   ⇩ Sends file/form data via API call
Backend (FastAPI)
   ⇩ Uploads audio to S3 bucket
   ⇩ Starts transcription job with AWS Transcribe (async)
   ⇩ Polls job status until complete
   ⇩ Fetches and parses transcription JSON with speaker labels
   ⇩ Sends transcript to frontend
Frontend
   ⇩ Displays transcript with speakers & timestamps in chat UI
```

---

### 🛠️ Tech Stack

| Layer             | Technology              |
| ----------------- | ----------------------- |
| 🖥️ Frontend       | HTML5, CSS3, Vanilla JS |
| ⚙️ Backend        | FastAPI (Python 3.8+)   |
| ☁️ Cloud Storage  | AWS S3                  |
| 🎙️ Speech-to-Text | AWS Transcribe          |
| 🚀 Deployment     | Local / Cloud           |

---

### ⚙️ Setup and Installation

## Prerequisites

🐍 Python 3.8+

☁️ AWS account with S3 & Transcribe permissions

🔧 AWS CLI configured locally

## Steps

### 1. Clone repo

```
git clone https://github.com/18Prashanth/Audio_transcribe_aws.git
cd Audio_transcribe_aws

```

### 2. Create virtual env & activate

```
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 3. Install Python deps

```
pip install -r requirements.txt
```

### 4. Configure AWS

note: To configure aws required aws screte and access key

```
aws configure
```

### 5. Create s3 buckets and update configs

- Modify S3 bucket names and AWS region in backend code
- Two s3 buckets required one for store input audio and one more for store output

### 6. Run backend

```
uvicorn app.main:app --reload
```

### 7. Serve frontend

```
http://localhost:8000
```

---

## 🚀 Usage

- Open frontend in your browser 🌐

- Upload or drag & drop audio files 🎵

- See upload & transcription progress ⏳

- Get the transcription

---

## 🔗 API Endpoints

| Endpoint           | Method | Description                             |
| ------------------ | ------ | --------------------------------------- |
| `/api/transcribe/` | POST   | Upload audio file and get transcription |

---

### 📂 Folder Structure

```
/
├── app/                       # Backend source code
│   ├── routers/               # API routes
│   ├── utils/                 # AWS Transcribe + S3 helpers
│   ├── main.py                # FastAPI app entrypoint
├── static/                    # Frontend static assets (CSS, JS)
├── templates/                 # HTML templates (if any)
├── requirements.txt           # Python dependencies
├── index.html                 # Frontend main page
└── README.md                  # Project documentation

```

---

### ❓ Troubleshooting & FAQ

### Q: Transcription job failed or stuck?

- Check AWS permissions and service limits 🚦

- Validate audio format & file integrity 🔍

- Review backend logs for errors 📝

### Q: Can I change AWS region?

- Yes, update region_name in boto3 client 🗺️

---

### 📬 Contact

Prashanth gowda — prashanthgowdaas@outlook.com

GitHub: https://github.com/18Prashanth
