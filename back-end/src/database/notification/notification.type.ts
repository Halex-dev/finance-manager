export interface Notification {
  id: number;
  icon: string;
  message: string;
  code: NotificationState;
  date: Date;
  separator?: boolean;
  type?: string;
  read: boolean;
}

export enum NotificationState {
  ERROR_MONEY = 'error_money',
}
