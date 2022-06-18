import { children, ParentComponent } from "solid-js"
import Navbar from "../Navbar"

/**
 * A formatted container that contains a navbar and the app content.
 */
export const AppContainer: ParentComponent = (props) => {
  const c = children(() => props.children)

  return (
    <div id="app-container">
      <Navbar />
      <div id="content">{c()}</div>
    </div>
  )
}
