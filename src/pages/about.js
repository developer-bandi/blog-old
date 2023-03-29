import { graphql } from "gatsby"
import * as React from "react"
import Footer from "../components/Footer/Footer"
import Header from "../components/Header/Header"
import Seo from "../components/seo"

const About = ({ location, data }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  return (
    <div>
      <Header path={location.pathname}>{siteTitle}</Header>
      <main
        style={{
          padding: "70px 20px 50px 20px",
          maxWidth: "700px",
          margin: "auto",
          minHeight: "calc(100vh - 140px)",
        }}
      >
        <h1>
          안녕하세요
          <br />
          프론트엔드 개발자 김상두입니다.
        </h1>
        <p>
          적절한 도구를 선택하여 다양한 유저의 요구를 잘 해결하는 개발자가
          되고싶습니다. 또한 오픈소스에 관심이 많고 생태계에 기여하기 위해서
          노력합니다.
        </p>
        <a href="https://github.com/puki4416" target="_blank" rel="noreferrer">
          GitHub : https://github.com/puki4416
        </a>
        <div>Email : puki4416@gmail.com</div>
      </main>
      <Footer />
    </div>
  )
}

export default About

export const Head = () => <Seo title="About" />

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
  }
`
