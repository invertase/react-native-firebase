const schema = require("../../packages/app/firebase-schema.json")

const crypto = require("crypto");

module.exports = async function sourceReference({
  actions,
  createNodeId,
  createContentDigest}) {

  const { properties } = schema.properties["react-native"]

  for (const key in properties) {

    const element = properties[key];
    const { description, type } = element

    const property = {
      name: key,
      description: description,
      type,
    }

    await actions.createNode({
      ...property,
      parent: null,
      children: [],

      id: createNodeId(key),
      internal: {
        type: `JsonConfig`,
        contentDigest: crypto
          .createHash(`md5`)
          .update(description)
          .digest(`hex`),
        mediaType: `text/markdown`,
        content: description,
        contentDigest: createContentDigest(property)
      }
    })
  }

}
