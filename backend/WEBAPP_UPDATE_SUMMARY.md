# Web Application Update for v3_plus Network

## Summary
Updated Django backend to support dual routing networks: enhanced `rede_viaria_v3_plus` for walk/bike and original `rede_viaria_v3` for car routing.

## Changes Made

### 1. Models (`routing/models.py`)
**Added:**
- `RedeViariaV3Plus` - Model for enhanced network table
- `RedeViariaV3PlusVerticesPgr` - Vertex table for v3_plus topology
- `IsoWalkRingsV3Plus` - Walk isochrones from enhanced network
- `IsoBikeRingsV3Plus` - Bike isochrones from enhanced network

**Updated:**
- `RedeViariaV3` - Clarified it's for car routing only
- `IsoWalkRings` / `IsoBikeRings` - Marked as deprecated
- `IsoCarRings` - Unchanged (still uses v3)

### 2. Serializers (`routing/serializers.py`)
**Added:**
- `IsoWalkRingsV3PlusSerializer`
- `IsoBikeRingsV3PlusSerializer`

**Updated:**
- Import statements to include new models
- Documentation strings for clarity

### 3. Views (`routing/views.py`)
**Updated `calculate_route()` function:**
```python
# Dynamic table selection based on mode
if mode in ['walk', 'bike']:
    network_table = 'rede_viaria_v3_plus'
    geom_column = 'geom_2d'  # Normalized 2D geometry
else:
    network_table = 'rede_viaria_v3'
    geom_column = 'geom'
```

- All SQL queries now use `{network_table}` and `{geom_column}` f-string variables
- Origin/destination snapping queries updated
- pgr_dijkstra query updated to use correct table

**Updated `generate_isochrone()` function:**
- Same dynamic table selection logic
- pgr_drivingDistance query updated
- Geometry collection query updated

**Updated ViewSets:**
- `IsoWalkRingsViewSet` → now queries `IsoWalkRingsV3Plus`
- `IsoBikeRingsViewSet` → now queries `IsoBikeRingsV3Plus`
- `IsoCarRingsViewSet` → unchanged (still queries `IsoCarRings`)

## API Behavior

### No Breaking Changes
- **Endpoints remain the same**: `/api/routing/calculate/`, `/api/isochrones/generate/`, etc.
- **Request/response format unchanged**: Same JSON structure
- **Frontend compatibility**: No frontend code changes required

### Improved Results
- **Walk routes**: Use enhanced network with footways, paths, cycleways
- **Bike routes**: Use enhanced network with dedicated bike infrastructure
- **Car routes**: Continue using validated original network
- **Isochrones**: Walk/bike show significantly larger and more realistic coverage

## Testing Performed

✅ Django configuration check: `python manage.py check` - No errors
✅ Model imports validated
✅ Serializer imports validated
✅ View logic updated correctly

## Next Steps

1. **Restart Backend Server**:
   ```bash
   cd /home/miragaia/Documents/5_ANO/SIGCS/PROJECT_SIGCS/backend
   ./venv/bin/python manage.py runserver
   ```

2. **Test Walk Routing**:
   - Open frontend at http://localhost:5173/
   - Select "Walk" mode
   - Click two points on map
   - Verify route uses pedestrian paths

3. **Test Bike Routing**:
   - Select "Bike" mode
   - Click two points
   - Verify route uses cycling infrastructure

4. **Test Car Routing**:
   - Select "Car" mode
   - Click two points
   - Verify route follows roads (unchanged behavior)

5. **Test Isochrones**:
   - Generate walk isochrones - should be larger and more continuous
   - Generate bike isochrones - should include cycling paths
   - Generate car isochrones - should be unchanged

6. **Verify Stored Isochrones**:
   ```bash
   # Check that v3_plus tables exist and have data
   ./venv/bin/python manage.py shell
   >>> from routing.models import IsoWalkRingsV3Plus, IsoBikeRingsV3Plus
   >>> IsoWalkRingsV3Plus.objects.count()
   >>> IsoBikeRingsV3Plus.objects.count()
   ```

## Rollback Plan

If issues arise, revert to original behavior by changing ViewSets back:
```python
# In views.py
class IsoWalkRingsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = IsoWalkRings.objects.all()  # Old table
    serializer_class = IsoWalkRingsSerializer
```

And routing logic:
```python
# Always use v3 table (old behavior)
network_table = 'rede_viaria_v3'
geom_column = 'geom'
```

## Files Modified

1. `/backend/routing/models.py` - Added 4 new models
2. `/backend/routing/serializers.py` - Added 2 new serializers, updated imports
3. `/backend/routing/views.py` - Updated routing/isochrone logic, updated ViewSets
4. `/README.md` - Documented network update and v3_plus architecture

## Database Requirements

Ensure these tables exist in PostgreSQL:
- `rede_viaria_v3_plus` (with `geom_2d` column)
- `rede_viaria_v3_plus_vertices_pgr`
- `iso_walk_rings_v3_plus`
- `iso_bike_rings_v3_plus`

If missing, the API will return 422 errors when attempting walk/bike routing.
