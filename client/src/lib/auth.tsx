import { Component, createComponent, createResource, Show } from "solid-js"
import { myInfo, verifyToken } from "./commands"
import { Without } from "./util"
import { JSX } from "solid-js"
import { useNavigate } from "solid-app-router"
import { User } from "../types/user/user"

export type AuthenticatedComponent<T = unknown> = Component<T & AuthenticatedPageProps>

export type AuthenticatedPageProps = {
  user: User
}

type AuthenticationEnforcerProps<P extends AuthenticatedPageProps> = {
  /**
   * The page to render if the user is authenticated.
   */
  page: Component<P>
  /**
   * The page to render while the authentication is being tested.
   */
  fallback: JSX.Element
  /**
   * The props to pass to the page.
   */
  props: Without<P, "user">
  /**
   * The page to redirect to after the user is authenticated.
   */
  redirect?: string
}

/**
 * A wrapper that requires the user to be authenticated to access the given page.
 */
export function AuthenticationEnforcer<P extends AuthenticatedPageProps>({
  page,
  props,
  fallback,
  redirect,
}: AuthenticationEnforcerProps<P>) {
  const navigate = useNavigate()

  const authPath = () =>
    `/auth?redirect=${encodeURIComponent(redirect?.replace(/^\/+/, "") || "")}`

  const [user] = createResource(
    authPath,
    async (path) => {
      const result = await verifyToken()
      if (result.result !== "authorized") {
        // maybe emit a toast here?
        navigate(path)
        return null
      } else {
        const result = await myInfo()
        if (result.type === "success") {
          return { id: result.id, username: result.username }
        } else {
          navigate(path)
          return null
        }
      }
    },
    { initialValue: null },
  )

  return (
    <Show when={user()} fallback={fallback}>
      {createComponent(page, { ...props, user: user() })}
    </Show>
  )
}
