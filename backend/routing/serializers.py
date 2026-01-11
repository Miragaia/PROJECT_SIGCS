from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import (
    RedeViariaV3, RedeViariaV3Plus, RedeViariaAvVerticesPgr, PoisAveiro,
    IsoWalkRings, IsoBikeRings, IsoCarRings,
    IsoWalkRingsV3Plus, IsoBikeRingsV3Plus,
    AcessibilidadeORSWalking, AcessibilidadeORSBike, AcessibilidadeORSCar
)


class RedeViariaV3Serializer(GeoFeatureModelSerializer):
    """Serializer for the routing network."""
    
    class Meta:
        model = RedeViariaV3
        geo_field = 'geom'
        fields = '__all__'


class RedeViariaAvVerticesPgrSerializer(GeoFeatureModelSerializer):
    """Serializer for routing vertices."""
    
    class Meta:
        model = RedeViariaAvVerticesPgr
        geo_field = 'the_geom'
        fields = '__all__'


class PoisAveiroSerializer(GeoFeatureModelSerializer):
    """Serializer for Points of Interest."""
    
    class Meta:
        model = PoisAveiro
        geo_field = 'geom'
        fields = ['gid', 'name', 'fclass', 'cat', 'geom']


class IsoWalkRingsSerializer(GeoFeatureModelSerializer):
    """Serializer for walking isochrones (original v3 - deprecated)."""
    
    class Meta:
        model = IsoWalkRings
        geo_field = 'geom'
        fields = '__all__'


class IsoBikeRingsSerializer(GeoFeatureModelSerializer):
    """Serializer for cycling isochrones (original v3 - deprecated)."""
    
    class Meta:
        model = IsoBikeRings
        geo_field = 'geom'
        fields = '__all__'


class IsoCarRingsSerializer(GeoFeatureModelSerializer):
    """Serializer for car isochrones."""
    
    class Meta:
        model = IsoCarRings
        geo_field = 'geom'
        fields = '__all__'


class IsoWalkRingsV3PlusSerializer(GeoFeatureModelSerializer):
    """Serializer for walking isochrones (v3_plus - current)."""
    
    class Meta:
        model = IsoWalkRingsV3Plus
        geo_field = 'geom'
        fields = '__all__'


class IsoBikeRingsV3PlusSerializer(GeoFeatureModelSerializer):
    """Serializer for cycling isochrones (v3_plus - current)."""
    
    class Meta:
        model = IsoBikeRingsV3Plus
        geo_field = 'geom'
        fields = '__all__'


class AcessibilidadeORSWalkingSerializer(GeoFeatureModelSerializer):
    """Serializer for walking accessibility."""
    
    class Meta:
        model = AcessibilidadeORSWalking
        geo_field = 'geom'
        fields = '__all__'


class AcessibilidadeORSBikeSerializer(GeoFeatureModelSerializer):
    """Serializer for cycling accessibility."""
    
    class Meta:
        model = AcessibilidadeORSBike
        geo_field = 'geom'
        fields = '__all__'


class AcessibilidadeORSCarSerializer(GeoFeatureModelSerializer):
    """Serializer for car accessibility."""
    
    class Meta:
        model = AcessibilidadeORSCar
        geo_field = 'geom'
        fields = '__all__'


# Input serializers for API requests
class RouteRequestSerializer(serializers.Serializer):
    """Serializer for route calculation requests."""
    origin_lat = serializers.FloatField(required=True, min_value=-90, max_value=90)
    origin_lng = serializers.FloatField(required=True, min_value=-180, max_value=180)
    destination_lat = serializers.FloatField(required=True, min_value=-90, max_value=90)
    destination_lng = serializers.FloatField(required=True, min_value=-180, max_value=180)
    mode = serializers.ChoiceField(choices=['walk', 'bike', 'car'], required=True)


class IsochroneRequestSerializer(serializers.Serializer):
    """Serializer for isochrone generation requests."""
    origin_lat = serializers.FloatField(required=True, min_value=-90, max_value=90)
    origin_lng = serializers.FloatField(required=True, min_value=-180, max_value=180)
    mode = serializers.ChoiceField(choices=['walk', 'bike', 'car'], required=True)
    minutes = serializers.ListField(
        child=serializers.IntegerField(min_value=1, max_value=60),
        required=True,
        min_length=1
    )
