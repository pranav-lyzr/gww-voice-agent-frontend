export type Health = {
	status: string;
	active_sessions: number;
	timestamp: string;
};

export type Config = {
	server_domain: string;
	port: number;
	transfer_enabled: boolean;
	twilio_configured: boolean;
	active_sessions: number;
};

export type Session = {
	session_id: string;
	call_sid: string;
	from_number: string;
	to_number: string;
	start_time: string;
};

export type SessionsResponse = {
	sessions: Session[];
};

export type ConversationTurn = {
	role: 'customer' | 'assistant' | string;
	text: string;
	timestamp: string;
};

export type ConversationItem = {
	session_id: string;
	call_sid: string;
	from_number: string;
	to_number: string;
	start_time: string;
	end_time?: string;
	duration_seconds?: number;
	turns: ConversationTurn[];
};

export type ConversationsResponse = {
	count: number;
	items: ConversationItem[];
};

export type ConversationResponse = {
	ok: true;
	conversation: {
		session_id: string;
		turns: ConversationTurn[];
	};
};

export type LogsResponse = {
	lines: string[];
};

export type User = {
	name: string;
	address?: string;
	phone_number: string;
	dob?: string;
	email?: string;
	scheduled_callback?: string | null;
	otp?: string | null;
	call_outcome?: string | null;
};

export type UsersListResponse = {
	items: User[];
};

export type OkResponse = { ok: true };

export type ValidateOtpResponse = { ok: true; verified: boolean };

export type ErrorResponse = { detail?: string; message?: string };
