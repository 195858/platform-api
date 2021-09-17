/* eslint-disable */


import type { MsgVpnAclProfileSubscribeException } from './MsgVpnAclProfileSubscribeException';
import type { MsgVpnAclProfileSubscribeExceptionLinks } from './MsgVpnAclProfileSubscribeExceptionLinks';
import type { SempMeta } from './SempMeta';

export type MsgVpnAclProfileSubscribeExceptionResponse = {
    data?: MsgVpnAclProfileSubscribeException;
    links?: MsgVpnAclProfileSubscribeExceptionLinks;
    meta: SempMeta;
}

export namespace MsgVpnAclProfileSubscribeExceptionResponse {

    /**
     * the discriminator for the model if required for more complex api's
     */
    export const discriminator = 'MsgVpnAclProfileSubscribeExceptionResponse';


}