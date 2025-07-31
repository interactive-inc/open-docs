import { test } from "bun:test"
import type { DocFileSystem } from "./doc-file-system"
import type { DocPathSystem } from "./doc-path-system"
import type { Equals } from "./types"
import { assertType } from "./utils"

test("DocFileSystem - メソッドの戻り値の型", () => {
  // readFile の戻り値の型
  type ReadFileResult = Awaited<ReturnType<DocFileSystem["readFile"]>>
  assertType<Equals<ReadFileResult, string | null | Error>>()

  // writeFile の戻り値の型
  type WriteFileResult = Awaited<ReturnType<DocFileSystem["writeFile"]>>
  assertType<Equals<WriteFileResult, Error | null>>()

  // deleteFile の戻り値の型
  type DeleteFileResult = Awaited<ReturnType<DocFileSystem["deleteFile"]>>
  assertType<Equals<DeleteFileResult, Error | null>>()

  // exists の戻り値の型
  type ExistsResult = Awaited<ReturnType<DocFileSystem["exists"]>>
  assertType<Equals<ExistsResult, boolean>>()

  // readDirectoryFilePaths の戻り値の型
  type ReadDirResult = Awaited<
    ReturnType<DocFileSystem["readDirectoryFilePaths"]>
  >
  assertType<Equals<ReadDirResult, string[] | Error>>()

  // getFileSize の戻り値の型
  type FileSizeResult = Awaited<ReturnType<DocFileSystem["getFileSize"]>>
  assertType<Equals<FileSizeResult, number | Error>>()

  // getFileModifiedTime の戻り値の型
  type FileModifiedTimeResult = Awaited<
    ReturnType<DocFileSystem["getFileModifiedTime"]>
  >
  assertType<Equals<FileModifiedTimeResult, Date | Error>>()

  // getFileCreatedTime の戻り値の型
  type FileCreatedTimeResult = Awaited<
    ReturnType<DocFileSystem["getFileCreatedTime"]>
  >
  assertType<Equals<FileCreatedTimeResult, Date | Error>>()
})

test("DocFileSystem - コンストラクタのProps型", () => {
  // コンストラクタのProps型を確認
  type ConstructorProps = ConstructorParameters<typeof DocFileSystem>[0]

  // Propsの構造: basePath (必須), pathSystem (オプショナル)
  assertType<Equals<ConstructorProps["basePath"], string>>()
  assertType<
    Equals<ConstructorProps["pathSystem"], DocPathSystem | undefined>
  >()

  // 必須とオプショナルのプロパティ
  type RequiredProps = Required<ConstructorProps>
  type RequiredKeys = keyof RequiredProps
  assertType<Equals<RequiredKeys, "basePath" | "pathSystem">>()
})

test("DocFileSystem - moveFile と copyFile の型", () => {
  // moveFile の戻り値の型
  type MoveFileResult = Awaited<ReturnType<DocFileSystem["moveFile"]>>
  assertType<Equals<MoveFileResult, Error | null>>()

  // copyFile の戻り値の型
  type CopyFileResult = Awaited<ReturnType<DocFileSystem["copyFile"]>>
  assertType<Equals<CopyFileResult, Error | null>>()

  // 両メソッドとも string の引数を2つ取る
  type MoveFileParams = Parameters<DocFileSystem["moveFile"]>
  assertType<Equals<MoveFileParams, [string, string]>>()

  type CopyFileParams = Parameters<DocFileSystem["copyFile"]>
  assertType<Equals<CopyFileParams, [string, string]>>()
})

test("DocFileSystem - getBasePath の型", () => {
  // getBasePath の戻り値の型
  type BasePathResult = ReturnType<DocFileSystem["getBasePath"]>
  assertType<Equals<BasePathResult, string>>()
})

test("DocFileSystem - readDirectoryFilePaths の型", () => {
  // readDirectoryFilePaths の引数の型
  type ReadDirParams = Parameters<DocFileSystem["readDirectoryFilePaths"]>
  assertType<Equals<ReadDirParams, [string]>>()
})

test("DocFileSystem - エラーハンドリングの型", () => {
  // deleteFile の戻り値が Error | null であることを確認
  type DeleteFileResult = Awaited<ReturnType<DocFileSystem["deleteFile"]>>
  assertType<Equals<DeleteFileResult, Error | null>>()
})

test("DocFileSystem - 非同期メソッドの型", () => {
  // すべての主要メソッドが Promise を返すことを確認
  type Methods = {
    readFile: DocFileSystem["readFile"]
    writeFile: DocFileSystem["writeFile"]
    deleteFile: DocFileSystem["deleteFile"]
    exists: DocFileSystem["exists"]
    readDirectoryFilePaths: DocFileSystem["readDirectoryFilePaths"]
    moveFile: DocFileSystem["moveFile"]
    copyFile: DocFileSystem["copyFile"]
    getFileSize: DocFileSystem["getFileSize"]
    getFileModifiedTime: DocFileSystem["getFileModifiedTime"]
    getFileCreatedTime: DocFileSystem["getFileCreatedTime"]
  }

  // すべてのメソッドが Promise を返すことを型レベルで確認
  type AllReturnPromise = {
    [K in keyof Methods]: ReturnType<Methods[K]> extends Promise<unknown>
      ? true
      : false
  }

  type AllTrue = AllReturnPromise[keyof AllReturnPromise] extends true
    ? true
    : false
  assertType<AllTrue>()
})
