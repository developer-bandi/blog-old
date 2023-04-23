const React = require("react")
const RootElement = require("./src/context/root-element")

/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/
 */

/**
 * @type {import('gatsby').GatsbySSR['onRenderBody']}
 */
exports.onRenderBody = ({ setHtmlAttributes }) => {
  setHtmlAttributes({ lang: `ko` })
}

exports.wrapPageElement = ({ element, props }) => {
  return <RootElement {...props}>{element}</RootElement>
}
