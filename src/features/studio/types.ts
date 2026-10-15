export type SessionUser = {
  id: number;
  email: string;
  name: string;
  phone: string;
  arn: string;
  roles: string[];
  /** False when the user is tenant-viewer on their linked business. */
  canEditSite: boolean;
};
export type SyncState = "idle" | "saving" | "saved" | "error";
export type StudioStatus = "loading" | "ready";
