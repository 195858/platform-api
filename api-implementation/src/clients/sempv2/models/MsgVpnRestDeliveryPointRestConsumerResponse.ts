/* eslint-disable */


import type { MsgVpnRestDeliveryPointRestConsumer } from './MsgVpnRestDeliveryPointRestConsumer';
import type { MsgVpnRestDeliveryPointRestConsumerLinks } from './MsgVpnRestDeliveryPointRestConsumerLinks';
import type { SempMeta } from './SempMeta';

export type MsgVpnRestDeliveryPointRestConsumerResponse = {
    data?: MsgVpnRestDeliveryPointRestConsumer;
    links?: MsgVpnRestDeliveryPointRestConsumerLinks;
    meta: SempMeta;
}

export namespace MsgVpnRestDeliveryPointRestConsumerResponse {

    /**
     * the discriminator for the model if required for more complex api's
     */
    export const discriminator = 'MsgVpnRestDeliveryPointRestConsumerResponse';


}