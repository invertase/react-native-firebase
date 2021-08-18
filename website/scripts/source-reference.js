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

const {
  extractComments,
  extractSourceFile,
  extractCommonEntityProps,
  extractInherited,
} = require('./utils');

const { generateTypedoc } = require('./generate-typedoc');

let getNodeFunc;

module.exports = async function sourceReference({
  actions,
  getNode,
  createNodeId,
  createContentDigest,
  reporter,
}) {
  // Global usage
  getNodeFunc = getNode;

  const { children } = generateTypedoc();
  const modules = [];

  children.forEach(module => {
    if (module.comment && Array.isArray(module.comment.tags)) {
      // Each module has a unique "firebase tag"
      const namespace = module.comment.tags.find($ => $.tag === 'firebase');

      // Check the "firebase" tag has a valid "module" name assigned to it
      if (namespace && namespace.text) {
        // Get the module name (e.g. admob)
        const moduleName = namespace.text.replace('\n', '');

        // Build the base module node
        const moduleProps = {
          id: createNodeId(namespace.text),
          module: moduleName,
          moduleName: moduleNameToFullName(moduleName),
          ...extractComments(module.comment),
          statics: [],
          // Module entities with their own pages
          entities: [],
        };

        // Each child of a module is a type... iterate on them
        module.children.forEach(entity => {
          try {
            if (entity.name === 'Statics' && entity.kindString === 'Interface' && entity.children) {
              entity.children.forEach(child => {
                moduleProps.statics.push(Static(child));
              });
            }

            // Convert a TSDoc entity into a GQL node
            const node = convertEntityToNode(entity);
            // Only add it's a valid entity (not null)
            if (node) {
              // Shift "Module" page to root
              const slug =
                node.name === 'Module'
                  ? `/reference/${moduleName}`
                  : `/reference/${moduleName}/${node.name}`;

              if (node.name === 'Module') node.name = moduleName;

              moduleProps.entities.push({
                ...node,
                slug: slug.toLowerCase(),
              });
            }
          } catch (e) {
            reporter.panic(e);
          }
        });

        modules.push(moduleProps);
      }
    }
  });

  // Create a URL for each entity, used to reference it by ID in JS land
  function createEntityNode(entity) {
    actions.createNode({
      ...entity,
      internal: {
        type: 'Entity',
        contentDigest: createContentDigest(entity),
      },
    });
  }

  // Create a node per module (e.g. admob, firestore etc)
  function createModuleNode(moduleNode) {
    actions.createNode({
      ...moduleNode,
      internal: {
        type: 'Module',
        contentDigest: createContentDigest(moduleNode),
      },
    });
  }

  // Some modules have multiple-declarations which need merging together,
  // such as ml-vision
  const moduleMerger = {};

  modules.forEach(module => {
    if (!moduleMerger[module.module]) {
      moduleMerger[module.module] = module;
    } else {
      moduleMerger[module.module].entities = [
        ...moduleMerger[module.module].entities,
        ...module.entities,
      ];
    }
  });

  Object.values(moduleMerger).forEach(module => {
    createModuleNode(module);

    // Module entities are already pages and have a slug
    module.entities.forEach(createEntityNode);
  });
};

function moduleNameToFullName(name) {
  switch (name) {
    case 'admob':
      return 'AdMob';
    case 'app-check':
      return 'App Check';
    case 'app-distribution':
      return 'App Distribution';
    case 'analytics':
      return 'Analytics';
    case 'auth':
      return 'Authentication';
    case 'crashlytics':
      return 'Crashlytics';
    case 'database':
      return 'Realtime Database';
    case 'dynamic-links':
      return 'Dynamic Links';
    case 'firestore':
      return 'Cloud Firestore';
    case 'functions':
      return 'Cloud Functions';
    case 'iid':
      return 'Instance ID';
    case 'in-app-messaging':
      return 'In-App Messaging';
    case 'installations':
      return 'Installations';
    case 'messaging':
      return 'Cloud Messaging';
    case 'ml':
      return 'ML';
    case 'perf':
      return 'Performance Monitoring';
    case 'remote-config':
      return 'Remote Config';
    case 'storage':
      return 'Storage';
    case 'app':
      return 'Core/App';
    default:
      return 'Unknown';
  }
}

