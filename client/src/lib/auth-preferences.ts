export type FarmoraRole = "user" | "creator" | "guest";

export function persistSelectedRole(role: FarmoraRole) {
  window.localStorage.setItem("farmora:selected-role", role);
  window.sessionStorage.setItem("farmora:active-role", role);
}

export function persistAuthSession(role: Exclude<FarmoraRole, "guest">, email: string) {
  const session = {
    role,
    email,
    loggedIn: true,
    loggedInAt: new Date().toISOString(),
  };

  window.localStorage.setItem("farmora:auth", JSON.stringify(session));
  window.localStorage.setItem("farmora:logged-in", "true");
  window.sessionStorage.setItem("farmora:auth", JSON.stringify(session));
  persistSelectedRole(role);
}
