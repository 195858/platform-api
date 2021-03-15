/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AboutUser } from './AboutUser';
import type { AboutUserLinks } from './AboutUserLinks';
import type { SempMeta } from './SempMeta';

export type AboutUserResponse = {
    data?: AboutUser;
    links?: AboutUserLinks;
    meta: SempMeta;
}