function convertEntityToNode(entity) {
  // property
  if (entity.kindString === 'Property') {
    return Property(entity);
  }

  // method
  if (entity.kindString === 'Method') {
    return Method(entity);
  }

  // enum
  if (entity.kindString === 'Enumeration') {
    return Enumeration(entity);
  }

  // interfaces/classes
  else if (entity.kindString === 'Interface' || entity.kindString === 'Class') {
    if (entity.name !== 'Statics') return Interface(entity);
  } else if (entity.name === 'Statics' && entity.kindString === 'Interface' && entity.children) {
  }
  // aliases
  else if (entity.kindString === 'Type alias') {
    return Alias(entity);
  }
}

function Interface(entity) {
  const props = {
    kind: 'interface',
    ...extractCommonEntityProps(entity),
    ...extractComments(entity.comment),
    source: extractSourceFile(entity.sources)[0],
    signatures: [],
    properties: [],
    methods: [],
  };

  if (entity.indexSignature) {
    props.signatures.push(Signature(entity.indexSignature[0]));
  }

  if (entity.signatures) {
    entity.signatures.forEach(e => {
      props.signatures.push(Signature(e));
    });
  }

  if (Array.isArray(entity.children)) {
    entity.children.forEach(child => {
      if (child.kindString === 'Property') props.properties.push(Property(child));
      if (child.kindString === 'Method') props.methods.push(Method(child));
    });
  }

  return props;
}

function Method(entity) {
  const sources = extractSourceFile(entity.sources);
  const signatures = entity.signatures.map(Signature);
  signatures.forEach((signature, i) => (signature.source = sources[i]));

  return {
    kind: 'method',
    ...extractCommonEntityProps(entity),
    ...extractComments(entity.comment),
    signatures: signatures,
    source: sources[0],
  };
}

function Signature(entity) {
  return {
    kind: 'signature',
    ...extractCommonEntityProps(entity),
    ...extractComments(entity.comment),
    parameters: entity.parameters ? entity.parameters.map(Parameter) : [],
    type: Type(entity.type),
  };
}

function Parameter(entity) {
  return {
    kind: 'parameter',
    ...extractCommonEntityProps(entity),
    ...extractComments(entity.comment),
    type: Type(entity.type),
  };
}

function Property(entity) {
  return {
    kind: 'property',
    ...extractCommonEntityProps(entity),
    ...extractComments(entity.comment),
    ...extractInherited(entity.inheritedFrom),
    source: extractSourceFile(entity.sources)[0],
    type: Type(entity.type),
  };
}

function Enumeration(entity) {
  return {
    kind: 'enum',
    ...extractCommonEntityProps(entity),
    ...extractComments(entity.comment),
    source: extractSourceFile(entity.sources)[0],
    members: entity.children.map(Member),
  };
}

function Member(entity) {
  return {
    kind: 'member',
    ...extractCommonEntityProps(entity),
    ...extractComments(entity.comment),
    source: extractSourceFile(entity.sources)[0],
    defaultValue: entity.defaultValue || '',
  };
}

function Alias(entity) {
  return {
    kind: 'alias',
    ...extractCommonEntityProps(entity),
    ...extractComments(entity.comment),
    source: extractSourceFile(entity.sources)[0],
    type: Type(entity.type),
  };
}

function Static(entity) {
  let props = {
    source: extractSourceFile(entity.sources)[0],
    kind: 'static',
  };

  if (entity.kindString === 'Property') {
    props = {
      ...props,
      ...Property(entity),
    };
  }

  if (entity.kindString === 'Method') {
    props = {
      ...props,
      ...Method(entity),
    };
  }

  return props;
}

function Type(type) {
  if (!type) return null;

  // Type can be pretty much anything such as a basic object,
  // or a big recursive object which GQL doesn't support, so we
  // have to stringify it and iterate on JS side.
  return JSON.stringify(type);
}
