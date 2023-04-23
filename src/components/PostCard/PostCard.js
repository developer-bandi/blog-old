import { Link } from "gatsby"
import * as React from "react"
import * as styles from "./PostCard.module.css"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

const PostCard = ({ date, title, description, category, link, thumbnail }) => {
  const image = getImage(thumbnail)

  return (
    <li key={title + date} className={styles.container}>
      <article itemScope itemType="http://schema.org/Article">
        <Link to={link} itemProp="url" className={styles.wrap}>
          <div className={styles.textWrap}>
            <p className={styles.category}>{category}</p>
            <h2 className={styles.title} itemProp="headline">
              {title}
            </h2>
            <p itemProp="description" className={styles.description}>
              {description}
            </p>
            <time className={styles.date}>{date}</time>
          </div>
          <GatsbyImage
            image={image}
            alt={"thumbnail"}
            className={styles.thumbnail}
          />
        </Link>
      </article>
    </li>
  )
}

export default PostCard
