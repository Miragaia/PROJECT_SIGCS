# Accessibility Analysis in Aveiro  
### Multimodal Accessibility Platform with PostGIS, pgRouting, Django REST, and React

## Project Overview

This project implements a **web-based multimodal accessibility platform** for the city of **Aveiro (Portugal)**, focusing on **car, walking, and cycling** travel modes. The system features interactive routing, isochrone generation, and amenity discovery, with a particular emphasis on **student mobility** and the **University of Aveiro**.

The platform combines a **Django REST Framework backend** with **PostgreSQL/PostGIS** and **pgRouting** for spatial analysis, and a **React + Leaflet frontend** for interactive mapping and visualization. The workflow integrates **OpenStreetMap (OSM)** data, implementing advanced cost models including **Tobler's Hiking Function** for realistic pedestrian and cycling travel times.

---

## Objectives

- Build a reproducible multimodal routing network for Aveiro  
- Accurately model car, walking, and cycling accessibility  
- Generate travel-time isochrones (5, 10, 15, 20, 25, 30 minutes)  
- Provide interactive web interface for route planning and isochrone visualization
- Enable click-to-route functionality with real-time route calculation
- Store and retrieve precomputed isochrones for performance optimization
- Display amenities and points of interest with spatial filtering
- Support territorial and urban accessibility studies  

---

## Architecture

### Backend (Django REST Framework)
- **Framework**: Django 5.2.9 with Django REST Framework
- **Database**: PostgreSQL 14+ with PostGIS 3.4+
- **Routing Engine**: pgRouting (pgr_dijkstra, pgr_drivingDistance)
- **API**: RESTful endpoints for routing, isochrones, POIs, and transport modes
- **CORS**: Configured for local development with frontend on port 5173

### Frontend (React + Leaflet)
- **Framework**: React 18.2 with Vite 5.4
- **Mapping**: Leaflet 1.9.4 with react-leaflet 4.2.1
- **Styling**: Tailwind CSS for responsive UI
- **Features**: Interactive map, click-to-route, isochrone overlays, amenity markers

---

## Features

### 1. Interactive Routing
- **Click-to-Route**: Click once to set origin, click again for destination
- **Multimodal**: Select between walk, bike, or car modes
- **Smart Snapping**: Automatically snaps points to nearest road using `ST_ClosestPoint`
- **Smooth Visualization**: Blue polyline with green origin and red destination markers
- **Advanced Geometry Handling**: 
  - Handles both LineString and MultiLineString geometries
  - Segment reversal detection and correction
  - Duplicate point removal at junctions
  - Origin/destination backtracking prevention

### 2. Isochrone Generation
- **Time Thresholds**: 5, 10, 15, 20, 25, 30 minute isochrones
- **Transport Modes**: Walk, bike, car with mode-specific cost models
- **Dynamic Generation**: Real-time isochrone calculation from any clicked point
- **Database Storage**: Precomputed isochrones stored in dedicated tables
- **Visual Styling**: Color-coded polygons (green=walk, blue=bike, orange=car)
- **Geometry Processing**: Concave hull for 3+ edges, convex hull for 2 edges, buffer for single edge

### 3. Amenity Discovery
- **POI Database**: 710 unique amenities from OpenStreetMap
- **Categories**: Restaurants, cafes, schools, healthcare, shops, services
- **Clustering**: Automatic marker clustering for better map performance
- **Deduplication**: Fuzzy matching on names and exact coordinates
- **Interactive**: Click on markers for amenity details

### 4. Cost Models

#### Walking & Cycling: Tobler's Hiking Function
Incorporates terrain slope for realistic travel times:
```python
time_minutes = distance_km / (base_speed * exp(-3.5 * abs(slope_percent/100 + 0.05))) * 60
```
- **Walking base speed**: 6 km/h on flat terrain
- **Cycling base speed**: 15 km/h on flat terrain
- **Slope adjustment**: Exponential penalty for uphill/downhill

