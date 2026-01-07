export const requests = {
    // Client API
    ClientCreate: 'client/create/',
    ClientList: 'client/clients/',
    ClientDetail: (id: number) => `client/clients/details/${id}/`,
    ClientUpdate: (id: number) => `client/clients/${id}/update/`,
    ClientDelete: (id: number) => `client/clients/delete/${id}/`,
    ClientUploadDocument: (id: number) => `client/clients/${id}/upload-document/`,

    // Task API
    TaskCreate: 'tasks/create/',
    TaskList: 'tasks/tasks/',
    TaskDetail: (id: number) => `tasks/task_details/${id}/`,
    TaskUpdate: (id: number) => `tasks/update-task/${id}/`,
    TaskDelete: (id: number) => `tasks/task/${id}/delete/`,

    // Auth/Employee API
    EmployeeList: 'auth/employees/',
};
