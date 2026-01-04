from django.db import migrations
from django.contrib.gis.db import models as gis_models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- Drop existing tables if they exist
            DROP TABLE IF EXISTS iso_walk_rings CASCADE;
            DROP TABLE IF EXISTS iso_bike_rings CASCADE;
            DROP TABLE IF EXISTS iso_car_rings CASCADE;

            -- Create iso_walk_rings table
            CREATE TABLE iso_walk_rings (
                id SERIAL PRIMARY KEY,
                minutes INTEGER NOT NULL,
                origin_lat DOUBLE PRECISION,
                origin_lng DOUBLE PRECISION,
                geom GEOMETRY(Polygon, 4326),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_iso_walk_rings_minutes ON iso_walk_rings(minutes);
            CREATE INDEX idx_iso_walk_rings_geom ON iso_walk_rings USING GIST(geom);

            -- Create iso_bike_rings table
            CREATE TABLE iso_bike_rings (
                id SERIAL PRIMARY KEY,
                minutes INTEGER NOT NULL,
                origin_lat DOUBLE PRECISION,
                origin_lng DOUBLE PRECISION,
                geom GEOMETRY(Polygon, 4326),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_iso_bike_rings_minutes ON iso_bike_rings(minutes);
            CREATE INDEX idx_iso_bike_rings_geom ON iso_bike_rings USING GIST(geom);

            -- Create iso_car_rings table
            CREATE TABLE iso_car_rings (
                id SERIAL PRIMARY KEY,
                minutes INTEGER NOT NULL,
                origin_lat DOUBLE PRECISION,
                origin_lng DOUBLE PRECISION,
                geom GEOMETRY(Polygon, 4326),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX idx_iso_car_rings_minutes ON iso_car_rings(minutes);
            CREATE INDEX idx_iso_car_rings_geom ON iso_car_rings USING GIST(geom);
            """,
            reverse_sql="""
            DROP TABLE IF EXISTS iso_walk_rings CASCADE;
            DROP TABLE IF EXISTS iso_bike_rings CASCADE;
            DROP TABLE IF EXISTS iso_car_rings CASCADE;
            """
        ),
    ]
