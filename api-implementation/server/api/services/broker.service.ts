import L from '../../common/logger';

import App = Components.Schemas.App;
import Developer = Components.Schemas.Developer;
import APIProduct = Components.Schemas.APIProduct;
import Environment = Components.Schemas.Environment;
import Permissions = Components.Schemas.Permissions;
import Endpoint = Components.Schemas.Endpoint;

import ApiProductsService from './apiProducts.service';
import ApisService from './apis.service';

import EnvironmentsService from './environments.service';
import { Service } from "../../../src/clients/solacecloud"
import { ApiError, AllService, MsgVpnClientUsername, MsgVpnClientUsernameResponse, MsgVpnAclProfile, MsgVpnAclProfileResponse, MsgVpnAclProfilePublishException, MsgVpnAclProfilePublishExceptionResponse, MsgVpnAclProfileSubscribeExceptionResponse, MsgVpnAclProfileSubscribeException, MsgVpnQueue, MsgVpnQueueSubscription, MsgVpnRestDeliveryPoint, MsgVpnRestDeliveryPointRestConsumer, MsgVpnRestDeliveryPointQueueBinding, MsgVpnRestDeliveryPointQueueBindingResponse } from '../../../src/clients/sempv2';
import SolaceCloudFacade from '../../../src/solacecloudfacade';
import { Sempv2Client } from '../../../src/sempv2-client';

import parser from '@asyncapi/parser';

import { ErrorResponseInternal } from '../middlewares/error.handler';

enum Direction {
	Publish = "Publish",
	Subscribe = "Subscribe"
}

interface ProtocolMapping {
	name: string,
	protocolKeys: SolaceProtocolIdentifiers
}

interface SolaceProtocolIdentifiers {
	name: string
	protocol: string
}

class BrokerService {


	getPermissions(app: App, developer: Developer): Promise<Permissions> {
		return new Promise<Permissions>((resolve, reject) => {
			var environmentNames: string[] = [];

			var apiProductPromises: Promise<APIProduct>[] = [];
			app.apiProducts.forEach((productName: string) => {
				L.info(productName);
				apiProductPromises.push(ApiProductsService.byName(productName));
			});

			Promise.all(apiProductPromises).then(async (products: APIProduct[]) => {
				products.forEach((product: APIProduct) => {
					product.environments.forEach((e: string) => {
						environmentNames.push(e);
					})
					L.info(`env: ${product.environments}`);
				});
				environmentNames = Array.from(new Set(environmentNames));

				try {
					var c: Permissions = await this.getClientACLExceptions(app, products, developer);
					resolve(c);

				} catch (e) {
					L.error("Get permissions error");
					reject(new ErrorResponseInternal(500, e));
				}
			});
		});
	}
	provisionApp(app: App, developer: Developer): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			var environmentNames: string[] = [];

			var apiProductPromises: Promise<APIProduct>[] = [];
			app.apiProducts.forEach((productName: string) => {
				L.info(productName);
				apiProductPromises.push(ApiProductsService.byName(productName));
			});

