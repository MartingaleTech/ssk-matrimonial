import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStorageKeyToProfilePhotos1790394861000 implements MigrationInterface {
  name = 'AddStorageKeyToProfilePhotos1790394861000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('profile_photos');
    if (table?.findColumnByName('storage_key')) {
      return;
    }
    await queryRunner.addColumn(
      'profile_photos',
      new TableColumn({
        name: 'storage_key',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('profile_photos', 'storage_key');
  }
}
