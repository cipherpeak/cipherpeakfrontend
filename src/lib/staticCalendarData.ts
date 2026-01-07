// Static calendar events data
export const STATIC_CALENDAR_EVENTS = [
    {
        id: 1,
        title: "TechCorp Payment Due",
        date: "2026-02-05",
        type: "payment",
        client: "TechCorp Solutions",
        amount: 5000,
        status: "upcoming",
    },
    {
        id: 2,
        title: "Social Media Strategy",
        date: "2026-01-10",
        type: "task",
        assignee: "Jane Smith",
        priority: "high",
        status: "in_progress",
    },
    {
        id: 3,
        title: "Client Meeting",
        date: "2026-01-12",
        type: "event",
        client: "Creative Agency",
        location: "Conference Room A",
        status: "scheduled",
    },
];

// Static finance data
export const STATIC_FINANCE_DATA = {
    stats: {
        total_income: 125000,
        total_expenses: 45000,
        net_profit: 80000,
        growth: 15.5,
    },
    incomes: [
        {
            id: 1,
            amount: 5000,
            category: "Retainer",
            date: "2026-01-05",
            client: "TechCorp Solutions",
            description: "Monthly retainer payment",
            payment_method: "Bank Transfer",
        },
        {
            id: 2,
            amount: 3500,
            category: "Project",
            date: "2026-01-03",
            client: "Global Retail",
            description: "Website redesign project",
            payment_method: "Check",
        },
    ],
    expenses: [
        {
            id: 1,
            amount: 1200,
            category: "Software",
            date: "2026-01-02",
            description: "Adobe Creative Cloud subscription",
            vendor: "Adobe",
        },
        {
            id: 2,
            amount: 2500,
            category: "Salary",
            date: "2026-01-01",
            description: "Employee salaries",
            vendor: "Payroll",
        },
    ],
    categories: {
        income: ["Retainer", "Project", "Consulting", "Maintenance"],
        expense: ["Software", "Rent", "Salary", "Marketing", "Utilities"],
    },
};
