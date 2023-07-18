export interface UserType {
  userId?: string;
  _id: string;
  username: string;
}

export interface WebSocketUserType {
  online: UserType[];
}

export interface WebSocketMessageType {
  _id: string;
  recipient: string;
  sender: string;
  text: string;
}