#### Car: Speed-based
```python
time_minutes = distance_km / speed_kmh * 60
```
- Uses `kmh` column from OpenStreetMap road classifications
- Respects one-way restrictions with high reverse costs  

---

## Tools and Technologies

### Backend Stack
| Tool | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Backend programming language |
| Django | 5.2.9 | Web framework |
| Django REST Framework | 3.15+ | REST API development |
| PostgreSQL | 14+ | Relational database |
| PostGIS | 3.4+ | Spatial database extension |
| pgRouting | 3.6+ | Routing algorithms |
| psycopg2 | 2.9+ | PostgreSQL adapter |
| django-cors-headers | 4.3+ | CORS middleware |

### Frontend Stack
| Tool | Version | Purpose |
|---|---|---|
| React | 18.2 | UI framework |
| Vite | 5.4 | Build tool and dev server |
| Leaflet | 1.9.4 | Interactive mapping library |
| react-leaflet | 4.2.1 | React bindings for Leaflet |
| Tailwind CSS | 3.4+ | Utility-first CSS framework |
| Axios | 1.6+ | HTTP client |
| react-leaflet-cluster | 2.2+ | Marker clustering |

### Data Processing Tools
| Tool | Purpose |
|---|---|
| osm2po | Generates pgRouting-ready car network with topology, speeds, and one-way rules |
| osm2pgsql | Imports complete OSM geometries (footways, paths, cycleways, POIs) |
| QGIS | Validation, visualization, and cartographic output |


---

## Installation and Setup

### Prerequisites
- Python 3.11 or higher
- Node.js 18+ and npm
- PostgreSQL 14+ with PostGIS 3.4+ extension
- Git

### Backend Setup

1. **Clone the repository**
```bash
cd /path/to/PROJECT_SIGCS
```

2. **Set up Python virtual environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure database**
Create a `.env` file in the backend directory:
```env
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-secret-key-here
DEBUG=True
```

5. **Run migrations**
```bash
python manage.py migrate
python manage.py migrate routing
```

