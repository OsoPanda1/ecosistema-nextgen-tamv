/**
 * Geolocation Controller
 */

import { Request, Response, NextFunction } from 'express';
import * as geolocationService from '../services/geolocation.service';

export async function registerPlaceHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const actorId = req.user?.id;

    if (!actorId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const result = await geolocationService.registerPlace({
      actorId,
      name: req.body.name,
      kind: req.body.kind,
      category: req.body.category,
      address: req.body.address,
      lat: req.body.lat,
      lng: req.body.lng,
      accuracyMeters: req.body.accuracyMeters,
      source: req.body.source,
      metadata: req.body.metadata,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function ingestTelemetryHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await geolocationService.ingestTelemetry({
      actorId: req.user?.id,
      sessionId: req.body.sessionId,
      lat: req.body.lat,
      lng: req.body.lng,
      source: req.body.source,
      accuracyMeters: req.body.accuracyMeters,
      speedKmh: req.body.speedKmh,
      headingDeg: req.body.headingDeg,
      observedAt: req.body.observedAt,
      metadata: req.body.metadata,
    });

    res.status(202).json(result);
  } catch (error) {
    next(error);
  }
}

export async function nearbyPlacesHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusMeters = req.query.radiusMeters ? parseInt(req.query.radiusMeters as string, 10) : 250;

    const places = await geolocationService.findNearbyPlaces(lat, lng, radiusMeters);
    res.json({ items: places, count: places.length, radiusMeters });
  } catch (error) {
    next(error);
  }
}
