import { NextApiRequest, NextApiResponse } from 'next';
import { AuthClient } from '../../oauth/oauth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.redirect(AuthClient.getAuthURL());
}