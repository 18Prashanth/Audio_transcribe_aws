import time
import requests
from fastapi import FastAPI, UploadFile, File, HTTPException
import boto3
import uuid
from urllib.parse import urlparse

transcribe_client = boto3.client('transcribe', region_name='us-east-1')

# Your S3 bucket name
BUCKET_NAME = "audiotranscribe0"

OUTPUT_BUCKET = "audiooutput0"

# Initialize S3 client (you can specify region_name if needed)
s3_client = boto3.client('s3')

def upload_file(file: UploadFile = File(...)):
    try:
        # Generate a unique filename to avoid overwrites
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"

        # Upload fileobj directly to S3
        s3_client.upload_fileobj(file.file, BUCKET_NAME, unique_filename)

        file_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{unique_filename}"
        return {"filename": unique_filename, "url": file_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")


def start_transcription_job(job_name: str, s3_uri: str, language_code='en-US', media_format='mp3', output_bucket=OUTPUT_BUCKET):
    transcribe_client.start_transcription_job(
        TranscriptionJobName=job_name,
        LanguageCode=language_code,
        MediaFormat=media_format,
        Media={'MediaFileUri': s3_uri},
        OutputBucketName=output_bucket  # Optional: You can set where transcript JSON will be stored
    )

    # Poll job status until it completes or fails
    while True:
        status = transcribe_client.get_transcription_job(TranscriptionJobName=job_name)
        job_status = status['TranscriptionJob']['TranscriptionJobStatus']

        if job_status in ['COMPLETED', 'FAILED']:
            break
        print("Waiting for transcription to complete...")
        time.sleep(5)

    if job_status == 'COMPLETED':
        transcript_uri = status['TranscriptionJob']['Transcript']['TranscriptFileUri']
        return transcript_uri
    else:
        return None
    

def get_transcript_text(transcript_url):
    parsed_url = urlparse(transcript_url)

    # Example: for virtual-hosted style
    # parsed_url.netloc = 'audiooutput0.s3.amazonaws.com'
    # parsed_url.path = '/transcription-xxxx.json'

    # Extract bucket name from hostname (before .s3.amazonaws.com)
    bucket_name =  parsed_url.path.split('/')[1] 

    # Remove leading slash from path to get the object key
    object_key = '/'.join(parsed_url.path.split('/')[2:])

    s3_client = boto3.client('s3')

    presigned_url = s3_client.generate_presigned_url(
        'get_object',
        Params={'Bucket': bucket_name, 'Key': object_key},
        ExpiresIn=3600
    )

    response = requests.get(presigned_url)
    response.raise_for_status()
    data = response.json()
    return data['results']['transcripts'][0]['transcript']

