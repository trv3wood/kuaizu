// constants.ts

// Message Business Keys (Subscription Messages)
export const MsgBizKey = {
    CardReceived: "MSG_CARD_RECEIVED",
    CardDeliveryResult: "MSG_CARD_DELIVERY_RESULT",
    AuditResultProj: "MSG_AUDIT_RESULT_PROJ",
    UserReply: "MSG_USER_REPLY",
    InviteJoin: "MSG_INVITE_JOIN",
    AuditResultUser: "MSG_AUDIT_RESULT_USER",
    IdentityAuth: "MSG_IDENTITY_AUTH"
}

export const MBTI_COLOR_MAP: Record<string, string> = {
    INTJ: '#dbb4fd',
    INTP: '#dbb4fd',
    ENTJ: '#dbb4fd',
    ENTP: '#dbb4fd',
    ISTJ: '#5bfdfd',
    ISFJ: '#5bfdfd',
    ESFJ: '#5bfdfd',
    ESTJ: '#5bfdfd',
    INFJ: 'rgba(78, 211, 61, 0.75)',
    INFP: 'rgba(78, 211, 61, 0.75)',
    ENFP: 'rgba(78, 211, 61, 0.75)',
    ENFJ: 'rgba(78, 211, 61, 0.75)',
    ESTP: '#ffd633',
    ESFP: '#ffd633',
    ISTP: '#ffd633',
    ISFP: '#ffd633'
}

export const DEFAULT_MBTI_COLOR = 'rgba(78, 211, 61, 0.75)'
