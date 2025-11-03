import { backendUrl } from "../components/Constants/Constants"


const requests = {
    LoginUser :`${backendUrl}/auth/login/`,
    FetchEmployees :`${backendUrl}/auth/employees/`,
    CreateEmployees :`${backendUrl}/auth/employees/create/`,
    UpdateEmployees :`${backendUrl}/auth/employees/`,

    FetchClients :`${backendUrl}/client/create/`,
    CreateClient :`${backendUrl}/client/create/`,
    UpdateClient :`${backendUrl}/client/create/`,
    EarlyPaid:`${backendUrl}/client/earlypaid/`,

    // Add tasks endpoints
    FetchTasks: `${backendUrl}/tasks/create/`,
    CreateTask: `${backendUrl}/tasks/create/`,
    UpdateTask: `${backendUrl}/tasks/create/`,


    FetchEvents: `${backendUrl}/event/events/`,
    CreateEvent: `${backendUrl}/event/events/`,

    FetchIncomes: `${backendUrl}/finance/incomes/`,
    CreateIncome: `${backendUrl}/finance/incomes/`,
    UpdateIncome: `${backendUrl}/finance/incomes/`,
    DeleteIncome: `${backendUrl}/finance/incomes/`,
    
    FetchExpenses: `${backendUrl}/finance/expenses/`,
    CreateExpense: `${backendUrl}/finance/expenses/`,
    UpdateExpense: `${backendUrl}/finance/expenses/`,
    DeleteExpense: `${backendUrl}/finance/expenses/`,
    
    FetchIncomeCategories:`${backendUrl}/finance/income-categories/`,
    FetchExpenseCategories: `${backendUrl}/finance/expense-categories/`,
    
    FinanceStats: `${backendUrl}/finance/stats/`,
    RecentTransactions: `${backendUrl}/finance/recent-transactions/`,
    GenerateSummary: `${backendUrl}/finance/generate-summary/`,
    ExportData:`${backendUrl}/finance/export-data/`,
        
}
export default requests 