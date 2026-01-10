export const requests = {
    // Client API
    ClientCreate: 'client/create/',
    ClientList: 'client/clients/',
    ClientDetail: (id: number) => `client/clients/details/${id}/`,
    ClientUpdate: (id: number) => `client/clients/${id}/update/`,
    ClientDelete: (id: number) => `client/clients/delete/${id}/`,
    ClientUploadDocument: (id: number) => `client/clients/${id}/upload-document/`,
    ClientAdminNotes: (id: number) => `client/clients/${id}/admin-note/`,
    ClientAdminNoteCreate: (id: number) => `client/clients/${id}/admin-note/create/`,
    ClientPaymentList: 'client/clients/process-salary-payment/',
    ClientPaymentProcess: (id: number) => `client/clients/process-salary-payment/${id}/`,

    // Task API
    TaskCreate: 'tasks/create/',
    TaskList: 'tasks/tasks/',
    TaskDetail: (id: number) => `tasks/task_details/${id}/`,
    TaskUpdate: (id: number) => `tasks/update-task/${id}/`,
    TaskDelete: (id: number) => `tasks/task/${id}/delete/`,
    TaskStatusUpdate: (id: number) => `tasks/create/${id}/status/`,
    TaskStats: 'tasks/stats/',
    MyTasks: 'tasks/my-tasks/',
    TasksCreatedByMe: 'tasks/created-by-me/',

    // Auth/Employee API
    EmployeeList: 'auth/employees/',


    // Calendar/Events API
    EventCreate: 'event/event_create/',
    EventList: 'event/events/',
    EventDetail: (id: number) => `event/events/${id}/`,
    EventUpdate: (id: number) => `event/events/${id}/update/`,
    EventDelete: (id: number) => `event/events/${id}/delete/`,
    EventStatusUpdate: (id: number) => `event/events/${id}/status/`,
    EventStats: 'event/events/stats/',
    MyEvents: 'event/events/my-events/',
    EventsCreatedByMe: 'event/events/created-by-me/',
    EmployeeEvents: (employeeId: number) => `event/events/employee/${employeeId}/`,
    CalendarEvents: 'event/events/calendar/',

    // Leave Management API
    LeaveList: 'auth/leaves/',
    LeaveCreate: 'auth/leaves/create/',
    LeaveDetail: (id: number | string) => `auth/leaves/${id}/`,
};
