import { string } from "yup";
import type { Agent } from "./agent";
import type { CreatedByable, Identifiable, Timeable, UpdatedByable } from "./type";

// Type báo cáo
export type Report = Identifiable & Timeable & CreatedByable & UpdatedByable & {
    name: string;
    dob: string;
    agent_id: number;
    agent?: Agent;
    email: string;
    phone: string;
    nationality: string;
    home_town: string;
    current_city: string;
    religion: string;
    address: string;
    meta: string;
    report_link: string;
    photo_link: string;
    status: number;
}

export type ReportFormData = {
    name?: string;
    dob?: string;
    phone?: string;
    email?: string;
    agent_id?: number;
    one_time_password ?: string;
    nickname?: string;
    initials?: string;
}

export enum REPORT_STATUS {
    STATUS_INACTIVE = 0,
    STATUS_ACTIVE = 1
};

export const getReportStatusItems = (key?: REPORT_STATUS) => {
    const items: Record<number, string> = {};
    items[REPORT_STATUS.STATUS_INACTIVE] = "Đang xử lý";
    items[REPORT_STATUS.STATUS_ACTIVE] = "Đã hoàn thành";
    if (key !== undefined) {
        return items[key];
    }
    return items;
}