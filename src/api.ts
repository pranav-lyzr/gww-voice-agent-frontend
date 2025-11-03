import type {
	ErrorResponse,
	Health,
	OkResponse,
	SessionsResponse,
	UsersListResponse,
	User,
	Config,
	ConversationsResponse,
	ConversationResponse,
	LogsResponse,
	ValidateOtpResponse,
	DashboardAnalyticsResponse,
	UserAnalyticsResponse,
	CreateUserRequest,
	CreateUserResponse,
	DeleteUserResponse,
} from './types';

const API_BASE_URL: string = (import.meta as any).env?.VITE_API_BASE_URL || 'https://gww-voice-agent-backend.ca.lyzr.app';

function buildUrl(path: string): string {
	return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
	const url = buildUrl(path);
	const response = await fetch(url, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(init?.headers || {}),
		},
	});

	const isJson = response.headers.get('content-type')?.includes('application/json');
	if (!response.ok) {
		let message = `Request failed with status ${response.status}`;
		if (isJson) {
			try {
				const body: ErrorResponse = await response.json();
				if (body?.detail) message = body.detail;
				if (body?.message) message = body.message;
			} catch (_) {}
		}
		throw new Error(message);
	}

	if (!isJson) return undefined as unknown as T;
	return (await response.json()) as T;
}

export const api = {
	getBaseUrl(): string {
		return API_BASE_URL;
	},

	// Health & Config
	async getHealth(): Promise<Health> {
		return requestJson<Health>('/health');
	},
	async getConfig(): Promise<Config> {
		return requestJson<Config>('/config');
	},

	// Sessions
	async getSessions(): Promise<SessionsResponse> {
		return requestJson<SessionsResponse>('/sessions');
	},
	async deleteSession(sessionId: string): Promise<OkResponse> {
		return requestJson<OkResponse>(`/sessions/${encodeURIComponent(sessionId)}`, {
			method: 'DELETE',
		});
	},

	// Conversations
	async getConversations(limit = 50, offset = 0): Promise<ConversationsResponse> {
		const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
		return requestJson<ConversationsResponse>(`/conversations?${params.toString()}`);
	},
	async getConversation(sessionId: string): Promise<ConversationResponse> {
		return requestJson<ConversationResponse>(`/conversations/${encodeURIComponent(sessionId)}`);
	},

	// Logs
	async getLogs(limit = 100): Promise<LogsResponse> {
		const params = new URLSearchParams({ limit: String(limit) });
		return requestJson<LogsResponse>(`/logs?${params.toString()}`);
	},

	// Users
	async getUsers(): Promise<UsersListResponse> {
		return requestJson<UsersListResponse>('/users');
	},
	async createUser(user: CreateUserRequest): Promise<CreateUserResponse> {
		return requestJson<CreateUserResponse>('/users', {
			method: 'POST',
			body: JSON.stringify(user),
		});
	},
	async deleteUser(phoneNumber: string): Promise<DeleteUserResponse> {
		return requestJson<DeleteUserResponse>(`/users/${encodeURIComponent(phoneNumber)}`, {
			method: 'DELETE',
		});
	},
	async getUserByPhone(phoneNumber: string): Promise<User> {
		return requestJson<User>(`/users/by-phone/${encodeURIComponent(phoneNumber)}`);
	},
	async getUserByName(name: string): Promise<User> {
		return requestJson<User>(`/users/by-name/${encodeURIComponent(name)}`);
	},
	async sendOtp(phoneNumber: string): Promise<OkResponse> {
		return requestJson<OkResponse>(`/users/${encodeURIComponent(phoneNumber)}/otp`, {
			method: 'POST',
			body: JSON.stringify({}),
		});
	},
	async updateEmail(phoneNumber: string, email: string): Promise<OkResponse> {
		return requestJson<OkResponse>(`/users/${encodeURIComponent(phoneNumber)}/email`, {
			method: 'POST',
			body: JSON.stringify({ email }),
		});
	},
	async scheduleCallback(phoneNumber: string, when: string): Promise<OkResponse> {
		return requestJson<OkResponse>(`/users/${encodeURIComponent(phoneNumber)}/callback`, {
			method: 'POST',
			body: JSON.stringify({ when }),
		});
	},
	async setOutcome(phoneNumber: string, outcome: string): Promise<OkResponse> {
		return requestJson<OkResponse>(`/users/${encodeURIComponent(phoneNumber)}/outcome`, {
			method: 'POST',
			body: JSON.stringify({ outcome }),
		});
	},
	async validateOtp(phoneNumber: string, otp: string): Promise<ValidateOtpResponse> {
		return requestJson<ValidateOtpResponse>('/validate-otp', {
			method: 'POST',
			body: JSON.stringify({ phone_number: phoneNumber, otp }),
		});
	},

	// Data exports (optional helpers)
	async getDataUsers(): Promise<UsersListResponse> {
		return requestJson<UsersListResponse>('/data/users');
	},

	// Analytics
	async getUserAnalytics(): Promise<UserAnalyticsResponse> {
		return requestJson<UserAnalyticsResponse>('/analytics/users');
	},
	async getDashboardAnalytics(): Promise<DashboardAnalyticsResponse> {
		return requestJson<DashboardAnalyticsResponse>('/analytics/dashboard');
	},
};
