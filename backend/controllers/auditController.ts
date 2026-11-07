import { Response } from 'express';
import storage from '../storage.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { module, action, userName } = req.query;
    const logs = await storage.getAuditLogs({
      module: module as string,
      action: action as string,
      userName: userName as string,
    });

    return res.status(200).json({ success: true, count: logs.length, logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit trail.' });
  }
};
