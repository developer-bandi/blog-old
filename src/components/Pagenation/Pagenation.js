import * as React from "react"
import * as styles from "./Pagenation.module.css"

const Pagenation = ({ page, contentLength, setPage }) => {
  console.log(
    page,
    contentLength,
    setPage,
    new Array(Math.ceil(contentLength / 5))
  )
  return (
    <ul className={styles.container}>
      {new Array(Math.ceil(contentLength / 5))
        .fill(0)
        .map((_, index) => index + 1)
        .map(cur => {
          return (
            <li key={cur} className={styles.buttonWrap}>
              <button
                className={`${styles.button} ${
                  cur === page ? styles.selected : ""
                }`}
                onClick={() => {
                  setPage(cur)
                }}
              >
                {cur}
              </button>
            </li>
          )
        })}
    </ul>
  )
}

export default Pagenation
