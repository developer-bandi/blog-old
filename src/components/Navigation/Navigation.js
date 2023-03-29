import * as React from "react"
import * as styles from "./Navigation.module.css"

const Navigation = ({ select, setCategory }) => {
  return (
    <nav className={styles.container}>
      <ul className={styles.wrap}>
        {navList.map(nav => {
          return (
            <li className={styles.nav} key={nav}>
              <button
                className={`${styles.button} ${
                  select === nav ? styles.select : ""
                }`}
                onClick={() => setCategory(nav)}
              >
                {nav}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default Navigation

const navList = ["전체", "기술아티클", "트러블슈팅", "회고"]
