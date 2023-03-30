import * as React from "react"
import { graphql } from "gatsby"
import Seo from "../components/seo"
import PostCard from "../components/PostCard/PostCard"
import Header from "../components/Header/Header"
import Footer from "../components/Footer/Footer"
import Navigation from "../components/Navigation/Navigation"
import { useState } from "react"
import { useEffect } from "react"
import Pagenation from "../components/Pagenation/Pagenation"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes
  const [category, setCategory] = useState("전체")
  const [content, setContent] = useState(posts)
  const [page, setPage] = useState(1)

  const changeCategory = category => {
    setCategory(category)
    setPage(1)
  }
  useEffect(() => {
    setContent(
      posts.filter(post => {
        if (category === "전체") return true
        if (post.frontmatter.category === category) return true
        return false
      })
    )
  }, [category, posts])

  if (category === "회고") {
    return (
      <div>
        <Header path={location.pathname}>{siteTitle}</Header>
        <main className="homeMain">
          <Navigation select={category} setCategory={changeCategory} />
          <div
            style={{
              minHeight: "calc(100vh - 370px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p style={{ fontSize: "35px", fontWeight: "600" }}>
              포스트가 없습니다.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <Header path={location.pathname}>{siteTitle}</Header>
      <main className="homeMain">
        <Navigation select={category} setCategory={changeCategory} />
        <ol style={{ listStyle: `none` }}>
          {content.slice((page - 1) * 5, page * 5).map(post => {
            const title = post.frontmatter.title || post.fields.slug
            return (
              <PostCard
                title={title}
                date={post.frontmatter.date}
                description={post.frontmatter.description}
                category={post.frontmatter.category}
                link={post.fields.slug}
                key={title}
              />
            )
          })}
        </ol>
        <Pagenation
          page={page}
          setPage={setPage}
          contentLength={content.length}
        />
      </main>
      <Footer />
    </div>
  )
}

export default BlogIndex

/**
 * Head export to define metadata for the page
 *
 * See: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-head/
 */
export const Head = () => <Seo title="전체 포스트" />

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "YYYY. MM. DD")
          title
          description
          category
        }
      }
    }
  }
`
