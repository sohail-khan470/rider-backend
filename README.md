This project is based on repository pattern similar to nestjs but i have used sequelize with 
express.
I have use Plain javascript without typescript with good folder structures but it is flexible
and can be modified as needed.

`src`  All the code of out project resides inside this directory. (if you want to write tests 
then create seperate test folder in root directory) .

`config` All the necessary configuration required for app is present there .
i-e: `loggerConfig` it is used for logging using winston package

`utils ` This folder include some common modules required throughout the application development also some helper modules errors etc

`controllers` This folder is will communicate with services to get business logic.

`Routes` This folder is for storing the routes of the application 
    inside the application `V1` directory is used for versioning the api 
`Middlewares` This directory can be used to write and store different middlewares `i-e` Auth.

`Models` This directory stores the models which can represent the schema  of the resources

`services` The service is the place where we write business logic and the will communicates 
with `repositories`

`repositories` Repositories will directly communicates with database using sequelize ORM

