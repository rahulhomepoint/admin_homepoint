import {
  Sidebar,
  SidebarCollapse,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
} from "flowbite-react";
import { BiData } from "react-icons/bi";
import { CgPlayListAdd } from "react-icons/cg";
import { CiSettings } from "react-icons/ci";

import {
  HiChartPie,
  HiShoppingBag,
  HiUser,
  HiUserAdd,
  HiUserGroup,
} from "react-icons/hi";
import { HiListBullet, HiQueueList } from "react-icons/hi2";
import { MdOutlineDomain } from "react-icons/md";
import { PiSignOut } from "react-icons/pi";
import Dashboard from "./Dashboard/Dashboard";
// @ts-ignore
import AllDomain from "./Domains/AllDomain.jsx";
import Hero from "./Dashboard/Home/Hero";
import { Routes, Route, Navigate } from "react-router-dom";
import NavbarTab from "./Navbar";
import { useState } from "react";
import { FiMonitor } from "react-icons/fi";
import { BsPersonCircle } from "react-icons/bs";
import { AddProject } from "./Projects/AddProject.js";
import { ListProject } from "./Projects/ListProject.js";
import { SignOut } from "./Dashboard/Dashboard";
import { Zones } from "./Dashboard/Home/Zones.js";
import { About } from "./Dashboard/Home/About.js";
// @ts-ignore
import Associate_Developers from "./Dashboard/Home/AssociateDevelopers.jsx";

export default function Slidebar() {
  const [Drawer, setDrawer] = useState(false);

  const changeDrawer = () => {
    console.log("Drawer clicked ", Drawer);
    setDrawer(!Drawer);
  };

  return (
    <>
      <NavbarTab changeDrawer={changeDrawer} />
      <div className="flex h-[90svh] gap-4">
        {/* Slide bar */}
        <Sidebar
          collapseBehavior={"collapse"}
          collapsed={Drawer}
          aria-label="Sidebar with multi-level dropdown example "
          className={`mt-1 border-r-2 border-gray-200 py-0 md:ml-1 [&_div]:p-0`}
        >
          <SidebarItems className="relative h-[86vh] rounded md:px-2">
            <SidebarItemGroup>
              <SidebarItem icon={HiChartPie} href="/dashboard/home">
                Dashboard
              </SidebarItem>
              <SidebarCollapse icon={HiShoppingBag} label="Home">
                <SidebarItem href="/dashboard/hero">Hero</SidebarItem>
                <SidebarItem href="/dashboard/zones">Zones</SidebarItem>
                <SidebarItem href="/dashboard/about">About</SidebarItem>
                <SidebarItem href="/dashboard/associate-developers">
                  Associate Developers
                </SidebarItem>
                <SidebarItem href="/dashboard/reviews">Reviews</SidebarItem>
                <SidebarItem href="/dashboard/bank-list">Bank List</SidebarItem>
              </SidebarCollapse>
              <SidebarCollapse icon={HiQueueList} label="Projects">
                <SidebarItem icon={HiListBullet} href="/dashboard/lists">
                  Lists
                </SidebarItem>
                <SidebarItem icon={CgPlayListAdd} href="/dashboard/add-project">
                  Add Project
                </SidebarItem>
              </SidebarCollapse>
              <SidebarCollapse icon={HiUser} label="Users">
                <SidebarItem
                  icon={HiUserGroup}
                  href="/dashboard/users-management"
                >
                  Users management
                </SidebarItem>
                <SidebarItem icon={HiUserAdd} href="/dashboard/add-user">
                  Add User
                </SidebarItem>
              </SidebarCollapse>
              <SidebarItem icon={BiData} href="/dashboard/master-data">
                Master Data
              </SidebarItem>
              <SidebarItem icon={MdOutlineDomain} href="/dashboard/domain-list">
                Domain List
              </SidebarItem>
              <SidebarItem icon={FiMonitor} href="/dashboard/monitor">
                Monitor
              </SidebarItem>
              <SidebarItem icon={BsPersonCircle} href="/dashboard/Carrer">
                Carrer Add
              </SidebarItem>
            </SidebarItemGroup>

            <SidebarItemGroup className="sticky bottom-0 bg-gray-50">
              <SidebarItem
                icon={PiSignOut}
                labelColor="red"
                color="black"
                className="text-red-500"
                href="/dashboard/sign-out"
              >
                Sign Out
              </SidebarItem>
              <SidebarItem icon={CiSettings} href="/dashboard/settings">
                Settings
              </SidebarItem>
            </SidebarItemGroup>
          </SidebarItems>
        </Sidebar>
        <div className="flex-1">
          <Routes>
            <Route path="" element={<Navigate to="home" replace />} />
            <Route path="home" element={<Dashboard />} />
            <Route path="hero" element={<Hero />} />
            <Route path="domain-list" element={<AllDomain />} />
            <Route path="add-project" element={<AddProject />} />
            <Route path="lists" element={<ListProject />} />
            <Route path="sign-out" element={<SignOut />} />
            <Route path="zones" element={<Zones />} />
            <Route path="about" element={<About />} />
            <Route
              path="associate-developers"
              element={<Associate_Developers />}
            />
            {/* Add more routes/components as needed for other sidebar links */}
          </Routes>
        </div>
      </div>
    </>
  );
}
