/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MsgVpnJndiQueue } from './MsgVpnJndiQueue';
import type { MsgVpnJndiQueueLinks } from './MsgVpnJndiQueueLinks';
import type { SempMeta } from './SempMeta';

export type MsgVpnJndiQueueResponse = {
    data?: MsgVpnJndiQueue;
    links?: MsgVpnJndiQueueLinks;
    meta: SempMeta;
}
