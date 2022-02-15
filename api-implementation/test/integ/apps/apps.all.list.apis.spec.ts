import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { PlatformAPIClient } from '../../lib/api.helpers';
import { TestContext } from "../../lib/test.helpers";
import type { App } from "../../lib/generated/openapi";
import { ApiError, AppsService } from "../../lib/generated/openapi";

import * as setup from './common/test.setup';

const scriptName: string = path.basename(__filename);

describe(scriptName, function () {

  const organizationName: string = setup.organizationName;
  const developerName: string = setup.developer1.userName;

  const devctx = {
    organizationName: organizationName,
    developerUsername: developerName,
  }

  const applicationName1: string = `${developerName}-app1`;
  const applicationName2: string = `${developerName}-app2`;

  const appctx1 = {
    organizationName: organizationName,
    appName: applicationName1,
  }

  const appctx2 = {
    organizationName: organizationName,
    appName: applicationName2,
  }

  /**
   * An application with API products.
   * 
   * API products:
   * - {@link setup.apiProduct1 apiProduct1}, {@link setup.apiProduct2 apiProduct2} and {@link setup.apiProduct3 apiProduct3}
   */
  const application1: App = {
    name: applicationName1,
    apiProducts: [setup.apiProduct2.name, setup.apiProduct1.name, setup.apiProduct3.name],
    credentials: { expiresAt: -1 },
  }

  /** An application without API products. */
  const application2: App = {
    name: applicationName2,
    apiProducts: [],
    credentials: { expiresAt: -1 },
  }

  // HOOKS

  setup.addBeforeHooks(this);

  before(async function () {
    TestContext.newItId();
    await Promise.all([
      AppsService.createDeveloperApp({ ...devctx, requestBody: application1 }),
      AppsService.createDeveloperApp({ ...devctx, requestBody: application2 }),
    ]);
  });

  after(async function () {
    TestContext.newItId();
    await Promise.all([
      AppsService.deleteDeveloperApp({ ...devctx, appName: applicationName1 }).catch(() => { }),
      AppsService.deleteDeveloperApp({ ...devctx, appName: applicationName2 }).catch(() => { }),
    ]);
  });

  setup.addAfterHooks(this);

  // TESTS

  it("should return API names", async function () {

    const response = await AppsService.listAppApiSpecifications({ ...appctx1 }).catch((reason) => {
      expect(reason, `error=${reason.message}`).is.instanceof(ApiError);
      expect.fail(`failed to get API names; error="${reason.body.message}"`);
    });

    const names: Set<string> = new Set(setup.apiProduct1.apis.concat(setup.apiProduct2.apis, setup.apiProduct3.apis));
    expect(response.body, "API names are incorrect").to.have.members(Array.from(names.values()));
  });

  it("should return no API names for an application without API products", async function () {

    const response = await AppsService.listAppApiSpecifications({ ...appctx2 }).catch((reason) => {
      expect(reason, `error=${reason.message}`).is.instanceof(ApiError);
      expect.fail(`failed to get application status; error="${reason.body.message}"`);
    });

    expect(response.body, "returned API names are incorrect").to.be.empty;
  });

  it("should not return API names if the user is not authorized", async function () {

    PlatformAPIClient.setManagementUser();

    await AppsService.listAppApiSpecifications({ ...appctx1 }).then(() => {
      expect.fail("unauthorized request was not rejected");
    }, (reason) => {
      expect(reason, `error=${reason.message}`).is.instanceof(ApiError);
      expect(reason.status, `status is not correct`).to.be.oneOf([401]);
    });
  });

  it("should not return API names for an unknown application", async function () {

    await AppsService.listAppApiSpecifications({ organizationName: organizationName, appName: "unknown" }).then(() => {
      expect.fail("invalid request was not rejected");
    }, (reason) => {
      expect(reason, `error=${reason.message}`).is.instanceof(ApiError);
      expect(reason.status, `status is not correct`).to.be.oneOf([404]);
    });
  });

});
