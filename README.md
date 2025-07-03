🎙️ Audio Transcription Web Application

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

👁️ Overview

## This app lets users upload audio 🎧 files, then asynchronously transcribes it with speaker labels 🗣️, using AWS Transcribe and FastAPI backend.

✨ Features

📂 Upload audio files via drag-n-drop or file selector

📊 Upload progress bar and real-time status updates

💬 Chat-style transcript display with timestamps and speaker labels

⚡ FastAPI backend for performance and scalability

## ☁️ AWS S3 for audio storage and transcription results

🏗️ Architecture

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

🛠️ Tech Stack

| Layer             | Technology              |
| ----------------- | ----------------------- |
| 🖥️ Frontend       | HTML5, CSS3, Vanilla JS |
| ⚙️ Backend        | FastAPI (Python 3.8+)   |
| ☁️ Cloud Storage  | AWS S3                  |
| 🎙️ Speech-to-Text | AWS Transcribe          |
| 🚀 Deployment     | Local / Cloud           |

⚙️ Setup and Installation

## Prerequisites

🐍 Python 3.8+

☁️ AWS account with S3 & Transcribe permissions

🔧 AWS CLI configured locally
