/* eslint-disable */


export type MsgVpnDistributedCacheClusterTopic = {
    /**
     * The name of the Distributed Cache.
     */
    cacheName?: string;
    /**
     * The name of the Cache Cluster.
     */
    clusterName?: string;
    /**
     * The name of the Message VPN.
     */
    msgVpnName?: string;
    /**
     * The value of the Topic in the form a/b/c.
     */
    topic?: string;
}

export namespace MsgVpnDistributedCacheClusterTopic {

    /**
     * the discriminator for the model if required for more complex api's
     */
    export const discriminator = 'MsgVpnDistributedCacheClusterTopic';


}