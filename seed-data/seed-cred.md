## Seed Data Credentials

### Super Admins

| Email                    | Password    |
| ------------------------ | ----------- |
| superadmin1@example.com  | password123 |
| superadmin2@example.com  | password123 |
| superadmin3@example.com  | password123 |
| ...                      | ...         |
| superadmin10@example.com | password123 |

### Companies

| Company Name | Email                 | Password    | Status       |
| ------------ | --------------------- | ----------- | ------------ |
| Company 1    | company1@example.com  | companypass | Approved     |
| Company 2    | company2@example.com  | companypass | Approved     |
| ...          | ...                   | ...         | ...          |
| Company 12   | company12@example.com | companypass | Approved     |
| Company 13   | company13@example.com | companypass | Not Approved |
| Company 14   | company14@example.com | companypass | Not Approved |
| Company 15   | company15@example.com | companypass | Not Approved |

### Users

Users are generated with these patterns:

| Role Type  | Email Pattern                                      | Password |
| ---------- | -------------------------------------------------- | -------- |
| Admin      | admin{number}\_company{companyId}@example.com      | userpass |
| Manager    | manager{number}\_company{companyId}@example.com    | userpass |
| Dispatcher | dispatcher{number}\_company{companyId}@example.com | userpass |

Examples:

- admin1_company1@example.com (password: userpass)
- manager1_company2@example.com (password: userpass)
- dispatcher1_company3@example.com (password: userpass)

### Drivers

Drivers use this pattern:

- driver{number}\_company{companyId}@example.com

Example: driver1_company1@example.com

### Customers

Customers use this pattern:

- customer{number}\_company{companyId}@example.com

Example: customer1_company1@example.com

## Notes

- The script generates multiple users for each role in each company
- Each company has 10-15 drivers
- Each company has 15-25 customers
- All passwords are hashed in the database but listed here in plaintext for testing
