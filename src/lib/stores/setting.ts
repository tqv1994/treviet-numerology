import type {
    CreatedByable,
    Identifiable,
    Timeable,
    UpdatedByable,
  } from "./type";
  import { writable } from "svelte/store";
  // Type hỏi đáp
  export type Setting = Identifiable & Timeable & CreatedByable & UpdatedByable & {
    option_name: string;
    option_value: string;
  };
  export type SettingFormData = {
    option_name?: string;
    option_value?: string;
  }
  export const settingStore = writable<Setting[]>([]);
  