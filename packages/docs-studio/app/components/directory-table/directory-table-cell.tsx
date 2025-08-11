import { EditableTableCell } from "@/components/editable-table-cell/editable-table-cell"
import { TableCell } from "@/components/ui/table"
import type { DocFileIndexSchemaField, DocRelation } from "@/lib/types"

type Props = {
  columnKey: string
  schema: DocFileIndexSchemaField
  value: unknown
  relations?: DocRelation[]
  onUpdate: (field: string, value: unknown) => void
}

export function DirectoryTableCell(props: Props) {
  const schema = props.schema

  if (schema.type === "relation" || schema.type === "multi-relation") {
    const relationData = props.relations?.find((rel) => {
      return rel.path === schema.path
    })

    return (
      <TableCell className="p-1">
        <EditableTableCell
          value={props.value}
          type={schema.type}
          path={schema.path}
          relationOptions={relationData?.files}
          onUpdate={(newValue) => {
            return props.onUpdate(props.columnKey, newValue)
          }}
        />
      </TableCell>
    )
  }

  if (schema.type === "select-text" || schema.type === "select-number") {
    return (
      <TableCell className="p-1">
        <EditableTableCell
          value={props.value}
          type={schema.type}
          selectOptions={schema.options}
          onUpdate={(newValue) => {
            return props.onUpdate(props.columnKey, newValue)
          }}
        />
      </TableCell>
    )
  }

  if (
    schema.type === "multi-select-text" ||
    schema.type === "multi-select-number"
  ) {
    return (
      <TableCell className="p-1">
        <EditableTableCell
          value={props.value}
          type={schema.type}
          selectOptions={schema.options}
          onUpdate={(newValue) => {
            return props.onUpdate(props.columnKey, newValue)
          }}
        />
      </TableCell>
    )
  }

  if (
    schema.type === "text" ||
    schema.type === "number" ||
    schema.type === "boolean"
  ) {
    return (
      <TableCell className="p-1">
        <EditableTableCell
          value={props.value}
          type={schema.type}
          onUpdate={(newValue) => {
            return props.onUpdate(props.columnKey, newValue)
          }}
        />
      </TableCell>
    )
  }

  if (schema.type === "multi-text" || schema.type === "multi-number") {
    return (
      <TableCell className="p-1">
        <EditableTableCell
          value={props.value}
          type={schema.type}
          onUpdate={(newValue) => {
            return props.onUpdate(props.columnKey, newValue)
          }}
        />
      </TableCell>
    )
  }

  return (
    <TableCell className="p-1">
      <EditableTableCell
        value={props.value}
        type="text"
        onUpdate={(newValue) => {
          return props.onUpdate(props.columnKey, newValue)
        }}
      />
    </TableCell>
  )
}
