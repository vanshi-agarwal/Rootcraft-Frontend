import React from "react";
import AdminShell from "./components/AdminShell";

export const metadata = {
    title: "Admin Dashboard | Rootcraft",
    description: "Rootcraft Administration Dashboard",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminShell>{children}</AdminShell>;
}
