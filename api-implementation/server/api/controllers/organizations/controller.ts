import OrganizationsService from '../../services/organizations.service';
import { Request, Response } from 'express';
import L from '../../../common/logger';

export class Controller {
  all(req: Request, res: Response): void {
    OrganizationsService.all().then((r) => res.json(r));
  }

  create(req: Request, res: Response): void {
    OrganizationsService.create(req.body).then((r) => {
      if (r) {
        res.status(201).json(r);
      }
      else res.status(500).end();
    }).catch((e) => {
      res.status(e).end()
    });
  }


  update(req: Request, res: Response): void {
    OrganizationsService.update(req.params['name'], req.body).then((r) => {
      if (r) {
        res.status(200).json(r);
      }
      else res.status(500).end();
    }).catch((e) => {
      L.info(e);
      res.status(e).end()
    });
  }
  byName(req: Request, res: Response): void {
    OrganizationsService.byName(req.params['name']).then((r) => {
      if (r) res.json(r);
      else res.status(404).end();
    }).catch((e) => {
      res.status(e).end();
    });
  }

  delete(req: Request, res: Response): void {
    OrganizationsService.delete(req.params['name']).then((r) => {
      res.status(r).end();
    }).catch((e) => {
      res.status(e).end();
    });
  }

}
export default new Controller();
