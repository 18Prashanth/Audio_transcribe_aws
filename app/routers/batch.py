import boto3
from fastapi import APIRouter, UploadFile, File
import uuid
from ..utils.transcribe_batch import start_transcription_job
from ..utils.transcribe_batch import get_transcript_text
from ..utils.transcribe_batch import upload_file
from fastapi import BackgroundTasks
from fastapi.responses import JSONResponse
import asyncio
from concurrent.futures import ThreadPoolExecutor


router = APIRouter()


@router.post("/transcribe/")
async def upload_and_transcribe(file: UploadFile = File(...)):
    loop = asyncio.get_running_loop()
    executor = ThreadPoolExecutor()
    
    # Run blocking upload_file in thread
    s3 = await loop.run_in_executor(executor, upload_file, file)

    s3_uri = s3.get("url")

    job_name = f"transcription-{uuid.uuid4()}"

    # Run blocking start_transcription_job in thread
    transcript_uri = await loop.run_in_executor(executor, start_transcription_job, job_name, s3_uri,"en-US", file.filename.split('.')[-1])

    if transcript_uri:
        # Run get_transcript_text in thread too
        transcript_text = await loop.run_in_executor(executor, get_transcript_text, transcript_uri)
        return JSONResponse(content={"transcript": transcript_text})
    else:
        return {"error": "Transcription failed"}

