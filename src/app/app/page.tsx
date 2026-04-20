import { redirect } from "next/navigation";
import { APP_ROUTES_BY_ROLE } from "@/lib/constants";
import { requireSession } from "@/lib/auth";

export default async function AppRootPage() {
  const user = await requireSession();
  redirect(APP_ROUTES_BY_ROLE[user.role]);
}
