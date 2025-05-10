from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.endpoints import call_summary
from .api.endpoints import commlog
from .database import engine
from .models import call_summary as models, commlog as commlog_models

models.Base.metadata.create_all(bind = engine)
commlog_models.Base.metadata.create_all(bind = engine)

app = FastAPI(title = "CareIN AI Call Summary API")

allowed_origins = [
    "http://localhost:3001",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins = allowed_origins,
    allow_credentials = False,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

@app.get("/")
async def root():
    return {"message" : "Welcome to CareIn AI Call Summary API"}

# Include routers
app.include_router(call_summary.router, prefix="/api/v1", tags=["call-summaries"])
app.include_router(commlog.router, prefix="/api/v1", tags=["commlog"])