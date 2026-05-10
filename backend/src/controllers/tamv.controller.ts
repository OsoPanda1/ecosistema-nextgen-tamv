import { Request, Response } from 'express';
import { tamvService } from '../services/tamv.service';

export const getTamvSnapshot = async (_req: Request, res: Response): Promise<void> => {
  const snapshot = await tamvService.getPlatformSnapshot();
  res.json(snapshot);
};
