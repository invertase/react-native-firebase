import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRNFBTurboML');
