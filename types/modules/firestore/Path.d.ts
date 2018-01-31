/**
 * @flow
 * Path representation wrapper
 */
/**
 * @class Path
 */
export default class Path {
    private _parts;
    constructor(pathComponents: string[]);
    readonly id: string | null;
    readonly isDocument: boolean;
    readonly isCollection: boolean;
    readonly relativeName: string;
    child(relativePath: string): Path;
    parent(): Path | null;
    /**
     *
     * @package
     */
    static fromName(name: string): Path;
}
