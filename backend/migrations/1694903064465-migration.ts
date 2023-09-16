import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1694903064465 implements MigrationInterface {
    name = 'Migration1694903064465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`session\` (\`expiredAt\` bigint NOT NULL, \`id\` varchar(255) NOT NULL, \`json\` text NOT NULL, \`destroyedAt\` datetime(6) NULL, INDEX \`IDX_28c5d1d16da7908c97c9bc2f74\` (\`expiredAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`login\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`firstName\` varchar(64) NULL, \`role\` varchar(16) NOT NULL, \`bandId\` int NULL, INDEX \`IDX_a62473490b3e4578fd683235c5\` (\`login\`), INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`band\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`stem\` (\`id\` int NOT NULL AUTO_INCREMENT, \`songId\` int NULL, \`status\` enum ('reserved', 'processing', 'failed', 'ready', 'deleted') NOT NULL DEFAULT 'reserved', \`name\` varchar(255) NOT NULL, \`instrument\` varchar(16) NOT NULL, \`gainDecibels\` float NOT NULL DEFAULT '0', \`pan\` float NOT NULL DEFAULT '0', \`offset\` int NOT NULL DEFAULT '0', \`processingHostname\` varchar(255) NULL, \`processingPid\` int NULL, \`samples\` int NULL, \`sampleRate\` int NULL, \`local\` tinyint NULL, \`location\` varchar(512) NULL, \`hqLocation\` varchar(512) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`song\` (\`id\` int NOT NULL AUTO_INCREMENT, \`slug\` varchar(255) NOT NULL, \`ownerId\` int NULL, \`title\` varchar(255) NOT NULL, \`bpm\` float NULL, \`timeSignature\` smallint NULL DEFAULT '4', \`form\` text NOT NULL, \`varyingTempo\` text NULL, INDEX \`IDX_c311b415cb9f62143604b60aab\` (\`slug\`), INDEX \`IDX_799953815eca86703e58c6ecc1\` (\`ownerId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_cf7fca8d9f36deb4576f4650271\` FOREIGN KEY (\`bandId\`) REFERENCES \`band\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stem\` ADD CONSTRAINT \`FK_27382b5f2082a3b34a6c3cdbaf7\` FOREIGN KEY (\`songId\`) REFERENCES \`song\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`song\` ADD CONSTRAINT \`FK_799953815eca86703e58c6ecc15\` FOREIGN KEY (\`ownerId\`) REFERENCES \`band\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`song\` DROP FOREIGN KEY \`FK_799953815eca86703e58c6ecc15\``);
        await queryRunner.query(`ALTER TABLE \`stem\` DROP FOREIGN KEY \`FK_27382b5f2082a3b34a6c3cdbaf7\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_cf7fca8d9f36deb4576f4650271\``);
        await queryRunner.query(`DROP INDEX \`IDX_799953815eca86703e58c6ecc1\` ON \`song\``);
        await queryRunner.query(`DROP INDEX \`IDX_c311b415cb9f62143604b60aab\` ON \`song\``);
        await queryRunner.query(`DROP TABLE \`song\``);
        await queryRunner.query(`DROP TABLE \`stem\``);
        await queryRunner.query(`DROP TABLE \`band\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_a62473490b3e4578fd683235c5\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_28c5d1d16da7908c97c9bc2f74\` ON \`session\``);
        await queryRunner.query(`DROP TABLE \`session\``);
    }

}
