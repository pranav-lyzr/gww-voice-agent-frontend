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
	secondary_phone_number?: string;
	dob?: string;
	email?: string;
	scheduled_callback?: string | null;
	otp?: string | null;
	otp_count?: number;
	portal_mail_sent?: boolean;
	fields_updated?: string[];
	otp_verified?: boolean;
	call_outcome?: string | null;
	call_back_datetime?: string | null;
};

export type UsersListResponse = {
	items: User[];
};

export type OkResponse = { ok: true };

export type ValidateOtpResponse = { ok: true; verified: boolean };

export type CreateUserRequest = {
	name: string;
	address: string;
	phone_number: string;
	secondary_phone_number?: string;
	dob: string;
	email: string;
};

export type CreateUserResponse = {
	ok: true;
	user: User;
};

export type DeleteUserResponse = {
	ok: true;
	deleted_user: User;
};

export type ErrorResponse = { detail?: string; message?: string };

// Analytics Types
export type UserAnalyticsResponse = {
	success: boolean;
	data: User[];
	total_users: number;
};

export type DashboardAnalyticsResponse = {
	success: boolean;
	data: {
		overview: {
			total_calls: number;
			total_users: number;
			avg_conversation_time_seconds: number;
			avg_conversation_time_minutes: number;
		};
		call_outcomes: {
			total_outcomes_recorded: number;
			distribution: Record<string, { count: number; percentage: number }>;
			percentages: Record<string, number>;
		};
		otp_statistics: {
			total_otp_sent: number;
			average_otp_per_user: number;
			otp_verified: number;
			otp_unverified: number;
			verification_rate_percentage: number;
		};
		engagement: {
			callbacks_scheduled: number;
			portal_mails_sent: number;
		};
		fields_updated_statistics?: {
			total_fields_updated: number;
			users_with_updates: number;
			field_distribution: Record<string, number>;
		};
		time_series: {
			calls_over_time: Array<{ date: string; count: number }>;
			duration_trend: Array<{ date: string; avg_duration_seconds: number }>;
		};
	};
};
