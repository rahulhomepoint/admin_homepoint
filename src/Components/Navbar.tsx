import {
  Avatar,
  DarkThemeToggle,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  NavbarToggle,
} from "flowbite-react";
import { HiSun, HiMoon } from "react-icons/hi";
import { IoIosPartlySunny } from "react-icons/io";
// import { Link } from "react-router"; // No longer needed
import Navlogo from "../asset/home_point_logo.svg";
import { Link } from "react-router";
import { BiLogOut } from "react-icons/bi";

type NavbarTabProps = {
  changeDrawer: () => void;
};

export default function NavbarTab({ changeDrawer }: NavbarTabProps) {
  // Greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        greeting: "Good morning",
        icon: (
          <IoIosPartlySunny
            className="inline"
            style={{ color: "orange", filter: "drop-shadow(0 0 2px gold)" }}
          />
        ),
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: "Good afternoon",
        icon: <IoIosPartlySunny className="inline text-yellow-400" />,
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        greeting: "Good evening",
        icon: <HiMoon className="inline text-blue-500" />,
      };
    } else {
      return {
        greeting: "Good night",
        icon: <HiMoon className="inline text-gray-700" />,
      };
    }
  };
  const username = localStorage.getItem("username") || " Guest"; // Replace with dynamic username if available
  const { greeting, icon } = getGreeting();
  return (
    <Navbar fluid className="bg-purple-200">
      <NavbarBrand
        href="/"
        className="self-center text-xl font-semibold whitespace-nowrap dark:text-white"
      >
        <img src={Navlogo} className="h-14 w-38 bg-cover" />
      </NavbarBrand>
      <div className="flex items-center md:order-2">
        {/* Greeting message */}
        <div className="mr-4 hidden flex-col items-end justify-center text-right md:flex">
          <span
            className="flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 shadow-md backdrop-blur-md transition-colors duration-300 dark:bg-gray-800/60"
            style={{ minWidth: 0 }}
          >
            <span className="text-2xl">{icon}</span>
            <span className="text-base font-medium whitespace-nowrap">
              {greeting},{" "}
              <span className="text-lg font-bold text-gray-900 capitalize dark:text-white">
                {username}
              </span>
            </span>
          </span>
        </div>
        <Dropdown
          className="mt-2"
          arrowIcon={false}
          inline
          label={
            <Avatar
              placeholderInitials="HP"
              alt="User settings"
              img=""
              rounded
            />
          }
        >
          <DropdownHeader>
            <span className="block text-sm capitalize">{username}</span>
            {/* <span className="block truncate text-sm font-medium">
              name@flowbite.com
            </span> */}
          </DropdownHeader>
          <DropdownItem>Dashboard</DropdownItem>
          <DropdownItem>Settings</DropdownItem>
          {/* <DropdownItem>Earnings</DropdownItem> */}
          <DropdownDivider />
          <Link to={"/dashboard/sign-out"}>
            <DropdownItem className="bg-red-700 text-white hover:text-black">
              <BiLogOut className="mr-4 text-xl" /> Sign out
            </DropdownItem>{" "}
          </Link>
        </Dropdown>
        <DarkThemeToggle className="mx-2 rounded-full" iconDark={HiSun} />
        <NavbarToggle onClick={changeDrawer} />
      </div>
    </Navbar>
  );
}
