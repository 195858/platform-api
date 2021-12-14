/* eslint-disable */


import type { MsgVpnRestDeliveryPointQueueBinding } from './MsgVpnRestDeliveryPointQueueBinding';
import type { MsgVpnRestDeliveryPointQueueBindingCollections } from './MsgVpnRestDeliveryPointQueueBindingCollections';
import type { MsgVpnRestDeliveryPointQueueBindingLinks } from './MsgVpnRestDeliveryPointQueueBindingLinks';
import type { SempMeta } from './SempMeta';

export type MsgVpnRestDeliveryPointQueueBindingsResponse = {
    collections?: Array<MsgVpnRestDeliveryPointQueueBindingCollections>;
    data?: Array<MsgVpnRestDeliveryPointQueueBinding>;
    links?: Array<MsgVpnRestDeliveryPointQueueBindingLinks>;
    meta: SempMeta;
}

export namespace MsgVpnRestDeliveryPointQueueBindingsResponse {

    /**
     * the discriminator for the model if required for more complex api's
     */
    export const discriminator = 'MsgVpnRestDeliveryPointQueueBindingsResponse';


}