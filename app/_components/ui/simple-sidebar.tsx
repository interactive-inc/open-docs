"use client"

import { Button } from "@/app/_components/ui/button"
import type { ReactNode } from "react"

type Props = {
  title: string
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  footer: ReactNode
}

export function SimpleSidebar(props: Props) {
  return (
    <>
      <div
        className={`border-r transition-all duration-200 ${
          props.isOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">{props.title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={props.onClose}
              className="h-8 w-8 p-0"
            >
              {"<"}
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4">{props.children}</div>
          <div className="border-t p-4">{props.footer}</div>
        </div>
      </div>

      {!props.isOpen && (
        <Button
          variant="ghost"
          size="sm"
          onClick={props.onOpen}
          className="absolute top-16 left-4 h-8 w-8 p-0"
        >
          {">"}
        </Button>
      )}
    </>
  )
}
