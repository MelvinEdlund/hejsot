import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Logga in",
  description:
    "Logga in eller skapa ett konto för att hålla koll på dina inbjudningar.",
};

export default function LoginPage() {
  redirect("/");
}
