

export interface IUser {
  id: string;
  email: string;
  username: string;
  phone_number: string;
  full_name: string;
  profile_img: string;
  role: string;
}

export interface INotification {
  id: number;
  user: IUser;
  title: string;
  message: string;
  error: null | string;
  is_success: boolean;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface INotificationData {
  [key: string]: any;
}

// export interface INotificationForm {
//   title: string;
//   body: string;
//   country_code?: string;
// }
export interface INotificationForm {
  title: string;
  body: string;
  user_id?: string;
  country_code?: string;
  data?: INotificationData;
}