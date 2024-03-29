/* eslint-disable */


import type { MsgVpnJndiQueue } from './MsgVpnJndiQueue';
import type { MsgVpnJndiQueueLinks } from './MsgVpnJndiQueueLinks';
import type { SempMeta } from './SempMeta';

export type MsgVpnJndiQueuesResponse = {
    data?: Array<MsgVpnJndiQueue>;
    links?: Array<MsgVpnJndiQueueLinks>;
    meta: SempMeta;
}

export namespace MsgVpnJndiQueuesResponse {

    /**
     * the discriminator for the model if required for more complex api's
     */
    export const discriminator = 'MsgVpnJndiQueuesResponse';


}