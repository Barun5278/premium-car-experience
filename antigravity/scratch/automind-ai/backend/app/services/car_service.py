from typing import List, Optional, Dict, Any
from app.schemas.car import CarResponse, CarFilterQuery
from app.db.session import get_supabase_client


class CarService:
    @staticmethod
    async def get_cars(filters: Optional[CarFilterQuery] = None) -> Dict[str, Any]:
        """
        Queries cars from database or fallback catalog with dynamic filtering
        """
        # Architectural hook for Supabase / PostgreSQL query
        client = get_supabase_client()
        if client:
            query = client.table("cars").select("*")
            if filters:
                if filters.make:
                    query = query.ilike("make", f"%{filters.make}%")
                if filters.body_type:
                    query = query.eq("body_type", filters.body_type)
            result = query.execute()
            return {"items": result.data or [], "total": len(result.data or []), "page": 1, "limit": 20, "totalPages": 1}

        # Return empty structured catalog response when DB is not yet populated
        return {"items": [], "total": 0, "page": 1, "limit": 20, "totalPages": 0}

    @staticmethod
    async def get_car_by_id(car_id: str) -> Optional[Dict[str, Any]]:
        client = get_supabase_client()
        if client:
            result = client.table("cars").select("*").eq("id", car_id).single().execute()
            return result.data
        return None

    @staticmethod
    async def get_featured_cars() -> List[Dict[str, Any]]:
        client = get_supabase_client()
        if client:
            result = client.table("cars").select("*").eq("is_featured", True).limit(6).execute()
            return result.data or []
        return []
