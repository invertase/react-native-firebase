export interface RemoteMessageProperties {
    id: string;
    ttl: number;
    sender: string;
    type: string;
    data: any;
    collapseKey?: string;
}
export default class RemoteMessage {
    properties: RemoteMessageProperties;
    constructor(sender: string);
    /**
     *
     * @param ttl
     * @returns {RemoteMessage}
     */
    setTtl(ttl: number): RemoteMessage;
    /**
     *
     * @param id
     */
    setId(id: string): RemoteMessage;
    /**
     *
     * @param type
     * @returns {RemoteMessage}
     */
    setType(type: string): RemoteMessage;
    /**
     *
     * @param key
     * @returns {RemoteMessage}
     */
    setCollapseKey(key: string): RemoteMessage;
    /**
     *
     * @param data
     * @returns {RemoteMessage}
     */
    setData(data?: Object): this;
    toJSON(): Object;
}
