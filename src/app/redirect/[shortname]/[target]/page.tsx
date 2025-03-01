import { redirect } from "next/navigation"
import { getPresentation } from "~/lib/data"

export default function RedirectPage({
  params,
}: {
  params: { shortname: string; target: string }
}) {
  const { shortname, target } = params
  const presentation = getPresentation(shortname)

  if (!presentation) {
    redirect("/")
  }

  let redirectUrl = "/"

  switch (target) {
    case "presentation":
      redirectUrl = presentation.presentationFile?.url || "/"
      break
    case "handout":
      redirectUrl = presentation.handoutFile?.url || "/"
      break
    case "research":
      redirectUrl = presentation.researchFile?.url || "/"
      break
    default:
      redirectUrl = "/"
  }

  redirect(redirectUrl)
}