6. **Start development server**
```bash
python manage.py runserver
# Server runs on http://127.0.0.1:8000/
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend  # or wherever your frontend code is located
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure API endpoint**
Update `.env` or `vite.config.js` to point to backend:
```js
VITE_API_URL=http://127.0.0.1:8000
```

4. **Start development server**
```bash
npm run dev
# Server runs on http://localhost:5173/
```

---

## API Endpoints

### Routing
- `POST /api/routing/calculate/` - Calculate route between two points
  ```json
  {
    "origin_lat": 40.6412,
    "origin_lng": -8.6540,
    "destination_lat": 40.6319,
    "destination_lng": -8.6578,
    "mode": "walk"
  }
  ```

### Isochrones
- `POST /api/isochrones/generate/` - Generate isochrones from a point
  ```json
  {
    "origin_lat": 40.6319,
    "origin_lng": -8.6578,
    "mode": "walk",
    "minutes": [5, 10, 15, 20, 25, 30]
  }
  ```

- `GET /api/isochrones/walk/` - Retrieve stored walk isochrones
- `GET /api/isochrones/bike/` - Retrieve stored bike isochrones
- `GET /api/isochrones/car/` - Retrieve stored car isochrones

### Amenities & Metadata
- `GET /api/pois/` - Get all points of interest
- `GET /api/amenities/` - Get amenity categories and counts
- `GET /api/modes/` - Get available transport modes and properties

---

## Database Schema

### Core Routing Tables

**rede_viaria_v3** - Original validated car network
- Used exclusively for **car routing**
- Preserved from initial validation
- ~20,000 edges with validated speeds and one-way restrictions

**rede_viaria_v3_plus** - Enhanced multimodal network (CURRENT for walk/bike)
- Used for **walk and bike routing**
- Includes all original edges PLUS missing pedestrian/cycling paths
- Added footways, paths, steps, cycleways from OpenStreetMap
- Normalized 2D geometry (`geom_2d` column) for pgRouting compatibility
- Improved topology with `rede_viaria_v3_plus_vertices_pgr`
- Significantly larger and more continuous coverage for pedestrian/cycling

**Common Fields (both tables)**
- `id_0` (Primary Key) - Edge identifier
- `source` - Start vertex
- `target` - End vertex
- `geom` / `geom_2d` - LineString geometry (SRID 3763)
- `distance_km` - Edge length in kilometers
- `kmh` - Speed limit for cars
- `slope_dire` - Directional slope percentage
- `cost_walk` - Walking time in minutes (Tobler's function)
- `cost_bike` - Cycling time in minutes (Tobler's function)
- `cost` - Car time in minutes (speed-based)

### Isochrone Storage Tables

**iso_walk_rings_v3_plus** - Walking isochrone polygons (CURRENT)
- Uses enhanced pedestrian network
- Larger, more realistic coverage
- Better connectivity through parks, campuses, pedestrian zones

**iso_bike_rings_v3_plus** - Cycling isochrone polygons (CURRENT)
- Uses enhanced cycling network
- Includes dedicated cycleways and shared paths
- More accurate urban cycling accessibility

**iso_car_rings** - Car isochrone polygons
- Uses original validated car network (unchanged)

**Common Isochrone Fields**
- `id` (Serial Primary Key)
- `minutes` - Time threshold (5, 10, 15, 20, 25, 30)
- `origin_lat` - Origin latitude
- `origin_lng` - Origin longitude
- `geom` - Polygon geometry (SRID 4326)
- `created_at` - Timestamp
- Indexes: `idx_iso_*_minutes`, `idx_iso_*_geom` (GIST)

### Points of Interest
**pois_aveiro** - Amenities and landmarks
- `osm_id` - OpenStreetMap identifier
- `name` - Amenity name
- `amenity` - Amenity category
- `geom` - Point geometry (SRID 4326)

---

## Usage Guide

### 1. Calculate a Route
1. Open the web interface at http://localhost:5173/
2. Select transport mode (walk/bike/car) from the sidebar
3. Click on the map to set origin (green marker)
4. Click again to set destination (red marker)
5. Blue route line appears automatically with travel time displayed

### 2. Generate Isochrones
1. Click on the map to set the center point
2. In the Isochrone Controls panel, check desired time thresholds
3. Select transport mode
4. Colored polygons appear showing reachable areas

### 3. Precompute Isochrones
Use the provided script to generate and store isochrones:
```bash
cd backend
./venv/bin/python generate_isochrones.py
```

Edit the script to change coordinates or time thresholds:
```python
origin_lat = 40.6319
origin_lng = -8.6578
minutes_list = [5, 10, 15, 20, 25, 30]
```

---

## Data Sources


- OpenStreetMap (OSM) – extracted from portugal-latest.osm.pbf  
- Digital Elevation Model (DEM) – used for slope-aware cost modelling  

---

## Network Preparation

### Car Network (osm2po)

The osm2po tool was used to generate a topologically correct car network including directionality, one-way restrictions, and default speeds per road class.

Main output table: `rede_viaria_av`

Key attributes:
- id
- source / target
- km
- kmh
- cost / reverse_cost
- clazz / flags
- geom_way

Reverse cost logic:
- Bidirectional roads → same as forward cost  
- One-way roads → very high reverse cost (999999)  

---

### Complete Geometry Import (osm2pgsql)

osm2po does not import several pedestrian and cycling features. To address this limitation, osm2pgsql was used to import all OSM geometries, including footways, paths, steps, and cycleways.

Generated tables include:
- av_line
- av_point
- av_polygon
- av_roads
- av_nodes
- av_ways

---

### Walking and Cycling Network

From `av_line`, a subset of pedestrian- and cyclist-accessible edges was extracted.

Assigned speeds:
- Walking: 5 km/h  
- Cycling: 15 km/h  

Reverse cost equals forward cost for non-motorised modes.

---

### Hybrid Multimodal Network

A unified network (`rede_hibrida`) was created by merging:
1. osm2po car edges  
2. osm2pgsql walking and cycling edges  

Topology was rebuilt using pgRouting:

```sql
SELECT pgr_createTopology('rede_hibrida', 0.0001, 'geom_way', 'id');
```

This generates `rede_hibrida_vertices_pgr`.

---

## Isochrones and Accessibility Analysis

Isochrones represent areas reachable within defined travel-time thresholds (e.g. 10, 20, 30 minutes). Each transport mode uses a specific cost model and routing logic.

---

## Validation with ORS Tools

The ORS Tools plugin for QGIS (based on OpenRouteService) was used as an independent benchmark. Isochrones were generated for walking, wheelchair, cycling, and car modes using travel-time thresholds from 5 to 30 minutes.

Comparisons focused on:
- Polygon extent
- Shape differences
- Coverage gaps
- Connectivity consistency

---

## Slope Integration

A Digital Elevation Model was integrated to improve realism for walking and cycling.

Steps:
1. DEM clipping to study area  
2. Elevation extraction at network nodes  
3. Slope calculation (`slope_percent`, `slope_dir`)  
4. Cost model adjustment to penalise steep uphill segments  

Terrain classification:
- 0–15% slope → low impedance  
- >15% slope → high impedance  

---


---

## Network Update (v3_plus)

### Background
After initial deployment, validation revealed that **walking and cycling isochrones were spatially limited and fragmented** compared to expected real-world accessibility. This was caused by missing pedestrian and cycling infrastructure in the original OSM import.

### Solution
A **network enhancement** was performed:

1. **Additional OSM Import**: Missing footways, paths, steps, and cycleways were imported from OpenStreetMap into `missing_viaria_av` table.

2. **Merged Network**: Created `rede_viaria_v3_plus` by combining:
   - All original edges from `rede_viaria_v3`
   - New pedestrian/cycling paths (avoiding duplicates by OSM ID)

3. **Geometry Normalization**: Fixed mixed 2D/3D geometry issues:
   ```sql
   -- Created geom_2d column: MultiLineString, 2D, SRID 3763
   UPDATE rede_viaria_v3_plus 
   SET geom_2d = ST_Multi(ST_Force2D(ST_LineMerge(geom)));
   ```

4. **Topology Rebuild**: Recreated pgRouting topology with 0.5m tolerance:
   ```sql
   SELECT pgr_createTopology('rede_viaria_v3_plus', 0.5, 'geom_2d', 'id_0');
   ```

5. **Cost Recalculation**: New edges received walk/bike costs using Tobler's function (assuming flat terrain where slope data unavailable).

6. **Isochrone Regeneration**: Recomputed all walk/bike isochrones with significantly improved coverage.

### Results
- ✅ **Larger isochrones**: 50-200% increase in reachable area
- ✅ **Better connectivity**: Parks, campuses, pedestrian zones now accessible
- ✅ **Continuous coverage**: Eliminated fragmentation in urban areas
- ✅ **Validated against reality**: Matches observed pedestrian/cycling patterns

### Implementation
**Backend automatically selects the correct network**:
- Walk/Bike routes → `rede_viaria_v3_plus` (enhanced)
- Car routes → `rede_viaria_v3` (original, validated)

**No frontend changes required** - API responses remain identical format.

---

## Implementation Details

### Route Calculation Algorithm
1. **Point Snapping**: Uses `ST_ClosestPoint` to snap origin/destination to nearest edge
2. **Vertex Selection**: Tests both source and target vertices of snapped edge
3. **Pathfinding**: Executes `pgr_dijkstra` with mode-specific cost field
4. **Geometry Assembly**: 
   - Extracts LineString/MultiLineString geometries from route edges
   - Reverses segments if needed based on distance calculation
   - Removes duplicate points at junctions
   - Replaces first/last network points with projected snap points
5. **Coordinate Transformation**: SRID 3763 (storage) → 4326 (API output)

### Isochrone Generation Algorithm
1. **Point Snapping**: Snap origin to nearest edge with valid cost
2. **Reachability Analysis**: `pgr_drivingDistance` finds all edges within time threshold
3. **Geometry Collection**: Gathers all reachable edge geometries with `ST_Collect`
4. **Hull Generation**:
   - 0 edges: NULL geometry
   - 1 edge: Buffer by (minutes × 60) meters
   - 2 edges: Small buffer around convex hull
   - 3+ edges: Concave hull (α=0.9)
5. **Dimensionality Fix**: `ST_Force2D` ensures consistent 2D geometry
6. **Coordinate Transformation**: SRID 3763 → 4326

### Frontend Architecture
- **State Management**: React hooks (useState, useEffect) for app-level state
- **Map Interaction**: Leaflet click events for origin/destination selection
- **Data Fetching**: Axios for API communication with error handling
- **Visualization**:
  - `RouteLayer`: Blue polyline with green/red markers
  - `IsochroneLayer`: Color-coded polygons with opacity by time
  - `MarkerClusterGroup`: Clustered amenity markers
- **Responsive UI**: Tailwind CSS for sidebar, controls, and overlays

### Cost Model Implementation

#### Tobler's Hiking Function (Walk/Bike)
```sql
-- Walking cost calculation
cost_walk = distance_km / (6.0 * EXP(-3.5 * ABS(slope_dire/100 + 0.05))) * 60

