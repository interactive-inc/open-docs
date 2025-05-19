import type { Metadata } from "next"

import "./globals.css"
import { RootHeader } from "./components/root-header"

export const metadata: Metadata = {
  title: "Docs",
  description: "資料管理システム",
}

type Props = Readonly<{ children: React.ReactNode }>

export default function RootLayout(props: Props) {
  return (
    <html lang={"ja"} className={"dark"}>
      <body className={"antialiased"}>
        <RootHeader />
        {props.children}
      </body>
    </html>
  )
}
