from django.contrib.gis.db import models


class RedeViariaV3(models.Model):
    """
    Main routing network table with costs, slopes, and geometry.
    This model represents the rede_viaria_v3 table in the database.
    """
    id_0 = models.IntegerField(primary_key=True)
    geom = models.GeometryField(srid=3763, geography=False)
    fid = models.IntegerField(null=True, blank=True)
    id = models.IntegerField(null=True, blank=True)
    osm_id = models.BigIntegerField(null=True, blank=True)
    osm_name = models.CharField(max_length=255, null=True, blank=True)
    osm_meta = models.CharField(max_length=255, null=True, blank=True)
    osm_source = models.CharField(max_length=255, null=True, blank=True)
    osm_target = models.CharField(max_length=255, null=True, blank=True)
    clazz = models.IntegerField(null=True, blank=True)
    flags = models.IntegerField(null=True, blank=True)
    source = models.IntegerField(null=True, blank=True)
    target = models.IntegerField(null=True, blank=True)
    km = models.FloatField(null=True, blank=True)
    kmh = models.FloatField(null=True, blank=True)
    cost = models.FloatField(null=True, blank=True)
    reverse_co = models.FloatField(null=True, blank=True)
    x1 = models.FloatField(null=True, blank=True)
    y1 = models.FloatField(null=True, blank=True)
    x2 = models.FloatField(null=True, blank=True)
    y2 = models.FloatField(null=True, blank=True)
    cost_walk = models.FloatField(null=True, blank=True)
    cost_bike = models.FloatField(null=True, blank=True)
    reverse_1 = models.FloatField(null=True, blank=True, db_column='reverse__1')
    reverse_2 = models.FloatField(null=True, blank=True, db_column='reverse__2')
    slope_perc = models.FloatField(null=True, blank=True)
    slope_dire = models.FloatField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'rede_viaria_v3'

    def __str__(self):
        return f"Edge {self.id_0}: {self.osm_name or 'Unnamed'}"


class RedeViariaAvVerticesPgr(models.Model):
    """
    Network vertices for pgRouting.
    """
    id = models.BigIntegerField(primary_key=True)
    cnt = models.IntegerField(null=True, blank=True)
    chk = models.IntegerField(null=True, blank=True)
    ein = models.IntegerField(null=True, blank=True)
    eout = models.IntegerField(null=True, blank=True)
    the_geom = models.PointField(srid=4326, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'rede_viaria_av_vertices_pgr'

    def __str__(self):
        return f"Vertex {self.id}"


class PoisAveiro(models.Model):
    """
    Points of Interest in Aveiro.
    """
    gid = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    fclass = models.CharField(max_length=100, null=True, blank=True)
    geom = models.PointField(srid=4326, null=True, blank=True)
    cat = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'pois_aveiro'

    def __str__(self):
        return f"{self.name or 'POI'} ({self.cat})"


class IsoWalkRings(models.Model):
    """
    Walking isochrone rings.
    """
    band = models.CharField(max_length=50, null=True, blank=True)
    geom = models.GeometryField(srid=4326, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'iso_walk_rings'


class IsoBikeRings(models.Model):
    """
    Cycling isochrone rings.
    """
    band = models.CharField(max_length=50, null=True, blank=True)
    geom = models.GeometryField(srid=4326, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'iso_bike_rings'


class IsoCarRingsOsm(models.Model):
    """
    Car isochrone rings from OSM.
    """
    band = models.CharField(max_length=50, primary_key=True)
    geom = models.MultiPolygonField(srid=4326, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'iso_car_rings_osm'


class AcessibilidadeORSWalking(models.Model):
    """
    Walking accessibility analysis from ORS.
    """
    id = models.IntegerField(primary_key=True)
    geom = models.PolygonField(srid=4326, null=True, blank=True)
    range_val = models.IntegerField(null=True, blank=True, db_column='range')
    total_pop = models.CharField(max_length=254, null=True, blank=True, db_column='TOTAL_POP')

    class Meta:
        managed = False
        db_table = 'acessibilidade_ORS_walking'


class AcessibilidadeORSBike(models.Model):
    """
    Cycling accessibility analysis from ORS.
    """
    id = models.IntegerField(primary_key=True)
    geom = models.PolygonField(srid=4326, null=True, blank=True)
    range_val = models.IntegerField(null=True, blank=True, db_column='range')
    total_pop = models.CharField(max_length=254, null=True, blank=True, db_column='TOTAL_POP')

    class Meta:
        managed = False
        db_table = 'acessibilidade_ORS_bike'


class AcessibilidadeORSCar(models.Model):
    """
    Car accessibility analysis from ORS.
    """
    id = models.IntegerField(primary_key=True)
    geom = models.PolygonField(srid=4326, null=True, blank=True)
    range_val = models.IntegerField(null=True, blank=True, db_column='range')
    total_pop = models.CharField(max_length=254, null=True, blank=True, db_column='TOTAL_POP')

    class Meta:
        managed = False
        db_table = 'acessibilidade_ORS_car'