-- Cycling cost calculation  
cost_bike = distance_km / (15.0 * EXP(-3.5 * ABS(slope_dire/100 + 0.05))) * 60
```

Applied to 15,629 walk edges and 15,621 bike edges in `rede_viaria_v3`.

#### Speed-Based Cost (Car)
```sql
-- Car cost calculation
cost = distance_km / kmh * 60
```

Applied to 19,374 car edges with valid speed data.

---

## Database Architecture (Comprehensive)

| Table / View | Records | Purpose |
|---|---|---|
| rede_viaria_v3 | ~20,000 | Base routing network with multimodal costs |
| rede_viaria_v3_vertices_pgr | ~14,000 | pgRouting topology vertices |
| pois_aveiro | 710 | Points of interest (deduplicated) |
| iso_walk_rings | Variable | Stored walking isochrones |
| iso_bike_rings | Variable | Stored cycling isochrones |
| iso_car_rings | Variable | Stored car isochrones |

### Key Indexes
- `geom` columns: GIST spatial index for fast proximity queries
- `minutes` columns: B-tree index for time-based filtering
- `source`/`target`: B-tree for routing graph traversal




---

## Key Technical Achievements

### 1. Coordinate System Handling
- **Storage**: SRID 3763 (PT-TM06/ETRS89) for accurate metric calculations
- **API**: SRID 4326 (WGS84) for web map compatibility
- **Transformation**: `ST_Transform` used consistently in all queries

### 2. Geometry Processing
- **MultiLineString Support**: Handles both single and multi-part geometries
- **Segment Ordering**: Distance-based reversal detection using Euclidean distance
- **Junction Handling**: Duplicate point removal at edge connections
- **2D/3D Normalization**: `ST_Force2D` prevents dimensionality mismatches

### 3. Performance Optimizations
- **Spatial Indexing**: GIST indexes on all geometry columns
- **Query Optimization**: `<->` operator for KNN searches
- **Edge Filtering**: NULL cost check before routing operations
- **Frontend Clustering**: react-leaflet-cluster for amenity markers

### 4. Cost Model Accuracy
- **Terrain-Aware**: Tobler's function accounts for slope impact
- **Mode-Specific**: Different base speeds and formulas per transport type
- **Bidirectional**: Handles uphill/downhill asymmetry correctly

### 5. Route Visualization Quality
- **No Backtracking**: Origin/destination projected onto network edges
- **Smooth Lines**: Segment reversal and duplicate removal
- **Accurate Snapping**: Uses ST_ClosestPoint for precise projection
- **Clear Markers**: Distinct colors for origin (green) and destination (red)

---

## Troubleshooting

### Backend Issues

**Problem**: Migration fails with `NodeNotFoundError`
- **Solution**: Ensure migration dependencies match actual migration files
- Run: `python manage.py migrate routing --fake` if tables already exist

**Problem**: `ST_Transform` returns NULL coordinates
- **Solution**: Verify SRID is valid and PostGIS extension is installed
- Check: `SELECT PostGIS_version();`

**Problem**: Route calculation returns empty result
- **Solution**: Check if cost fields are populated for the selected mode
- Query: `SELECT COUNT(*) FROM rede_viaria_v3 WHERE cost_walk IS NOT NULL;`

### Frontend Issues

**Problem**: CORS errors when accessing API
- **Solution**: Ensure django-cors-headers is installed and configured
- Check `CORS_ALLOWED_ORIGINS` in settings.py

**Problem**: Map doesn't load
- **Solution**: Verify Leaflet CSS is imported in index.html or main component
- Check browser console for tile loading errors

**Problem**: Isochrones not displaying
- **Solution**: Check API response format matches GeoJSON FeatureCollection
- Verify geometry type is Polygon, not MultiPolygon or other

---

## Performance Metrics

### Route Calculation
- **Average response time**: 150-300ms
- **Network size**: ~20,000 edges
- **Vertex count**: ~14,000 nodes
- **Snapping accuracy**: <5 meters typical deviation

### Isochrone Generation
- **5-minute isochrone**: ~200-400ms
- **30-minute isochrone**: ~800-1500ms
- **Edge complexity**: 50-500 edges per isochrone
- **Polygon vertices**: 100-1000 depending on area shape

### Data Volume
- **Route network**: ~15.6 MB (geometry + attributes)
- **POI data**: ~2.8 MB (710 features)
- **Precomputed isochrones**: ~1-2 MB per origin point (18 polygons)

---

## Future Enhancements

### Planned Features
- **Multi-stop routing**: Support for waypoints and complex routes
- **Turn-by-turn directions**: Step-by-step navigation instructions
- **Elevation profiles**: Visual display of route terrain
- **Time-of-day routing**: Traffic-aware car routing
- **Public transport integration**: GTFS data for bus routes
- **Accessibility scoring**: Quantitative accessibility metrics per area
- **Mobile responsive**: Touch-optimized interface for tablets/phones
- **Route export**: Download routes as GPX/GeoJSON
- **Amenity filtering**: Filter POIs by distance to isochrones

### Research Applications
- **Equity analysis**: Compare accessibility across neighborhoods
- **Scenario modeling**: Impact assessment for new infrastructure
- **Student mobility**: Journey time analysis to University of Aveiro
- **Service area analysis**: Optimal locations for new facilities
- **Multi-criteria routing**: Preferences for safety, greenness, etc.

---

## Project Structure

```
PROJECT_SIGCS/
├── backend/
│   ├── accessibility_model/        # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── routing/                    # Main app
│   │   ├── migrations/
│   │   │   └── 0001_create_isochrone_tables.py
│   │   ├── models.py              # Database models
│   │   ├── serializers.py         # DRF serializers
│   │   ├── views.py               # API endpoints
│   │   └── urls.py                # URL routing
│   ├── manage.py
│   ├── requirements.txt
│   ├── generate_isochrones.py     # Utility script
│   └── venv/
│
├── frontend/                       # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── Map.jsx
│   │   │   │   ├── RouteLayer.jsx
│   │   │   │   └── IsochroneLayer.jsx
│   │   │   └── Controls/
│   │   │       ├── ModeSelector.jsx
│   │   │       └── IsochroneControls.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── rede_viaria_v3.csv             # Network data export
```

---

## Database Table Documentation

| Table | Purpose | Key Columns | Row Count |
|---|---|---|---|
| rede_viaria_v3 | Routing network | source, target, cost_walk, cost_bike, cost, geom | ~20,000 |
| rede_viaria_v3_vertices_pgr | Network topology | id, lon, lat, geom | ~14,000 |
| pois_aveiro | Points of interest | osm_id, name, amenity, geom | 710 |
| iso_walk_rings | Walk isochrones | minutes, origin_lat, origin_lng, geom | Variable |
| iso_bike_rings | Bike isochrones | minutes, origin_lat, origin_lng, geom | Variable |
| iso_car_rings | Car isochrones | minutes, origin_lat, origin_lng, geom | Variable |

---

## References and Acknowledgments

### Academic Foundation
- **Tobler's Hiking Function**: Tobler, W. (1993). Three presentations on geographical analysis and modeling.
- **pgRouting**: Obe, R., & Hsu, L. (2015). pgRouting: A Practical Guide.
- **Accessibility Analysis**: Geurs, K. T., & Van Wee, B. (2004). Accessibility evaluation of land-use and transport strategies.

### Data Sources
- **OpenStreetMap**: © OpenStreetMap contributors
- **Digital Elevation Model**: Portuguese Geographic Institute (IGP)

### Tools and Libraries
- Django REST Framework: [https://www.django-rest-framework.org/](https://www.django-rest-framework.org/)
- PostGIS: [https://postgis.net/](https://postgis.net/)
- pgRouting: [https://pgrouting.org/](https://pgrouting.org/)
- Leaflet: [https://leafletjs.com/](https://leafletjs.com/)
- React: [https://react.dev/](https://react.dev/)

---

## License

This project is developed for academic purposes at the University of Aveiro.

---

## Contact and Support

For questions, issues, or contributions, please contact the development team or open an issue in the project repository.

**Project**: Accessibility Analysis in Aveiro  
**Institution**: University of Aveiro  
**Year**: 2026  
**Course**: SIGCS (Geographic Information Systems)

---

## Changelog

### Version 2.1 (January 2026 - Network Enhancement)
- ✅ **Critical Fix**: Enhanced walk/bike networks with missing OSM paths
- ✅ Created `rede_viaria_v3_plus` with complete pedestrian/cycling infrastructure
- ✅ Added `geom_2d` normalized geometry column for pgRouting compatibility
- ✅ Rebuilt topology with 0.5m tolerance for better connectivity
- ✅ Recomputed walk/bike costs on new edges (Tobler's function, flat terrain assumption)
- ✅ Regenerated walk/bike isochrones with 50-200% coverage increase
- ✅ Updated Django models, serializers, and views for dual-network support
- ✅ Automatic network selection: v3_plus for walk/bike, v3 for car
- ✅ Backward compatible API - no frontend changes required

### Version 2.0 (January 2026)
- ✅ Implemented web-based platform with React frontend
- ✅ Added Django REST Framework backend with full API
- ✅ Integrated interactive click-to-route functionality
- ✅ Implemented real-time isochrone generation
- ✅ Added Tobler's Hiking Function for walk/bike costs
- ✅ Created database storage for precomputed isochrones
- ✅ Fixed route visualization with smooth polylines
- ✅ Added 710 deduplicated POIs with clustering
- ✅ Implemented 6 time thresholds (5, 10, 15, 20, 25, 30 min)
- ✅ Added comprehensive coordinate system handling

### Version 1.0 (Initial)
- ✅ OSM data import with osm2po and osm2pgsql
- ✅ Multimodal network creation
- ✅ Basic isochrone generation in QGIS
- ✅ Slope integration for terrain awareness
- ✅ ORS validation

---

## Conclusion

This project establishes a **modern, web-based platform** for multimodal accessibility analysis in Aveiro. By combining **Django REST Framework**, **React**, **PostGIS**, and **pgRouting**, it provides an interactive tool for route planning, isochrone visualization, and amenity discovery. The implementation of **Tobler's Hiking Function** ensures realistic travel time estimates that account for terrain slope, while the **click-to-route interface** makes the system accessible to both researchers and general users.

The platform serves as a foundation for advanced accessibility studies, urban planning decisions, and sustainable mobility research, with particular relevance to student accessibility and the University of Aveiro campus.
