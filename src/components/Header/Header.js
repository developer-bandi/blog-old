import * as React from "react"
import { Link } from "gatsby"
import * as styles from "./Header.module.css"

const Header = ({ children, path }) => {
  return (
    <header className={styles.container}>
      <div className={styles.wrap}>
        <Link className={styles.logo} to="/">
          {children}
        </Link>
        <div className={styles.linkWrap}>
          <Link
            className={`${styles.link} ${path === "/" ? styles.select : ""}`}
            to="/"
          >
            Home
          </Link>
          <Link
            className={`${styles.link} ${
              path === "/about" ? styles.select : ""
            }`}
            to="/about"
          >
            Abouts
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
