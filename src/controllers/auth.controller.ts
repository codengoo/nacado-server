import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../data';
import UserModel from '../models/user.model';
import { handleExceptions } from '../utils';
import { AuthorizationError, ValidationError } from '../utils/error';
import { isNullOrEmpty } from '../validations/base.validation';

export default class AuthController {
  static async openDeepLink(req: Request, res: Response) {
    // patch: Remove on production
    const id = req.query.id as string;

    await handleExceptions(res, async () => {
      // const user = req.user as IUser;

      // TODO: remove on product
      const user =
        (req.user as IUser) || (id && (await UserModel.getUserByID(id)));

      if (!user) throw new ValidationError('Invalid user');
      const token = jwt.sign(user, process.env.JWT_TOKEN);
      const refresh = jwt.sign(user, process.env.JWT_REFRESH);
      res.redirect(`nacado://auth?token=${token}&refresh=${refresh}`);
    });
  }

  static async failed(req: Request, res: Response) {
    await handleExceptions(res, async () => {
      res.status(401).json({ message: 'Unauthorized' });
      throw new AuthorizationError();
    });
  }

  static async checkLogin(req: Request, res: Response) {
    const { token } = req.cookies;

    await handleExceptions(res, async () => {
      if (isNullOrEmpty(token)) {
        throw new AuthorizationError();
      }

      try {
        const user = jwt.verify(token, process.env.JWT_TOKEN);
        res.json({ message: 'Ok', user: user });
      } catch (error) {
        throw new AuthorizationError();
      }
    });
  }
}
