from pydantic import BaseModel

class TranscriptionResult(BaseModel):
    transcript: str
    job_name: str
    download_url: str