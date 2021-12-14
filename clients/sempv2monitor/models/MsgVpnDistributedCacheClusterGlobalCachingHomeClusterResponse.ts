/* eslint-disable */


import type { MsgVpnDistributedCacheClusterGlobalCachingHomeCluster } from './MsgVpnDistributedCacheClusterGlobalCachingHomeCluster';
import type { MsgVpnDistributedCacheClusterGlobalCachingHomeClusterCollections } from './MsgVpnDistributedCacheClusterGlobalCachingHomeClusterCollections';
import type { MsgVpnDistributedCacheClusterGlobalCachingHomeClusterLinks } from './MsgVpnDistributedCacheClusterGlobalCachingHomeClusterLinks';
import type { SempMeta } from './SempMeta';

export type MsgVpnDistributedCacheClusterGlobalCachingHomeClusterResponse = {
    collections?: MsgVpnDistributedCacheClusterGlobalCachingHomeClusterCollections;
    data?: MsgVpnDistributedCacheClusterGlobalCachingHomeCluster;
    links?: MsgVpnDistributedCacheClusterGlobalCachingHomeClusterLinks;
    meta: SempMeta;
}

export namespace MsgVpnDistributedCacheClusterGlobalCachingHomeClusterResponse {

    /**
     * the discriminator for the model if required for more complex api's
     */
    export const discriminator = 'MsgVpnDistributedCacheClusterGlobalCachingHomeClusterResponse';


}