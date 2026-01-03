# Aveiro Accessibility Platform - Development Guide

## 📋 Project Overview

**Project Name**: Aveiro Multimodal Accessibility Platform  
**Purpose**: Interactive web-based platform for visualizing and analyzing multimodal accessibility (walking, cycling, car) in Aveiro, Portugal.

**Technology Stack**:
- **Backend**: Django 4.2+ with Django REST Framework
- **Frontend**: React 18+ with Tailwind CSS 3.4.0 and Leaflet
- **Database**: PostgreSQL 15+ with PostGIS extension
- **Routing Engine**: pgRouting (existing infrastructure)
- **Deployment**: Docker Compose

---

## 🗂️ Project Structure

```
PROJECT_SIGCS/
├── backend/                    # Django REST API
│   ├── accessibility_model/    # Django project root
│   │   ├── settings.py        # Django configuration
│   │   ├── urls.py            # URL routing
│   │   └── wsgi.py            # WSGI entry point
│   ├── routing/               # Routing and accessibility app
│   │   ├── models.py          # Database models
│   │   ├── serializers.py     # DRF serializers
│   │   ├── views.py           # API endpoints
│   │   └── urls.py            # App-specific routes
│   ├── venv/                  # Python virtual environment
│   ├── requirements.txt       # Python dependencies
│   └── manage.py              # Django management script
│
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Map/          # Leaflet map components
│   │   │   ├── Controls/     # UI controls (mode selector, etc.)
│   │   │   └── Results/      # Results display
│   │   ├── services/          # API client services
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # React entry point
│   ├── public/                # Static assets
│   ├── package.json           # Node dependencies
│   ├── tailwind.config.js     # Tailwind configuration
│   └── vite.config.js         # Vite configuration
│
├── docker-compose.yml         # Docker orchestration
├── .gitignore                 # Git ignore rules
├── DEVELOPMENT_GUIDE.md       # This file
└── README.md                  # Project description
```

---

## 🗄️ Database Configuration

**Database Server**: gis4cloud.com  
**Port**: 5432  
**Database Name**: grupo1_sigcs2025  
**Username**: grupo1_sigcs2025  
**Password**: mFhQgfB!Ubr51

### Key Tables

| Table | Description |
|-------|-------------|
| `rede_viaria_v3` | Main routing network with costs and slopes |
| `rede_viaria_av` | Car network from osm2po |
| `rede_viaria_av_vertices_pgr` | Network topology vertices |
| `pois_aveiro` | Points of interest |
| `iso_walk_rings` | Walking isochrones |
| `iso_bike_rings` | Cycling isochrones |
| `iso_car_rings_osm` | Car isochrones |
| `acessibilidade_ORS_walking` | Walking accessibility analysis |
| `acessibilidade_ORS_bike` | Cycling accessibility analysis |
| `acessibilidade_ORS_car` | Car accessibility analysis |

---

## 🚀 Development Setup

### Prerequisites

- Python 3.10+
- Node.js 20+
- PostgreSQL client (psql)
- Docker & Docker Compose (optional, for containerized development)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run development server
python manage.py runserver 0.0.0.0:8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Docker Setup

