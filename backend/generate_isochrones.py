import os
import django
import json
from django.contrib.gis.geos import GEOSGeometry
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'accessibility_model.settings')
django.setup()

from routing.models import IsoWalkRings, IsoBikeRings, IsoCarRings

# Coordinates to generate isochrones for
origin_lat = 40.6319
origin_lng = -8.6578
modes = ['walk', 'bike', 'car']
minutes_list = [5, 10, 15, 20, 25, 30]

# Generate isochrones via API
for mode in modes:
    print(f"\n=== Generating {mode} isochrones ===")
    payload = {
        'origin_lat': origin_lat,
        'origin_lng': origin_lng,
        'mode': mode,
        'minutes': minutes_list
    }
    
    try:
        response = requests.post('http://127.0.0.1:8000/api/isochrones/generate/', json=payload)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            features = data.get('features', [])
            print(f"Generated {len(features)} isochrones for {mode}")
            
            # Save to database
            if mode == 'walk':
                model = IsoWalkRings
            elif mode == 'bike':
                model = IsoBikeRings
            else:
                model = IsoCarRings
            
            for feature in features:
                props = feature['properties']
                geom = feature['geometry']
                minutes = props['minutes']
                
                # Create GeoJSON string for GeometryField
                geom_json = json.dumps(geom)
                
                # Save to model
                iso = model(
                    minutes=minutes,
                    origin_lat=origin_lat,
                    origin_lng=origin_lng,
                    geom=GEOSGeometry(geom_json)
                )
                iso.save()
                print(f"  Saved {mode} {minutes}min isochrone")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Exception: {e}")
        import traceback
        traceback.print_exc()

print("\n=== Done ===")
