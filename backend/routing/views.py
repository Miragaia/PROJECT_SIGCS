from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.db import connection
from django.conf import settings
from functools import lru_cache
import csv
import json
import os
from .models import (
    RedeViariaV3, RedeViariaAvVerticesPgr, PoisAveiro,
    IsoWalkRings, IsoBikeRings, IsoCarRingsOsm,
    AcessibilidadeORSWalking, AcessibilidadeORSBike, AcessibilidadeORSCar
)
from .serializers import (
    RedeViariaV3Serializer, PoisAveiroSerializer,
    IsoWalkRingsSerializer, IsoBikeRingsSerializer, IsoCarRingsOsmSerializer,
    RouteRequestSerializer, IsochroneRequestSerializer
)


class PoisAveiroViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Points of Interest.
    Supports filtering by category and spatial queries.
    """
    queryset = PoisAveiro.objects.all()
    serializer_class = PoisAveiroSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(cat=category)
        
        # Spatial filter: POIs near a point
        lat = self.request.query_params.get('lat', None)
        lng = self.request.query_params.get('lng', None)
        radius_km = self.request.query_params.get('radius', None)
        
        if lat and lng and radius_km:
            point = Point(float(lng), float(lat), srid=4326)
            queryset = queryset.filter(
                geom__distance_lte=(point, D(km=float(radius_km)))
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all unique POI categories."""
        categories = PoisAveiro.objects.values_list('cat', flat=True).distinct()
        return Response({'categories': list(categories)})


class IsoWalkRingsViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for walking isochrones."""
    queryset = IsoWalkRings.objects.all()
    serializer_class = IsoWalkRingsSerializer


class IsoBikeRingsViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for cycling isochrones."""
    queryset = IsoBikeRings.objects.all()
    serializer_class = IsoBikeRingsSerializer


class IsoCarRingsOsmViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for car isochrones."""
    queryset = IsoCarRingsOsm.objects.all()
    serializer_class = IsoCarRingsOsmSerializer


@api_view(['POST'])
def calculate_route(request):
    """
    Calculate optimal route between two points using pgRouting.
    
    POST /api/routing/calculate/
    {
        "origin_lat": 40.6412,
        "origin_lng": -8.6540,
        "destination_lat": 40.6301,
        "destination_lng": -8.6578,
        "mode": "bike"
    }
    """
    serializer = RouteRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    origin_lat = data['origin_lat']
    origin_lng = data['origin_lng']
    dest_lat = data['destination_lat']
    dest_lng = data['destination_lng']
    mode = data['mode']
    
    # Map mode to cost field
    # NULL values indicate the road segment doesn't allow that transport mode
    cost_mapping = {
        'walk': 'cost_walk',
        'bike': 'cost_bike',
        'car': 'cost'
    }
    cost_field = cost_mapping.get(mode, 'cost')
    
    try:
        with connection.cursor() as cursor:
            # Find nearest EDGE (road segment) for origin, considering transport mode
            # Get both source and target vertices to try both ends of the road
            cursor.execute(f"""
                SELECT source, target, 
                       ST_Distance(ST_Transform(geom, 4326), ST_SetSRID(ST_MakePoint(%s, %s), 4326)) as dist
                FROM rede_viaria_v3
                WHERE {cost_field} IS NOT NULL
                ORDER BY ST_Transform(geom, 4326) <-> ST_SetSRID(ST_MakePoint(%s, %s), 4326)
                LIMIT 1
            """, [origin_lng, origin_lat, origin_lng, origin_lat])
            origin_edge = cursor.fetchone()
            if not origin_edge:
                return Response({
                    'error': 'No valid road found near origin point',
                    'message': f'Could not find a {mode}-accessible road near the starting point.'
                }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
            
            origin_source, origin_target = origin_edge[0], origin_edge[1]
            
            # Find nearest EDGE for destination
            cursor.execute(f"""
                SELECT source, target,
                       ST_Distance(ST_Transform(geom, 4326), ST_SetSRID(ST_MakePoint(%s, %s), 4326)) as dist
                FROM rede_viaria_v3
                WHERE {cost_field} IS NOT NULL
                ORDER BY ST_Transform(geom, 4326) <-> ST_SetSRID(ST_MakePoint(%s, %s), 4326)
                LIMIT 1
            """, [dest_lng, dest_lat, dest_lng, dest_lat])
            dest_edge = cursor.fetchone()
            if not dest_edge:
                return Response({
                    'error': 'No valid road found near destination point',
                    'message': f'Could not find a {mode}-accessible road near the destination.'
                }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
            
            dest_source, dest_target = dest_edge[0], dest_edge[1]
            
            # Try all combinations of source/target vertices to find a valid route
            # This handles cases where one end of the edge is better connected
            routes_found = None
            best_vertices = None
            
            for origin_vertex in [origin_source, origin_target]:
                for dest_vertex in [dest_source, dest_target]:
                    # Calculate route using pgr_dijkstra, filtering by transport mode
                    # Only include edges where the cost column is NOT NULL (road allows this mode)
                    cursor.execute(f"""
                        SELECT 
                            r.seq,
                            r.node,
                            r.edge,
                            r.cost,
                            rv.osm_name,
                            ST_AsGeoJSON(rv.geom) as geometry,
                            rv.km
                        FROM pgr_dijkstra(
                            'SELECT id_0 as id, source, target, 
                                    {cost_field} as cost, 
                                    {cost_field} as reverse_cost 
                             FROM rede_viaria_v3 
                             WHERE {cost_field} IS NOT NULL',
                            %s, %s, directed := false
                        ) r
                        LEFT JOIN rede_viaria_v3 rv ON r.edge = rv.id_0
                        WHERE r.edge IS NOT NULL
                    """, [origin_vertex, dest_vertex])
                    
                    temp_routes = cursor.fetchall()
                    
                    if temp_routes:
                        routes_found = temp_routes
                        best_vertices = (origin_vertex, dest_vertex)
                        break
                
                if routes_found:
                    break
            
            if not routes_found:
                return Response({
                    'error': 'No route found between the specified points',
                    'message': 'Could not find a valid route using the selected transport mode. The points may not be connected in the network or may be too far apart.'
                }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
            
            # Calculate total distance and duration
            total_distance_km = sum(r[6] for r in routes_found if r[6])  # km from table
            total_time_minutes = sum(r[3] for r in routes_found)  # adjusted cost
            
            # Format response
            route_data = {
                'type': 'FeatureCollection',
                'features': [],
                'properties': {
                    'mode': mode,
                    'distance': round(total_distance_km, 2),  # in km
                    'duration': round(total_time_minutes, 1),  # in minutes
                    'origin': {'lat': origin_lat, 'lng': origin_lng},
                    'destination': {'lat': dest_lat, 'lng': dest_lng}
                }
            }
            
            for route in routes_found:
                if route[5]:  # geometry
                    route_data['features'].append({
                        'type': 'Feature',
                        'properties': {
                            'seq': route[0],
                            'node': route[1],
                            'edge': route[2],
                            'cost': route[3],
                            'name': route[4],
                            'distance_km': route[6]
                        },
                        'geometry': eval(route[5])  # Parse GeoJSON string
                    })
            
            return Response(route_data)
    
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def generate_isochrone(request):
    """
    Generate isochrone from a point using pgRouting.
    
    POST /api/isochrones/generate/
    {
        "origin_lat": 40.6412,
        "origin_lng": -8.6540,
        "mode": "walk",
        "minutes": [10, 20, 30]
    }
    """
    serializer = IsochroneRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    origin_lat = data['origin_lat']
    origin_lng = data['origin_lng']
    mode = data['mode']
    minutes_list = data['minutes']
    
    # Map mode to cost field and function
    if mode == 'walk':
        function_name = 'mk_isochrone_walk'
    elif mode == 'bike':
        function_name = 'mk_isochrone_bike'
    else:
        return Response({
            'error': 'Isochrone generation for car mode not yet implemented'
        }, status=status.HTTP_501_NOT_IMPLEMENTED)
    
    try:
        isochrones = []
        
        with connection.cursor() as cursor:
            for minutes in minutes_list:
                cursor.execute(f"""
                    SELECT ST_AsGeoJSON({function_name}(%s, %s, %s))
                """, [origin_lng, origin_lat, minutes])
                
                result = cursor.fetchone()
                if result and result[0]:
                    isochrones.append({
                        'type': 'Feature',
                        'properties': {
                            'minutes': minutes,
                            'mode': mode
                        },
                        'geometry': eval(result[0])
                    })
        
        return Response({
            'type': 'FeatureCollection',
            'features': isochrones
        })
    
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def transport_modes(request):
    """Get available transport modes and their properties."""
    modes = {
        'walk': {
            'name': 'Walking',
            'speed_kmh': 5,
            'cost_field': 'cost_walk',
            'icon': 'walk'
        },
        'bike': {
            'name': 'Cycling',
            'speed_kmh': 15,
            'cost_field': 'cost_bike',
            'icon': 'bicycle'
        },
        'car': {
            'name': 'Driving',
            'speed_kmh': 40,
            'cost_field': 'cost',
            'icon': 'car'
        }
    }
    return Response(modes)


@lru_cache(maxsize=1)
def _load_amenities_from_csv():
    """Load amenities from reviews_enriched.csv once and cache."""
    csv_path = os.path.join(settings.BASE_DIR.parent, 'reviews_enriched.csv')
    amenities = []
    if not os.path.exists(csv_path):
        return amenities

    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Basic sanity check for coordinates
            try:
                lat = float(row.get('lat'))
                lon = float(row.get('lon'))
            except (TypeError, ValueError):
                continue

            amenities.append({
                'name': row.get('place_name') or row.get('poi_name') or 'Amenity',
                'primary_type': row.get('place_primary_type') or row.get('poi_amenity') or row.get('poi_shop'),
                'rating': float(row.get('place_rating')) if row.get('place_rating') else None,
                'lat': lat,
                'lon': lon,
                'raw': {
                    'place_id': row.get('place_id'),
                    'amenity': row.get('poi_amenity'),
                    'shop': row.get('poi_shop'),
                    'tourism': row.get('poi_tourism'),
                }
            })
    return amenities


@api_view(['GET'])
def amenities(request):
    """
    Serve amenities from reviews_enriched.csv as a GeoJSON FeatureCollection.
    Deduplicates by name and coordinates to avoid multiple entries per review.

    Optional query params:
      - type: filter by primary_type/amenity/shop/tourism
      - min_rating: float, filter by place rating
      - limit: int, limit number of features (default 500)
    """
    features = []
    data = _load_amenities_from_csv()

    filter_type = request.query_params.get('type')
    min_rating = request.query_params.get('min_rating') or '3.5'  # default filter for relevance
    limit_param = request.query_params.get('limit')
    limit = int(limit_param) if limit_param else None

    allowed_types = {
        'restaurant', 'food', 'cafe', 'coffee', 'fuel', 'gas', 'pharmacy', 'health',
        'school', 'university', 'education', 'shop', 'store', 'market', 'supermarket',
        'bakery', 'bar', 'pub', 'hospital', 'clinic', 'bus', 'parking'
    }

    def normalized_type(item):
        t = item.get('primary_type') or item['raw'].get('amenity') or item['raw'].get('shop') or item['raw'].get('tourism')
        if t:
            return t.lower()
        return ''

    # Track unique amenities by (name, rounded coordinates) to avoid duplicates
    seen = set()
    for item in data:
        ntype = normalized_type(item)

        # Relevance filter: only keep allowed types unless overridden via type filter
        if filter_type:
            types = [item.get('primary_type'), item['raw'].get('amenity'), item['raw'].get('shop'), item['raw'].get('tourism')]
            if filter_type not in types:
                continue
        else:
            if not any(key in ntype for key in allowed_types):
                continue

        if min_rating:
            try:
                if item['rating'] is None or item['rating'] < float(min_rating):
                    continue
            except ValueError:
                pass

        # Deduplicate: use (name, rounded coordinates) as unique key
        # Round to 5 decimals to account for minor coordinate variations
        unique_key = (item['name'], round(item['lat'], 5), round(item['lon'], 5))
        if unique_key in seen:
            continue
        seen.add(unique_key)

        features.append({
            'type': 'Feature',
            'properties': {
                'name': item['name'],
                'type': item['primary_type'],
                'rating': item['rating'],
            },
            'geometry': {
                'type': 'Point',
                'coordinates': [item['lon'], item['lat']],
            }
        })

        if limit and len(features) >= limit:
            break

    return Response({
        'type': 'FeatureCollection',
        'features': features,
        'metadata': {
            'count': len(features),
        }
    })
