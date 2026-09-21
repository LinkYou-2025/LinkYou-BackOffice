// 사생활 보호 모드 등에서 storage 접근이 throw 될 수 있어서 모든 접근을 감쌉니다.
export const sessionStore = {
  get(key: string): string | null {
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    try {
      sessionStorage.setItem(key, value)
    } catch {
      // storage 를 쓸 수 없어도 앱은 동작해야 한다.
    }
  },
  remove(key: string) {
    try {
      sessionStorage.removeItem(key)
    } catch {
      // 위와 동일
    }
  },
}
