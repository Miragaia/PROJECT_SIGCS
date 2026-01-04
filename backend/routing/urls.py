from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'pois', views.PoisAveiroViewSet, basename='pois')
router.register(r'isochrones/walk', views.IsoWalkRingsViewSet, basename='isochrone-walk')
router.register(r'isochrones/bike', views.IsoBikeRingsViewSet, basename='isochrone-bike')
router.register(r'isochrones/car', views.IsoCarRingsViewSet, basename='isochrone-car')

urlpatterns = [
    path('', include(router.urls)),
    path('routing/calculate/', views.calculate_route, name='calculate-route'),
    path('isochrones/generate/', views.generate_isochrone, name='generate-isochrone'),
    path('modes/', views.transport_modes, name='transport-modes'),
    path('amenities/', views.amenities, name='amenities'),
]
