import ApiProductsService from '../../services/apiProducts.service';
import { NextFunction, Request, Response } from 'express';
import L from '../../../common/logger';
import { ErrorResponseInternal } from '../../middlewares/error.handler';

export class Controller {
  all(req: Request, res: Response): void {
    ApiProductsService.all().then((r) => res.json(r).send());
  }

  create(req: Request, res: Response, next: NextFunction): void {
    ApiProductsService.create(req.body).then((r) => {
      if (r) {
        res.status(201).json(r).send();
      }
      else
        next(new ErrorResponseInternal(500, `No response`));
    }).catch((e) => next(e));
  }


  update(req: Request, res: Response, next: NextFunction): void {
    ApiProductsService.update(req.params['name'], req.body).then((r) => {
      if (r) {
        res.status(200).json(r).send();
      }
      else
        next(new ErrorResponseInternal(500, `No response`));
    }).catch((e) => next(e));
  }
  byName(req: Request, res: Response, next: NextFunction): void {
    ApiProductsService.byName(req.params['name']).then((r) => {
      if (r) res.json(r).status(200).send();
      else res.status(404);
    }).catch((e) => next(e));
  }

  delete(req: Request, res: Response, next: NextFunction): void {
    ApiProductsService.delete(req.params['name']).then((r) => {
      res.status(r).send();
    }).catch((e) => next(e));
  }

}
export default new Controller();
