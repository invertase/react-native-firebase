/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { Entity, EnumMember, Method, Module, Property, Static } from '../types/reference';

/**
 * Returns an icon for a module
 * @param module
 */
function iconForModule(module: string): string {
  switch (module) {
    case 'admob':
      return '//static.invertase.io/assets/firebase/google-admob.svg';
    case 'analytics':
      return '//static.invertase.io/assets/firebase/analytics.svg';
    case 'app-check':
      return '//static.invertase.io/assets/social/firebase-logo.png';
    case 'app-distribution':
      return '/assets/docs/app-distribution/app-distribution.png';
    case 'auth':
      return '//static.invertase.io/assets/firebase/authentication.svg';
    case 'firestore':
      return '//static.invertase.io/assets/firebase/cloud-firestore.svg';
    case 'functions':
      return '//static.invertase.io/assets/firebase/cloud-functions.svg';
    case 'messaging':
      return '//static.invertase.io/assets/firebase/cloud-messaging.svg';
    case 'storage':
      return '//static.invertase.io/assets/firebase/cloud-storage.svg';
    case 'crashlytics':
      return '//static.invertase.io/assets/firebase/crashlytics.svg';
    case 'database':
      return '//static.invertase.io/assets/firebase/realtime-database.svg';
    case 'dynamic-links':
      return '//static.invertase.io/assets/firebase/dynamic-links.svg';
    case 'in-app-messaging':
      return '//static.invertase.io/assets/firebase/in-app-messaging.svg';
    case 'installations':
      return '//static.invertase.io/assets/social/firebase-logo.png';
    case 'ml':
      return '//static.invertase.io/assets/firebase/ml-kit.svg';
    case 'remote-config':
      return '//static.invertase.io/assets/firebase/remote-config.svg';
    case 'perf':
      return '//static.invertase.io/assets/firebase/performance-monitoring.svg';
    default:
      return '//static.invertase.io/assets/social/firebase-logo.png';
  }
}

function dashCaseToCamelCase(str: string): string {
  return str;
}

/**
 * With a given slug, return the entity item if it exists
 * @param modules
 * @param findBySlug
 */
function extractEntityFromModules(modules: Module[], findBySlug: string): Entity | null {
  modules.forEach(({ entities }) => {
    entities.forEach(e => {
      if (e.slug === findBySlug) return e;
    });
  });

  return null;
}

/**
 * Generate a sidebar from the modules & their entities
 * @param modules
 */
function generateReferenceSidebarFromModules(
  modules: Module[],
): (string | (string | boolean)[][])[][] {
  return modules
    .filter(({ module }) => module !== 'indexing')
    .map(({ module, moduleName, entities }) => {
      // Root page (e.g. /reference/admob)
      const rootPage = [moduleName, `/reference/${module}`, true];

      // Pages for each entity
      const entityPages = entities
        .filter(({ name }) => name !== 'Statics')
        .filter(({ name }) => name !== module)
        .map(({ name }) => [
          name,
          `/reference/${module}/${name}`.toLowerCase(),
          true, // exact
        ]);

      return [moduleName, [rootPage, ...entityPages], iconForModule(module)];
    });
}

interface TableOfContentsGenerationProps {
  members: EnumMember[] | null;
  properties: Property[] | null;
  methods: Method[] | null;
  statics: Static[] | null;
}

function generateTableOfContentsFromEntities({
  members,
  properties,
  methods,
  statics,
}: TableOfContentsGenerationProps): { url: string; title: string; items: any }[] {
  const items = [];

  if (members?.length) {
    items.push({
      url: '#members',
      title: 'Members',
      items: members.map(member => ({
        url: `#${member.name.toLowerCase()}`,
        title: member.name,
      })),
    });
  }

  if (properties?.length) {
    items.push({
      url: '#properties',
      title: 'Properties',
      items: properties.map(property => ({
        url: `#${property.hash}`,
        title: property.name,
      })),
    });
  }

  if (methods?.length) {
    const signatures: any = [];

    methods.forEach(method => {
      const signaturesTotal = method.signatures?.length || 0;
      method.signatures?.forEach((signature, si) => {
        signatures.push({
          title: `${signature.name}${signaturesTotal < 2 ? '' : ` (${si + 1})`}`,
          url: `#${signature.hash}${signaturesTotal < 2 ? '' : `-${si + 1}`}`,
        });
      });
    });

    items.push({
      url: '#methods',
      title: 'Methods',
      items: signatures,
    });
  }

  if (statics?.length) {
    items.push({
      url: '#statics',
      title: 'Statics',
      items: statics.map(stat => ({
        url: `#${stat.hash}`,
        title: stat.name,
      })),
    });
  }

  return items;
}

function stringToColour(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

export {
  iconForModule,
  extractEntityFromModules,
  generateReferenceSidebarFromModules,
  generateTableOfContentsFromEntities,
  dashCaseToCamelCase,
  stringToColour,
};
