# Accessibility Analysis in Aveiro  
### Multimodal Accessibility with PostGIS, pgRouting and QGIS

## Project Overview

This project implements a **multimodal accessibility analysis** for the city of **Aveiro (Portugal)**, focusing on **car, walking, and cycling** travel modes. The objective is to compute realistic travel-time isochrones and evaluate access to key opportunities such as education, services, and amenities, with a particular emphasis on **student mobility** and the **University of Aveiro**.

The workflow integrates **OpenStreetMap (OSM)** data with **PostgreSQL/PostGIS**, **pgRouting**, **osm2po**, **osm2pgsql**, and **QGIS**, combining the strengths of each tool to overcome limitations in pedestrian and cycling network coverage.

---

## Objectives

- Build a reproducible multimodal routing network for Aveiro  
- Accurately model car, walking, and cycling accessibility  
- Generate travel-time isochrones (10, 20, 30 minutes)  
- Validate results against OpenRouteService (ORS) isochrones  
- Provide a foundation for future public transport integration  
- Support territorial and urban accessibility studies  

---

## Tools and Technologies

| Tool | Purpose |
|---|---|
| osm2po | Generates a pgRouting-ready car network with topology, speeds, and one-way rules |
| osm2pgsql | Imports complete OSM geometries (footways, paths, cycleways, POIs) |
| PostgreSQL / PostGIS | Spatial storage and geometry processing |
| pgRouting | Routing algorithms and isochrone computation |
| QGIS | Visualisation, validation, and cartographic output |
| ORS Tools (QGIS plugin) | External benchmark for isochrone validation |

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

## Database Architecture (Key Tables)

| Table / View | Purpose |
|---|---|
| rede_viaria_av | Base car network (osm2po) |
| rede_viaria_av_vertex | Network intersections |
| rede_viaria_av_vertices_pgr | pgRouting topology |
| rede_walk | Walking routing view |
| rede_bike | Cycling routing view |
| rede_car | Car routing view |
| pois_aveiro | Points of interest |
| iso_walk_rings | Walking isochrones |
| iso_bike_rings | Cycling isochrones |

---

## Future Work

- Integration of Aveiro Bus public transport using GTFS  
- Time-dependent routing and transit isochrones  
- Expanded slope-aware cost functions  
- Interactive dashboards and QGIS projects  

---

## Conclusion

This project establishes a reproducible and scientifically grounded framework for multimodal accessibility analysis in Aveiro. By combining osm2po and osm2pgsql, it ensures high-quality car routing while preserving complete pedestrian and cycling connectivity, forming a robust base for future multimodal and sustainable mobility studies.
