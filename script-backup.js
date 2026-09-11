// ======================================================
// PAYROLLPRO - MAIN JAVASCRIPT
// ======================================================

// ======================================================
// PWA INSTALL PROMPT
// ======================================================

let deferredInstallPrompt = null;

// Keep this function GLOBAL so onclick="installPayrollPro()"
// in settings.html can always find it.
window.installPayrollPro = async function () {

    if (!deferredInstallPrompt) {

        alert(
            "PayrollPro is not currently ready for installation. " +
            "Make sure you are using Chrome or Edge and opened " +
            "PayrollPro through Live Server."
        );

        return;
    }

    deferredInstallPrompt.prompt();

    try {

        const result =
            await deferredInstallPrompt.userChoice;

        if (result.outcome === "accepted") {

            console.log(
                "PayrollPro installation accepted."
            );

        } else {

            console.log(
                "PayrollPro installation dismissed."
            );
        }

    } catch (error) {

        console.error(
            "Installation error:",
            error
        );
    }

    deferredInstallPrompt = null;
};


window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();

        deferredInstallPrompt = event;

        const installButton =
            document.getElementById("installAppBtn");

        if (installButton) {

            installButton.style.display =
                "inline-block";

            installButton.disabled = false;

            installButton.textContent =
                "Install App";
        }
    }
);


window.addEventListener(
    "appinstalled",
    () => {

        const installButton =
            document.getElementById("installAppBtn");

        if (installButton) {

            installButton.textContent =
                "Installed";

            installButton.disabled = true;
        }

        deferredInstallPrompt = null;

        console.log(
            "PayrollPro installed successfully."
        );
    }
);


// ======================================================
// SERVICE WORKER
// ======================================================

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register("./service-worker.js")

                .then(
                    registration => {

                        console.log(
                            "PayrollPro service worker registered.",
                            registration
                        );
                    }
                )

                .catch(
                    error => {

                        console.error(
                            "Service worker registration failed:",
                            error
                        );
                    }
                );
        }
    );
}


