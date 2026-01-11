# Update of the Multimodal Network and Isochrones (v3_plus)

## Context and Motivation

During validation of the accessibility results, it was observed that the **walking and cycling isochrones were spatially limited and fragmented**, especially when compared with expected real-world accessibility patterns in Aveiro.  
This issue was traced back to **missing pedestrian and cycling paths** in the underlying network, particularly OSM features such as footways, paths, steps, and cycleways.

The **car network was already validated and producing realistic isochrones**, therefore **only walking and cycling were updated**, leaving car routing unchanged.

---

## Tables Involved

### Existing Tables
- **rede_viaria_v3**  
  Original multimodal edge table used by the web application (walk, bike, car).
- **iso_walk_rings**, **iso_bike_rings**, **iso_car_rings**  
  Previously computed isochrone rings used by the frontend.

### New Tables Introduced
- **missing_viaria_av**  
  New table imported from OpenStreetMap containing missing pedestrian and cycling paths.
- **rede_viaria_v3_plus**  
  Updated main network table combining the original network with the newly imported paths.
- **rede_viaria_v3_plus_vertices_pgr**  
  pgRouting vertex table created from the updated network topology.

### New Isochrone Tables
- **iso_walk_v3_plus**
- **iso_bike_v3_plus**
- **iso_walk_rings_v3_plus**
- **iso_bike_rings_v3_plus**

---

## Network Update Process

### 1. Merging Missing Paths

A new network table (**rede_viaria_v3_plus**) was created by copying the original network and **inserting only new edges** from `missing_viaria_av`, ensuring that:
- Existing edges were preserved
- Only genuinely new OSM paths were added
- Duplicate OSM IDs were avoided

### 2. Geometry Normalization

The imported paths introduced **mixed geometry types and Z dimensions**, which are incompatible with pgRouting topology creation.

To resolve this, a new geometry column was created:

- **geom_2d**: `geometry(MultiLineString, 3763)`

Each geometry was normalized using:
- `ST_LineMerge` to unify segments
- `ST_Force2D` to remove Z values
- `ST_Multi` to ensure consistent geometry type

This ensured full compatibility with pgRouting.

---

## Topology Rebuild

After geometry normalization, the routing topology was rebuilt using:

- Edge ID: `id_0`
- Geometry: `geom_2d`
- Tolerance: `0.5 meters`
- Output columns: `source`, `target`

This produced the vertex table:
- **rede_viaria_v3_plus_vertices_pgr**

The rebuild confirmed:
- All new walk/bike paths were properly connected
- Thousands of additional edges became reachable from central Aveiro
- Snapping and reachability now work as expected

---

## Cost Model Handling

### Walking and Cycling
- Existing cost values were preserved
- **Only newly added edges were recomputed**
- Because slope data was unavailable for new paths:
  - `slope_dire` was assumed to be **0**
  - Tobler’s Hiking Function was applied without slope penalty

This ensures consistency with the original cost model while avoiding unrealistic penalties.

### Car
- **No changes were made**
- Car routing and isochrones continue to rely on the original validated network

---

## Isochrone Recalculation

### Time Thresholds
The same thresholds used previously were preserved to ensure consistency:

**5, 10, 15, 20, 25, 30 minutes**

### Recomputed Layers
Using the updated topology and costs, new isochrones were generated for:

- **Walking**
  - `iso_walk_v3_plus`
  - `iso_walk_rings_v3_plus`
- **Cycling**
  - `iso_bike_v3_plus`
  - `iso_bike_rings_v3_plus`

Each ring represents the incremental accessibility band between consecutive time thresholds.

### Improvements Observed
- Significantly larger and more continuous walk/bike isochrones
- Correct traversal of parks, campuses, pedestrian streets, and shared paths
- Accessibility patterns now align with expected real-world behavior

---

## Final State of the System

### Routing Networks
| Mode | Network Table |
|-----|--------------|
| Walk | rede_viaria_v3_plus |
| Bike | rede_viaria_v3_plus |
| Car  | rede_viaria_v3 (unchanged) |

### Isochrone Tables
| Mode | Isochrones | Rings |
|-----|-----------|-------|
| Walk | iso_walk_v3_plus | iso_walk_rings_v3_plus |
| Bike | iso_bike_v3_plus | iso_bike_rings_v3_plus |
| Car  | (unchanged) | iso_car_rings |

---

## Required Web Application Updates

To reflect the improved accessibility model, the web application must be updated as follows:

### Backend (Django / API)
- **Routing endpoints**
  - Walk/Bike: use `rede_viaria_v3_plus` and `rede_viaria_v3_plus_vertices_pgr`
  - Car: keep existing logic unchanged
- **Isochrone endpoints**
  - Walk: read from `iso_walk_rings_v3_plus`
  - Bike: read from `iso_bike_rings_v3_plus`
  - Car: continue using existing tables

### Frontend (React / Leaflet)
- No UI changes required
- Map layers automatically benefit from:
  - Larger isochrones
  - More realistic walk/bike coverage
  - Improved visual continuity

---

## Summary

This update resolves the main limitation of the original walking and cycling model by:
- Completing the pedestrian and cycling network
- Rebuilding topology with consistent geometries
- Preserving the validated car model
- Recomputing isochrones with realistic reachability

The result is a **more accurate, robust, and realistic multimodal accessibility system**, fully compatible with both QGIS-based analysis and the interactive web application.
