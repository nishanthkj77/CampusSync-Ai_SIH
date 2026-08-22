# API module boundaries

The API will grow by domain modules rather than generic CRUD resources:

- auth
- users
- departments
- programs
- academic-terms
- sections
- faculty
- students
- courses
- course-offerings
- enrollments
- rooms
- time-slots
- availability
- scheduling
- audit

Controllers own HTTP concerns, services own business rules, and Prisma access stays behind domain services/repositories. The scheduler is called only from the scheduling module.
