export class PendingInvitationDto {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
  createdAt: Date;
  invitedBy: { id: string; email: string };
}
