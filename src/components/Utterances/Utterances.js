import { useEffect, useState } from "react"
import * as React from "react"

const Utterances = () => {
  const [status, setStatus] = useState({ status: "pending" })
  const ref = React.useRef(null)
  useEffect(() => {
    const scriptEl = document.createElement("script")
    scriptEl.onload = () => setStatus({ status: "success" })
    scriptEl.onerror = () => setStatus({ status: "failed" })
    scriptEl.async = true
    scriptEl.src = "https://utteranc.es/client.js"
    scriptEl.setAttribute("repo", "puki4416/blog-comment")
    scriptEl.setAttribute("issue-term", "title")
    scriptEl.setAttribute("theme", "github-light")
    scriptEl.setAttribute("crossorigin", "anonymous")
    ref.current.appendChild(scriptEl)
  }, [])
  return (
    <div style={{ marginBottom: "100px" }}>
      {status === "failed" && <div>Error. Please try again.</div>}
      {status === "pending" && <div>Loading script...</div>}
      <div ref={ref} />
    </div>
  )
}

export default Utterances