```bash
# From project root
docker-compose up --build

# Access services:
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

---

## 🎯 Core Features Implementation Plan

### Phase 1: Backend Foundation
- ✅ Django project initialization
- ✅ Database connection configuration
- ✅ Create models for routing data
- ✅ REST API endpoints for networks and isochrones

### Phase 2: API Endpoints

#### Routing Endpoints
- `POST /api/routing/calculate/` - Calculate route between two points
- `GET /api/routing/modes/` - Get available transport modes

#### Isochrone Endpoints
- `POST /api/isochrones/generate/` - Generate isochrone from point
- `GET /api/isochrones/precomputed/` - Get precomputed isochrones

#### POI Endpoints
- `GET /api/pois/` - List POIs with filtering
- `GET /api/pois/{id}/` - Get POI details
- `GET /api/pois/categories/` - Get POI categories

#### Accessibility Endpoints
- `POST /api/accessibility/analyze/` - Analyze accessibility from point
- `GET /api/accessibility/statistics/` - Get accessibility statistics

### Phase 3: Frontend Foundation
- ✅ React + Vite project setup
- ✅ Tailwind CSS configuration
- ✅ Leaflet map integration
- ✅ Base layout and navigation

### Phase 4: Interactive Map
- Leaflet map with Aveiro basemap
- POI markers with clustering
- Isochrone layer visualization
- Route visualization
- Click-to-select origin/destination

### Phase 5: User Interface
- Transport mode selector (walk, bike, car)
- Travel time slider (5, 10, 15, 20, 30 min)
- POI category filters
- Results panel with statistics
- Accessibility metrics display

### Phase 6: Integration & Testing
- Connect frontend to backend APIs
- Error handling and loading states
- Performance optimization
- Cross-browser testing

---

## 📡 API Design Specification

### Base URL
```
Development: http://localhost:8000/api/
Production: TBD
```

### Authentication
Initially open API, JWT authentication to be added later if needed.

### Transport Modes
```json
{
  "walk": {
    "speed_kmh": 5,
    "cost_field": "cost_walk"
  },
  "bike": {
    "speed_kmh": 15,
    "cost_field": "cost_bike"
  },
  "car": {
    "speed_kmh": 40,
    "cost_field": "cost"
  }
}
```

### Example API Requests

#### Calculate Route
```http
POST /api/routing/calculate/
Content-Type: application/json

{
  "origin": {"lat": 40.6412, "lng": -8.6540},
  "destination": {"lat": 40.6301, "lng": -8.6578},
  "mode": "bike"
}
```

#### Generate Isochrone
```http
POST /api/isochrones/generate/
Content-Type: application/json

{
  "origin": {"lat": 40.6412, "lng": -8.6540},
  "mode": "walk",
  "minutes": [10, 20, 30]
}
```

#### Search POIs
```http
GET /api/pois/?category=education&within_isochrone=true&origin_lat=40.6412&origin_lng=-8.6540&mode=walk&minutes=15
```

---

## 🐳 Docker Configuration

### Services

#### Backend (Django)
- Port: 8000
- Environment: Development
- Hot reload enabled

#### Frontend (React + Vite)
- Port: 3000
- Environment: Development
- Hot reload enabled

#### Database (PostgreSQL + PostGIS)
- Optional local instance for testing
- Production uses remote gis4cloud.com

---

## 🔧 Environment Variables

### Backend (.env)
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_HOST=gis4cloud.com
DATABASE_PORT=5432
DATABASE_NAME=gupo1_sigcs2025
DATABASE_USER=gupo1_sigcs2025
DATABASE_PASSWORD=mFhQgfB!Ubr51
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 📦 Dependencies

### Backend (requirements.txt)
- Django==4.2.*
- djangorestframework==3.14.*
- django-cors-headers==4.3.*
- psycopg2-binary==2.9.*
- python-dotenv==1.0.*
- gunicorn==21.2.*

### Frontend (package.json)
- react: ^18.2.0
- react-dom: ^18.2.0
- react-leaflet: ^4.2.1
- leaflet: ^1.9.4
- axios: ^1.6.0
- tailwindcss: ^3.4.0

---

## 🧪 Testing Strategy

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## 📝 Git Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Commit Convention
```
feat: Add isochrone generation endpoint
fix: Correct routing cost calculation
docs: Update API documentation
style: Format code with black
refactor: Restructure map components
test: Add routing tests
```

---

## 🚀 Deployment

### Production Checklist
- [ ] Set DEBUG=False in Django settings
- [ ] Configure proper SECRET_KEY
- [ ] Set up HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up static file serving (WhiteNoise or CDN)
- [ ] Database connection pooling
- [ ] Enable Django logging
- [ ] Set up monitoring (Sentry, etc.)

---

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Leaflet Documentation](https://leafletjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [pgRouting Documentation](https://docs.pgrouting.org/)

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test database connection
psql -h gis4cloud.com -p 5432 -U gupo1_sigcs2025 -d gupo1_sigcs2025
```

### CORS Errors
Ensure `django-cors-headers` is properly configured in Django settings.

### Map Not Rendering
Check that Leaflet CSS is imported and container has explicit height.

---

## 👥 Development Team

**Student**: [Your Name]  
**Institution**: University of Aveiro  
**Course**: SIGCS 2025  
**Date**: January 2026

---

## 📄 License

Academic Project - University of Aveiro
