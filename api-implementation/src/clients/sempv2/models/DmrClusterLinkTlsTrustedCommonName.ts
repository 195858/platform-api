/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type DmrClusterLinkTlsTrustedCommonName = {
    /**
     * The name of the Cluster. Deprecated since 2.18. Common Name validation has been replaced by Server Certificate Name validation.
     */
    dmrClusterName?: string;
    /**
     * The name of the node at the remote end of the Link. Deprecated since 2.18. Common Name validation has been replaced by Server Certificate Name validation.
     */
    remoteNodeName?: string;
    /**
     * The expected trusted common name of the remote certificate. Deprecated since 2.18. Common Name validation has been replaced by Server Certificate Name validation.
     */
    tlsTrustedCommonName?: string;
}
