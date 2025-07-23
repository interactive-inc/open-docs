export function getCurrentPath() {
  return window.location.pathname.match(/\/(.*)$/)?.[1] || ""
}
