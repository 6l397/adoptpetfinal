"use client";

import { useState } from "react";
import styles from "./links.module.css";
import NavLink from "./navLink/navLink";
import Image from "next/image";
import { handleLogout } from "@/lib/action";

const links = [
  {
    title: "Головна сторінка",
    path: "/",
  },
  {
    title: "Адопція тварин",
    path: "/catalog",
  },
  {
    title: "Загублені / знайдені",
    path: "/lost-found",
  },
  {
    title: "Разова допомога",
    path: "/help",
  },
];

const Links = ({session}) => {
  const [open, setOpen] = useState(false);
  const sessionLinks = session?.user
    ? [
        { title: "Мій кабінет", path: "/profile" },
        ...(session.user?.isAdmin ? [{ title: "Адмін", path: "/admin" }] : []),
      ]
    : [{ title: "Увійти", path: "/login" }];

  return (
    <div className={styles.container}>
      <div className={styles.links}>
        {links.map((link) => (
          <NavLink item={link} key={link.title} />
        ))}
        {session?.user ? (
          <>
            {sessionLinks.map((link) => (
              <NavLink item={link} key={link.title} />
            ))}
            <form action={handleLogout}>
              <button className={styles.logout}>Вийти</button>
            </form>
          </>
        ) : (
          <NavLink item={sessionLinks[0]} />
        )}
      </div>
      <Image
        className={styles.menuButton}
        src="/menu.png"
        alt=""
        width={30}
        height={30}
        onClick={() => setOpen((prev) => !prev)}
      />
      {open && (
        <div className={styles.mobileLinks}>
          {links.map((link) => (
            <NavLink item={link} key={link.title} />
          ))}
          {sessionLinks.map((link) => (
            <NavLink item={link} key={link.title} />
          ))}
          {session?.user && (
            <form action={handleLogout}>
              <button className={styles.logout}>Вийти</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Links;
