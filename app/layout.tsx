import type { Metadata } from "next"
import { Toaster } from "sonner"

import "./globals.css"

export const metadata: Metadata = {
  title: "Docs",
  description: "",
}

type Props = Readonly<{ children: React.ReactNode }>

export default function RootLayout(props: Props) {
  return (
    <html lang={"ja"} className={"dark"}>
      <body className={"overscroll-none antialiased"}>
        <Toaster position={"top-right"} closeButton richColors />
        {props.children}
      </body>
    </html>
  )
}
