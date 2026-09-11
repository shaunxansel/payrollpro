// ======================================================
// PAYROLLPRO - MAIN JAVASCRIPT
// ======================================================

const API_BASE_URL = "/api";

// ======================================================
// BACKEND FUNCTIONS
// ======================================================

async function fetchEmployees() {
    try {
        const response = await fetch(`${API_BASE_URL}/employees`);

        if (!response.ok) {
            throw new Error("Failed to fetch employees.");
        }

        const employees = await response.json();

        localStorage.setItem(
            "employees",
            JSON.stringify(employees)
        );

        return Array.isArray(employees) ? employees : [];

    } catch (error) {
        console.error("Backend error:", error);

        try {
            const saved =
                JSON.parse(
                    localStorage.getItem("employees") || "[]"
                );

            return Array.isArray(saved) ? saved : [];

        } catch {
            return [];
        }
    }
}


async function fetchEmployee(id) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/employees/${encodeURIComponent(id)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Employee not found."
            );
        }

        return data;

    } catch (error) {
        console.error(error);
        alert(error.message);
        return null;
    }
}


async function createEmployeeInBackend(employee) {
    const response = await fetch(
        `${API_BASE_URL}/employees`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(employee)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to add employee."
        );
    }

    return data;
}


async function updateEmployeeInBackend(id, employee) {
    const response = await fetch(
        `${API_BASE_URL}/employees/${encodeURIComponent(id)}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(employee)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to update employee."
        );
    }

    return data;
}


async function deleteEmployeeFromBackend(id) {
    const response = await fetch(
        `${API_BASE_URL}/employees/${encodeURIComponent(id)}`,
        {
            method: "DELETE"
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to delete employee."
        );
    }

    return data;
}


// ======================================================
// SALARY CALCULATION
// ======================================================

function calculateSalary(employee) {

    if (!employee) {
        return 0;
    }

    if (employee.type === "Part-Time") {

        return (
            Number(employee.hoursWorked) *
            Number(employee.ratePerHour)
        ) || 0;
    }

    const basic =
        Number(employee.basicSalary) || 0;

    const hra =
        Number(employee.hra) || 0;

    const da =
        Number(employee.da) || 0;

    const pf =
        Number(employee.pf) || 0;

    return basic + hra + da - pf;
}


// ======================================================
// INSTALL APP
// ======================================================

let deferredInstallPrompt = null;

window.installPayrollPro = async function () {

    if (!deferredInstallPrompt) {
        alert(
            "PayrollPro is not currently ready for installation."
        );
        return;
    }

    deferredInstallPrompt.prompt();

    try {
        await deferredInstallPrompt.userChoice;
    } catch (error) {
        console.error(error);
    }

    deferredInstallPrompt = null;
};


window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();

        deferredInstallPrompt = event;

        const button =
            document.getElementById("installAppBtn");

        if (button) {
            button.style.display = "inline-block";
            button.disabled = false;
            button.textContent = "Install App";
        }
    }
);


window.addEventListener(
    "appinstalled",
    () => {

        const button =
            document.getElementById("installAppBtn");

        if (button) {
            button.textContent = "Installed";
            button.disabled = true;
        }

        deferredInstallPrompt = null;
    }
);


// ======================================================
// MAIN APPLICATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
         * IMPORTANT:
         * Get the latest data from SQLite first.
         * This prevents the old localStorage data
         * from replacing the database data.
         */
        await fetchEmployees();


        // ==================================================
        // ELEMENT REFERENCES
        // ==================================================

        const form =
            document.getElementById("addEmployeeForm");

        const empTypeSelect =
            document.getElementById("empType");

        const fullTimeFields =
            document.getElementById("fullTimeFields");

        const partTimeFields =
            document.getElementById("partTimeFields");

        const employeeTable =
            document.getElementById("employeeTable");

        const searchEmployee =
            document.getElementById("searchEmployee");

        const payrollTable =
            document.getElementById("payrollTable");

        const payrollSearch =
            document.getElementById("payrollSearch");

        const payrollTypeFilter =
            document.getElementById("payrollTypeFilter");


        // ==================================================
        // GET EMPLOYEES FROM LOCAL CACHE
        // ==================================================

        function getEmployees() {

            try {

                const employees =
                    JSON.parse(
                        localStorage.getItem(
                            "employees"
                        ) || "[]"
                    );

                return Array.isArray(employees)
                    ? employees
                    : [];

            } catch {
                return [];
            }
        }


        // ==================================================
        // EMPLOYEE TYPE
        // ==================================================

        function updateEmployeeTypeFields() {

            if (!empTypeSelect) {
                return;
            }

            const type =
                empTypeSelect.value;

            if (fullTimeFields) {

                fullTimeFields.style.display =
                    type === "Full-Time"
                        ? ""
                        : "none";
            }

            if (partTimeFields) {

                partTimeFields.style.display =
                    type === "Part-Time"
                        ? ""
                        : "none";
            }
        }


        if (empTypeSelect) {

            empTypeSelect.addEventListener(
                "change",
                updateEmployeeTypeFields
            );

            updateEmployeeTypeFields();
        }


        // ==================================================
        // ADD / EDIT EMPLOYEE FORM
        // ==================================================

        if (form) {

            let editEmployeeData = null;

            try {

                editEmployeeData =
                    JSON.parse(
                        localStorage.getItem(
                            "editEmployee"
                        )
                    );

            } catch {
                editEmployeeData = null;
            }


            // ----------------------------------------------
            // LOAD EDIT DATA
            // ----------------------------------------------

            if (editEmployeeData) {

                const setValue =
                    (id, value) => {

                        const element =
                            document.getElementById(id);

                        if (element) {
                            element.value =
                                value ?? "";
                        }
                    };


                setValue(
                    "empId",
                    editEmployeeData.id
                );

                setValue(
                    "empName",
                    editEmployeeData.name
                );

                setValue(
                    "empEmail",
                    editEmployeeData.email
                );

                setValue(
                    "empPhone",
                    editEmployeeData.phone
                );

                setValue(
                    "empDepartment",
                    editEmployeeData.department
                );

                setValue(
                    "empDesignation",
                    editEmployeeData.designation
                );

                setValue(
                    "empType",
                    editEmployeeData.type
                );

                setValue(
                    "basicSalary",
                    editEmployeeData.basicSalary
                );

                setValue(
                    "hra",
                    editEmployeeData.hra
                );

                setValue(
                    "da",
                    editEmployeeData.da
                );

                setValue(
                    "pf",
                    editEmployeeData.pf
                );

                setValue(
                    "hoursWorked",
                    editEmployeeData.hoursWorked
                );

                setValue(
                    "ratePerHour",
                    editEmployeeData.ratePerHour
                );


                updateEmployeeTypeFields();
            }


            // ----------------------------------------------
            // FORM SUBMIT
            // ----------------------------------------------

            form.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();


                    const getValue =
                        id => {

                            const element =
                                document.getElementById(id);

                            return element
                                ? element.value.trim()
                                : "";
                        };


                    const id =
                        getValue("empId");

                    const name =
                        getValue("empName");

                    const email =
                        getValue("empEmail");

                    const phone =
                        getValue("empPhone");

                    const department =
                        getValue("empDepartment");

                    const designation =
                        getValue("empDesignation");

                    const type =
                        getValue("empType");


                    // --------------------------------------
                    // VALIDATION
                    // --------------------------------------

                    if (
                        !id ||
                        !name ||
                        !email ||
                        !phone ||
                        !department ||
                        !designation
                    ) {

                        alert(
                            "Please fill in all required fields."
                        );

                        return;
                    }


                    if (!/^\d{10}$/.test(phone)) {

                        alert(
                            "Phone number must be exactly 10 digits."
                        );

                        return;
                    }


                    const basicSalary =
                        Number(
                            getValue("basicSalary")
                        ) || 0;

                    const hraInput =
                        Number(
                            getValue("hra")
                        ) || 0;

                    const daInput =
                        Number(
                            getValue("da")
                        ) || 0;

                    const pfInput =
                        Number(
                            getValue("pf")
                        ) || 0;


                    let hra = 0;
                    let da = 0;
                    let pf = 0;


                    if (type === "Full-Time") {

                        const hraType =
                            getValue("hraType");

                        const daType =
                            getValue("daType");

                        const pfType =
                            getValue("pfType");


                        hra =
                            hraType === "percentage"
                                ? basicSalary * hraInput / 100
                                : hraInput;


                        da =
                            daType === "percentage"
                                ? basicSalary * daInput / 100
                                : daInput;


                        pf =
                            pfType === "percentage"
                                ? basicSalary * pfInput / 100
                                : pfInput;
                    }


                    const hoursWorked =
                        Number(
                            getValue("hoursWorked")
                        ) || 0;

                    const ratePerHour =
                        Number(
                            getValue("ratePerHour")
                        ) || 0;


                    if (
                        type === "Full-Time" &&
                        basicSalary <= 0
                    ) {

                        alert(
                            "Please enter a valid Basic Salary."
                        );

                        return;
                    }


                    if (
                        type === "Part-Time" &&
                        (
                            hoursWorked <= 0 ||
                            ratePerHour <= 0
                        )
                    ) {

                        alert(
                            "Please enter valid Hours Worked and Rate Per Hour."
                        );

                        return;
                    }


                    const employee = {

                        id,
                        name,
                        email,
                        phone,
                        department,
                        designation,
                        type,
                        basicSalary,
                        hra,
                        da,
                        pf,
                        hoursWorked,
                        ratePerHour

                    };


                    // --------------------------------------
                    // EDIT
                    // --------------------------------------

                    if (editEmployeeData) {

                        const oldId =
                            String(
                                editEmployeeData.id
                            );


                        if (
                            id.toLowerCase() !==
                            oldId.toLowerCase()
                        ) {

                            alert(
                                "Employee ID cannot be changed while editing."
                            );

                            return;
                        }


                        try {

                            await updateEmployeeInBackend(
                                oldId,
                                employee
                            );


                            localStorage.removeItem(
                                "editEmployee"
                            );


                            await fetchEmployees();


                            alert(
                                "Employee updated successfully!"
                            );


                            window.location.href =
                                "employees.html";


                        } catch (error) {

                            console.error(error);

                            alert(error.message);
                        }


                        return;
                    }


                    // --------------------------------------
                    // ADD
                    // --------------------------------------

                    try {

                        await createEmployeeInBackend(
                            employee
                        );


                        await fetchEmployees();


                        alert(
                            "Employee added successfully!"
                        );


                        window.location.href =
                            "employees.html";


                    } catch (error) {

                        console.error(error);

                        alert(error.message);
                    }
                }
            );
        }


        // ==================================================
        // EMPLOYEE TABLE
        // ==================================================

        async function loadEmployees() {

            if (!employeeTable) {
                return;
            }


            const employees =
                await fetchEmployees();


            employees.sort(
                (a, b) =>
                    String(a.id).localeCompare(
                        String(b.id),
                        undefined,
                        {
                            numeric: true
                        }
                    )
            );


            employeeTable.innerHTML = "";


            employees.forEach(
                employee => {

                    const row =
                        document.createElement("tr");


                    row.innerHTML = `

                        <td>
                            ${employee.id}
                        </td>

                        <td>
                            ${employee.name}
                        </td>

                        <td>
                            ${employee.department}
                        </td>

                        <td>
                            ${employee.designation}
                        </td>

                        <td>
                            ${employee.type}
                        </td>

                        <td>
                            ₹${calculateSalary(
                                employee
                            ).toLocaleString("en-IN")}
                        </td>

                        <td>

                            <button
                                class="view-btn"
                                onclick="viewEmployee('${employee.id}')">
                                View
                            </button>

                            <button
                                class="edit-btn"
                                onclick="editEmployee('${employee.id}')">
                                Edit
                            </button>

                            <button
                                class="delete-btn"
                                onclick="deleteEmployee('${employee.id}')">
                                Delete
                            </button>

                        </td>
                    `;


                    employeeTable.appendChild(row);
                }
            );
        }


        // ==================================================
        // EDIT EMPLOYEE
        // ==================================================

        window.editEmployee =
            async function(id) {

                const employee =
                    await fetchEmployee(id);


                if (!employee) {
                    return;
                }


                localStorage.setItem(
                    "editEmployee",
                    JSON.stringify(employee)
                );


                window.location.href =
                    "add-employee.html?mode=edit";
            };


        // ==================================================
        // DELETE EMPLOYEE
        // ==================================================

        window.deleteEmployee =
            async function(id) {

                const employee =
                    await fetchEmployee(id);


                if (!employee) {
                    return;
                }


                const confirmed =
                    confirm(
                        `Are you sure you want to delete ${employee.name}?`
                    );


                if (!confirmed) {
                    return;
                }


                try {

                    await deleteEmployeeFromBackend(id);


                    localStorage.removeItem(
                        "viewEmployee"
                    );


                    await fetchEmployees();


                    alert(
                        "Employee deleted successfully!"
                    );


                    await loadEmployees();


                } catch (error) {

                    console.error(error);

                    alert(error.message);
                }
            };


        // ==================================================
        // VIEW EMPLOYEE
        // ==================================================

        window.viewEmployee =
            async function(id) {

                const employee =
                    await fetchEmployee(id);


                if (!employee) {
                    return;
                }


                localStorage.setItem(
                    "viewEmployee",
                    JSON.stringify(employee)
                );


                window.location.href =
                    "employee-details.html";
            };


        // ==================================================
        // EMPLOYEE SEARCH
        // ==================================================

        if (
            searchEmployee &&
            employeeTable
        ) {

            searchEmployee.addEventListener(
                "input",
                () => {

                    const searchText =
                        searchEmployee.value
                            .toLowerCase()
                            .trim();


                    const rows =
                        employeeTable.querySelectorAll(
                            "tr"
                        );


                    rows.forEach(
                        row => {

                            const rowText =
                                row.textContent
                                    .toLowerCase();


                            row.style.display =
                                rowText.includes(
                                    searchText
                                )
                                    ? ""
                                    : "none";
                        }
                    );
                }
            );
        }


        if (employeeTable) {
            await loadEmployees();
        }


        // ==================================================
        // EMPLOYEE DETAILS
        // ==================================================

        async function loadEmployeeDetails() {

            const detailName =
                document.getElementById(
                    "detailName"
                );


            if (!detailName) {
                return;
            }


            let employee = null;


            try {

                employee =
                    JSON.parse(
                        localStorage.getItem(
                            "viewEmployee"
                        )
                    );

            } catch {
                employee = null;
            }


            if (!employee) {

                detailName.textContent =
                    "Employee not found.";

                return;
            }


            const setDetail =
                (id, value) => {

                    const element =
                        document.getElementById(id);

                    if (element) {
                        element.textContent = value;
                    }
                };


            setDetail(
                "detailName",
                employee.name
            );

            setDetail(
                "detailId",
                employee.id
            );

            setDetail(
                "detailEmail",
                employee.email
            );

            setDetail(
                "detailPhone",
                employee.phone
            );

            setDetail(
                "detailDepartment",
                employee.department
            );

            setDetail(
                "detailDesignation",
                employee.designation
            );

            setDetail(
                "detailType",
                employee.type
            );

            setDetail(
                "detailBasicSalary",
                "₹" +
                Number(
                    employee.basicSalary
                ).toLocaleString("en-IN")
            );

            setDetail(
                "detailHra",
                "₹" +
                Number(
                    employee.hra
                ).toLocaleString("en-IN")
            );

            setDetail(
                "detailDa",
                "₹" +
                Number(
                    employee.da
                ).toLocaleString("en-IN")
            );

            setDetail(
                "detailPf",
                "₹" +
                Number(
                    employee.pf
                ).toLocaleString("en-IN")
            );

            setDetail(
                "detailNetSalary",
                "₹" +
                calculateSalary(employee)
                    .toLocaleString("en-IN")
            );


            const partTimeDetails =
                document.getElementById(
                    "partTimeDetails"
                );


            if (
                employee.type ===
                "Part-Time"
            ) {

                if (partTimeDetails) {
                    partTimeDetails.style.display =
                        "grid";
                }

                setDetail(
                    "detailHours",
                    employee.hoursWorked
                );

                setDetail(
                    "detailRate",
                    "₹" +
                    Number(
                        employee.ratePerHour
                    ).toLocaleString("en-IN")
                );

            } else {

                if (partTimeDetails) {
                    partTimeDetails.style.display =
                        "none";
                }
            }
        }


        await loadEmployeeDetails();


        // ==================================================
        // PAYROLL
        // ==================================================

        async function loadPayroll() {

            if (!payrollTable) {
                return;
            }


            const employees =
                await fetchEmployees();


            payrollTable.innerHTML = "";


            let totalPayroll = 0;
            let fullTimeCount = 0;
            let partTimeCount = 0;


            employees.forEach(
                employee => {

                    const salary =
                        calculateSalary(employee);


                    totalPayroll += salary;


                    if (
                        employee.type ===
                        "Full-Time"
                    ) {
                        fullTimeCount++;
                    }


                    if (
                        employee.type ===
                        "Part-Time"
                    ) {
                        partTimeCount++;
                    }


                    const row =
                        document.createElement("tr");


                    row.innerHTML = `

                        <td>${employee.id}</td>

                        <td>${employee.name}</td>

                        <td>${employee.type}</td>

                        <td>
                            ₹${Number(
                                employee.basicSalary
                            ).toLocaleString("en-IN")}
                        </td>

                        <td>
                            ₹${Number(
                                employee.hra
                            ).toLocaleString("en-IN")}
                        </td>

                        <td>
                            ₹${Number(
                                employee.da
                            ).toLocaleString("en-IN")}
                        </td>

                        <td>
                            ₹${Number(
                                employee.pf
                            ).toLocaleString("en-IN")}
                        </td>

                        <td>
                            ₹${salary.toLocaleString("en-IN")}
                        </td>

                        <td>

                            <button
                                class="payslip-btn"
                                onclick="generatePayslip('${employee.id}')">
                                Payslip
                            </button>

                        </td>

                    `;


                    payrollTable.appendChild(row);
                }
            );


            const totalPayrollElement =
                document.getElementById(
                    "totalPayroll"
                );

            const payrollEmployees =
                document.getElementById(
                    "payrollEmployees"
                );

            const payrollFullTime =
                document.getElementById(
                    "payrollFullTime"
                );

            const payrollPartTime =
                document.getElementById(
                    "payrollPartTime"
                );


            if (totalPayrollElement) {

                totalPayrollElement.textContent =
                    "₹" +
                    totalPayroll.toLocaleString(
                        "en-IN"
                    );
            }


            if (payrollEmployees) {
                payrollEmployees.textContent =
                    employees.length;
            }


            if (payrollFullTime) {
                payrollFullTime.textContent =
                    fullTimeCount;
            }


            if (payrollPartTime) {
                payrollPartTime.textContent =
                    partTimeCount;
            }
        }


        if (payrollTable) {
            await loadPayroll();
        }


        // ==================================================
        // PAYROLL SEARCH / FILTER
        // ==================================================

        function filterPayroll() {

            if (!payrollTable) {
                return;
            }


            const searchText =
                payrollSearch
                    ? payrollSearch.value
                        .toLowerCase()
                        .trim()
                    : "";


            const selectedType =
                payrollTypeFilter
                    ? payrollTypeFilter.value
                    : "All";


            const rows =
                payrollTable.querySelectorAll("tr");


            rows.forEach(
                row => {

                    const rowText =
                        row.textContent
                            .toLowerCase();


                    const type =
                        row.children[2]
                            ? row.children[2]
                                .textContent
                                .trim()
                            : "";


                    const matchesSearch =
                        rowText.includes(
                            searchText
                        );


                    const matchesType =
                        selectedType === "All" ||
                        type === selectedType;


                    row.style.display =
                        matchesSearch &&
                        matchesType
                            ? ""
                            : "none";
                }
            );
        }


        if (payrollSearch) {

            payrollSearch.addEventListener(
                "input",
                filterPayroll
            );
        }


        if (payrollTypeFilter) {

            payrollTypeFilter.addEventListener(
                "change",
                filterPayroll
            );
        }


        // ==================================================
        // PAYSLIP
        // ==================================================

        window.generatePayslip =
            async function(id) {

                const employee =
                    await fetchEmployee(id);


                if (!employee) {
                    return;
                }


                const salary =
                    calculateSalary(employee);


                const grossSalary =
                    employee.type === "Full-Time"

                        ? Number(employee.basicSalary) +
                          Number(employee.hra) +
                          Number(employee.da)

                        : salary;


                const pf =
                    employee.type === "Full-Time"
                        ? Number(employee.pf)
                        : 0;


                const payslipWindow =
                    window.open(
                        "",
                        "_blank",
                        "width=850,height=700"
                    );


                if (!payslipWindow) {

                    alert(
                        "Please allow pop-ups to generate the payslip."
                    );

                    return;
                }


                payslipWindow.document.write(`

                    <!DOCTYPE html>

                    <html>

                    <head>

                        <title>
                            Payslip - ${employee.name}
                        </title>

                        <style>

                            * {
                                box-sizing: border-box;
                            }

                            body {
                                margin: 0;
                                padding: 40px;
                                font-family: Arial, sans-serif;
                                background: #f4f7fa;
                                color: #102b48;
                            }

                            .payslip {
                                max-width: 760px;
                                margin: auto;
                                background: white;
                                padding: 35px;
                                border-radius: 12px;
                                box-shadow:
                                    0 8px 30px
                                    rgba(0,0,0,0.08);
                            }

                            .header {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                border-bottom:
                                    3px solid #ffd21f;
                                padding-bottom: 20px;
                                margin-bottom: 25px;
                            }

                            .company {
                                font-size: 28px;
                                font-weight: bold;
                            }

                            .title {
                                font-size: 22px;
                                font-weight: bold;
                            }

                            .employee-info {
                                display: grid;
                                grid-template-columns:
                                    1fr 1fr;
                                gap: 14px;
                                margin-bottom: 30px;
                            }

                            .info-box {
                                background: #f4f7fa;
                                padding: 12px 15px;
                                border-radius: 7px;
                            }

                            .label {
                                font-size: 12px;
                                color: #718096;
                                margin-bottom: 4px;
                            }

                            .value {
                                font-weight: bold;
                            }

                            table {
                                width: 100%;
                                border-collapse:
                                    collapse;
                                margin-top: 15px;
                            }

                            th,
                            td {
                                padding: 13px;
                                border-bottom:
                                    1px solid #e1e7ed;
                                text-align: left;
                            }

                            th {
                                background: #f4f7fa;
                            }

                            .amount {
                                text-align: right;
                            }

                            .net {
                                font-size: 18px;
                                font-weight: bold;
                            }

                            .footer {
                                margin-top: 30px;
                                text-align: center;
                            }

                            .print-btn {
                                border: none;
                                padding: 12px 20px;
                                background: #ffd21f;
                                cursor: pointer;
                                border-radius: 7px;
                                font-weight: bold;
                            }

                            @media print {

                                .print-btn {
                                    display: none;
                                }

                                body {
                                    background: white;
                                    padding: 0;
                                }

                                .payslip {
                                    box-shadow: none;
                                }
                            }

                        </style>

                    </head>

                    <body>

                        <div class="payslip">

                            <div class="header">

                                <div class="company">
                                    PayrollPro
                                </div>

                                <div class="title">
                                    PAYSLIP
                                </div>

                            </div>


                            <div class="employee-info">

                                <div class="info-box">
                                    <div class="label">
                                        Employee ID
                                    </div>
                                    <div class="value">
                                        ${employee.id}
                                    </div>
                                </div>

                                <div class="info-box">
                                    <div class="label">
                                        Employee Name
                                    </div>
                                    <div class="value">
                                        ${employee.name}
                                    </div>
                                </div>

                                <div class="info-box">
                                    <div class="label">
                                        Department
                                    </div>
                                    <div class="value">
                                        ${employee.department}
                                    </div>
                                </div>

                                <div class="info-box">
                                    <div class="label">
                                        Designation
                                    </div>
                                    <div class="value">
                                        ${employee.designation}
                                    </div>
                                </div>

                            </div>


                            <table>

                                <thead>

                                    <tr>
                                        <th>
                                            Description
                                        </th>

                                        <th class="amount">
                                            Amount
                                        </th>
                                    </tr>

                                </thead>


                                <tbody>

                                    ${
                                        employee.type ===
                                        "Full-Time"

                                        ? `

                                            <tr>
                                                <td>
                                                    Basic Salary
                                                </td>

                                                <td class="amount">
                                                    ₹${Number(
                                                        employee.basicSalary
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    HRA
                                                </td>

                                                <td class="amount">
                                                    ₹${Number(
                                                        employee.hra
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    DA
                                                </td>

                                                <td class="amount">
                                                    ₹${Number(
                                                        employee.da
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    Gross Salary
                                                </td>

                                                <td class="amount">
                                                    ₹${grossSalary.toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    PF Deduction
                                                </td>

                                                <td class="amount">
                                                    - ₹${pf.toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </td>
                                            </tr>

                                        `

                                        : `

                                            <tr>
                                                <td>
                                                    Hours Worked
                                                </td>

                                                <td class="amount">
                                                    ${employee.hoursWorked}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    Rate Per Hour
                                                </td>

                                                <td class="amount">
                                                    ₹${Number(
                                                        employee.ratePerHour
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    Total Earnings
                                                </td>

                                                <td class="amount">
                                                    ₹${salary.toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </td>
                                            </tr>

                                        `
                                    }


                                    <tr class="net">

                                        <td>
                                            Net Salary
                                        </td>

                                        <td class="amount">
                                            ₹${salary.toLocaleString(
                                                "en-IN"
                                            )}
                                        </td>

                                    </tr>

                                </tbody>

                            </table>


                            <div class="footer">

                                <p>
                                    This is a computer-generated payslip.
                                </p>

                                <button
                                    class="print-btn"
                                    onclick="window.print()">
                                    Print Payslip
                                </button>

                            </div>

                        </div>

                    </body>

                    </html>

                `);


                payslipWindow.document.close();
            };


        // ==================================================
        // DASHBOARD
        // ==================================================

        async function loadDashboard() {

            const totalElement =
                document.getElementById(
                    "dashboardTotalEmployees"
                );


            if (!totalElement) {
                return;
            }


            const employees =
                await fetchEmployees();


            let totalPayroll = 0;
            let fullTime = 0;
            let partTime = 0;


            employees.forEach(
                employee => {

                    totalPayroll +=
                        calculateSalary(employee);


                    if (
                        employee.type ===
                        "Full-Time"
                    ) {
                        fullTime++;
                    }


                    if (
                        employee.type ===
                        "Part-Time"
                    ) {
                        partTime++;
                    }
                }
            );


            totalElement.textContent =
                employees.length;


            const payrollElement =
                document.getElementById(
                    "dashboardPayroll"
                );

            const fullTimeElement =
                document.getElementById(
                    "dashboardFullTime"
                );

            const partTimeElement =
                document.getElementById(
                    "dashboardPartTime"
                );


            if (payrollElement) {

                payrollElement.textContent =
                    "₹" +
                    totalPayroll.toLocaleString(
                        "en-IN"
                    );
            }


            if (fullTimeElement) {
                fullTimeElement.textContent =
                    fullTime;
            }


            if (partTimeElement) {
                partTimeElement.textContent =
                    partTime;
            }
        }


        async function loadDashboardEmployeeTable() {

            const table =
                document.getElementById(
                    "dashboardEmployeeTable"
                );


            if (!table) {
                return;
            }


            const employees =
                await fetchEmployees();


            table.innerHTML = "";


            employees
                .sort(
                    (a, b) =>
                        String(a.id).localeCompare(
                            String(b.id),
                            undefined,
                            {
                                numeric: true
                            }
                        )
                )
                .slice(0, 5)
                .forEach(
                    employee => {

                        const row =
                            document.createElement(
                                "tr"
                            );


                        row.innerHTML = `

                            <td>
                                ${employee.id}
                            </td>

                            <td>
                                ${employee.name}
                            </td>

                            <td>
                                ${employee.department}
                            </td>

                            <td>
                                ₹${calculateSalary(
                                    employee
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </td>

                        `;


                        table.appendChild(row);
                    }
                );
        }


        if (
            document.getElementById(
                "dashboardTotalEmployees"
            )
        ) {

            await loadDashboard();

            await loadDashboardEmployeeTable();
        }


        // ==================================================
        // REPORTS
        // ==================================================

        async function loadReports() {

            const reportEmployees =
                document.getElementById(
                    "reportEmployees"
                );


            if (!reportEmployees) {
                return;
            }


            const employees =
                await fetchEmployees();


            let totalPayroll = 0;
            let highestSalary = 0;
            let highestEmployee = null;
            let fullTime = 0;
            let partTime = 0;


            employees.forEach(
                employee => {

                    const salary =
                        calculateSalary(employee);


                    totalPayroll += salary;


                    if (
                        salary >
                        highestSalary
                    ) {

                        highestSalary =
                            salary;

                        highestEmployee =
                            employee;
                    }


                    if (
                        employee.type ===
                        "Full-Time"
                    ) {
                        fullTime++;
                    }


                    if (
                        employee.type ===
                        "Part-Time"
                    ) {
                        partTime++;
                    }
                }
            );


            const averageSalary =
                employees.length
                    ? totalPayroll / employees.length
                    : 0;


            reportEmployees.textContent =
                employees.length;


            const reportPayroll =
                document.getElementById(
                    "reportPayroll"
                );

            const reportAverage =
                document.getElementById(
                    "reportAverage"
                );

            const reportHighest =
                document.getElementById(
                    "reportHighest"
                );

            const reportFullTime =
                document.getElementById(
                    "reportFullTime"
                );

            const reportPartTime =
                document.getElementById(
                    "reportPartTime"
                );


            if (reportPayroll) {

                reportPayroll.textContent =
                    "₹" +
                    totalPayroll.toLocaleString(
                        "en-IN"
                    );
            }


            if (reportAverage) {

                reportAverage.textContent =
                    "₹" +
                    Math.round(
                        averageSalary
                    ).toLocaleString(
                        "en-IN"
                    );
            }


            if (reportHighest) {

                reportHighest.textContent =
                    "₹" +
                    highestSalary.toLocaleString(
                        "en-IN"
                    );
            }


            if (reportFullTime) {
                reportFullTime.textContent =
                    fullTime;
            }


            if (reportPartTime) {
                reportPartTime.textContent =
                    partTime;
            }


            // ----------------------------------------------
            // DEPARTMENT REPORT
            // ----------------------------------------------

            const departmentReport =
                document.getElementById(
                    "departmentReport"
                );


            if (departmentReport) {

                departmentReport.innerHTML =
                    "";


                const departments = {};


                employees.forEach(
                    employee => {

                        const department =
                            employee.department ||
                            "Other";


                        if (
                            !departments[
                                department
                            ]
                        ) {

                            departments[
                                department
                            ] = {
                                employees: 0,
                                payroll: 0
                            };
                        }


                        departments[
                            department
                        ].employees++;


                        departments[
                            department
                        ].payroll +=
                            calculateSalary(
                                employee
                            );
                    }
                );


                Object.keys(
                    departments
                )
                .sort()
                .forEach(
                    department => {

                        const row =
                            document.createElement(
                                "tr"
                            );


                        row.innerHTML = `

                            <td>
                                ${department}
                            </td>

                            <td>
                                ${departments[
                                    department
                                ].employees}
                            </td>

                            <td>
                                ₹${departments[
                                    department
                                ].payroll.toLocaleString(
                                    "en-IN"
                                )}
                            </td>

                        `;


                        departmentReport.appendChild(
                            row
                        );
                    }
                );
            }


            // ----------------------------------------------
            // HIGHEST PAID EMPLOYEE
            // ----------------------------------------------

            const highestEmployeeElement =
                document.getElementById(
                    "highestEmployee"
                );


            if (highestEmployeeElement) {

                if (highestEmployee) {

                    highestEmployeeElement.innerHTML = `

                        <h3>
                            ${highestEmployee.name}
                        </h3>

                        <p>
                            <strong>
                                Employee ID:
                            </strong>
                            ${highestEmployee.id}
                        </p>

                        <p>
                            <strong>
                                Department:
                            </strong>
                            ${highestEmployee.department}
                        </p>

                        <p>
                            <strong>
                                Designation:
                            </strong>
                            ${highestEmployee.designation}
                        </p>

                        <p>
                            <strong>
                                Employee Type:
                            </strong>
                            ${highestEmployee.type}
                        </p>

                        <p>
                            <strong>
                                Net Salary:
                            </strong>
                            ₹${highestSalary.toLocaleString(
                                "en-IN"
                            )}
                        </p>

                    `;

                } else {

                    highestEmployeeElement.innerHTML =
                        "<p>No employees found.</p>";
                }
            }
        }


        if (
            document.getElementById(
                "reportEmployees"
            )
        ) {

            await loadReports();
        }


        // ==================================================
        // APPEARANCE SETTINGS
        // ==================================================

        function applyAppearance() {

            const color =
                localStorage.getItem(
                    "payrollpro_color"
                ) || "yellow";


            const theme =
                localStorage.getItem(
                    "payrollpro_theme"
                ) || "dark";


            document.body.dataset.color =
                color;

            document.body.dataset.theme =
                theme;
        }


        applyAppearance();


        const colorScheme =
            document.getElementById(
                "colorScheme"
            );

        const themeMode =
            document.getElementById(
                "themeMode"
            );


        if (colorScheme) {

            colorScheme.value =
                localStorage.getItem(
                    "payrollpro_color"
                ) || "yellow";


            colorScheme.addEventListener(
                "change",
                () => {

                    localStorage.setItem(
                        "payrollpro_color",
                        colorScheme.value
                    );

                    applyAppearance();
                }
            );
        }


        if (themeMode) {

            themeMode.value =
                localStorage.getItem(
                    "payrollpro_theme"
                ) || "dark";


            themeMode.addEventListener(
                "change",
                () => {

                    localStorage.setItem(
                        "payrollpro_theme",
                        themeMode.value
                    );

                    applyAppearance();
                }
            );
        }

    }
);