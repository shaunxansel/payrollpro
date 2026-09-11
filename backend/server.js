const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "PayrollPro backend is running successfully."
    });
});

// GET ALL EMPLOYEES
app.get("/api/employees", (req, res) => {
    try {
        const employees = db
            .prepare("SELECT * FROM employees ORDER BY id")
            .all();

        res.json(employees);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch employees."
        });
    }
});

// GET ONE EMPLOYEE
app.get("/api/employees/:id", (req, res) => {
    try {
        const employee = db
            .prepare("SELECT * FROM employees WHERE id = ?")
            .get(req.params.id);

        if (!employee) {
            return res.status(404).json({
                error: "Employee not found."
            });
        }

        res.json(employee);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to fetch employee."
        });
    }
});

// ADD EMPLOYEE
app.post("/api/employees", (req, res) => {
    try {
        const {
            id,
            name,
            email,
            phone,
            department,
            designation,
            type,
            basicSalary = 0,
            hra = 0,
            da = 0,
            pf = 0,
            hoursWorked = 0,
            ratePerHour = 0
        } = req.body;

        if (
            !id ||
            !name ||
            !email ||
            !phone ||
            !department ||
            !designation ||
            !type
        ) {
            return res.status(400).json({
                error: "All required employee fields must be provided."
            });
        }

        const existing = db
            .prepare("SELECT id FROM employees WHERE id = ?")
            .get(id);

        if (existing) {
            return res.status(409).json({
                error: "Employee ID already exists."
            });
        }

        db.prepare(`
            INSERT INTO employees (
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
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id,
            name,
            email,
            phone,
            department,
            designation,
            type,
            Number(basicSalary) || 0,
            Number(hra) || 0,
            Number(da) || 0,
            Number(pf) || 0,
            Number(hoursWorked) || 0,
            Number(ratePerHour) || 0
        );

        const employee = db
            .prepare("SELECT * FROM employees WHERE id = ?")
            .get(id);

        res.status(201).json(employee);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to add employee."
        });
    }
});

// UPDATE EMPLOYEE
app.put("/api/employees/:id", (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            department,
            designation,
            type,
            basicSalary = 0,
            hra = 0,
            da = 0,
            pf = 0,
            hoursWorked = 0,
            ratePerHour = 0
        } = req.body;

        const existing = db
            .prepare("SELECT id FROM employees WHERE id = ?")
            .get(req.params.id);

        if (!existing) {
            return res.status(404).json({
                error: "Employee not found."
            });
        }

        db.prepare(`
            UPDATE employees
            SET
                name = ?,
                email = ?,
                phone = ?,
                department = ?,
                designation = ?,
                type = ?,
                basicSalary = ?,
                hra = ?,
                da = ?,
                pf = ?,
                hoursWorked = ?,
                ratePerHour = ?
            WHERE id = ?
        `).run(
            name,
            email,
            phone,
            department,
            designation,
            type,
            Number(basicSalary) || 0,
            Number(hra) || 0,
            Number(da) || 0,
            Number(pf) || 0,
            Number(hoursWorked) || 0,
            Number(ratePerHour) || 0,
            req.params.id
        );

        const employee = db
            .prepare("SELECT * FROM employees WHERE id = ?")
            .get(req.params.id);

        res.json(employee);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to update employee."
        });
    }
});

// DELETE EMPLOYEE
app.delete("/api/employees/:id", (req, res) => {
    try {
        const result = db
            .prepare("DELETE FROM employees WHERE id = ?")
            .run(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({
                error: "Employee not found."
            });
        }

        res.json({
            message: "Employee deleted successfully."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to delete employee."
        });
    }
});

// SEED DEFAULT EMPLOYEES
app.post("/api/seed-default-employees", (req, res) => {
    try {
        const employees = [
            {
                id: "EMP001",
                name: "Rahul Sharma",
                email: "rahul@example.com",
                phone: "9876543210",
                department: "IT",
                designation: "Software Developer",
                type: "Full-Time",
                basicSalary: 45000,
                hra: 9000,
                da: 4500,
                pf: 5400
            },
            {
                id: "EMP002",
                name: "Priya Patel",
                email: "priya@example.com",
                phone: "9876543211",
                department: "HR",
                designation: "HR Executive",
                type: "Full-Time",
                basicSalary: 38000,
                hra: 7600,
                da: 3800,
                pf: 4560
            },
            {
                id: "EMP003",
                name: "Arjun Mehta",
                email: "arjun@example.com",
                phone: "9876543212",
                department: "Finance",
                designation: "Accountant",
                type: "Part-Time",
                hoursWorked: 80,
                ratePerHour: 250
            }
        ];

        let added = 0;

        for (const employee of employees) {
            const exists = db
                .prepare("SELECT id FROM employees WHERE id = ?")
                .get(employee.id);

            if (!exists) {
                db.prepare(`
                    INSERT INTO employees (
                        id, name, email, phone, department,
                        designation, type, basicSalary, hra,
                        da, pf, hoursWorked, ratePerHour
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    employee.id,
                    employee.name,
                    employee.email,
                    employee.phone,
                    employee.department,
                    employee.designation,
                    employee.type,
                    employee.basicSalary || 0,
                    employee.hra || 0,
                    employee.da || 0,
                    employee.pf || 0,
                    employee.hoursWorked || 0,
                    employee.ratePerHour || 0
                );

                added++;
            }
        }

        res.json({
            message: "Default employees processed successfully.",
            added
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Failed to seed default employees."
        });
    }
});

app.listen(PORT, () => {
    console.log(
        `PayrollPro backend running at http://localhost:${PORT}`
    );
});