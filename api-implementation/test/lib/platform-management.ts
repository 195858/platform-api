import { RequestInit } from "node-fetch";
import { TestLogger, PlatformRequestHelper, PlatformResponseHelper } from "./test.helpers";

export class PlatformManagementHelper {

    private platformManagementRequest: PlatformRequestHelper;
    private apiPath: string = "organizations"

    constructor(platformManagementRequest: PlatformRequestHelper) {
        this.platformManagementRequest = platformManagementRequest;
    }
    private _logResponse = (msg: string, response: PlatformResponseHelper) => { 
        TestLogger.logResponse(`platformManagement:${msg}`, response);
    }
    createOrg = async (orgName: string): Promise<boolean> => {
        let body = {
          name: orgName
        }
        let request: RequestInit = {
          method: "POST",
          body: JSON.stringify(body)
        };
        let response: PlatformResponseHelper = await this.platformManagementRequest.fetch(this.apiPath, request);
        TestLogger.logResponse(`create org: ${orgName}`, response);
        return true;
    }
    deleteOrg = async (orgName: string): Promise<boolean> => {
        let apiPath: string = this.apiPath + "/" + orgName;
        let request: RequestInit = {
            method: "DELETE"
        };
        // console.log(`deleting ${orgName}...`);
        let response: PlatformResponseHelper = await this.platformManagementRequest.fetch(apiPath, request); 
        // console.log(`apiPath=${apiPath}`);
        // console.log(`deleting org=${JSON.stringify(org, null, 2)}`);
        // response = await this.platformRequest.fetch(apiPath, request);         
        // console.log("why am i not seeing this?");
        this._logResponse(`delete org '${orgName}'` , response);
        return true;
    }
    deleteAllOrgs = async(): Promise<boolean> => {
        let success: boolean = true;
        let request: RequestInit = null;
        let response: PlatformResponseHelper = null;
        request = {
            method: "GET"
          };
        response = await this.platformManagementRequest.fetch(this.apiPath, request);
        this._logResponse("get all orgs", response);
        if(response.status == 200) {
            let orgs = response.body;
            let num = orgs ? orgs.length : 0;
            for (let i=0; i < num; i++) {
                success = await this.deleteOrg(orgs[i].name) && success;
            }
        }
        return success;
    }
}

