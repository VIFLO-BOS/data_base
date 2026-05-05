#!/usr/bin/env python3
"""
Database Utility Functions
Shared helpers for all Python scripts.
"""
import psycopg2
from contextlib import contextmanager

@contextmanager
def get_db_connection(db_url: str):
    """Context manager for database connections."""
    conn = psycopg2.connect(db_url)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
