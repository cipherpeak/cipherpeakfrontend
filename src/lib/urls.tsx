export const requests = {
    // Client API
    ClientCreate: 'client/create/',
    ClientList: 'client/clients/',
    ClientDetail: (id: number) => `client/clients/details/${id}/`,
    ClientUpdate: (id: number) => `client/clients/${id}/update/`,
    ClientDelete: (id: number) => `client/clients/delete/${id}/`,
    ClientUploadDocument: (id: number) => `client/clients/${id}/upload-document/`,
    ClientDocumentDelete: (id: number) => `client/client-documents/${id}/delete/`,
    ClientDocumentDownload: (id: number) => `client/client-documents/${id}/download/`,
    ClientAdminNotes: (id: number) => `client/clients/${id}/admin-note/`,
    ClientAdminNoteCreate: (id: number) => `client/clients/${id}/admin-note/create/`,
    ClientPaymentList: (id: number) => `client/clients/${id}/payment-history/`,
    ProcessClientPayment: (id: number) => `client/clients/${id}/process-payment/`,
    ClientPaymentDetail: (id: number) => `client/clients/${id}/payment-detail/`,

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
    Logout: 'auth/logout/',
    EmployeeList: 'auth/employees/',
    EmployeeDocumentUpload: (id: number) => `auth/employees/upload_document/${id}/`,
    EmployeeMediaUpload: (id: number) => `auth/employees/upload_media/${id}/`,
    EmployeeDocumentDelete: (id: number) => `auth/employees/document/${id}/delete/`,
    EmployeeMediaDelete: (id: number) => `auth/employees/media/${id}/delete/`,


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
    LeaveProcess: (id: number | string) => `auth/leaves/${id}/process/`,

    // Salary Payment API
    SalaryPaymentList: 'auth/salary-payment-history/',
    ProcessSalaryPayment: (id: number) => `auth/process-salary-payment/${id}/`,
    PaymentDetail: (id: number) => `auth/payments/${id}/`,
};
