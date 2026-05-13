import React from "react";
import { Link, useLocation } from "react-router-dom";

const menuSections = [
  {
    header: "General",
    items: [
      { label: "Manage Membership", to: "/settings/membership" },
      { label: "Preferred Language", to: "/settings/language" },
    ],
  },
  {
    header: "Account",
    items: [{ label: "Email / Password", to: "/settings/email-password" }],
  },
  {
    header: "Purchase",
    items: [
      { label: "Payment Info", to: "/settings/payment-info" },
      { label: "Billing History", to: "/settings/billing-history" },
    ],
  },
];

function SettingsSidebar() {
  const location = useLocation();

  return (
    <>
      <nav className="px-4 py-6 max-w-[200px] w-full bg-transparent">
        <div className="text-white text-[1.5rem] font-bold mb-10 ml-[2px] tracking-tight whitespace-nowrap">
          Account Setting
        </div>
        {menuSections.map((section, idx) => (
          <div key={section.header} className={idx !== 0 ? "mt-6" : ""}>
            <div className="text-lg font-bold text-gray-400 mb-2 select-none">
              {section.header}
            </div>
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={
                        `block rounded px-3 py-2 transition ` +
                        (isActive
                          ? "text-[#87CEEB] font-semibold"
                          : "text-white hover:text-blue-300 hover:bg-gray-700")
                      }
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}

export default SettingsSidebar;
