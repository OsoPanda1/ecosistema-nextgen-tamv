# Geolocation Endpoints (RDM Digital)

## Base path

`/api/v1/geolocation`

## 1) Register a place

**POST** `/places/register`

Registers a business, street stall, or point of interest with initial AI-ready verification metadata.

### Auth

Required (`Bearer JWT`).

### Request body

```json
{
  "name": "Mercado Minero",
  "kind": "business",
  "category": "gastronomia",
  "address": "Calle Hidalgo 10",
  "lat": 20.13875,
  "lng": -98.67311,
  "accuracyMeters": 8,
  "source": "gps",
  "metadata": {
    "mediaEvidence": true,
    "operator": "rdm-merchant-app"
  }
}
```

### Response

Returns the created place and potential duplicate candidates within ~50 meters.

## 2) Ingest telemetry

**POST** `/telemetry/ingest`

Ingests a telemetry point in real time and returns nearby places (default search radius: 300 m).

### Auth

Optional (if authenticated, event is trace-logged to MSR).

### Request body

```json
{
  "sessionId": "a8cded93-58f9-4c46-88a8-1e73d2ccaf8b",
  "lat": 20.13870,
  "lng": -98.67350,
  "source": "gps",
  "accuracyMeters": 6,
  "speedKmh": 3.2,
  "headingDeg": 120,
  "observedAt": "2026-04-19T12:00:00.000Z"
}
```

## 3) Query nearby places

**GET** `/places/nearby?lat=20.1387&lng=-98.6731&radiusMeters=250`

Returns up to 50 places sorted by distance and filtered by requested radius.
