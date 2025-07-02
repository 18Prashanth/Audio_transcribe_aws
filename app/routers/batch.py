import boto3
from fastapi import APIRouter, UploadFile, File
import uuid
from ..utils.transcribe_batch import start_transcription_job
from ..utils.transcribe_batch import get_transcript_text
from ..utils.transcribe_batch import upload_file





router = APIRouter()


@router.post("/transcribe/")
async def upload_and_transcribe(file: UploadFile = File(...)):
    file_extension = file.filename.split('.')[-1]
    s3 = upload_file(file)

    s3_uri = s3.get("url")

    # Start transcription
    job_name = f"transcription-{uuid.uuid4()}"
    transcript_uri = start_transcription_job(job_name, s3_uri, media_format=file_extension)

    if transcript_uri:
        transcript_text = get_transcript_text(transcript_uri)
        return {"transcript": transcript_text}
    else:
        return {"error": "Transcription failed"}

