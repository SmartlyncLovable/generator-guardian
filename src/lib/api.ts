// Type definitions
export type UserRole = 'admin' | 'agent' | 'customer';
export type TicketStatus = 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketDepartment = 'Human Resource' | 'IT Support' | 'Finance' | 'Operations';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string | null;
  open_ticket_count?: number;
  created_at: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customer_id: string;   // actual field returned by backend
  customerId?: string;   // legacy alias
  customerName: string;
  department: string;
  agent_id?: string;
  agentName?: string;
  sla_deadline?: string;
  satisfaction_rating?: number | null;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  entity_type: string | null;
  entity_id: string | null;
  is_read: number; // 0 or 1
  created_at: string;
}

export interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  uploaded_by: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  created_at: string;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  avgResponseTime: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  entity_type: string;
  entity_id: string | null;
  description: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface AgentPerformance {
  id: string;
  agent_name: string;
  agent_email: string;
  total_assigned: number;
  open_count: number;
  in_progress_count: number;
  pending_count: number;
  resolved_count: number;
  closed_count: number;
  avg_resolution_hours: number | null;
  urgent_handled: number;
  high_handled: number;
  avg_satisfaction_rating: number | null;
  rated_count: number;
}

export interface TicketVolumeDay {
  date: string;
  total: number;
  resolved: number;
}

export interface DepartmentStats {
  department: string;
  total: number;
  open_count: number;
  in_progress_count: number;
  resolved_count: number;
  closed_count: number;
  avg_resolution_hours: number | null;
}

export interface PriorityStats {
  priority: string;
  total: number;
  resolved_count: number;
  avg_resolution_hours: number | null;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8009/api';

// ============================================================================
// API IMPLEMENTATION
// ============================================================================

export const api = {

  // ---------- AUTH ----------

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async register(email: string, password: string, name: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    return response.json();
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
      if (!response.ok) return null;
      const data = await response.json();
      return data.user ?? null;
    } catch {
      return null;
    }
  },

  // ---------- TICKETS ----------

  async getTickets(filters?: { status?: TicketStatus; priority?: TicketPriority }): Promise<Ticket[]> {
    const response = await fetch(`${API_BASE}/tickets`, { credentials: 'include' });
    const data = await response.json();
    let tickets: Ticket[] = data.tickets ?? [];
    if (filters?.status)   tickets = tickets.filter(t => t.status   === filters.status);
    if (filters?.priority) tickets = tickets.filter(t => t.priority === filters.priority);
    return tickets;
  },

  async getTicketsByCustomer(filters?: { priority?: TicketPriority }, user_id: string = ''): Promise<Ticket[]> {
    const response = await fetch(`${API_BASE}/all_tickets/customer/${user_id}`, { credentials: 'include' });
    const data = await response.json();
    let tickets: Ticket[] = data.tickets ?? [];
    if (filters?.priority) tickets = tickets.filter(t => t.priority === filters.priority);
    return tickets;
  },

  async getOpenTickets(filters?: { priority?: TicketPriority }): Promise<Ticket[]> {
    const response = await fetch(`${API_BASE}/open_tickets`, { credentials: 'include' });
    const data = await response.json();
    let tickets: Ticket[] = data.tickets ?? [];
    if (filters?.priority) tickets = tickets.filter(t => t.priority === filters.priority);
    return tickets;
  },

  async getActiveTickets(filters?: { priority?: TicketPriority }): Promise<Ticket[]> {
    const response = await fetch(`${API_BASE}/in_progress_tickets`, { credentials: 'include' });
    const data = await response.json();
    let tickets: Ticket[] = data.tickets ?? [];
    if (filters?.priority) tickets = tickets.filter(t => t.priority === filters.priority);
    return tickets;
  },

  async getPendingTickets(filters?: { priority?: TicketPriority }): Promise<Ticket[]> {
    const response = await fetch(`${API_BASE}/pending_tickets`, { credentials: 'include' });
    const data = await response.json();
    let tickets: Ticket[] = data.tickets ?? [];
    if (filters?.priority) tickets = tickets.filter(t => t.priority === filters.priority);
    return tickets;
  },

  async getResolvedTickets(filters?: { priority?: TicketPriority }): Promise<Ticket[]> {
    const response = await fetch(`${API_BASE}/resolved_tickets`, { credentials: 'include' });
    const data = await response.json();
    let tickets: Ticket[] = data.tickets ?? [];
    if (filters?.priority) tickets = tickets.filter(t => t.priority === filters.priority);
    return tickets;
  },

  async getCloseTickets(filters?: { priority?: TicketPriority }): Promise<Ticket[]> {
    const response = await fetch(`${API_BASE}/closed_tickets`, { credentials: 'include' });
    const data = await response.json();
    let tickets: Ticket[] = data.tickets ?? [];
    if (filters?.priority) tickets = tickets.filter(t => t.priority === filters.priority);
    return tickets;
  },

  async getTicket(id: string): Promise<Ticket | null> {
    const response = await fetch(`${API_BASE}/tickets/${id}`, { credentials: 'include' });
    if (!response.ok) return null;
    const data = await response.json();
    return data.ticket ?? null;
  },

