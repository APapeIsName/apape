import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AdminAiForm from "./AdminAiForm";

export default async function AdminAiPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login?callbackUrl=/admin/ai");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return <AdminAiForm />;
}
