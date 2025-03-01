from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Database setup
engine = create_engine('sqlite:///users.db')
Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)
session = Session()

# Example of adding a new user
def add_user(username, password):
    new_user = User(username=username)
    new_user.set_password(password)
    session.add(new_user)
    session.commit()

# Example of user login
def login(username, password):
    user = session.query(User).filter_by(username=username).first()
    if user and user.check_password(password):
        return True
    return False

