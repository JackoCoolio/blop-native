import "./navbar.scss"
import LogoIcon from "../../assets/blop.svg"
import ProfileIcon from "../../assets/profile.svg"
import DashboardIcon from "../../assets/dashboard.svg"
import PlusIcon from "../../assets/plus.svg"
import SettingsIcon from "../../assets/settings.svg"

import { Component, createEffect, createSignal, For } from "solid-js"
import Button, { ButtonProps } from "../Button"
import { useNavigate } from "solid-app-router"
import { myInfo, verifyToken } from "../../lib/commands"
import { BlopColor } from "../../lib/themes"

export const Navbar: Component = () => {
  const navigate = useNavigate()

  const buttons: ButtonProps[] = [
    {
      text: "Create",
      icon: { elt: PlusIcon },
      onClick: () => navigate("/create"),
      color: "alpha" as BlopColor,
    },
    {
      text: "Dashboard",
      icon: { elt: DashboardIcon },
      onClick: () => navigate("/dashboard"),
      color: "beta" as BlopColor,
    },
    {
      text: "Settings",
      icon: { elt: SettingsIcon },
      color: "delta" as BlopColor,
    },
  ]

  return (
    <div id="navbar" class="flex flex-row align-middle justify-between">
      <div class="navbar-section flex flex-row flex-nowrap justify-start">
        <LogoIcon
          id="logo"
          onClick={() => {
            navigate("/")
          }}
        />
        <For each={buttons}>
          {(button) => <Button {...button} />}
        </For>
      </div>
      <div class="navbar-section flex flex-row flex-nowrap justify-end">
        <ProfileSection />
      </div>
    </div>
  )
}

const ProfileSection: Component = () => {
  const [authed, setAuthed] = createSignal(false)
  const [username, setUsername] = createSignal<string | undefined>(undefined)

  const navigate = useNavigate()

  // load user data
  createEffect(async () => {
    const verifyTokenResult = await verifyToken()
    if (verifyTokenResult.result === "authorized") {
      const myInfoResult = await myInfo()
      console.log(myInfoResult)
      if (myInfoResult.type === "success") {
        setAuthed(true)
        setUsername(myInfoResult.username)
      }
    } else {
      setAuthed(false)
    }
  })

  return (
    <div class="profile-section">
      <Button
        color="epsilon"
        icon={{ elt: ProfileIcon }}
        onClick={() => {
          navigate(authed() ? "/profile" : "/auth")
        }}
        text={authed() ? username() : "Log in"}
      />
    </div>
  )
}