  async createTicket(title: string, description: string, priority: TicketPriority, department: TicketDepartment): Promise<Ticket> {
    const response = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, priority, department }),
    });
    const data = await response.json();
    return data.ticket;
  },

  async updateTicket(id: string, updates: { status?: TicketStatus; priority?: TicketPriority; agent_id?: string }): Promise<Ticket> {
    const response = await fetch(`${API_BASE}/tickets/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return data.ticket;
  },

  // ---------- COMMENTS ----------

  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    const response = await fetch(`${API_BASE}/tickets/${ticketId}/comments`, { credentials: 'include' });
    const data = await response.json();
    return data.comments ?? [];
  },

  async addTicketComment(ticketId: string, content: string): Promise<TicketComment> {
    const response = await fetch(`${API_BASE}/tickets/${ticketId}/comments`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const data = await response.json();
    return data.comment;
  },

  // ---------- AGENTS ----------

  async getAgents(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/agents`, { credentials: 'include' });
    const data = await response.json();
    return data.users ?? [];
  },

  // ---------- USERS ----------

  async getUsers(role?: UserRole): Promise<User[]> {
    const params = role ? `?role=${role}` : '';
    const response = await fetch(`${API_BASE}/users${params}`, { credentials: 'include' });
    const data = await response.json();
    return data.users ?? [];
  },

  async createUser(userData: CreateUserInput): Promise<User> {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data.user;
  },

  async updateUser(id: string, updates: { name?: string; role?: UserRole }): Promise<User> {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return data.user;
  },

  async updateUserPassword(id: string, updates: { password?: string }): Promise<User> {
    const response = await fetch(`${API_BASE}/users_password/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return data.user;
  },

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message ?? 'Failed to delete user');
    }
  },

  // ---------- DASHBOARD ----------

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE}/dashboard/stats`, { credentials: 'include' });
    const data = await response.json();
    return data.stats;
  },

  // ---------- REPORTS ----------

  async getReportsOverview(): Promise<{
    by_status: { status: string; count: number }[];
    avg_resolution_hours: number | null;
    this_week_tickets: number;
    last_week_tickets: number;
  }> {
    const response = await fetch(`${API_BASE}/reports/overview`, { credentials: 'include' });
    const data = await response.json();
    return data.overview;
  },

  async getAgentPerformance(): Promise<AgentPerformance[]> {
    const response = await fetch(`${API_BASE}/reports/agent_performance`, { credentials: 'include' });
    const data = await response.json();
    return data.agents ?? [];
  },

  async getTicketVolume(days: number = 30): Promise<TicketVolumeDay[]> {
    const response = await fetch(`${API_BASE}/reports/ticket_volume?days=${days}`, { credentials: 'include' });
    const data = await response.json();
    return data.volume ?? [];
  },

  async getTicketsByDepartment(): Promise<DepartmentStats[]> {
    const response = await fetch(`${API_BASE}/reports/by_department`, { credentials: 'include' });
    const data = await response.json();
    return data.departments ?? [];
  },

  async getTicketsByPriority(): Promise<PriorityStats[]> {
    const response = await fetch(`${API_BASE}/reports/by_priority`, { credentials: 'include' });
    const data = await response.json();
    return data.priorities ?? [];
  },

  async getResolutionTimes(): Promise<Ticket[]> {
    const response = await fetch(`${API_BASE}/reports/resolution_times`, { credentials: 'include' });
    const data = await response.json();
    return data.tickets ?? [];
  },

  // ---------- AUDIT TRAIL ----------

  // ---------- TICKET ACTIONS ----------

  async claimTicket(id: string): Promise<Ticket> {
    const response = await fetch(`${API_BASE}/tickets/${id}/claim`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await response.json();
    return data.ticket;
  },

  async rateTicket(id: string, rating: number): Promise<void> {
    await fetch(`${API_BASE}/tickets/${id}/rate`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });
  },

  // ---------- ATTACHMENTS ----------

  async getAttachments(ticketId: string): Promise<Attachment[]> {
    const response = await fetch(`${API_BASE}/tickets/${ticketId}/attachments`, { credentials: 'include' });
    const data = await response.json();
    return data.attachments ?? [];
  },

  async uploadAttachment(ticketId: string, file: File): Promise<{ attachment_id: string; file_name: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/tickets/${ticketId}/attachments`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    return response.json();
  },

  getAttachmentDownloadUrl(attachmentId: string): string {
    return `${API_BASE}/attachments/${attachmentId}/download`;
  },

  // ---------- NOTIFICATIONS ----------

  async getNotifications(): Promise<{ notifications: Notification[]; unread_count: number }> {
    const response = await fetch(`${API_BASE}/notifications`, { credentials: 'include' });
    const data = await response.json();
    return { notifications: data.notifications ?? [], unread_count: data.unread_count ?? 0 };
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST', credentials: 'include' });
  },

  async markAllNotificationsRead(): Promise<void> {
    await fetch(`${API_BASE}/notifications/read_all`, { method: 'POST', credentials: 'include' });
  },

  // ---------- AUDIT TRAIL ----------

  async getAuditLogs(params?: {
    limit?: number;
    offset?: number;
    action?: string;
    entity_type?: string;
    from?: string;
    to?: string;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.limit)       query.set('limit',       String(params.limit));
    if (params?.offset)      query.set('offset',      String(params.offset));
    if (params?.action)      query.set('action',      params.action);
    if (params?.entity_type) query.set('entity_type', params.entity_type);
    if (params?.from)        query.set('from',        params.from);
    if (params?.to)          query.set('to',          params.to);

    const response = await fetch(`${API_BASE}/audit_logs?${query.toString()}`, { credentials: 'include' });
    const data = await response.json();
    return { logs: data.logs ?? [], total: data.total ?? 0 };
  },
};
