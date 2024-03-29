/* eslint-disable */


export type DmrClusterLinks = {
    /**
     * The URI of this Cluster's collection of Link objects.
     */
    linksUri?: string;
    /**
     * The URI of this Cluster's collection of Cluster Topology Issue objects.
     */
    topologyIssuesUri?: string;
    /**
     * The URI of this Cluster object.
     */
    uri?: string;
}

export namespace DmrClusterLinks {

    /**
     * the discriminator for the model if required for more complex api's
     */
    export const discriminator = 'DmrClusterLinks';


}