// ======================================================
// MAIN APPLICATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // ==================================================
        // ELEMENT REFERENCES
        // ==================================================

        const form =
            document.getElementById(
                "addEmployeeForm"
            );

        const empTypeSelect =
            document.getElementById(
                "empType"
            );

        const fullTimeFields =
            document.getElementById(
                "fullTimeFields"
            );

        const partTimeFields =
            document.getElementById(
                "partTimeFields"
            );

        const employeeTable =
            document.getElementById(
                "employeeTable"
            );

        const searchEmployee =
            document.getElementById(
                "searchEmployee"
            );


        // ==================================================
        // DEFAULT EMPLOYEES
        // ==================================================

        const defaultEmployees = [

            {
                id: "EMP001",
                name: "Rahul Sharma",
                email: "rahul@company.com",
                phone: "9876543210",
                department: "IT",
                designation: "Software Developer",
                type: "Full-Time",
                basicSalary: 45000,
                hra: 9000,
                da: 4500,
                pf: 5400,
                hoursWorked: 0,
                ratePerHour: 0
            },

            {
                id: "EMP002",
                name: "Priya Patel",
                email: "priya@company.com",
                phone: "9876543211",
                department: "HR",
                designation: "HR Executive",
                type: "Full-Time",
                basicSalary: 38000,
                hra: 7600,
                da: 3800,
                pf: 4560,
                hoursWorked: 0,
                ratePerHour: 0
            },

            {
                id: "EMP003",
                name: "Arjun Mehta",
                email: "arjun@company.com",
                phone: "9876543212",
                department: "Finance",
                designation: "Accountant",
                type: "Part-Time",
                basicSalary: 0,
                hra: 0,
                da: 0,
                pf: 0,
                hoursWorked: 80,
                ratePerHour: 250
            }

        ];


        // ==================================================
        // GET EMPLOYEES
        // ==================================================

        function getEmployees() {

            let employees = null;

            try {

                employees =
                    JSON.parse(
                        localStorage.getItem(
                            "employees"
                        )
                    );

            } catch (error) {

                employees = null;
            }


            if (!Array.isArray(employees)) {

                employees =
                    defaultEmployees.map(
                        employee => ({
                            ...employee
                        })
                    );

                localStorage.setItem(
                    "employees",
                    JSON.stringify(employees)
                );
            }


            return employees;
        }


        // ==================================================
        // SALARY CALCULATION
        // ==================================================

        function calculateSalary(employee) {

            if (
                employee.type ===
                "Part-Time"
            ) {

                const hoursWorked =
                    Number(
                        employee.hoursWorked
                    ) || 0;

                const ratePerHour =
                    Number(
                        employee.ratePerHour
                    ) || 0;

                return (
                    hoursWorked *
                    ratePerHour
                );
            }


            const basicSalary =
                Number(
                    employee.basicSalary
                ) || 0;

            const hra =
                Number(
                    employee.hra
                ) || 0;

            const da =
                Number(
                    employee.da
                ) || 0;

            const pf =
                Number(
                    employee.pf
                ) || 0;


            const grossSalary =
                basicSalary +
                hra +
                da;


            return (
                grossSalary -
                pf
            );
        }


        // ==================================================
        // HRA / DA / PF INPUT HELPERS
        // ==================================================

        function updateSalaryInput(
            typeId,
            inputId,
            hintId
        ) {

            const typeSelect =
                document.getElementById(
                    typeId
                );

            const input =
                document.getElementById(
                    inputId
                );

            const hint =
                document.getElementById(
                    hintId
                );


            if (
                !typeSelect ||
                !input ||
                !hint
            ) {
                return;
            }


            function update() {

                if (
                    typeSelect.value ===
                    "percentage"
                ) {

                    input.placeholder =
                        inputId === "hra"
                            ? "e.g. 20"
                            : inputId === "da"
                                ? "e.g. 10"
                                : "e.g. 12";


                    hint.textContent =
                        "Enter percentage of Basic Salary";

                } else {

                    input.placeholder =
                        inputId === "hra"
                            ? "e.g. ₹9,000"
                            : inputId === "da"
                                ? "e.g. ₹4,500"
                                : "e.g. ₹5,400";


                    hint.textContent =
                        "Enter fixed amount in ₹";
                }
            }


            typeSelect.addEventListener(
                "change",
                update
            );

            update();
        }


        updateSalaryInput(
            "hraType",
            "hra",
            "hraHint"
        );

        updateSalaryInput(
            "daType",
            "da",
            "daHint"
        );

        updateSalaryInput(
            "pfType",
            "pf",
            "pfHint"
        );


        // ==================================================
        // ADD / EDIT EMPLOYEE
        // ==================================================

        if (
            form &&
            empTypeSelect
        ) {

            function updateEmployeeTypeFields() {

                if (
                    empTypeSelect.value ===
                    "Full-Time"
                ) {

                    if (fullTimeFields) {

                        fullTimeFields.classList.remove(
                            "hidden"
                        );
                    }

                    if (partTimeFields) {

                        partTimeFields.classList.add(
                            "hidden"
                        );
                    }

                } else {

                    if (fullTimeFields) {

                        fullTimeFields.classList.add(
                            "hidden"
                        );
                    }

                    if (partTimeFields) {

                        partTimeFields.classList.remove(
                            "hidden"
                        );
                    }
                }
            }


            empTypeSelect.addEventListener(
                "change",
                updateEmployeeTypeFields
            );


            updateEmployeeTypeFields();


            // ==============================================
            // EDIT MODE
            // ==============================================

            const urlParams =
                new URLSearchParams(
                    window.location.search
                );

            const isEditMode =
                urlParams.get(
                    "mode"
                ) === "edit";


            let editEmployeeData = null;


            if (isEditMode) {

                try {

                    editEmployeeData =
                        JSON.parse(
                            localStorage.getItem(
                                "editEmployee"
                            )
                        );

                } catch (error) {

                    editEmployeeData = null;
                }

            } else {

                localStorage.removeItem(
                    "editEmployee"
                );
            }


            // ==============================================
            // LOAD EDIT DATA
            // ==============================================

            if (editEmployeeData) {

                const formTitle =
                    document.getElementById(
                        "formTitle"
                    );


                if (formTitle) {

                    formTitle.textContent =
                        "Edit Employee";
                }


                const fields = {

                    empId:
                        editEmployeeData.id,

                    fullName:
                        editEmployeeData.name,

                    email:
                        editEmployeeData.email,

                    phone:
                        editEmployeeData.phone,

                    department:
                        editEmployeeData.department,

                    designation:
                        editEmployeeData.designation,

                    empType:
                        editEmployeeData.type,

                    basicSalary:
                        editEmployeeData.basicSalary,

                    hra:
                        editEmployeeData.hra,

                    da:
                        editEmployeeData.da,

                    pf:
                        editEmployeeData.pf,

                    hoursWorked:
                        editEmployeeData.hoursWorked,

                    ratePerHour:
                        editEmployeeData.ratePerHour
                };


                Object.keys(fields)
                    .forEach(
                        id => {

                            const element =
                                document.getElementById(
                                    id
                                );


                            if (element) {

                                element.value =
                                    fields[id];
                            }
                        }
                    );


                updateEmployeeTypeFields();


                if (
                    editEmployeeData.type ===
                    "Full-Time"
                ) {

                    const hraType =
                        document.getElementById(
                            "hraType"
                        );

                    const daType =
                        document.getElementById(
                            "daType"
                        );

                    const pfType =
                        document.getElementById(
                            "pfType"
                        );


                    if (hraType) {

                        hraType.value =
                            "amount";

                        hraType.dispatchEvent(
                            new Event("change")
                        );
                    }


                    if (daType) {

                        daType.value =
                            "amount";

                        daType.dispatchEvent(
                            new Event("change")
                        );
                    }


                    if (pfType) {

                        pfType.value =
                            "amount";

                        pfType.dispatchEvent(
                            new Event("change")
                        );
                    }
                }
            }


            // ==============================================
            // SAVE EMPLOYEE
            // ==============================================

            form.addEventListener(
                "submit",
                event => {

                    event.preventDefault();


                    const getValue =
                        id => {

                            const element =
                                document.getElementById(
                                    id
                                );

                            return element
                                ? element.value.trim()
                                : "";
                        };


                    const id =
                        getValue("empId");

                    const name =
                        getValue("fullName");

                    const email =
                        getValue("email");

                    const phone =
                        getValue("phone");

                    const department =
                        getValue("department");

                    const designation =
                        getValue("designation");

                    const type =
                        getValue("empType");


                    // ======================================
                    // VALIDATION
                    // ======================================

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


                    if (
                        !/^\d{10}$/.test(
                            phone
                        )
                    ) {

                        alert(
                            "Phone number must be exactly 10 digits."
                        );

                        return;
                    }


                    const basicSalary =
                        Number(
                            getValue(
                                "basicSalary"
                            )
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


                    if (
                        type ===
                        "Full-Time"
                    ) {

                        const hraType =
                            getValue(
                                "hraType"
                            );

                        const daType =
                            getValue(
                                "daType"
                            );

                        const pfType =
                            getValue(
                                "pfType"
                            );


                        hra =
                            hraType ===
                            "percentage"

                                ? basicSalary *
                                  hraInput /
                                  100

                                : hraInput;


                        da =
                            daType ===
                            "percentage"

                                ? basicSalary *
                                  daInput /
                                  100

                                : daInput;


                        pf =
                            pfType ===
                            "percentage"

                                ? basicSalary *
                                  pfInput /
                                  100

                                : pfInput;
                    }


                    const hoursWorked =
                        Number(
                            getValue(
                                "hoursWorked"
                            )
                        ) || 0;


                    const ratePerHour =
                        Number(
                            getValue(
                                "ratePerHour"
                            )
                        ) || 0;


                    if (
                        type ===
                        "Full-Time" &&
                        basicSalary <= 0
                    ) {

                        alert(
                            "Please enter a valid Basic Salary."
                        );

                        return;
                    }


                    if (
                        type ===
                        "Part-Time" &&
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


                    let employees =
                        getEmployees();


                    // ======================================
                    // EDIT
                    // ======================================

                    if (
                        editEmployeeData
                    ) {

                        const oldId =
                            String(
                                editEmployeeData.id
                            ).toLowerCase();


                        const index =
                            employees.findIndex(
                                employee =>
                                    String(
                                        employee.id
                                    ).toLowerCase() ===
                                    oldId
                            );


                        if (
                            index === -1
                        ) {

                            alert(
                                "Employee could not be found."
                            );

                            return;
                        }


                        // Don't allow the edited ID
                        // to collide with another employee.

                        const duplicate =
                            employees.some(
                                (employee, i) =>
                                    i !== index &&
                                    String(
                                        employee.id
                                    ).toLowerCase() ===
                                    id.toLowerCase()
                            );


                        if (duplicate) {

                            alert(
                                "Employee ID already exists."
                            );

                            return;
                        }


                        employees[index] =
                            employee;


                        localStorage.setItem(
                            "employees",
                            JSON.stringify(
                                employees
                            )
                        );


                        localStorage.removeItem(
                            "editEmployee"
                        );


                        alert(
                            "Employee updated successfully!"
                        );


                        window.location.href =
                            "employees.html";


                        return;
                    }


                    // ======================================
                    // NEW EMPLOYEE
                    // ======================================

                    const duplicate =
                        employees.some(
                            employee =>
                                String(
                                    employee.id
                                ).toLowerCase() ===
                                id.toLowerCase()
                        );


                    if (duplicate) {

                        alert(
                            "Employee ID already exists."
                        );

                        return;
                    }


                    employees.push(
                        employee
                    );


                    localStorage.setItem(
                        "employees",
                        JSON.stringify(
                            employees
                        )
                    );


                    alert(
                        "Employee added successfully!"
                    );


                    window.location.href =
                        "employees.html";
                }
            );
        }


        // ==================================================
        // EMPLOYEE TABLE
        // ==================================================

        if (employeeTable) {

            loadEmployees();
        }


        function loadEmployees() {

            if (!employeeTable) {
                return;
            }


            const employees =
                getEmployees();


            employees.sort(
                (a, b) =>
                    String(a.id)
                        .localeCompare(
                            String(b.id),
                            undefined,
                            {
                                numeric: true
                            }
                        )
            );


            employeeTable.innerHTML =
                "";


            employees.forEach(
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
                            ${employee.designation}
                        </td>

                        <td>
                            ${employee.type}
                        </td>

                        <td>
                            ₹${calculateSalary(employee)
                                .toLocaleString("en-IN")}
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


                    employeeTable.appendChild(
                        row
                    );
                }
            );
        }


        // ==================================================
        // EDIT EMPLOYEE
        // ==================================================

        window.editEmployee =
            function(id) {

                const employees =
                    getEmployees();


                const employee =
                    employees.find(
                        employee =>
                            String(
                                employee.id
                            ).toLowerCase() ===
                            String(
                                id
                            ).toLowerCase()
                    );


                if (!employee) {

                    alert(
                        "Employee not found."
                    );

                    return;
                }


                localStorage.setItem(
                    "editEmployee",
                    JSON.stringify(
                        employee
                    )
                );


                window.location.href =
                    "add-employee.html?mode=edit";
            };


        // ==================================================
        // DELETE EMPLOYEE
        // ==================================================

        window.deleteEmployee =
            function(id) {

                const employees =
                    getEmployees();


                const employee =
                    employees.find(
                        employee =>
                            String(
                                employee.id
                            ).toLowerCase() ===
                            String(
                                id
                            ).toLowerCase()
                    );


                if (!employee) {

                    alert(
                        "Employee not found."
                    );

                    return;
                }


                const confirmed =
                    confirm(
                        `Are you sure you want to delete ${employee.name}?`
                    );


                if (!confirmed) {
                    return;
                }


                const updatedEmployees =
                    employees.filter(
                        employee =>
                            String(
                                employee.id
                            ).toLowerCase() !==
                            String(
                                id
                            ).toLowerCase()
                    );


                localStorage.setItem(
                    "employees",
                    JSON.stringify(
                        updatedEmployees
                    )
                );


                localStorage.removeItem(
                    "viewEmployee"
                );


                loadEmployees();


                alert(
                    "Employee deleted successfully!"
                );
            };


        // ==================================================
        // VIEW EMPLOYEE
        // ==================================================

        window.viewEmployee =
            function(id) {

                const employees =
                    getEmployees();


                const employee =
                    employees.find(
                        employee =>
                            String(
                                employee.id
                            ).toLowerCase() ===
                            String(
                                id
                            ).toLowerCase()
                    );


                if (!employee) {

                    alert(
                        "Employee not found."
                    );

                    return;
                }


                localStorage.setItem(
                    "viewEmployee",
                    JSON.stringify(
                        employee
                    )
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


        // ==================================================
        // EMPLOYEE DETAILS
        // ==================================================

        let viewEmployeeData = null;


        try {

            viewEmployeeData =
                JSON.parse(
                    localStorage.getItem(
                        "viewEmployee"
                    )
                );

        } catch (error) {

            viewEmployeeData = null;
        }


        if (
            viewEmployeeData &&
            document.getElementById(
                "detailName"
            )
        ) {

            const setDetail =
                (
                    id,
                    value
                ) => {

                    const element =
                        document.getElementById(
                            id
                        );

                    if (element) {

                        element.textContent =
                            value;
                    }
                };


            setDetail(
                "detailName",
                viewEmployeeData.name
            );

            setDetail(
                "detailId",
                viewEmployeeData.id
            );

            setDetail(
                "detailEmail",
                viewEmployeeData.email
            );

            setDetail(
                "detailPhone",
                viewEmployeeData.phone
            );

            setDetail(
                "detailDepartment",
                viewEmployeeData.department
            );

            setDetail(
                "detailDesignation",
                viewEmployeeData.designation
            );

            setDetail(
                "detailType",
                viewEmployeeData.type
            );

            setDetail(
                "detailBasicSalary",
                "₹" +
                Number(
                    viewEmployeeData.basicSalary
                ).toLocaleString("en-IN")
            );

            setDetail(
                "detailHra",
                "₹" +
                Number(
                    viewEmployeeData.hra
                ).toLocaleString("en-IN")
            );

            setDetail(
                "detailDa",
                "₹" +
                Number(
                    viewEmployeeData.da
                ).toLocaleString("en-IN")
            );

            setDetail(
                "detailPf",
                "₹" +
                Number(
                    viewEmployeeData.pf
                ).toLocaleString("en-IN")
            );

            setDetail(
                "detailNetSalary",
                "₹" +
                calculateSalary(
                    viewEmployeeData
                ).toLocaleString("en-IN")
            );


            const partTimeDetails =
                document.getElementById(
                    "partTimeDetails"
                );


            if (
                viewEmployeeData.type ===
                "Part-Time"
            ) {

                if (partTimeDetails) {

                    partTimeDetails.style.display =
                        "grid";
                }


                setDetail(
                    "detailHours",
                    viewEmployeeData.hoursWorked
                );

                setDetail(
                    "detailRate",
                    "₹" +
                    Number(
                        viewEmployeeData.ratePerHour
                    ).toLocaleString("en-IN")
                );

            } else {

                if (partTimeDetails) {

                    partTimeDetails.style.display =
                        "none";
                }
            }
        }


        // ==================================================
        // PAYROLL
        // ==================================================

        const payrollTable =
            document.getElementById(
                "payrollTable"
            );

        const payrollSearch =
            document.getElementById(
                "payrollSearch"
            );

        const payrollTypeFilter =
            document.getElementById(
                "payrollTypeFilter"
            );


        if (payrollTable) {

            loadPayroll();
        }


        function loadPayroll() {

            if (!payrollTable) {
                return;
            }


            const employees =
                getEmployees();


            payrollTable.innerHTML =
                "";


            let totalPayroll = 0;

            let fullTimeCount = 0;

            let partTimeCount = 0;


            employees.forEach(
                employee => {

                    totalPayroll +=
                        calculateSalary(
                            employee
                        );


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
                }
            );


            const totalPayrollElement =
                document.getElementById(
                    "totalPayroll"
                );

            const payrollEmployeesElement =
                document.getElementById(
                    "payrollEmployees"
                );

            const payrollFullTimeElement =
                document.getElementById(
                    "payrollFullTime"
                );

            const payrollPartTimeElement =
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


            if (payrollEmployeesElement) {

                payrollEmployeesElement.textContent =
                    employees.length;
            }


            if (payrollFullTimeElement) {

                payrollFullTimeElement.textContent =
                    fullTimeCount;
            }


            if (payrollPartTimeElement) {

                payrollPartTimeElement.textContent =
                    partTimeCount;
            }


            employees.sort(
                (a, b) =>
                    String(a.id)
                        .localeCompare(
                            String(b.id),
                            undefined,
                            {
                                numeric: true
                            }
                        )
            );


            employees.forEach(
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
                            ${employee.type}
                        </td>

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
                            ₹${calculateSalary(
                                employee
                            ).toLocaleString("en-IN")}
                        </td>

                        <td>

                            <button
                                class="payslip-btn"
                                onclick="generatePayslip('${employee.id}')">
                                Payslip
                            </button>

                        </td>
                    `;


                    payrollTable.appendChild(
                        row
                    );
                }
            );
        }


        // ==================================================
        // PAYROLL FILTER
        // ==================================================

        function filterPayroll() {

            if (
                !payrollTable
            ) {
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
                payrollTable.querySelectorAll(
                    "tr"
                );


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
            function(id) {

                const employees =
                    getEmployees();


                const employee =
                    employees.find(
                        employee =>
                            String(
                                employee.id
                            ).toLowerCase() ===
                            String(
                                id
                            ).toLowerCase()
                    );


                if (!employee) {

                    alert(
                        "Employee not found."
                    );

                    return;
                }


                const salary =
                    calculateSalary(
                        employee
                    );


                const grossSalary =
                    employee.type ===
                    "Full-Time"

                        ? Number(
                            employee.basicSalary
                        ) +
                          Number(
                            employee.hra
                        ) +
                          Number(
                            employee.da
                        )

                        : salary;


                const pf =
                    employee.type ===
                    "Full-Time"

                        ? Number(
                            employee.pf
                        )

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
                                box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                            }

                            .header {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                border-bottom: 3px solid #ffd21f;
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
                                grid-template-columns: 1fr 1fr;
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
                                border-collapse: collapse;
                                margin-top: 15px;
                            }

                            th,
                            td {
                                padding: 13px;
                                border-bottom: 1px solid #e1e7ed;
                                text-align: left;
                            }

                            th {
                                background: #102b48;
                                color: white;
                            }

                            .amount {
                                text-align: right;
                            }

                            .net {
                                font-size: 18px;
                                font-weight: bold;
                                background: #fff5b8;
                            }

                            .footer {
                                margin-top: 30px;
                                text-align: center;
                                color: #718096;
                                font-size: 12px;
                            }

                            .print-btn {
                                margin-top: 25px;
                                padding: 11px 22px;
                                border: none;
                                border-radius: 7px;
                                background: #ffd21f;
                                color: #102b48;
                                font-weight: bold;
                                cursor: pointer;
                            }

                            @media print {

                                body {
                                    background: white;
                                    padding: 0;
                                }

                                .payslip {
                                    box-shadow: none;
                                    max-width: none;
                                }

                                .print-btn {
                                    display: none;
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
                                    EMPLOYEE PAYSLIP
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


                                <div class="info-box">

                                    <div class="label">
                                        Employee Type
                                    </div>

                                    <div class="value">
                                        ${employee.type}
                                    </div>

                                </div>


                                <div class="info-box">

                                    <div class="label">
                                        Phone
                                    </div>

                                    <div class="value">
                                        ${employee.phone}
                                    </div>

                                </div>

                            </div>


                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Salary Component
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
                                                        ).toLocaleString("en-IN")}
                                                    </td>

                                                </tr>

                                                <tr>

                                                    <td>
                                                        HRA
                                                    </td>

                                                    <td class="amount">
                                                        ₹${Number(
                                                            employee.hra
                                                        ).toLocaleString("en-IN")}
                                                    </td>

                                                </tr>

                                                <tr>

                                                    <td>
                                                        DA
                                                    </td>

                                                    <td class="amount">
                                                        ₹${Number(
                                                            employee.da
                                                        ).toLocaleString("en-IN")}
                                                    </td>

                                                </tr>

                                                <tr>

                                                    <td>
                                                        Gross Salary
                                                    </td>

                                                    <td class="amount">
                                                        ₹${grossSalary.toLocaleString("en-IN")}
                                                    </td>

                                                </tr>

                                                <tr>

                                                    <td>
                                                        PF Deduction
                                                    </td>

                                                    <td class="amount">
                                                        - ₹${pf.toLocaleString("en-IN")}
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
                                                        ).toLocaleString("en-IN")}
                                                    </td>

                                                </tr>

                                                <tr>

                                                    <td>
                                                        Total Earnings
                                                    </td>

                                                    <td class="amount">
                                                        ₹${salary.toLocaleString("en-IN")}
                                                    </td>

                                                </tr>

                                            `
                                    }


                                    <tr class="net">

                                        <td>
                                            Net Salary
                                        </td>

                                        <td class="amount">
                                            ₹${salary.toLocaleString("en-IN")}
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

        const dashboardTotalEmployees =
            document.getElementById(
                "dashboardTotalEmployees"
            );


        if (
            dashboardTotalEmployees
        ) {

            const employees =
                getEmployees();


            let totalPayroll = 0;

            let fullTimeCount = 0;

            let partTimeCount = 0;


            employees.forEach(
                employee => {

                    totalPayroll +=
                        calculateSalary(
                            employee
                        );


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
                }
            );


            dashboardTotalEmployees.textContent =
                employees.length;


            const dashboardPayroll =
                document.getElementById(
                    "dashboardPayroll"
                );

            const dashboardFullTime =
                document.getElementById(
                    "dashboardFullTime"
                );

            const dashboardPartTime =
                document.getElementById(
                    "dashboardPartTime"
                );


            if (dashboardPayroll) {

                dashboardPayroll.textContent =
                    "₹" +
                    totalPayroll.toLocaleString(
                        "en-IN"
                    );
            }


            if (dashboardFullTime) {

                dashboardFullTime.textContent =
                    fullTimeCount;
            }


            if (dashboardPartTime) {

                dashboardPartTime.textContent =
                    partTimeCount;
            }
        }


        // ==================================================
        // DASHBOARD EMPLOYEE TABLE
        // ==================================================

        const dashboardEmployeeTable =
            document.getElementById(
                "dashboardEmployeeTable"
            );


        if (
            dashboardEmployeeTable
        ) {

            const employees =
                getEmployees();


            dashboardEmployeeTable.innerHTML =
                "";


            employees
                .sort(
                    (a, b) =>
                        String(a.id)
                            .localeCompare(
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
                                ).toLocaleString("en-IN")}
                            </td>

                        `;


                        dashboardEmployeeTable.appendChild(
                            row
                        );
                    }
                );
        }


        // ==================================================
        // REPORTS
        // ==================================================

        function loadReports() {

            const employees =
                getEmployees();


            const totalEmployees =
                employees.length;


            let totalPayroll = 0;

            let highestSalary = 0;

            let highestEmployee = null;

            let fullTimeCount = 0;

            let partTimeCount = 0;


            employees.forEach(
                employee => {

                    const salary =
                        calculateSalary(
                            employee
                        );


                    totalPayroll +=
                        salary;


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

                        fullTimeCount++;
                    }


                    if (
                        employee.type ===
                        "Part-Time"
                    ) {

                        partTimeCount++;
                    }
                }
            );


            const averageSalary =
                totalEmployees > 0
                    ? totalPayroll /
                      totalEmployees
                    : 0;


            const reportEmployees =
                document.getElementById(
                    "reportEmployees"
                );

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


            if (reportEmployees) {

                reportEmployees.textContent =
                    totalEmployees;
            }


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


            const reportFullTime =
                document.getElementById(
                    "reportFullTime"
                );

            const reportPartTime =
                document.getElementById(
                    "reportPartTime"
                );


            if (reportFullTime) {

                reportFullTime.textContent =
                    fullTimeCount;
            }


            if (reportPartTime) {

                reportPartTime.textContent =
                    partTimeCount;
            }


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


                        const salary =
                            calculateSalary(
                                employee
                            );


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
                            salary;
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


            const highestEmployeeElement =
                document.getElementById(
                    "highestEmployee"
                );


            if (
                highestEmployeeElement
            ) {

                if (
                    highestEmployee
                ) {

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

            loadReports();
        }


        // ==================================================
        // APPEARANCE
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