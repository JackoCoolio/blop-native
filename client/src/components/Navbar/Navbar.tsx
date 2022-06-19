import "./navbar.scss"
import LogoIcon from "../../assets/blop.svg"
import ProfileIcon from "../../assets/profile.svg"
import DashboardIcon from "../../assets/dashboard.svg"
import PlusIcon from "../../assets/plus.svg"
import SettingsIcon from "../../assets/settings.svg"

import { Component, JSX } from "solid-js"
import { ExtendedBlopColor } from "../../lib/themes"
import Button from "../Button"
import { useNavigate } from "solid-app-router"
import { verifyToken } from "../../lib/commands"

interface NavbarItem {
  tooltip?: string
  text: string
  color: ExtendedBlopColor
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>
  icon?: JSX.Element
}

export const Navbar: Component = () => {
  const navigate = useNavigate()

  return (
    <div id="navbar" class="flex flex-row align-middle justify-between">
      <div class="navbar-section flex flex-row flex-nowrap justify-start">
        <LogoIcon
          id="logo"
          onClick={() => {
            navigate("/")
          }}
        />
        <Button
          color="alpha"
          icon={{
            elt: PlusIcon,
          }}
          text="Create"
        />
        <Button
          color="beta"
          icon={{
            elt: DashboardIcon,
          }}
          text="Dashboard"
        />
        <Button
          onClick={async () => {
            const result = await verifyToken()
            if (result.result !== "authorized") {
              navigate("/auth")
            } else {
              navigate("/profile")
            }
          }}
          color="gamma"
          text="Profile"
          icon={{ elt: ProfileIcon }}
        />
        <Button color="delta" text="Settings" icon={{ elt: SettingsIcon }} />
      </div>
      <div class="navbar-section flex flex-row flex-nowrap justify-end"></div>
    </div>
  )
}
