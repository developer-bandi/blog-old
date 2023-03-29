import * as React from "react"
import * as styles from "./Footer.module.css"

const Footer = () => {
  return (
    <footer className={styles.container}>
      <div>© {new Date().getFullYear()}. 김상두 all right reserved.</div>
      <div>
        Built with <a href="https://www.gatsbyjs.com">Gatsby</a>
      </div>
    </footer>
  )
}

export default Footer
