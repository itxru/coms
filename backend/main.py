from fastapi import FastAPI
from routers.auth import router as auth_router

app = FastAPI(
    title="COMS API",
    description="This is the COMS API for managing communications.",
    version="1.0.0",
)

app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"message": "API is working!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
