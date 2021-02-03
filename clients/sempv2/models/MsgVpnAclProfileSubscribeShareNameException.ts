/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export interface MsgVpnAclProfileSubscribeShareNameException {
    /**
     * The name of the ACL Profile.
     */
    aclProfileName?: string;
    /**
     * The name of the Message VPN.
     */
    msgVpnName?: string;
    /**
     * The subscribe share name exception to the default action taken. May include wildcard characters.
     */
    subscribeShareNameException?: string;
    /**
     * The syntax of the subscribe share name for the exception to the default action taken. The allowed values and their meaning are:
     *
     * <pre>
     * "smf" - Topic uses SMF syntax.
     * "mqtt" - Topic uses MQTT syntax.
     * </pre>
     *
     */
    subscribeShareNameExceptionSyntax?: MsgVpnAclProfileSubscribeShareNameException.subscribeShareNameExceptionSyntax;
}

export namespace MsgVpnAclProfileSubscribeShareNameException {

    /**
     * The syntax of the subscribe share name for the exception to the default action taken. The allowed values and their meaning are:
     *
     * <pre>
     * "smf" - Topic uses SMF syntax.
     * "mqtt" - Topic uses MQTT syntax.
     * </pre>
     *
     */
    export enum subscribeShareNameExceptionSyntax {
        SMF = 'smf',
        MQTT = 'mqtt',
    }


}
