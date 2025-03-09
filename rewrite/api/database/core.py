import os
import logging
from typing import Optional, AsyncContextManager, Union
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import AsyncAdaptedQueuePool
from contextlib import asynccontextmanager
import threading
import asyncio
from sqlalchemy import text

logger = logging.getLogger(__name__)

class DatabaseConnectionError(Exception):
    """Raised when there is an issue with database connection."""
    pass

class AsyncDatabase:
    _instance: Optional['AsyncDatabase'] = None
    _lock = threading.Lock()
    
    def __init__(self):
        if AsyncDatabase._instance is not None:
            raise RuntimeError("AsyncDatabase is a singleton. Use AsyncDatabase.get_instance()")
        
        try:
            self.engine = self._create_engine()
            self.async_session_maker = async_sessionmaker(
                self.engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            logger.info("Database connection initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize database connection: {str(e)}")
            raise DatabaseConnectionError(f"Database connection failed: {str(e)}") from e
    
    @staticmethod
    def get_instance() -> 'AsyncDatabase':
        if AsyncDatabase._instance is None:
            with AsyncDatabase._lock:
                if AsyncDatabase._instance is None:
                    AsyncDatabase._instance = AsyncDatabase()
        return AsyncDatabase._instance
    
    def _create_engine(self):
        database_url = os.getenv('DATABASE_URL', 'sqlite+aiosqlite:///userdb.sqlite')
        
        return create_async_engine(
            database_url,
            poolclass=AsyncAdaptedQueuePool,
            pool_size=int(os.getenv('DB_POOL_SIZE', '20')),
            max_overflow=int(os.getenv('DB_MAX_OVERFLOW', '10')),
            pool_timeout=int(os.getenv('DB_POOL_TIMEOUT', '30')),
            pool_recycle=int(os.getenv('DB_POOL_RECYCLE', '1800')),  # Recycle connections after 30 minutes
            pool_pre_ping=True,  # Check connection validity before use
            echo=os.getenv('DEBUG', 'false').lower() == 'true'
        )
    
    def get_session(self) -> Union[AsyncSession, AsyncContextManager[AsyncSession]]:
        return self.async_session_maker()
    
    @asynccontextmanager
    async def session(self) -> AsyncContextManager[AsyncSession]:
        session = self.async_session_maker()
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {str(e)}")
            raise
        finally:
            await session.close()
    
    async def ping(self) -> bool:
        """Check if database connection is healthy."""
        try:
            async with self.session() as session:
                # Execute a simple query to check connection
                await session.execute(text("SELECT 1"))
                return True
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            return False
    
    async def close(self):
        """Close all connections in the engine pool."""
        if self.engine:
            await self.engine.dispose()
            logger.info("Database connection pool closed")
    
    async def wait_for_database(self, max_attempts=5, retry_interval=2):
        """Wait for database to become available."""
        for attempt in range(1, max_attempts + 1):
            try:
                if await self.ping():
                    logger.info("Successfully connected to database")
                    return True
                logger.warning(f"Database connection attempt {attempt}/{max_attempts} failed, retrying...")
            except Exception as e:
                logger.error(f"Database connection error on attempt {attempt}/{max_attempts}: {str(e)}")
            
            if attempt < max_attempts:
                await asyncio.sleep(retry_interval)
        
        logger.error(f"Failed to connect to database after {max_attempts} attempts")
        return False 