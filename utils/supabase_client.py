"""Supabase Client Utility"""

from utils.supabase_auth import supabase


def get_supabase_client():
    """Get Supabase client instance"""
    if not supabase:
        raise ValueError("Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.")
    return supabase
