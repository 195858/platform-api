/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MsgVpnRestDeliveryPoint } from './MsgVpnRestDeliveryPoint';
import type { MsgVpnRestDeliveryPointLinks } from './MsgVpnRestDeliveryPointLinks';
import type { SempMeta } from './SempMeta';

export interface MsgVpnRestDeliveryPointResponse {
    data?: MsgVpnRestDeliveryPoint;
    links?: MsgVpnRestDeliveryPointLinks;
    meta: SempMeta;
}
