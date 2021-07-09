import L from '../server/common/logger';
import Environment = Components.Schemas.Environment;
import { OpenAPI, Service, ServicesService, ServiceResponse, ServicesResponse } from "./clients/solacecloud";
import { ErrorResponseInternal } from '../server/api/middlewares/error.handler';
import { getCloudBaseUrl, getCloudToken, validateToken, resolve } from './cloudtokenhelper';

import { Cache, CacheContainer } from 'node-ts-cache'
import { MemoryStorage } from 'node-ts-cache-storage-memory'

const serviceCache = new CacheContainer(new MemoryStorage());
const servicesCache = new CacheContainer(new MemoryStorage());

class SolaceCloudFacade {

  constructor() {
    OpenAPI.TOKEN = getCloudToken;
    OpenAPI.BASE = getCloudBaseUrl;
  }

  public async getServiceByEnvironment(e: Environment): Promise<Service> {
    return this.getServiceById(e.serviceId);
  }

  @Cache(serviceCache, {ttl: 3600})
  public async getServiceById(id: string): Promise<Service> {
    try {
      var result: ServiceResponse = await ServicesService.getService(id);
      if (result == null || result.data == null) {
        throw new ErrorResponseInternal(404, `Service ${id} does not exist`);
      } else {
        return result.data;
      }
    }
    catch (err) {
      L.error(`getServiceByEnvironment ${JSON.stringify(err)}`);
      throw new ErrorResponseInternal(500, `API Error ${err}`);
    }
  }

  @Cache(servicesCache, {ttl: 3600}) 
  public async getServices(): Promise<Service[]> {
    let services: Service[]  = [];
    try {
      var result: ServicesResponse = await ServicesService.listServices();
      if (result == null) {
        throw new ErrorResponseInternal(404, `No services found`);
      } else {
        for (const s of result.data){
        services.push(await this.getServiceById(s.serviceId))
        }
        return services;
      }
    }
    catch (e) {
      L.error(e);
      throw new ErrorResponseInternal(500, `API Error ${e}`);
    }
  }

  public async validate(token: string, baseUrl?: string): Promise<boolean> {
    let url: string = `${await resolve(OpenAPI.BASE)}/services`;
    if (baseUrl != null) {
      url = `${baseUrl}/services`;
    }
    return validateToken(token, url);
  }
}

export default new SolaceCloudFacade();
