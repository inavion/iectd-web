export const navItems = [
  {
    name: "Dashboard",
    icon: "/assets/icons/dashboard.svg",
    url: "/dashboard",
  },
  {
    name: "Documents",
    icon: "/assets/icons/documents.svg",
    url: "/documents",
  },
  {
    name: "AI Assistant",
    icon: "/assets/icons/ai-assistant.svg",
    url: "/ai-assistant",
  },
  {
    name: "Settings",
    icon: "/assets/icons/user.svg",
    url: "/settings",
  },
];

export const actionsDropdownItems = [
  {
    label: "Details",
    icon: "/assets/icons/info.svg",
    value: "details",
  },
  {
    label: "Share",
    icon: "/assets/icons/share.svg",
    value: "share",
  },
  {
    label: "Download",
    icon: "/assets/icons/download.svg",
    value: "download",
  },
  {
    label: "Delete",
    icon: "/assets/icons/delete.svg",
    value: "delete",
  },
];

export const folderDropdownItems = [
  {
    label: "Details",
    icon: "/assets/icons/info.svg",
    value: "details",
  },
  {
    label: "Share",
    icon: "/assets/icons/share.svg",
    value: "share",
  },

  {
    label: "Delete",
    icon: "/assets/icons/delete.svg",
    value: "delete",
  },
];

export const sortTypes = [
  {
    label: "Date created (newest)",
    value: "$createdAt-desc",
  },
  {
    label: "Created Date (oldest)",
    value: "$createdAt-asc",
  },
  {
    label: "Name (A-Z)",
    value: "name-asc",
  },
  {
    label: "Name (Z-A)",
    value: "name-desc",
  },
  {
    label: "Size (Highest)",
    value: "size-desc",
  },
  {
    label: "Size (Lowest)",
    value: "size-asc",
  },
];

export const avatarPlaceholderUrl = "/assets/images/avatar.avif";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
