# 🚀 Quick Start Guide

## ✅ Project Successfully Initialized!

Your Aveiro Accessibility Platform is now set up and running!

---

## 🌐 Access the Application

- **Frontend (React)**: http://localhost:5173
- **Backend API (Django)**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/

---

## 🖥️ Servers Currently Running

### Backend (Django REST API)
- **Status**: ✅ Running
- **Port**: 8000
- **Database**: Connected to grupo1_sigcs2025@gis4cloud.com

### Frontend (React + Vite)
- **Status**: ✅ Running  
- **Port**: 5173
- **Hot Reload**: Enabled

---

## 📂 Project Structure

```
PROJECT_SIGCS/
├── backend/                    ✅ Django REST API
│   ├── venv/                   ✅ Virtual environment
│   ├── manage.py               ✅ Django management
│   ├── accessibility_model/    ✅ Project settings
│   └── routing/                ✅ Routing app with models, views, serializers
│
├── frontend/                   ✅ React + Tailwind + Leaflet
│   ├── src/
│   │   ├── components/         ✅ React components
│   │   ├── services/           ✅ API client
│   │   ├── App.jsx             ✅ Main component
│   │   └── main.jsx            ✅ Entry point
│   └── package.json            ✅ Dependencies
│
├── docker-compose.yml          ✅ Container orchestration
├── .gitignore                  ✅ Git configuration
├── DEVELOPMENT_GUIDE.md        ✅ Full documentation
└── QUICK_START.md              📄 This file
```

---

## 🎯 Available API Endpoints

### Transport Modes
```
GET /api/modes/
```

### Routing
```
POST /api/routing/calculate/
Body: {
  "origin_lat": 40.6412,
  "origin_lng": -8.6540,
  "destination_lat": 40.6301,
  "destination_lng": -8.6578,
  "mode": "bike"
}
```

### Isochrones
```
POST /api/isochrones/generate/
Body: {
  "origin_lat": 40.6412,
  "origin_lng": -8.6540,
  "mode": "walk",
  "minutes": [10, 20, 30]
}
```

### Points of Interest
```
GET /api/pois/
GET /api/pois/categories/
GET /api/pois/?category=education&lat=40.6412&lng=-8.6540&radius=2
```

### Precomputed Isochrones
```
GET /api/isochrones/walk/
GET /api/isochrones/bike/
GET /api/isochrones/car/
```

---

## 🔧 Development Commands

### Backend
```bash
cd backend

# Activate virtual environment
source venv/bin/activate

# Run migrations (if needed)
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver 0.0.0.0:8000

# Run tests
python manage.py test
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker (Alternative)
```bash
# Start all services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

---

## 🗄️ Database Connection

**Credentials** (already configured):
- Host: gis4cloud.com
- Port: 5432
- Database: grupo1_sigcs2025
- Username: grupo1_sigcs2025
- Password: mFhQgfB!Ubr51

**Test connection**:
```bash
PGPASSWORD='mFhQgfB!Ubr51' psql -h gis4cloud.com -p 5432 -U grupo1_sigcs2025 -d grupo1_sigcs2025 -c '\dt'
```

---

## 🎨 Current Features

### ✅ Implemented
- Django REST API with PostGIS support
- Database models for routing network and POIs
- REST endpoints for routing, isochrones, and POIs
- React frontend with Tailwind CSS
- Leaflet map integration
- Transport mode selector (walk, bike, car)
- Responsive UI layout

### 🔄 Next Steps
1. Add click-to-route functionality on map
2. Visualize isochrones as colored polygons
3. Display POIs as markers with clustering
4. Add travel time slider
5. Show accessibility statistics
6. Implement route animation
7. Add user location detection

---

## 📚 Documentation

- **Full Guide**: `DEVELOPMENT_GUIDE.md`
- **Project Overview**: `README.md`
- **Django Docs**: https://docs.djangoproject.com/
- **DRF Docs**: https://www.django-rest-framework.org/
- **React Docs**: https://react.dev/
- **Leaflet Docs**: https://leafletjs.com/

---

## 🐛 Troubleshooting

### Backend not connecting to database
1. Check credentials in `backend/.env`
2. Test connection: `PGPASSWORD='mFhQgfB!Ubr51' psql -h gis4cloud.com -p 5432 -U grupo1_sigcs2025 -d grupo1_sigcs2025`

### Frontend API errors
1. Ensure backend is running on port 8000
2. Check CORS settings in `backend/accessibility_model/settings.py`
3. Verify `VITE_API_BASE_URL` in `frontend/.env`

### Map not rendering
1. Check Leaflet CSS is imported in `index.html`
2. Ensure map container has explicit height in CSS
3. Open browser console for errors

---

## 🚀 Next Development Session

To resume development:

```bash
# Terminal 1: Start Backend
cd /home/miragaia/Documents/5_ANO/SIGCS/PROJECT_SIGCS/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000

# Terminal 2: Start Frontend
cd /home/miragaia/Documents/5_ANO/SIGCS/PROJECT_SIGCS/frontend
npm run dev
```

Then open http://localhost:5173 in your browser!

---

## 📊 Project Status

| Component | Status | Notes |
|-----------|--------|-------|
| Database Connection | ✅ Working | Connected to gis4cloud.com |
| Django Backend | ✅ Running | Port 8000 |
| REST API Endpoints | ✅ Implemented | 8 endpoints available |
| React Frontend | ✅ Running | Port 5173 |
| Leaflet Map | ✅ Rendered | Base map with Aveiro center |
| Mode Selector | ✅ Working | Walk/Bike/Car selector |
| Docker Setup | ✅ Ready | docker-compose.yml configured |

---

**🎉 Congratulations! Your multimodal accessibility platform is ready for development!**
