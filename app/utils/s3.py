from fastapi import FastAPI, UploadFile, File, HTTPException
import boto3
import uuid

app = FastAPI()

# Your S3 bucket name
BUCKET_NAME = "audiotranscribe0"

# Initialize S3 client (you can specify region_name if needed)
s3_client = boto3.client('s3')

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
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
