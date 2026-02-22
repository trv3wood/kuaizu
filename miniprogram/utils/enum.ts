// enum.ts
export enum AuthStatus {
  Unverified = 0,
  Verified = 1,
  Failed = 2
}

export enum OliveBranchStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
  Ignored = 3
}

export enum ProjectStatus {
  UnderReview = 0,
  Approved = 1,
  Rejected = 2,
  Closed = 3
}

// 项目申请状态
export enum ApplicationStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2
}

export enum TalentStatus {
  OffShelf = 0,
  OnShelf = 1
}

export enum OrderStatus {
  PendingPayment = 0,
  Paid = 1,
  Canceled = 2,
  Refunded = 3
}

export enum EmailPromotionStatus {
  Pending = 0,
  Sending = 1,
  Completed = 2,
  Failed = 3
}