			Promise.all(apiProductPromises).then(async (products: APIProduct[]) => {
				products.forEach((product: APIProduct) => {
					product.environments.forEach((e: string) => {
						environmentNames.push(e);
					})
					L.info(`env: ${product.environments}`);
				});
				environmentNames = Array.from(new Set(environmentNames));

				try {
					const services = await this.getServices(environmentNames);
					var a = await this.createACLs(app, services);
					L.info(`created acl profile ${app.name}`);
					var b = await this.createClientUsernames(app, services);
					L.info(`created client username ${app.name}`);
					var c = await this.createClientACLExceptions(app, services, products, developer);
					L.info(`created acl exceptions ${app.name}`);
					// no webhook - no RDP
					if (app.webHook) {
						var d = await this.createQueues(app, services, products, developer);
						L.info(`created queues ${app.name}`);
						var d = await this.createRDP(app, services, products);
					}
					resolve(null);
				} catch (e) {
					L.error(`Provisioning error ${e}`);
					reject(new ErrorResponseInternal(500, e));
				}
			});
		});
	}

	deprovisionApp(app: App) {
		return new Promise<any>((resolve, reject) => {
			var environmentNames: string[] = [];

			var apiProductPromises: Promise<APIProduct>[] = [];
			app.apiProducts.forEach((productName: string) => {
				L.info(productName);
				apiProductPromises.push(ApiProductsService.byName(productName));
			});

			Promise.all(apiProductPromises).then(async (products: APIProduct[]) => {
				products.forEach((product: APIProduct) => {
					product.environments.forEach((e: string) => {
						environmentNames.push(e);
					})
					L.info(`env: ${product.environments}`);
				});
				environmentNames = Array.from(new Set(environmentNames));

				try {
					const services = await this.getServices(environmentNames);
					var b = await this.deleteClientUsernames(app, services);
					var a = await this.deleteACLs(app, services);
					var d = await this.deleteRDPs(app, services);
					var c = await this.deleteQueues(app, services);
					resolve(null);
				} catch (e) {
					L.error("De-Provisioninig error");
					reject(new ErrorResponseInternal(500, e));
				}
			});
		});

	}

	private getServices(environmentNames: string[]): Promise<Service[]> {
		return new Promise<Service[]>((resolve, reject) => {
			L.info(`all-env: ${environmentNames}`);
			var returnServices: Service[] = [];
			var servicePromises: Promise<Service>[] = [];
			var environmentPromises: Promise<Environment>[] = [];
			environmentNames.forEach((envName: string) => {
				L.info(envName);
				var ep = EnvironmentsService.byName(envName);
				environmentPromises.push(ep);
				ep.then((env: Environment) => {
					L.info(env.serviceId);
					var r = SolaceCloudFacade.getServiceByEnvironment(env);
					servicePromises.push(r);
					r.then((service: Service) => {
						returnServices.push(service);
					}).catch((e) => {
						L.error(e);
						reject(e)
					});

				}).catch((e) => {
					L.error(e);
					reject(e)
				});
			});
			Promise.all(environmentPromises).then((proms) => {
				Promise.all(servicePromises).then((p) => {
					L.info("return services resolve")
					resolve(returnServices);
				}).catch((e) => {
					L.error(e);
					reject(e)
				})

			});

		});
	}

	private getServiceByEnv(envName: string): Promise<Service> {
		return new Promise<Service>((resolve, reject) => {
			L.info(envName);
			var ep = EnvironmentsService.byName(envName);
			ep.then((env: Environment) => {
				L.info(env.serviceId);
				var r = SolaceCloudFacade.getServiceByEnvironment(env);

				r.then((service: Service) => {
					resolve(service);
				}).catch((e) => {
					L.error(e);
					reject(e)
				});

			});

		});
	}

	private createACLs(app: App, services: Service[]) {
		return new Promise<any>(async (resolve, reject) => {
			var allACLResponses: Promise<MsgVpnAclProfileResponse>[] = [];
			for (var service of services) {

				var sempv2Client = this.getSEMPv2Client(service);
				var aclProfile: MsgVpnAclProfile = {
					aclProfileName: app.credentials.secret.consumerKey,
					clientConnectDefaultAction: MsgVpnAclProfile.clientConnectDefaultAction.ALLOW,
					publishTopicDefaultAction: MsgVpnAclProfile.publishTopicDefaultAction.DISALLOW,
					subscribeTopicDefaultAction: MsgVpnAclProfile.subscribeTopicDefaultAction.DISALLOW,
					msgVpnName: service.msgVpnName

				};
				try {
					var getResponse = await AllService.getMsgVpnAclProfile(service.msgVpnName, app.credentials.secret.consumerKey);
					L.info("ACL Looked up");
					var responseUpd = await AllService.updateMsgVpnAclProfile(service.msgVpnName, app.credentials.secret.consumerKey, aclProfile);
					L.info("ACL updated");
				} catch (e) {

					try {
						let response = await AllService.createMsgVpnAclProfile(service.msgVpnName, aclProfile);
						L.info("created  ACL");
					} catch (e) {
						reject(e);
					}
				}
			};
			resolve();
		});
	}

	private deleteACLs(app: App, services: Service[]) {
		return new Promise<any>(async (resolve, reject) => {
			for (var service of services) {
				var sempv2Client = this.getSEMPv2Client(service);
				try {
					var getResponse = await AllService.deleteMsgVpnAclProfile(service.msgVpnName, app.credentials.secret.consumerKey);
					L.info("ACL deleted");
				} catch (e) {

					reject(e);
				}
			};
			resolve();
		});
	}

	private deleteQueues(app: App, services: Service[]) {
		return new Promise<any>(async (resolve, reject) => {
			for (var service of services) {
				var sempv2Client = this.getSEMPv2Client(service);
				try {
					var getResponse = await AllService.deleteMsgVpnQueue(service.msgVpnName, app.credentials.secret.consumerKey);
					L.info('Queue deleted');
				} catch (e) {

					reject(e);
				}
			};
			resolve();
		});
	}

	private deleteRDPs(app: App, services: Service[]) {
		return new Promise<any>(async (resolve, reject) => {
			for (var service of services) {
				var sempv2Client = this.getSEMPv2Client(service);
				try {
					var getResponse = await AllService.deleteMsgVpnRestDeliveryPoint(service.msgVpnName, app.credentials.secret.consumerKey);
					L.info("RDP deleted");
				} catch (e) {

					reject(e);
				}
			};
			resolve();
		});
	}

	private createClientUsernames(app: App, services: Service[]): Promise<any> {
		return new Promise<any>(async (resolve, reject) => {
			for (var service of services) {
				var sempV2Client = this.getSEMPv2Client(service);
				var clientUsername: MsgVpnClientUsername = {
					aclProfileName: app.credentials.secret.consumerKey,
					clientUsername: app.credentials.secret.consumerKey,
					password: app.credentials.secret.consumerSecret,
					clientProfileName: "default",
					msgVpnName: service.msgVpnName,
					enabled: true

				};
				try {
					var getResponse = await AllService.getMsgVpnClientUsername(service.msgVpnName, app.credentials.secret.consumerKey);
					L.info("Client Username Looked up");
					var responseUpd = await AllService.updateMsgVpnClientUsername(service.msgVpnName, app.credentials.secret.consumerKey, clientUsername);
					L.info("Client Username updated");
				} catch (e) {

					try {
						let response = await AllService.createMsgVpnClientUsername(service.msgVpnName, clientUsername);
						L.info("created  Client Username");
					} catch (e) {
						reject(e);
					}
				}
			}
			resolve();
		});
	}

	private deleteClientUsernames(app: App, services: Service[]): Promise<any> {
		return new Promise<any>(async (resolve, reject) => {
			for (var service of services) {
				var sempV2Client = this.getSEMPv2Client(service);
				var clientUsername: MsgVpnClientUsername = {
					aclProfileName: app.credentials.secret.consumerKey,
					clientUsername: app.credentials.secret.consumerKey,
					password: app.credentials.secret.consumerSecret,
					clientProfileName: "default",
					msgVpnName: service.msgVpnName,
					enabled: true

				};
				try {
					var getResponse = await AllService.deleteMsgVpnClientUsername(service.msgVpnName, app.credentials.secret.consumerKey);
				} catch (e) {
					reject(e);
				}
			}
			resolve();
		});
	}
	private createClientACLExceptions(app: App, services: Service[], apiProducts: APIProduct[], developer: Developer): Promise<void> {
		return new Promise<any>(async (resolve, reject) => {
			L.info(` services: ${services}`);
			var publishExceptions: string[] = [];
			var subscribeExceptions: string[] = [];
			// compile list of event destinations sub / pub separately
			for (var product of apiProducts) {
				publishExceptions = this.getResources(product.pubResources).concat(publishExceptions);
				subscribeExceptions = this.getResources(product.subResources).concat(subscribeExceptions);
				var strs: string[] = await this.getResourcesFromAsyncAPIs(product.apis, Direction.Subscribe);
				for (var s of strs) {
					subscribeExceptions.push(s);
				}
				strs = await this.getResourcesFromAsyncAPIs(product.apis, Direction.Publish);
				for (var s of strs) {
					publishExceptions.push(s);
				}
			}

			// inject attribute values into parameters within subscriptions
			var attributes: any[] = this.getAttributes(app, developer, apiProducts);
			subscribeExceptions = this.enrichTopics(subscribeExceptions, attributes);
			publishExceptions = this.enrichTopics(publishExceptions, attributes);
			publishExceptions.forEach((s, index, arr) => {
				arr[index] = this.scrubDestination(s);
			});
			subscribeExceptions.forEach((s, index, arr) => {
				arr[index] = this.scrubDestination(s);
			});
			try {
				var q = await this.addPublishTopicExceptions(app, services, publishExceptions);
				var r = await this.addSubscribeTopicExceptions(app, services, subscribeExceptions);
				resolve();
			} catch (e) {


				reject(new ErrorResponseInternal(400, e));
			}
		});
	}


	private getAttributes(app: App, developer: Developer, products: APIProduct[]) {
		var attributes = [];
		if (app.attributes) {
			attributes = attributes.concat(app.attributes);
		}
		if (developer.attributes) {
			attributes = attributes.concat(developer.attributes);
		}
		products.forEach(p => {
			if (p.attributes) {
				attributes = attributes.concat(p.attributes);
			}
		});
		return attributes;

	}

	private createRDP(app: App, services: Service[], apiProducts: APIProduct[]): Promise<void> {
		return new Promise<any>(async (resolve, reject) => {
			L.info(`createRDP services: ${services}`);
			var subscribeExceptions: string[] = [];
			for (var product of apiProducts) {
				var strs: string[] = await this.getRDPSubscriptionsFromAsyncAPIs(product.apis);
				for (var s of strs) {
					subscribeExceptions.push(s);
				}
			}
			if (subscribeExceptions.length < 1) {
				resolve();
				return;
			}
			// loop over services
			var restConsumerName = `Consumer`;
			var rdpUrl: URL;
			try {
				rdpUrl = new URL(app.webHook.uri);
			} catch (e) {
				reject(new ErrorResponseInternal(400, "Callback URL not provided or invalid"));
				return;
			}
			var protocol = rdpUrl.protocol.toUpperCase();
			var port = rdpUrl.port;
			var useTls: boolean = false;
			if (protocol == "HTTPS:") {
				useTls = true;
			}
			L.debug(`protocol is ${protocol}`);
			if (port == "") {
				if (protocol == "HTTPS:") {
					port = '443';
				} else {
					port = '80';
				}
			}
			for (var service of services) {
				//create RDPs
				var sempV2Client = this.getSEMPv2Client(service);
				var newRDP: MsgVpnRestDeliveryPoint = {
					clientProfileName: "default",
					msgVpnName: service.msgVpnName,
					restDeliveryPointName: app.credentials.secret.consumerKey,
					enabled: false
				};
				try {
					var q = await AllService.getMsgVpnRestDeliveryPoint(service.msgVpnName, app.credentials.secret.consumerKey);
					var updateResponse = await AllService.updateMsgVpnRestDeliveryPoint(service.msgVpnName, app.credentials.secret.consumerKey, newRDP);
					L.debug(`createRDP updated ${app.credentials.secret.consumerKey}`);
				} catch (e: any) {
					L.debug(`createRDP lookup  failed ${JSON.stringify(e)}`);
					try {
						var q = await AllService.createMsgVpnRestDeliveryPoint(service.msgVpnName, newRDP);
					} catch (e) {
						L.warn(`createRDP creation  failed ${JSON.stringify(e)}`);
						reject(e);
						return;
					}
				}
				var authScheme = app.webHook.authentication && app.webHook.authentication['username'] ? MsgVpnRestDeliveryPointRestConsumer.authenticationScheme.HTTP_BASIC : MsgVpnRestDeliveryPointRestConsumer.authenticationScheme.NONE;
				var newRDPConsumer: MsgVpnRestDeliveryPointRestConsumer = {
					msgVpnName: service.msgVpnName,
					restDeliveryPointName: app.credentials.secret.consumerKey,
					restConsumerName: restConsumerName,
					remotePort: parseInt(port),
					remoteHost: rdpUrl.hostname,
					tlsEnabled: useTls,
					enabled: false,
					authenticationScheme: authScheme
				};
				if (authScheme == MsgVpnRestDeliveryPointRestConsumer.authenticationScheme.HTTP_BASIC) {
					newRDPConsumer.authenticationHttpBasicUsername = app.webHook.authentication['username'];
					newRDPConsumer.authenticationHttpBasicPassword = app.webHook.authentication['password'];
				}

				try {
					var r = await AllService.getMsgVpnRestDeliveryPointRestConsumer(service.msgVpnName, app.credentials.secret.consumerKey, restConsumerName);
					var updateResponseRDPConsumer = await AllService.updateMsgVpnRestDeliveryPointRestConsumer(service.msgVpnName, app.credentials.secret.consumerKey, restConsumerName, newRDPConsumer);
					L.debug(`createRDP consumer updated ${app.credentials.secret.consumerKey}`);
				} catch (e: any) {
					L.debug(`createRDP consumer lookup  failed ${JSON.stringify(e)}`);
					try {
						var r = await AllService.createMsgVpnRestDeliveryPointRestConsumer(service.msgVpnName, app.credentials.secret.consumerKey, newRDPConsumer);
					} catch (e) {
						L.warn(`createRDP consumer creation  failed ${JSON.stringify(e)}`);
						reject(e);
						return;
					}
				}

				var newRDPQueueBinding: MsgVpnRestDeliveryPointQueueBinding = {
					msgVpnName: service.msgVpnName,
					restDeliveryPointName: app.credentials.secret.consumerKey,
					postRequestTarget: rdpUrl.pathname,
					queueBindingName: app.credentials.secret.consumerKey
				};
				try {
					var b = await AllService.getMsgVpnRestDeliveryPointQueueBinding(service.msgVpnName, app.credentials.secret.consumerKey, app.credentials.secret.consumerKey);

					var updateResponseQueueBinding = await AllService.updateMsgVpnRestDeliveryPointQueueBinding(service.msgVpnName, app.credentials.secret.consumerKey, app.credentials.secret.consumerKey, newRDPQueueBinding);
					L.debug(`createRDP queue binding updated ${app.credentials.secret.consumerKey}`);
				} catch (e: any) {
					L.debug(`createRDP queue binding lookup  failed ${JSON.stringify(e)}`);
					try {
						var b = await AllService.createMsgVpnRestDeliveryPointQueueBinding(service.msgVpnName, app.credentials.secret.consumerKey, newRDPQueueBinding);
					} catch (e) {
						L.warn(`createRDP queue binding creation  failed ${JSON.stringify(e)}`);
						reject(e);
						return;
					}
				}

				// enable the RDP
				try {
					var enableRDP: MsgVpnRestDeliveryPoint = {
						enabled: true
					}; var enableRDPResponse = await AllService.updateMsgVpnRestDeliveryPoint(service.msgVpnName, app.credentials.secret.consumerKey, enableRDP);
					L.debug(`createRDP enabled ${app.credentials.secret.consumerKey}`);
				} catch (e: any) {
					L.error(`createRDP enable failed ${JSON.stringify(e)}`);
					reject(new ErrorResponseInternal(500, e));
				}

				// enable the RDP consumer

				try {
					var enableRDPConsumer: MsgVpnRestDeliveryPointRestConsumer = {
						enabled: true
					};
					var updateResponseRDPConsumer = await AllService.updateMsgVpnRestDeliveryPointRestConsumer(service.msgVpnName, app.credentials.secret.consumerKey, restConsumerName, enableRDPConsumer);
					L.debug(`createRDP consumer enabled ${app.credentials.secret.consumerKey}`);
				} catch (e: any) {
					L.debug(`createRDP consumer enablement  failed ${JSON.stringify(e)}`);
				}

			}
			resolve();
		});
	}


	private createQueues(app: App, services: Service[], apiProducts: APIProduct[], developer: Developer): Promise<void> {
		return new Promise<any>(async (resolve, reject) => {
			L.info(`createQueueSubscriptions services: ${services}`);
			var subscribeExceptions: string[] = [];
			for (var product of apiProducts) {
				var strs: string[] = await this.getRDPSubscriptionsFromAsyncAPIs(product.apis);
				for (var s of strs) {
					subscribeExceptions.push(s);
				}
			}
			if (subscribeExceptions.length < 1) {
				resolve();
				return;
			}
			// inject attribute values into parameters within subscriptions
			var attributes: any[] = this.getAttributes(app, developer, apiProducts);
			subscribeExceptions = this.enrichTopics(subscribeExceptions, attributes);
			subscribeExceptions.forEach((s, index, arr) => {
				arr[index] = this.scrubDestination(s);
			});

			// loop over services
			for (var service of services) {
				//create queues
				var sempV2Client = this.getSEMPv2Client(service);
				var newQ: MsgVpnQueue = {
					queueName: app.credentials.secret.consumerKey,
					msgVpnName: service.msgVpnName
				};
				try {
					var q = await AllService.getMsgVpnQueue(service.msgVpnName, app.credentials.secret.consumerKey);
					var updateResponseMsgVpnQueue = await AllService.updateMsgVpnQueue(service.msgVpnName, app.credentials.secret.consumerKey, newQ);
					L.debug(`createQueues updated ${app.credentials.secret.consumerKey}`);
				} catch (e: any) {
					L.debug(`createQueues lookup  failed ${JSON.stringify(e)}`);
					try {
						var q = await AllService.createMsgVpnQueue(service.msgVpnName, newQ);
					} catch (e) {
						L.warn(`createQueues creation  failed ${JSON.stringify(e)}`);
						reject(e);
						return;
					}
				}

				for (var subscription of subscribeExceptions) {
					var queueSubscription: MsgVpnQueueSubscription = {
						msgVpnName: service.msgVpnName,
						queueName: app.credentials.secret.consumerKey,
						subscriptionTopic: subscription
					}
					try {
						var subResult = await AllService.getMsgVpnQueueSubscription(service.msgVpnName, app.credentials.secret.consumerKey, encodeURIComponent(subscription));
					} catch (e: any) {
						L.debug(`createQueues subscription lookup  failed ${JSON.stringify(e)}`);
						try {
							var subResult = await AllService.createMsgVpnQueueSubscription(service.msgVpnName, app.credentials.secret.consumerKey, queueSubscription);
						} catch (e) {
							L.warn(`createQueues subscription creation  failed ${JSON.stringify(e)}`);
							reject(e);
							return;
						}
					}


				}



			}
			resolve();
		});
	}

	public getClientACLExceptions(app: App, apiProducts: APIProduct[], developer: Developer): Promise<Permissions> {
		return new Promise<Permissions>(async (resolve, reject) => {

			var publishExceptions: string[] = [];
			var subscribeExceptions: string[] = [];
			// compile list of event destinations sub / pub separately
			for (var product of apiProducts) {
				publishExceptions = this.getResources(product.pubResources).concat(publishExceptions);
				subscribeExceptions = this.getResources(product.subResources).concat(subscribeExceptions);
				var strs: string[] = await this.getResourcesFromAsyncAPIs(product.apis, Direction.Subscribe);
				for (var s of strs) {
					subscribeExceptions.push(s);
				}
				strs = await this.getResourcesFromAsyncAPIs(product.apis, Direction.Publish);
				for (var s of strs) {
					publishExceptions.push(s);
				}
			}
			var attributes: any[] = this.getAttributes(app, developer, apiProducts);
			subscribeExceptions = this.enrichTopics(subscribeExceptions, attributes);
			publishExceptions = this.enrichTopics(publishExceptions, attributes);
			publishExceptions.forEach((s, index, arr) => {
				arr[index] = this.scrubDestination(s);
			});
			subscribeExceptions.forEach((s, index, arr) => {
				arr[index] = this.scrubDestination(s);
			});

			L.debug(publishExceptions);
			L.debug(subscribeExceptions);
			var permissions: Permissions = {
				publish: publishExceptions,
				subscribe: subscribeExceptions
			}
			resolve(permissions);
		});
	}


	private addPublishTopicExceptions(app: App, services: Service[], exceptions: string[]): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			for (var service of services) {
				var sempV2Client = this.getSEMPv2Client(service);
				for (var exception of exceptions) {
					var aclException: MsgVpnAclProfilePublishException = {
						aclProfileName: app.credentials.secret.consumerKey,
						msgVpnName: service.msgVpnName,
						publishExceptionTopic: exception,
						topicSyntax: MsgVpnAclProfilePublishException.topicSyntax.SMF
					};
					L.info("createMsgVpnAclProfilePublishException");
					L.info(aclException);
					try {

						var getResponse = await AllService.getMsgVpnAclProfilePublishException(service.msgVpnName, app.credentials.secret.consumerKey, MsgVpnAclProfilePublishException.topicSyntax.SMF, encodeURIComponent(exception));
						L.info("ACL Looked up");
					} catch (e) {
						L.info(`addPublishTopicExceptions lookup  failed ${e}`);
						try {
							let response = await AllService.createMsgVpnAclProfilePublishException(service.msgVpnName, app.credentials.secret.consumerKey, aclException);
							L.info("created  PublishException");
						} catch (e) {
							L.info(`addPublishTopicExceptions add failed ${e}`);
							reject(e);
						}
					}
				}

			}
			L.info("addPublishTopicExceptions resolved");
			resolve();
		});

	}
	private addSubscribeTopicExceptions(app: App, services: Service[], exceptions: string[]): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			for (var service of services) {
				var sempV2Client = this.getSEMPv2Client(service);
				for (var exception of exceptions) {
					var aclException: MsgVpnAclProfileSubscribeException = {
						aclProfileName: app.credentials.secret.consumerKey,
						msgVpnName: service.msgVpnName,
						subscribeExceptionTopic: exception,
						topicSyntax: MsgVpnAclProfileSubscribeException.topicSyntax.SMF
					};
					L.info("createMsgVpnAclProfileSubscribeException");
					L.info(aclException);
					try {
						var getResponse = await AllService.getMsgVpnAclProfileSubscribeException(service.msgVpnName, app.credentials.secret.consumerKey, MsgVpnAclProfileSubscribeException.topicSyntax.SMF, encodeURIComponent(exception));
						L.info("addSubscribeTopicExceptions: exception exists");
					} catch (e) {
						L.info(`addSubscribeTopicExceptions lookup  failed ${JSON.stringify(e)}`);
						try {
							let response = await AllService.createMsgVpnAclProfileSubscribeException(service.msgVpnName, app.credentials.secret.consumerKey, aclException);
							L.info("created  SubscribeException");
						} catch (e) {
							L.info(`addSubscribeTopicExceptions add failed ${e}`);
							reject(e);
						}

					}
				}

			}
			resolve();
		});

	}

	private getResourcesFromAsyncAPIs(apis: string[], direction: Direction): Promise<string[]> {
		return new Promise<string[]>(
			(resolve, reject) => {
				var apiPromises: Promise<string>[] = [];
				apis.forEach((api: string) => {
					apiPromises.push(ApisService.byName(api));
				});
				Promise.all(apiPromises).then(async (specs) => {
					var parserPromises: Promise<any>[] = [];
					var resources: string[] = [];
					specs.forEach((specification: string) => {
						var p: Promise<any> = parser.parse(specification);
						parserPromises.push(p);

						p.then(
							(spec) => {
								spec.channelNames().forEach((s: string) => {

									var channel = spec.channel(s);

									if (direction == Direction.Subscribe && channel.hasSubscribe()) {
										L.info(`Subscribe ${s}`)
										resources.push(s);
									}
									if (direction == Direction.Publish && channel.hasPublish()) {
										L.info(`Publish ${s}`)
										resources.push(s);
									}
								});
							}
						).catch((e) => {
							L.error(e);
							reject(e);
						});
					});
					Promise.all(parserPromises).then((vals) => {
						resolve(resources);
					});


				});
			}
		);
	}
	private getRDPSubscriptionsFromAsyncAPIs(apis: string[]): Promise<string[]> {
		return new Promise<string[]>(
			(resolve, reject) => {
				var apiPromises: Promise<string>[] = [];
				apis.forEach((api: string) => {
					apiPromises.push(ApisService.byName(api));
				});
				Promise.all(apiPromises).then(async (specs) => {
					var parserPromises: Promise<any>[] = [];
					var resources: string[] = [];
					specs.forEach((specification: string) => {
						var p: Promise<any> = parser.parse(specification);
						parserPromises.push(p);

						p.then(
							(spec) => {
								spec.channelNames().forEach((s: string) => {

									var channel = spec.channel(s);

									if (channel.hasSubscribe() && (channel.subscribe().hasBinding('http') || channel.subscribe().hasBinding('https'))) {
										L.info(`getRDPSubscriptionsFromAsyncAPIs subscribe ${s}`)
										resources.push(s);
									}
								});
							}
						).catch((e) => {
							L.error(e);
							reject(e);
						});
					});
					Promise.all(parserPromises).then((vals) => {
						resolve(resources);
					});


				});
			}
		);
	}

	public async getMessagingProtocols(app: App): Promise<Endpoint[]> {

		return new Promise<Endpoint[]>((resolve, reject) => {
			var endpoints: Endpoint[] = [];

			var apiProductPromises: Promise<APIProduct>[] = [];
			app.apiProducts.forEach((productName: string) => {
				L.info(productName);
				apiProductPromises.push(ApiProductsService.byName(productName));
			});

			Promise.all(apiProductPromises).then(async (products: APIProduct[]) => {
				for (var product of products) {
					L.info(`getMessagingProtocols ${product.name}`);
					for (var envName of product.environments) {
						const service = await this.getServiceByEnv(envName);
						for (var protocol of product.protocols) {
							L.info(`getMessagingProtocols ${protocol.name}`);
							var keys = this.getProtocolMappings().find(element => element.name == protocol.name).protocolKeys;
							L.info(`getMessagingProtocols ${keys.name} ${keys.protocol}`);
							var endpoint = service.messagingProtocols.find(mp => mp.name == keys.name).endPoints.find(ep => ep.transport == keys.protocol);
							L.info(endpoint);
							var newEndpoint: Endpoint = {
								compressed: endpoint.compressed == 'yes' ? 'yes' : 'no',
								environment: envName,
								secure: endpoint.secured == 'yes' ? 'yes' : 'no',
								protocol: protocol,
								transport: endpoint.transport,
								uri: endpoint.uris[0]
							};
							endpoints.push(newEndpoint);
						}
					}
				}
				resolve(endpoints);

			});

		});

	}

	private getBindingsFromAsyncAPIs(apis: string[]): Promise<string[]> {
		return new Promise<string[]>(
			(resolve, reject) => {
				var apiPromises: Promise<string>[] = [];
				apis.forEach((api: string) => {
					apiPromises.push(ApisService.byName(api));
				});
				Promise.all(apiPromises).then(async (specs) => {
					var parserPromises: Promise<any>[] = [];
					var resources: string[] = [];
					specs.forEach((specification: string) => {
						var p: Promise<any> = parser.parse(specification);
						parserPromises.push(p);

						p.then(
							(spec) => {
								spec.channelNames().forEach((s: string) => {

									var channel = spec.channel(s);
									var bindingProtocols: string[] = [];
									if (channel.hasSubscribe()) {
										bindingProtocols = bindingProtocols.concat(channel.getSubscribe().bindingProtocols());

									}
									if (channel.hasPublish()) {
										bindingProtocols = bindingProtocols.concat(channel.getPublish().bindingProtocols());
									}
									resources = resources.concat(bindingProtocols);
								});
							}
						).catch((e) => {
							L.error(e);
							reject(e);
						});
					});
					Promise.all(parserPromises).then((vals) => {
						resolve(resources);
					});


				});
			}
		);
	}

	private getResources(resources: string[]): string[] {
		var returnResources: string[] = [];
		resources.forEach((resource: string) => returnResources.push(resource));
		L.info(returnResources);
		return returnResources;
	}

	private scrubDestination(destination: string) {
		return destination.replace(/\{[^\/]*\}(?!$)/g, "*").replace(/\{[^\/]*\}$/, ">");
	}

	private enrichTopics(destinations: string[], attributes: any[]): string[] {
		var enrichedDestinations: string[] = [];
		destinations.forEach(d => {
			var result = this.enrichDestination(d, attributes);
			enrichedDestinations = enrichedDestinations.concat(result);
		});
		return enrichedDestinations;
	}

	private enrichDestination(destination: string, attributes: any[]): string[] {
		L.error(destination);
		var x = destination.match(/(?<=\{)[^}]*(?=\})/g);
		var destinations: string[] = [];
		destinations.push(destination);
		L.error(x);
		if (x) {
			x.forEach(match => {
				var newDestinations: string[] = [];
				L.info(match);
				var att = attributes.find(element => element.name == match);
				if (att) {
					var values = att.value.split(",");
					L.debug(values);
					for (var d of destinations) {
						values.forEach((s: string) => {
							s = s.trim();
							var newD = d.replace(`{${match}}`, s);
							L.debug(newD);
							newDestinations.push(newD);
						});
					}
					destinations = Array.from(newDestinations);
				}

			});
		} else {
			destinations.push(destination);
		}
		return destinations;
	}

	private getSEMPv2Client(service: Service): Sempv2Client {
		var sempProtocol = service.managementProtocols.find(i => i.name === "SEMP");
		var sempv2Client = new Sempv2Client(sempProtocol.endPoints.find(j => j.name === "Secured SEMP Config").uris[0],
			sempProtocol.username,
			sempProtocol.password);
		return sempv2Client;
	}

	private getProtocolMappings(): ProtocolMapping[] {
		var map: ProtocolMapping[] = [];
		var mqtt: ProtocolMapping = {
			name: 'mqtt',
			protocolKeys: {
				name: 'MQTT',
				protocol: "TCP"
			}
		};
		map.push(mqtt);

		var mqtts: ProtocolMapping = {
			name: 'secure-mqtt',
			protocolKeys: {
				name: 'MQTT',
				protocol: "SSL"
			}
		};
		map.push(mqtts);

		var amqp: ProtocolMapping = {
			name: 'amqp',
			protocolKeys: {
				name: 'AMQP',
				protocol: "AMQP"
			}
		};
		map.push(amqp);

		var amqps: ProtocolMapping = {
			name: 'amqps',
			protocolKeys: {
				name: 'AMQP',
				protocol: "AMQPS"
			}
		};
		map.push(amqps);

		var http: ProtocolMapping = {
			name: 'http',
			protocolKeys: {
				name: 'REST',
				protocol: "HTTP"
			}
		};
		map.push(http);

		var https: ProtocolMapping = {
			name: 'https',
			protocolKeys: {
				name: 'REST',
				protocol: "HTTPS"
			}
		};
		map.push(https);

		var smf: ProtocolMapping = {
			name: 'smf',
			protocolKeys: {
				name: 'SMF',
				protocol: "TCP"
			}
		};
		map.push(smf);

		var smfs: ProtocolMapping = {
			name: 'https',
			protocolKeys: {
				name: 'SMF',
				protocol: "TLS"
			}
		};
		map.push(smfs);

		var jms: ProtocolMapping = {
			name: 'jms',
			protocolKeys: {
				name: 'JMS',
				protocol: "TCP"
			}
		};
		map.push(jms);
		return map;
	}

}
export default new BrokerService();