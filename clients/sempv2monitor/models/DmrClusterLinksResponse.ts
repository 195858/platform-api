/* eslint-disable */


import type { DmrClusterLink } from './DmrClusterLink';
import type { DmrClusterLinkCollections } from './DmrClusterLinkCollections';
import type { DmrClusterLinkLinks } from './DmrClusterLinkLinks';
import type { SempMeta } from './SempMeta';

export type DmrClusterLinksResponse = {
    collections?: Array<DmrClusterLinkCollections>;
    data?: Array<DmrClusterLink>;
    links?: Array<DmrClusterLinkLinks>;
    meta: SempMeta;
}

export namespace DmrClusterLinksResponse {

    /**
     * the discriminator for the model if required for more complex api's
     */
    export const discriminator = 'DmrClusterLinksResponse';


}