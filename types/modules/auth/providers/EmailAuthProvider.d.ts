/**
 * EmailAuthProvider representation wrapper
 */
import { AuthCredential } from '../types';
export default class EmailAuthProvider {
    constructor();
    static readonly PROVIDER_ID: string;
    static credential(email: string, password: string): AuthCredential;
}
