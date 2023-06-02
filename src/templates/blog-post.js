import * as React from "react"
import { graphql } from "gatsby"

import Seo from "../components/seo"
import Header from "../components/Header/Header"
import Footer from "../components/Footer/Footer"
import Utterances from "../components/Utterances/Utterances"
import { useEffect } from "react"
import { useRef } from "react"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

const BlogPostTemplate = ({
  data: { site, markdownRemark: post },
  location,
}) => {
  const siteTitle = site.siteMetadata?.title || `Title`
  const bodyRef = useRef(null)
  const tocRef = useRef(null)
  const raf = useRef()

  useEffect(() => {
    const headerTag = ["H1", "H2", "H3", "H4", "H5", "H6"]
    const bodyEl = bodyRef.current.children
    const headerNames = []
    const headerPosition = []

    const tocElement = tocRef.current.querySelectorAll("a")
    const tocAnchorElements = {}

    for (let i = 0; i < bodyEl.length; i++) {
      if (headerTag.includes(bodyEl[i].tagName)) {
        headerNames.push(bodyEl[i].id)
        headerPosition.push(
          bodyEl[i].getBoundingClientRect().top + window.pageYOffset
        )
      }
    }

    for (let i = 0; i < tocElement.length; i++) {
      const el = tocElement[i]
      const href = el.href.split("/")[el.href.split("/").length - 1]
      tocAnchorElements[href] = el
    }

    const changeStyle = name => {
      const el = tocAnchorElements[`#${encodeURI(name)}`]
      Object.values(tocAnchorElements).forEach(element => {
        element.style.color = "#9e9e9e"
        element.style.fontWeight = "400"
      })
      if (el !== null) {
        el.style.color = "black"
        el.style.fontWeight = "600"
      }
    }

    const scrollEventHandler = () => {
      const position = document.documentElement.scrollTop
      raf.current = window.requestAnimationFrame(() => {
        if (position < headerPosition[0]) {
          changeStyle(headerNames[0])
        }
        for (let i = headerPosition.length - 1; i > 0; i--) {
          if (headerPosition[i] < position) {
            changeStyle(headerNames[i])
            break
          }
        }
      })
    }
    window.addEventListener("scroll", scrollEventHandler)
    scrollEventHandler()
    return () => {
      window.removeEventListener("scroll", scrollEventHandler)
      if (raf.current !== undefined) {
        window.cancelAnimationFrame(raf.current)
      }
    }
  }, [])

  const image = getImage(post.frontmatter.thumbnail)

  return (
    <div>
      <Header path={location.pathname}>{siteTitle}</Header>
      <article
        style={{
          padding: "100px 20px 0 20px",
          maxWidth: "700px",
          margin: "auto",
        }}
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 itemProp="headline" style={{ marginBottom: "10px" }}>
            {post.frontmatter.title}
          </h1>
          <p style={{ marginBottom: "30px" }}>{post.frontmatter.date}</p>
        </header>
        <GatsbyImage
          image={image}
          alt={"thumbnail"}
          style={{
            width: "100%",
            height: "300px",
            borderRadius: "20px",
            marginBottom: "30px",
            objectFit: "cover",
          }}
        />
        <section
          dangerouslySetInnerHTML={{ __html: post.html }}
          itemProp="articleBody"
          ref={bodyRef}
        />
        <section
          dangerouslySetInnerHTML={{ __html: post.tableOfContents }}
          className="toc"
          ref={tocRef}
        />
        <hr />
        <Utterances />
      </article>
      <Footer />
    </div>
  )
}

export const Head = ({ data: { markdownRemark: post } }) => {
  return (
    <Seo
      title={post.frontmatter.title}
      description={post.frontmatter.description || post.excerpt}
    />
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($id: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      tableOfContents
      frontmatter {
        title
        date(formatString: "YYYY. MM. DD")
        description
        thumbnail {
          childImageSharp {
            gatsbyImageData
          }
        }
      }
    }
  }
`
