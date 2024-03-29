import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { PlatformAPIClient } from '../../lib/api.helpers';
import type { Developer } from '../../lib/generated/openapi';
import {
  ApiError,
  DevelopersService,
} from '../../lib/generated/openapi';

import * as setup from './common/test.setup';

const scriptName: string = path.basename(__filename);

describe(scriptName, function () {

  const orgctx = {
    organizationName: setup.organizationName,
  }

  const developer: Developer = {
    email: "developer@mycompany.com",
    firstName: "firstName",
    lastName: "lastName",
    userName: `developer@${setup.organizationName}`,
  }

  // HOOKS

  setup.addBeforeHooks(this);

  afterEach(async function () {
    PlatformAPIClient.setApiUser();
    await DevelopersService.deleteDeveloper({ ...orgctx, developerUsername: developer.userName }).catch(() => { });
  });

  setup.addAfterHooks(this);

  // TESTS

  it("should return a developer", async function () {

    await DevelopersService.createDeveloper({ ...orgctx, requestBody: developer });

    const response = await DevelopersService.getDeveloper({ ...orgctx, developerUsername: developer.userName }).catch((reason) => {
      expect(reason, `error=${reason.message}`).is.instanceof(ApiError);
      expect.fail(`failed to get developer; error="${reason.body.message}"`);
    });

    expect(response.body, "response is not correct").to.be.eql(developer);
  });

  it("should return a developer with additional attributes", async function () {

    const anotherDeveloper: Developer = {
      ...developer,
      attributes: [{
        name: "country",
        value: "DE",
      }],
    }

    await DevelopersService.createDeveloper({ ...orgctx, requestBody: anotherDeveloper });

    const response = await DevelopersService.getDeveloper({ ...orgctx, developerUsername: developer.userName }).catch((reason) => {
      expect(reason, `error=${reason.message}`).is.instanceof(ApiError);
      expect.fail(`failed to get developer; error="${reason.body.message}"`);
    });

    expect(response.body, "response is not correct").to.be.eql(anotherDeveloper);
  });

  it("should not return a developer if the user is not authorized", async function () {

    await DevelopersService.createDeveloper({ ...orgctx, requestBody: developer });

    PlatformAPIClient.setManagementUser();

    await DevelopersService.getDeveloper({ ...orgctx, developerUsername: developer.userName }).then(() => {
      expect.fail("unauthorized request was not rejected");
    }, (reason) => {
      expect(reason, `error=${reason.message}`).is.instanceof(ApiError);
      expect(reason.status, `status is not correct`).to.be.oneOf([401]);
    });
  });

  it("should not return a developer that does not exist", async function () {

    await DevelopersService.deleteDeveloper({ ...orgctx, developerUsername: "unknown" }).then(() => {
      expect.fail("invalid request was not rejected");
    }, (reason) => {
      expect(reason, `error=${reason.message}`).is.instanceof(ApiError);
      expect(reason.status, `status is not correct`).to.be.oneOf([404]);
    });
  });

});
