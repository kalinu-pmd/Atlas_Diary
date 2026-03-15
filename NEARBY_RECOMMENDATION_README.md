# Nearby Location Recommendation Feature

## How it works
- Users select a location for each post using a map (Leaflet) in the post creation form.
- The backend stores the location as a GeoJSON Point.
- The recommendations endpoint supports location-based queries: pass `lng`, `lat`, and optional `radius` (meters) as query params to get posts near a location.

## Example API usage

To get posts near a location (e.g., Mumbai, India):

```
GET /posts/recommendations?lng=72.8777&lat=19.0760&radius=10000
```

## Frontend Usage
- The post creation form now includes a map picker.
- To show nearby recommendations, call the recommendations API with the user's chosen location.

## Backend Changes
- Post schema includes a `location` field (GeoJSON Point) and 2dsphere index.
- Geospatial queries are used for nearby recommendations.

## Testing
- Create a post and select a location on the map.
- Use the recommendations endpoint with location params to verify nearby posts are returned.
