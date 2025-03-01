from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from backend import session as db_session, User, add_user, login
from datetime import datetime, timedelta
import jwt

session = {}

app = FastAPI()

from fastapi import File, UploadFile
from fastapi import Depends, Security
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")


class UserCreate(BaseModel):
    username: str
    password: str

@app.post("/register/")
def create_user(user: UserCreate):
    if db_session.query(User).filter_by(username=user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    add_user(user.username, user.password)
    return {"message": "User created successfully"}

class UserLogin(BaseModel):
    username: str
    password: str

SECRET_KEY = "your_secret_key"  # Change this to a secure key

@app.post("/login/")
def login_user(user: UserLogin):
    if login(user.username, user.password):
        # Generate a token
        token = jwt.encode({
            'sub': user.username,
            'exp': datetime.utcnow() + timedelta(hours=1)
        }, SECRET_KEY, algorithm='HS256')
        return {"message": "Login successful", "token": token}
    raise HTTPException(status_code=401, detail="Invalid username or password")


@app.post("/upload/")
async def upload_photo(file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File type not supported")
    
    filename = uuid.uuid4().hex + file.filename.split(".")[-1]

    file_location = f"uploads/{filename}"
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())
    
    return {"message": "Photo uploaded successfully"}

