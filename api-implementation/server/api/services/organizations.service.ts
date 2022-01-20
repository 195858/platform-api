import L from '../../common/logger';
import { ContextConstants, PlatformConstants } from '../../common/constants';
import Organization = Components.Schemas.Organization;
import OrganizationResponse = Components.Schemas.OrganizationResponse;
import OrganizationStatus = Components.Schemas.OrganizationStatus;
import { PersistenceService } from './persistence.service';
import { ErrorResponseInternal } from '../middlewares/error.handler';
import { databaseaccess } from '../../../src/databaseaccess';
import AppsService from './apps.service';
import BrokerService from './broker.service';
import SolaceCloudFacade from '../../../src/solacecloudfacade';
import EventPortalFacade from '../../../src/eventportalfacade';
import { ns } from '../middlewares/context.handler';
import { isString } from '../../../src/typehelpers';

import { Cache, CacheContainer } from 'node-ts-cache'
import { MemoryStorage } from 'node-ts-cache-storage-memory'

const statusCache = new CacheContainer(new MemoryStorage());

export class OrganizationsService {
  private persistenceService: PersistenceService;
  constructor() {
    this.persistenceService = new PersistenceService('organizations');
  }

  all(query?: any): Promise<Organization[]> {
    return this.persistenceService.all(query);
  }

  async byName(name: string): Promise<Organization> {
    L.debug(`Organization.byName ${name}`);
    if (name == null) {
      throw new ErrorResponseInternal(500, `no name parameter provided`);
    }
    const org: OrganizationResponse = await this.persistenceService.byName(name);
    org.status = await this.getOrganizationStatusCached(org['cloud-token']);
    return org;
  }

  async delete(name: string): Promise<number> {
    if (name == PlatformConstants.PLATFORM_DB) {
      throw new ErrorResponseInternal(401, `Access denied, PlatformConstants.PLATFORM_DB name`);
    }
    const org = await this.byName(name);

    if (org == null) {
      throw new ErrorResponseInternal(404, `Organization not found`);
    }

    const p = new Promise<number>((resolve, reject) => {
      ns.getStore().set(ContextConstants.ORG_OBJECT, org);
      ns.getStore().set(ContextConstants.ORG_NAME, name);
      ns.getStore().set(ContextConstants.CLOUD_TOKEN, org[ContextConstants.CLOUD_TOKEN]);
      AppsService.all()
        .then((apps) => {
          const deprovisionPromises: Promise<any>[] = [];
          L.info(`cleaning up apps ${apps.length}`);
          apps.forEach(async (app) => {
            L.info(app);
            deprovisionPromises.push(BrokerService.deprovisionApp(app));
          });
          Promise.all(deprovisionPromises)
            .then((res) => {
              ns.getStore().set(ContextConstants.ORG_NAME, null);
              databaseaccess.client
                .db(name)
                .dropDatabase()
                .then((r) => {
                  resolve(this.persistenceService.delete(name));
                })
                .catch((e) => {
                  L.error(e);
                  reject(
                    new ErrorResponseInternal(404, `Organization not found`)
                  );
                });
            })
            .catch((e) => {
              L.info(e);
              reject(e);
            });
        })
        .catch((e) => {
          L.info(e);
          reject(e);
        });

    });
    return p;
  }

  async create(body: Organization): Promise<OrganizationResponse> {
    if (body.name == PlatformConstants.PLATFORM_DB) {
      throw (new ErrorResponseInternal(401, `Access denied, PlatformConstants.PLATFORM_DB name`));
    } else {
      if (
        body[ContextConstants.CLOUD_TOKEN] === undefined ||
        body[ContextConstants.CLOUD_TOKEN] === null ||
        (await this.validateCloudToken(body[ContextConstants.CLOUD_TOKEN]))
      ) {
        const org: OrganizationResponse = await this.persistenceService
          .create(body.name, body) as OrganizationResponse;
        org.status = await this.getOrganizationStatus(org['cloud-token']);
        return org;
      } else {
        throw (
          new ErrorResponseInternal(400, `Invalid cloud token provided`)
        );
      }
    }

  }

  async update(name: string, body: Organization): Promise<OrganizationResponse> {
    if (body.name == PlatformConstants.PLATFORM_DB) {
      throw(new ErrorResponseInternal(401, `Access denied, PlatformConstants.PLATFORM_DB name`));
    } else {
      if (
        body[ContextConstants.CLOUD_TOKEN] === undefined ||
        body[ContextConstants.CLOUD_TOKEN] === null ||
        (await this.validateCloudToken(body[ContextConstants.CLOUD_TOKEN]))
      ) {
        const org: OrganizationResponse = await this.persistenceService
          .update(name, body) as OrganizationResponse;
        org.status = await this.getOrganizationStatus(org['cloud-token']);
        return org;
      } else {
        throw(
          new ErrorResponseInternal(400, `Invalid cloud token provided`)
        );
      }
    }
  }

  async validateCloudToken(token: any): Promise<boolean> {
    try {

      if (isString(token)) {
        const isServiceToken: boolean = await SolaceCloudFacade.validate(token);
        const useProxyModeStr = process.env.APIS_PROXY_MODE || 'false';
        const useProxyMode = (useProxyModeStr.toLowerCase() == 'true') || (useProxyModeStr.toLowerCase() == '1');
        if (!useProxyMode) {
          return isServiceToken;
        } else {
          return isServiceToken && (await EventPortalFacade.validate(token));
        }
      } else {
        const isServiceToken: boolean = await SolaceCloudFacade.validate(token.cloud.token, token.cloud.baseUrl);
        const isPortalToken: boolean = await EventPortalFacade.validate(token.eventPortal.token, token.eventPortal.baseUrl);
        return isServiceToken && isPortalToken;
      }

    } catch (e) {
      L.warn(e);
      return false;
    }
  }

  @Cache(statusCache, {ttl: 240})
  async getOrganizationStatusCached(token: any): Promise<OrganizationStatus> {
    return this.getOrganizationStatus(token);
  }
  
  async getOrganizationStatus(token: any): Promise<OrganizationStatus> {
    const status: OrganizationStatus = {

    };
    if (!token){
      return status;
    }

    if (isString(token)) {
      status.cloudConnectivity = await SolaceCloudFacade.validate(token);
      status.eventPortalConnectivity = await EventPortalFacade.validate(token);
    } else {
      status.cloudConnectivity = await SolaceCloudFacade.validate(token.cloud.token, token.cloud.baseUrl);
      status.eventPortalConnectivity = await EventPortalFacade.validate(token.eventPortal.token, token.eventPortal.baseUrl);
    }

    return status;
  }
}

export default new OrganizationsService();
