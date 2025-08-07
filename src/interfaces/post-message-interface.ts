export interface IPostMessage {
  message: string;
  recipient: string;
  messaging_type?: string;
  tag?: string;
  companyId: string;
}
