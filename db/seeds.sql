INSERT INTO department
    (name)
VALUES
    ('Engineering'),
    ('Legal'),
    ('Sales'),
    ('Finance');

INSERT INTO role
    (title, salary, department_id)
VALUES 
    ('Sales Lead', 100000.0, 3),
    ('Salesperson', 80000.0, 3),
    ('Lead Engineer', 150000.0, 1),
    ('Software Engineer', 120000.0, 1),
    ('Accountant', 125000.0, 4),
    ('Legal Term Lead', 250000.0, 2),
    ('Lawyer', 190000.0, 2);

INSERT INTO employee
    (first_name, last_name, role_id, manager_id)
VALUES
    ('Rohith', 'Kurian', 3),
    ('Sarah', 'Jayne', 1),
    ('Bruce', 'Wayne', 6),
    ('Rohith', 'Kurian', 2, 1),
    ('Rohith', 'Kurian', 4, 2),
    ('Rohith', 'Kurian', 7, 3);