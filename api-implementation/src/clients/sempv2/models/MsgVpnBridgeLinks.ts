/* eslint-disable */


export type MsgVpnBridgeLinks = {
    /**
     * The URI of this Bridge's collection of Remote Message VPN objects.
     */
    remoteMsgVpnsUri?: string;
    /**
     * The URI of this Bridge's collection of Remote Subscription objects.
     */
    remoteSubscriptionsUri?: string;
    /**
     * The URI of this Bridge's collection of Trusted Common Name objects. Deprecated since 2.18. Common Name validation has been replaced by Server Certificate Name validation.
     */
    tlsTrustedCommonNamesUri?: string;
    /**
     * The URI of this Bridge object.
     */
    uri?: string;
}

export namespace MsgVpnBridgeLinks {

    /**
     * the discriminator for the model if required for more complex api's
     */
    export const discriminator = 'MsgVpnBridgeLinks';


}