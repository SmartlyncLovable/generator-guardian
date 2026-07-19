import {
  LayoutDashboard,
  ScrollText,
  Download,
  Zap,
  UserCog,
  LogOut,
} from "lucide-react";

import logo from "@/img/egenco.png";
import { NavLink } from "@/components/NavLink";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  //{ title: "Generator Activities", url: "/logs", icon: ScrollText },
  { title: "User Management", url: "/users", icon: UserCog },
  { title: "Reports", url: "/report", icon: Download },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/50">
      {/* --- LOGO SECTION --- */}
      <SidebarHeader className="bg-white transition-all duration-300 ease-in-out">
        <div
          className={`flex flex-col items-center justify-center ${
            collapsed ? "py-4" : "pt-8 pb-4"
          }`}
        >
          {collapsed ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b59a9] shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
          ) : (
            <div className="w-full px-4 flex flex-col items-center">
              <img
                src={logo}
                alt="Egenco Logo"
                className="h-12 w-auto mb-6 object-contain"
              />

              {/* Profile Highlight Box */}
              <div className="w-full bg-[#0b59a9] rounded-xl p-3 shadow-md border border-white/10 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1 opacity-20">
                  <Zap className="h-8 w-8 text-white pt-4" />
                </div>

                <p className="text-sm font-bold text-white truncate relative z-10">
                  {user?.name || "User"}
                </p>

                <p className="text-[10px] text-blue-100 uppercase tracking-widest opacity-80 relative z-10">
                  {user?.role || "Role"}
                </p>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* --- NAVIGATION --- */}
      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
              System Menu
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="h-11 transition-all duration-200 group"
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center w-full rounded-lg px-3"
                      activeClassName="bg-[#0b59a9]/10 text-[#0b59a9] font-bold shadow-sm"
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110" />
                      {!collapsed && (
                        <span className="ml-3 text-[13px]">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Logout Button */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Logout"
                  onClick={handleLogout}
                  className="h-11 transition-all duration-200 group text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110" />
                  {!collapsed && (
                    <span className="ml-3 text-[13px]">
                      Logout
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* --- FOOTER: POWERED BY --- */}
      <SidebarFooter className="p-4 space-y-4">
        {!collapsed && (
          <div className="bg-white border border-border/50 rounded-full py-2 px-4 flex items-center justify-center transition-opacity duration-300">
            <p className="text-[13px] text-muted-foreground flex items-center gap-1.5 tracking-tighter">
              Powered By{" "}
              <span className="font-bold text-[#0b59a9]">
                iMoSyS
              </span>
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}