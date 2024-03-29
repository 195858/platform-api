/* eslint-disable */


export type MsgVpnDmrBridge = {
    /**
     * The name of the Message VPN.
     */
    msgVpnName?: string;
    /**
     * The remote Message VPN of the DMR Bridge. The default value is `""`.
     */
    remoteMsgVpnName?: string;
    /**
     * The name of the node at the remote end of the DMR Bridge.
     */
    remoteNodeName?: string;
}

export namespace MsgVpnDmrBridge {

    /**
     * the discriminator for the model if required for more complex api's
     */
    export const discriminator = 'MsgVpnDmrBridge';


}