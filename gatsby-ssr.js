import React from "react"
import RootElement from "./src/context/root-element"

export const wrapRootElement = ({ element }) => {
  return <RootElement>{element}</RootElement>
}

export const onRenderBody = ({ setHtmlAttributes }) => {
  setHtmlAttributes({ lang: `ko` })
}
