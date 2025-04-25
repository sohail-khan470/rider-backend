-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `booking_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `booking_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `company_admin` DROP FOREIGN KEY `company_admin_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `customer` DROP FOREIGN KEY `customer_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `driver` DROP FOREIGN KEY `driver_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `location` DROP FOREIGN KEY `location_driverId_fkey`;

-- DropForeignKey
ALTER TABLE `staff` DROP FOREIGN KEY `staff_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `staff` DROP FOREIGN KEY `staff_roleId_fkey`;

-- DropIndex
DROP INDEX `booking_companyId_fkey` ON `booking`;

-- DropIndex
DROP INDEX `booking_customerId_fkey` ON `booking`;

-- DropIndex
DROP INDEX `customer_companyId_fkey` ON `customer`;

-- DropIndex
DROP INDEX `driver_companyId_fkey` ON `driver`;

-- DropIndex
DROP INDEX `staff_companyId_fkey` ON `staff`;

-- DropIndex
DROP INDEX `staff_roleId_fkey` ON `staff`;

-- AddForeignKey
ALTER TABLE `company_admin` ADD CONSTRAINT `company_admin_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff` ADD CONSTRAINT `staff_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `staff_role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff` ADD CONSTRAINT `staff_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `driver` ADD CONSTRAINT `driver_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer` ADD CONSTRAINT `customer_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking` ADD CONSTRAINT `booking_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `location` ADD CONSTRAINT `location_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `driver`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
