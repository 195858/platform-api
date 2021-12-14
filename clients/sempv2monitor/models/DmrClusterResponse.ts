/* eslint-disable */


import type { DmrCluster } from './DmrCluster';
import type { DmrClusterCollections } from './DmrClusterCollections';
import type { DmrClusterLinks } from './DmrClusterLinks';
import type { SempMeta } from './SempMeta';

export type DmrClusterResponse = {
    collections?: DmrClusterCollections;
    data?: DmrCluster;
    links?: DmrClusterLinks;
    meta: SempMeta;
}

export namespace DmrClusterResponse {

    /**
     * the discriminator for the model if required for more complex api's
     */
    export const discriminator = 'DmrClusterResponse';


}